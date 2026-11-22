export async function onRequestPost(context) {
  const { request, env } = context;

  const formData = await request.formData();

  const name  = formData.get('name')?.trim();
  const email = formData.get('email')?.trim();

  if (!name || !email) {
    return new Response(JSON.stringify({ error: 'name and email are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fields = [
    ['name',              'name'],
    ['email',             'email'],
    ['phone',             'phone'],
    ['instagram',         'instagram'],
    ['request_type',      'type of request'],
    ['reference_piece',   'reference piece'],
    ['piece_type',        'type of piece'],
    ['piece_type_other',  'type of piece (other)'],
    ['occasion',          'occasion'],
    ['occasion_other',    'occasion (other)'],
    ['preferred_metal',       'preferred metal'],
    ['preferred_metal_other', 'preferred metal (other)'],
    ['ring_size_system',  'ring size system'],
    ['ring_size_value',   'ring size'],
    ['stone_count',             'stones'],
    ['stone_multiple_desc',     'stone description (multiple)'],
    ['stone_type',              'stone type'],
    ['stone_cut',               'stone shape / cut'],
    ['stone_carat',             'stone carat weight'],
    ['stone_origin',            'lab grown or natural'],
    ['stone_color',             'stone color'],
    ['diamond_quality',         'diamond color & clarity'],
    ['stone_type_other',        'stone (other)'],
    ['designs_you_like',  'designs / pieces you like'],
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


  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'commission-request@yoho.jewelry',
      to: 'alan@yoho.jewelry',
      reply_to: email,
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
