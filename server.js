const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==============================
// Short.io Config
// ==============================
const API_KEY = "sk_4YZggpPrPO6FwLIW"; // 🔑 তোমার Secret API Key
const DOMAIN_ID = "1538613";                // 🔹 Domain ID

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Short.io Live Click Tracker API is running!");
});

// Click stats API
app.get("/api/clicks", async (req, res) => {
  const linkId = req.query.linkId;
  if (!linkId) return res.status(400).json({ error: "Missing linkId parameter" });

  try {
    const response = await axios.get(
      `https://api-v2.short.io/statistics/domain/${DOMAIN_ID}/link_clicks`,
      {
        params: { ids: linkId },
        headers: {
          accept: "*/*",
          authorization: API_KEY
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error("❌ Error fetching clicks:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.response ? err.response.data : err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
