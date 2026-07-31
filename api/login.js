const { createClient } = require('redis');
const bcrypt = require('bcryptjs');

let client;

async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.KV_REDIS_URL
    });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { email, password } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const kv = await getRedisClient();
    const data = await kv.get(`user:${cleanEmail}`);
    if (!data) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const record = JSON.parse(data);
    const match = await bcrypt.compare(password, record.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful.', 
      name: record.name, 
      email: record.email 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
};
