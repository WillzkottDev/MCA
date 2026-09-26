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
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function authorized(request, env) {
  const received = request.headers.get('X-MCA-Password') || '';
  const expected = env.MCA_PASSWORD || 'MCA';
  return received === expected;
}

async function ensureTable(env) {
  if (!env.DB) throw new Error('Falta el binding D1 llamado DB');
  await env.DB.prepare(TABLE_SQL).run();
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'No autorizado' }, 401);
  try {
    await ensureTable(env);
    const { results = [] } = await env.DB.prepare(
      `SELECT missionary_id, email, phone, social, message, updated_at
       FROM contacts
       ORDER BY missionary_id ASC`
    ).all();
    return json({ records: results });
  } catch (error) {
    return json({ error: error?.message || 'Error al consultar D1' }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'No autorizado' }, 401);
  try {
    await ensureTable(env);
    const body = await request.json();
    const missionaryId = Number(body.missionary_id);
    if (!Number.isInteger(missionaryId) || missionaryId < 1 || missionaryId > 2147483647) {
      return json({ error: 'missionary_id inválido' }, 400);
    }

    const clean = value => String(value ?? '').trim();
    const email = clean(body.email).slice(0, 180);
    const phone = clean(body.phone).slice(0, 80);
    const social = clean(body.social).slice(0, 240);
    const message = clean(body.message).slice(0, 1200);

    await env.DB.prepare(
      `INSERT INTO contacts (missionary_id, email, phone, social, message, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(missionary_id) DO UPDATE SET
         email = excluded.email,
         phone = excluded.phone,
         social = excluded.social,
         message = excluded.message,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(missionaryId, email, phone, social, message).run();

    return json({ ok: true, missionary_id: missionaryId });
  } catch (error) {
    return json({ error: error?.message || 'Error al guardar en D1' }, 500);
  }
}
