import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { project_id } = req.query;
      if (!project_id) return res.status(400).json({ error: 'project_id required' });
      const { data, error } = await supabase.from('comments').select('*').eq('project_id', project_id).order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { project_id, author_id, author_name, author_role, message } = req.body;
      if (!project_id || !message) return res.status(400).json({ error: 'project_id and message required' });
      const payload = { project_id, author_id: author_id || null, author_name: author_name || 'Client', author_role: author_role || 'client', message };
      const { data, error } = await supabase.from('comments').insert(payload).select().single();
      if (error) throw error;
      // touch project updated_at
      await supabase.from('projects').update({ updated_at: new Date().toISOString() }).eq('id', project_id);
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('comments api', err);
    return res.status(500).json({ error: err.message });
  }
}
