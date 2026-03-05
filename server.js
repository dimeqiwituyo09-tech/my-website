const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_TOKEN = 'f8b27ebfc2364ef6b2b67d1183baa5c4'; 

app.use(express.static(path.join(__dirname)));

app.get('/api/matches', async (req, res) => {
    try {
        // 增加 competitions 参数，锁定五大联赛代码
        const response = await axios.get('https://api.football-data.org/v4/matches', {
            headers: { 'X-Auth-Token': API_TOKEN },
            params: {
                competitions: 'PL,PD,BL1,SA,FL1' 
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: '数据抓取失败' });
    }
});

app.listen(PORT, () => {
    console.log(`量子监控终端已启动`);
});

