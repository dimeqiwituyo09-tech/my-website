import os
import requests
from flask import Flask, jsonify, send_from_directory
from datetime import datetime, timedelta
from flask_cors import CORS

# 【关键】这一行必须在函数外面，且名字必须是 app
app = Flask(__name__, static_folder='.')
CORS(app)

API_KEY = os.getenv("ODDS_API_KEY")

@app.route('/api/data')
def get_data():
    leagues = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 'soccer_italy_serie_a', 'soccer_france_ligue_1']
    all_matches = []
    now = datetime.utcnow()
    limit_time = now + timedelta(hours=48)

    if not API_KEY:
        return jsonify({"error": "Missing API Key"}), 500

    for league in leagues:
        url = f"https://api.the-odds-api.com/v4/sports/{league}/odds/?apiKey={API_KEY}&regions=uk&markets=h2h&bookmakers=williamhill,pinnacle"
        try:
            res = requests.get(url).json()
            if isinstance(res, list):
                for m in res:
                    m_time = datetime.strptime(m['commence_time'], '%Y-%m-%dT%H:%M:%SZ')
                    if now <= m_time <= limit_time:
                        all_matches.append(m)
        except: continue
            
    return jsonify(all_matches)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(host='0.0.0.0', port=port)

