import { NextResponse } from 'next/server';

// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe secret key not set in .env.local');
    return NextResponse.json({ error: 'Stripe secret key not set. Please see server logs.' }, { status: 500 });
  }

  console.log('API route called');
  try {
    const { items } = await req.json();
    console.log('Request items:', items);

    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Origin not found in request headers');
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [`${origin}${encodeURI(item.imageUrl)}`],
        },
        unit_amount: parseFloat(item.price.slice(1)) * 100, // Price in cents
      },
      quantity: item.quantity,
    }));
    console.log('Line items:', lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout?success=true`,
      cancel_url: `${origin}/cart`,
    });
    console.log('Stripe session created:', session);

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Stripe API error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
