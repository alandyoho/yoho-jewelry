const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { lineItems } = JSON.parse(event.body);

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: lineItems.map(function(item) {
      return { price: item.priceId, quantity: item.quantity };
    }),
    mode: 'payment',
    return_url: event.headers.origin + '?payment=complete&session_id={CHECKOUT_SESSION_ID}',
    metadata: { items: lineItems.map(function(i) { return i.itemName + ' — ' + i.size; }).join(', ') },
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientSecret: session.client_secret }),
  };
};
