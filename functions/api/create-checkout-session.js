import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;

  const { lineItems } = await request.json();

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: lineItems.map(function(item) {
      return { price: item.priceId, quantity: item.quantity };
    }),
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
    return_url: new URL(request.url).origin + '?payment=complete&session_id={CHECKOUT_SESSION_ID}',
    metadata: { items: lineItems.map(function(i) { return i.itemName + ' — ' + i.size; }).join(', ') },
  });

  return Response.json({ clientSecret: session.client_secret });
}
