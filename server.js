const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

const API_KEY = 'sk_tzIuIbEx726kD8uL';

app.use(express.static(__dirname));

app.get('/api/stats', async (req, res) => {
  const { linkId } = req.query;
  if (!linkId) return res.status(400).json({ error: 'Missing linkId' });

  try {
    const response = await axios.get(`https://api-v2.short.io/statistics/link/${linkId}`, {
      params: { period: 'total' },
      headers: { accept: '*/*', authorization: API_KEY }
    });

    const data = response.data;
    const humanClicks = data.humanClicks || 0;

    let countries = [];
    if (data.country) {
      countries = data.country.map(c => ({ ...c, score: c.humanScore || c.score }));
    }

    res.json({ humanClicks, countries });

  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
