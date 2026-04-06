import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionUpdate } from '@/utils/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  if (['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
    const customerId = session.customer || session.customer_id;
    if (!customerId) return NextResponse.json({ received: true });

    let supabaseUserId = session.metadata?.supabase_user_id;

    if (!supabaseUserId) {
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('stripe_customer_id', customerId).single();
      supabaseUserId = data?.id;
    }

    if (supabaseUserId) {
       let subscription: any;
       if (event.type === 'checkout.session.completed') {
          subscription = await stripe.subscriptions.retrieve(session.subscription as string);
       } else {
          subscription = event.data.object;
       }

       const planInterval = subscription.items.data[0].plan.interval;
       const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'canceled';
       const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

       const newPlan = planInterval === 'year' ? 'yearly' : 'monthly';

       // Check if exact subscription exists
       const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', supabaseUserId)
          .single();

       if (existingSub) {
          await supabaseAdmin.from('subscriptions').update({
            status: status,
            plan: newPlan,
            renewal_date: renewalDate
          }).eq('id', existingSub.id);
       } else {
          await supabaseAdmin.from('subscriptions').insert({
            user_id: supabaseUserId,
            status: status,
            plan: newPlan,
            renewal_date: renewalDate
          });
       }

       // Notify user
       const { data: userAuthData } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
       if (userAuthData?.user?.email) {
          sendSubscriptionUpdate(userAuthData.user.email, status, newPlan).catch(console.error);
       }
    }
  }

  return NextResponse.json({ received: true });
}
