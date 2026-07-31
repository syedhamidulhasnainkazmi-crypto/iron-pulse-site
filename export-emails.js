const { createClient } = require('@vercel/kv');

const kv = createClient({
  url: process.env.KV_REDIS_URL
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { key } = req.query;
  if (!key || key !== process.env.EXPORT_KEY) {
    return res.status(401).send('Unauthorized. Add ?key=YOUR_SECRET_KEY to the URL.');
  }

  try {
    const emails = await kv.smembers('signup-emails');
    let csv = 'Name,Email,SignedUpAt\n';

    for (const email of emails) {
      const record = await kv.get(`user:${email}`);
      if (record) {
        const safeName = (record.name || '').replace(/,/g, ' ');
        csv += `${safeName},${record.email},${record.createdAt}\n`;
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="iron-pulse-signups-${emails.length}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Something went wrong fetching the list.');
  }
};