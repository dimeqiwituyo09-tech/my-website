const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ODDS_API_KEY;

// 静态文件目录
app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    if (!API_KEY) return res.status(500).json({ error: "Missing API Key" });

    const leagues = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 'soccer_italy_serie_a', 'soccer_france_ligue_1'];
    
    try {
        // 并行抓取 5 大联赛
        const requests = leagues.map(league => 
            fetch(`https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${API_KEY}&regions=uk&markets=h2h&bookmakers=williamhill,pinnacle`)
            .then(r => r.ok ? r.json() : [])
        );

        const results = await Promise.all(requests);
        const combinedData = results.flat();
        
        res.json(combinedData);
    } catch (err) {
        console.error(err);
        res.status(500).send("Fetch Failed");
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 核心修复：必须绑定 0.0.0.0 和 process.env.PORT
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quantum Engine V4.2 running on port ${PORT}`);
});
