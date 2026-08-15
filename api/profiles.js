import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { user_id, email, id } = req.query;
      let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (user_id) q = q.eq('user_id', user_id);
      if (email) q = q.eq('email', email);
      if (id) q = q.eq('id', id);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { user_id, email, role, full_name, company, avatar_url } = req.body;
      if (!user_id || !email) return res.status(400).json({ error: 'user_id and email required' });
      const payload = { user_id, email, role: role || 'client', full_name: full_name || email.split('@')[0], company: company || null, avatar_url: avatar_url || null };
      const { data: existing } = await supabase.from('profiles').select('*').eq('user_id', user_id).limit(1);
      if (existing && existing.length > 0) return res.status(200).json(existing[0]);
      const { data, error } = await supabase.from('profiles').insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, user_id, ...updates } = req.body;
      if (!id && !user_id) return res.status(400).json({ error: 'id or user_id required' });
      let q = supabase.from('profiles').update(updates);
      if (id) q = q.eq('id', id); else q = q.eq('user_id', user_id);
      const { data, error } = await q.select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('profiles api', err);
    return res.status(500).json({ error: err.message });
  }
}
