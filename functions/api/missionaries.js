const TABLE_SQL = `
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

async function ensureTable(env) {
  if (!env.DB) throw new Error('Falta el binding D1 llamado DB');
  await env.DB.prepare(TABLE_SQL).run();
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'No autorizado' }, 401);
  try {
    await ensureTable(env);
    const { results = [] } = await env.DB.prepare(
      `SELECT id, name, country, year, created_at
       FROM manual_missionaries
       ORDER BY name COLLATE NOCASE ASC, year ASC`
    ).all();
    return json({ records: results });
  } catch (error) {
    return json({ error: error?.message || 'Error al consultar misioneros manuales' }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: 'No autorizado' }, 401);
  try {
    await ensureTable(env);
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

    if (existing) {
      return json({ error: 'Ese misionero ya fue agregado manualmente', record: existing }, 409);
    }

    const result = await env.DB.prepare(
      `INSERT INTO manual_missionaries (name, country, year, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(name, country, year).run();

    const id = Number(result.meta?.last_row_id);
    return json({
      ok: true,
      record: { id, name, country, year, contact_id: 100000 + id }
    }, 201);
  } catch (error) {
    return json({ error: error?.message || 'Error al agregar misionero' }, 500);
  }
}
