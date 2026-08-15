import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { fileName, fileBase64, contentType, folder } = req.body;
    if (!fileName || !fileBase64) return res.status(400).json({ error: 'fileName and fileBase64 required' });
    const buffer = Buffer.from(fileBase64, 'base64');
    const safeName = `${folder ? folder + '/' : ''}${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error } = await supabase.storage.from('portal-files').upload(safeName, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('portal-files').getPublicUrl(safeName);
    return res.status(200).json({ url: urlData.publicUrl, path: safeName });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ error: err.message });
  }
}
