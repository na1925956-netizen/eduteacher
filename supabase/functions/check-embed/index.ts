// Optional Supabase Edge Function: tells the admin panel whether a site can be shown in an iframe.
// Deploy: Dashboard → Edge Functions → Deploy a new function → name "check-embed" → paste this file.
// Only signed-in admins may call it (prevents it being used as an open proxy).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) return json({ error: 'forbidden' }, 403);

  let target: URL;
  try {
    const { url } = await req.json();
    target = new URL(String(url));
    if (target.protocol !== 'https:' && target.protocol !== 'http:') throw new Error();
  } catch {
    return json({ error: 'invalid url' }, 400);
  }

  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
    await res.body?.cancel();
    const xfo = (res.headers.get('x-frame-options') ?? '').toLowerCase();
    const fa = /frame-ancestors([^;]*)/i.exec(res.headers.get('content-security-policy') ?? '')?.[1]?.trim() ?? '';
    const blockedByXfo = xfo.includes('deny') || xfo.includes('sameorigin');
    const blockedByCsp = fa !== '' && !fa.split(/\s+/).includes('*');
    return json({ embeddable: res.ok && !blockedByXfo && !blockedByCsp, status: res.status });
  } catch {
    return json({ embeddable: false, error: 'unreachable' });
  }
});
