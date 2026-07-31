const { createClient } = require('@vercel/kv');
const bcrypt = require('bcryptjs');

const kv = createClient({
  url: process.env.KV_REDIS_URL
});

module.exports = async (req, res) => {
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

    await kv.set(key, record);
    await kv.sadd('signup-emails', cleanEmail);

    return res.status(200).json({ message: 'Account created successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
