import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { client_id, project_id, id } = req.query;
      let q = supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (id) q = q.eq('id', id);
      if (client_id) q = q.eq('client_id', client_id);
      if (project_id) q = q.eq('project_id', project_id);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { project_id, client_id, client_email, title, amount, currency, status, due_date, items } = req.body;
      if (!title || amount == null) return res.status(400).json({ error: 'title and amount required' });
      const payload = {
        project_id: project_id || null,
        client_id: client_id || null,
        client_email: client_email || null,
        title,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        status: status || 'Unpaid',
        due_date: due_date ? new Date(due_date).toISOString() : null,
        items: items || []
      };
      const { data, error } = await supabase.from('invoices').insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      if (updates.paid) {
        updates.status = 'Paid';
        updates.paid_at = new Date().toISOString();
        delete updates.paid;
      }
      if (updates.due_date) updates.due_date = new Date(updates.due_date).toISOString();
      if (updates.amount) updates.amount = parseFloat(updates.amount);
      const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('invoices api', err);
    return res.status(500).json({ error: err.message });
  }
}
