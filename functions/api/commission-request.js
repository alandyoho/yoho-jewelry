export async function onRequestPost(context) {
  const { request, env } = context;

  const formData = await request.formData();

  const fields = [
    ['name',              'name'],
    ['email',             'email'],
    ['phone',             'phone'],
    ['instagram',         'instagram'],
    ['piece_type',        'type of piece'],
    ['occasion',          'occasion'],
    ['preferred_metal',   'preferred metal'],
    ['ring_size',         'ring size'],
    ['stone_type',        'stone type'],
    ['stone_cut',         'stone cut'],
    ['stone_carat',       'stone carat weight'],
    ['designs_you_like',  'designs / pieces you like'],
    ['aesthetic',         'aesthetic'],
    ['avoid',             'avoid'],
    ['budget',            'budget'],
    ['needed_by',         'needed by'],
    ['additional_notes',  'additional notes'],
  ];

  const lines = fields
    .map(([key, label]) => {
      const val = formData.get(key);
      return val ? `${label}: ${val}` : null;
    })
    .filter(Boolean)
    .join('\n');

  const name  = formData.get('name')  || 'someone';
  const email = formData.get('email') || '';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'commission-request@yoho.jewelry',
      to: 'alan@yoho.jewelry',
      reply_to: email || undefined,
      subject: `commission request from ${name}`,
      text: lines,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'failed to send' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
