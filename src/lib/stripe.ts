import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia' as any,
  appInfo: {
    name: 'Golf Charity Platform',
    version: '1.0.0'
  }
});
