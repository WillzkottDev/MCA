function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
  });
}

function authorized(request,env){
  const received=request.headers.get('X-MCA-Password')||'';
  const expected=env.MCA_PASSWORD||'MCA';
  return received===expected;
}

async function ensureTable(db){
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS manual_missionaries (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      year INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `).run();
}

export async function onRequestGet({request,env}){
  if(!authorized(request,env)) return json({error:'Unauthorized'},401);
  if(!env.DB) return json({error:'Falta binding DB'},500);

  try{
    await ensureTable(env.DB);
    const result=await env.DB.prepare(`
      SELECT id,name,country,year
      FROM manual_missionaries
      ORDER BY name COLLATE NOCASE
    `).all();
    return json({ok:true,records:result.results||[]});
  }catch(error){
    return json({error:String(error?.message||'Database error')},500);
  }
}

export async function onRequestPost({request,env}){
  if(!authorized(request,env)) return json({error:'Unauthorized'},401);
  if(!env.DB) return json({error:'Falta binding DB'},500);

  let body;
  try{ body=await request.json(); }
  catch{ return json({error:'JSON inválido'},400); }

  const name=String(body.name||'').trim().slice(0,200);
  const country=String(body.country||'').trim().slice(0,120);
  const year=Number(body.year);

  if(!name||!country||!Number.isInteger(year)||year<1900||year>2100){
    return json({error:'Datos inválidos'},400);
  }

  try{
    await ensureTable(env.DB);
    const row=await env.DB.prepare(`
      SELECT COALESCE(MAX(id),999)+1 AS next_id
      FROM manual_missionaries
      WHERE id>=1000
    `).first();
    const id=Math.max(1000,Number(row?.next_id||1000));

    await env.DB.prepare(`
      INSERT INTO manual_missionaries (id,name,country,year,created_at,updated_at)
      VALUES (?,?,?,?,datetime('now'),datetime('now'))
    `).bind(id,name,country,year).run();

    return json({ok:true,record:{id,name,country,year}});
  }catch(error){
    return json({error:String(error?.message||'Database error')},500);
  }
}
