import Stripe from 'stripe';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia'
});

async function run() {
  try {
    console.log("Creating Monthly Product...");
    const monthlyProduct = await stripe.products.create({
      name: 'Golf Charity Platform - Monthly Tier',
      description: 'Monthly access to draws and impact routing.'
    });

    const monthlyPrice = await stripe.prices.create({
      unit_amount: 1500, // $15.00
      currency: 'usd',
      recurring: { interval: 'month' },
      product: monthlyProduct.id,
    });
    console.log("Monthly Price ID:", monthlyPrice.id);

    console.log("Creating Yearly Product...");
    const yearlyProduct = await stripe.products.create({
      name: 'Golf Charity Platform - Annual Tier',
      description: 'Yearly access to draws and impact routing (2 months free).'
    });

    const yearlyPrice = await stripe.prices.create({
      unit_amount: 15000, // $150.00
      currency: 'usd',
      recurring: { interval: 'year' },
      product: yearlyProduct.id,
    });
    console.log("Yearly Price ID:", yearlyPrice.id);

    let envPath = '.env.local';
    let envFile = fs.readFileSync(envPath, 'utf8');
    envFile = envFile.replace(/# NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_\.\.\./, `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    envFile = envFile.replace(/# NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_\.\.\./, `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    fs.writeFileSync(envPath, envFile);
    console.log("Updated .env.local with new Price IDs!");
  } catch(e) {
    console.error("Error creating products: ", e);
  }
}

run();