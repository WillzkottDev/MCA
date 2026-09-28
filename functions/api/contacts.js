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

async function ensureContacts(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contacts (
      missionary_id INTEGER PRIMARY KEY,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      social TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `).run();
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.DB) return json({ error: 'Falta binding D1 llamado DB' }, 500);

  try {
    await ensureContacts(env.DB);

    const result = await env.DB.prepare(`
      SELECT
        m.id AS missionary_id,
        m.name,
        m.country,
        m.year,
        COALESCE(c.email, '') AS email,
        COALESCE(c.phone, '') AS phone,
        COALESCE(c.social, '') AS social,
        COALESCE(c.message, '') AS message
      FROM missionaries m
      LEFT JOIN contacts c
        ON c.missionary_id = m.id
      ORDER BY m.name COLLATE NOCASE
    `).all();

    return json({ ok: true, records: result.results || [] });
  } catch (error) {
    const msg = String(error?.message || 'Database error');
    if (msg.toLowerCase().includes('no such table') && msg.toLowerCase().includes('missionaries')) {
      return json({
        error: 'Falta crear/cargar la tabla missionaries. Ejecuta migration.sql una vez en la consola D1.'
      }, 500);
    }
    return json({ error: msg }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.DB) return json({ error: 'Falta binding D1 llamado DB' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const missionaryId = Number(body.missionary_id);
  if (!Number.isInteger(missionaryId) || missionaryId < 1 || missionaryId > 10000) {
    return json({ error: 'missionary_id inválido' }, 400);
  }

  const email = String(body.email || '').trim().slice(0, 320);
  const phone = String(body.phone || '').trim().slice(0, 80);
  const social = String(body.social || '').trim().slice(0, 500);
  const message = String(body.message || '').trim().slice(0, 5000);

  try {
    await ensureContacts(env.DB);

    const exists = await env.DB.prepare(
      `SELECT id FROM missionaries WHERE id = ? LIMIT 1`
    ).bind(missionaryId).first();

    if (!exists) return json({ error: 'Misionero no existe en missionaries' }, 404);

    await env.DB.prepare(`
      INSERT INTO contacts (missionary_id, email, phone, social, message, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(missionary_id) DO UPDATE SET
        email = excluded.email,
        phone = excluded.phone,
        social = excluded.social,
        message = excluded.message,
        updated_at = datetime('now')
    `).bind(missionaryId, email, phone, social, message).run();

    return json({ ok: true, missionary_id: missionaryId });
  } catch (error) {
    return json({ error: String(error?.message || 'Database error') }, 500);
  }
}
