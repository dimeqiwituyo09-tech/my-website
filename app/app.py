import os
import requests
import sqlite3
from flask import Flask, jsonify, send_from_directory
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

DB_NAME = "odds_history.db"
API_KEY = os.getenv("ODDS_API_KEY")

# 初始化数据库
def init_db():
    conn = sqlite3.connect(DB_NAME)
    conn.execute('''CREATE TABLE IF NOT EXISTS odds_log 
        (id TEXT, teams TEXT, home_odds REAL, timestamp DATETIME)''')
    conn.commit()
    conn.close()

@app.route('/api/data')
def get_data():
    # 仅限五大联赛
    leagues = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 'soccer_italy_serie_a', 'soccer_france_ligue_1']
    all_matches = []
    now = datetime.now()
    limit_time = now + timedelta(hours=48)

    for league in leagues:
        url = f"https://api.the-odds-api.com/v4/sports/{league}/odds/?apiKey={API_KEY}&regions=uk&markets=h2h&bookmakers=williamhill,pinnacle"
        try:
            res = requests.get(url).json()
            if isinstance(res, list):
                # 核心逻辑：只取 48 小时内的比赛
                filtered = [m for m in res if datetime.strptime(m['commence_time'], '%Y-%m-%dT%H:%M:%SZ') <= limit_time]
                all_matches.extend(filtered)
        except: continue
    return jsonify(all_matches)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    init_db()
    # 修复 SIGTERM 的关键：绑定 0.0.0.0 和环境变量 PORT
    port = int(os.environ.get("PORT", 3000))
    app.run(host='0.0.0.0', port=port)
