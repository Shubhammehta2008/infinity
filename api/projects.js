import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { client_id, client_email, id, status } = req.query;
      let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (id) q = q.eq('id', id);
      if (client_id) q = q.eq('client_id', client_id);
      if (client_email) q = q.eq('client_email', client_email);
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { client_id, client_email, client_name, title, type, description, budget_range, deadline, priority, reference_files, status } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });
      const payload = {
        client_id: client_id || null,
        client_email,
        client_name: client_name || null,
        title,
        type: type || 'Brand Identity',
        description: description || '',
        budget_range: budget_range || '',
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority: priority || 'Medium',
        reference_files: reference_files || [],
        final_files: [],
        status: status || 'Submitted'
      };
      const { data, error } = await supabase.from('projects').insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      if (updates.deadline) updates.deadline = new Date(updates.deadline).toISOString();
      updates.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('projects api', err);
    return res.status(500).json({ error: err.message });
  }
}
