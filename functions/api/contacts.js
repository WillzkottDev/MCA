const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS contacts (
  missionary_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  social TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function authorized(request, env) {
  const supplied = request.headers.get('X-MCA-Password') || '';
  const expected = env.MCA_PASSWORD || 'MCA';
  return supplied === expected;
}

async function ensureDb(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured');
  await env.DB.prepare(TABLE_SQL).run();
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401);
  try {
    await ensureDb(env);
    const { results } = await env.DB.prepare(
      'SELECT missionary_id, email, phone, social, message, updated_at FROM contacts ORDER BY missionary_id'
    ).all();
    return json({ records: results || [] });
  } catch (e) {
    return json({ error: 'database_unavailable', detail: String(e.message || e) }, 503);
  }
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401);
  try {
    await ensureDb(env);
    const body = await request.json();
    const id = Number(body.missionary_id);
    if (!Number.isInteger(id) || id < 1 || id > 344) return json({ error: 'invalid_missionary_id' }, 400);

    const clean = (v, max) => String(v ?? '').trim().slice(0, max);
    const email = clean(body.email, 180);
    const phone = clean(body.phone, 80);
    const social = clean(body.social, 220);
    const message = clean(body.message, 1200);

    await env.DB.prepare(`
      INSERT INTO contacts (missionary_id, email, phone, social, message, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(missionary_id) DO UPDATE SET
        email=excluded.email,
        phone=excluded.phone,
        social=excluded.social,
        message=excluded.message,
        updated_at=CURRENT_TIMESTAMP
    `).bind(id, email, phone, social, message).run();

    return json({ ok: true });
  } catch (e) {
    return json({ error: 'save_failed', detail: String(e.message || e) }, 500);
  }
}
