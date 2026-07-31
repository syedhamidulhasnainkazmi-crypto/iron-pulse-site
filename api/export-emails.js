const { createClient } = require('redis');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { key } = req.query;
  if (!key || key !== process.env.EXPORT_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid export key.' });
  }

  try {
    const kv = await getRedisClient();
    const emails = await kv.sMembers('signup-emails') || [];
    let csv = 'Name,Email,SignedUpAt\n';

    for (const email of emails) {
      const data = await kv.get(`user:${email}`);
      if (data) {
        const record = JSON.parse(data);
        const safeName = (record.name || '').replace(/,/g, ' ');
        csv += `${safeName},${record.email},${record.createdAt}\n`;
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="iron-pulse-signups-${emails.length}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: err.message || 'Something went wrong.' });
  }
};
