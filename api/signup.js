const { createClient } = require('redis');
const bcrypt = require('bcryptjs');

// Create Redis client using KV_REDIS_URL
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
    const { name, email, password } = req.body || {};
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ error: 'Name, email, and password are all required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const kv = await getRedisClient();
    const key = `user:${cleanEmail}`;
    const existing = await kv.get(key);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const record = {
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await kv.set(key, JSON.stringify(record));
    await kv.sAdd('signup-emails', cleanEmail);

    return res.status(200).json({ 
      success: true, 
      message: 'Account created successfully.' 
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
};
