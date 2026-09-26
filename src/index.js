const CONTACTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS contacts (
  missionary_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  social TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const MISSIONARIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS manual_missionaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

async function ensureDb(env) {
  if (!env.DB) throw new Error('Falta el binding D1 llamado DB en este Worker de Cloudflare');
  await env.DB.prepare(CONTACTS_TABLE_SQL).run();
  await env.DB.prepare(MISSIONARIES_TABLE_SQL).run();
}

async function handleHealth(request, env) {
  if (!authorized(request, env)) return json({ ok: false, error: 'Contraseña no autorizada' }, 401);
  try {
    await ensureDb(env);
    const row = await env.DB.prepare('SELECT 1 AS ok').first();
    return json({ ok: true, db: Boolean(row?.ok), binding: 'DB' });
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Error de D1' }, 500);
  }
}

async function handleContacts(request, env) {
  if (!authorized(request, env)) return json({ error: 'No autorizado' }, 401);
  try {
    await ensureDb(env);

    if (request.method === 'GET') {
      const { results = [] } = await env.DB.prepare(
        `SELECT missionary_id, email, phone, social, message, updated_at
         FROM contacts
         ORDER BY missionary_id ASC`
      ).all();
      return json({ records: results });
    }

    if (request.method === 'POST') {
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
    }

    return json({ error: 'Método no permitido' }, 405);
  } catch (error) {
    return json({ error: error?.message || 'Error al acceder a D1' }, 500);
  }
}

async function handleMissionaries(request, env) {
  if (!authorized(request, env)) return json({ error: 'No autorizado' }, 401);
  try {
    await ensureDb(env);

    if (request.method === 'GET') {
      const { results = [] } = await env.DB.prepare(
        `SELECT id, name, country, year, created_at
         FROM manual_missionaries
         ORDER BY name COLLATE NOCASE ASC, year ASC`
      ).all();
      return json({ records: results });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const clean = (value, max) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
      const name = clean(body.name, 160);
      const country = clean(body.country, 100);
      const year = Number(body.year);

      if (name.length < 3) return json({ error: 'Ingresa el nombre completo' }, 400);
      if (country.length < 2) return json({ error: 'Ingresa el país' }, 400);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) return json({ error: 'Año inválido' }, 400);

      const existing = await env.DB.prepare(
        `SELECT id, name, country, year, created_at
         FROM manual_missionaries
         WHERE lower(trim(name)) = lower(trim(?)) AND year = ?
         LIMIT 1`
      ).bind(name, year).first();

      if (existing) return json({ error: 'Ese misionero ya fue agregado manualmente', record: existing }, 409);

      const result = await env.DB.prepare(
        `INSERT INTO manual_missionaries (name, country, year, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      ).bind(name, country, year).run();

      const id = Number(result.meta?.last_row_id);
      return json({ ok: true, record: { id, name, country, year, contact_id: 100000 + id } }, 201);
    }

    return json({ error: 'Método no permitido' }, 405);
  } catch (error) {
    return json({ error: error?.message || 'Error al acceder a D1' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') return handleHealth(request, env);
    if (url.pathname === '/api/contacts') return handleContacts(request, env);
    if (url.pathname === '/api/missionaries') return handleMissionaries(request, env);

    return env.ASSETS.fetch(request);
  }
};
