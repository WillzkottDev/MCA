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

async function readFromTable(db, table) {
  const sql = `SELECT missionary_id, email, phone, social, message FROM ${table} ORDER BY missionary_id`;
  const result = await db.prepare(sql).all();
  return result.results || [];
}

async function detectTable(db) {
  for (const table of ['contacts', 'missionary_contacts']) {
    try {
      await db.prepare(`SELECT missionary_id FROM ${table} LIMIT 1`).all();
      return table;
    } catch (_) {}
  }
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
  return 'contacts';
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.DB) return json({ error: 'Falta binding D1 llamado DB' }, 500);

  try {
    const table = await detectTable(env.DB);
    const records = await readFromTable(env.DB, table);
    return json({ ok: true, records });
  } catch (error) {
    return json({ error: error?.message || 'Database error' }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401);
  if (!env.DB) return json({ error: 'Falta binding D1 llamado DB' }, 500);

  let body;
  try {
    body = await request.json();
  } catch (_) {
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
    const table = await detectTable(env.DB);
    const sql = `
      INSERT INTO ${table} (missionary_id, email, phone, social, message, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(missionary_id) DO UPDATE SET
        email = excluded.email,
        phone = excluded.phone,
        social = excluded.social,
        message = excluded.message,
        updated_at = datetime('now')
    `;
    await env.DB.prepare(sql).bind(missionaryId, email, phone, social, message).run();
    return json({ ok: true, missionary_id: missionaryId });
  } catch (error) {
    // Compatibilidad con una tabla antigua sin columna updated_at.
    try {
      const table = await detectTable(env.DB);
      const fallbackSql = `
        INSERT INTO ${table} (missionary_id, email, phone, social, message)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(missionary_id) DO UPDATE SET
          email = excluded.email,
          phone = excluded.phone,
          social = excluded.social,
          message = excluded.message
      `;
      await env.DB.prepare(fallbackSql).bind(missionaryId, email, phone, social, message).run();
      return json({ ok: true, missionary_id: missionaryId });
    } catch (fallbackError) {
      return json({ error: fallbackError?.message || error?.message || 'Database error' }, 500);
    }
  }
}
