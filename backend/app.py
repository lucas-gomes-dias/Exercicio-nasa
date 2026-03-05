import os
from datetime import date as date_type
from datetime import datetime
from pathlib import Path

import requests
import urllib3
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS


BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
APOD_FIRST_DATE = date_type(1995, 6, 16)

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)

NASA_API_KEY = os.getenv("NASA_API_KEY")

# Desabilita warnings de certificado inválido (apenas para este projeto local)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)


@app.route("/")
def index():
    today = date_type.today()
    return render_template(
        "index.html",
        min_date=APOD_FIRST_DATE.isoformat(),
        max_date=today.isoformat(),
    )


@app.route("/api/apod")
def apod():
    """
    Endpoint que recebe uma data (YYYY-MM-DD) e retorna os dados do APOD da NASA.
    """
    if not NASA_API_KEY:
        return (
            jsonify(
                {
                    "error": "Chave da API da NASA não configurada. Verifique o arquivo .env (NASA_API_KEY)."
                }
            ),
            500,
        )

    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "Parâmetro 'date' é obrigatório (YYYY-MM-DD)."}), 400

    try:
        requested = datetime.fromisoformat(date_str).date()
    except ValueError:
        return jsonify({"error": "Data inválida. Use o formato YYYY-MM-DD."}), 400

    today = date_type.today()
    if requested < APOD_FIRST_DATE:
        return (
            jsonify(
                {
                    "error": f"A API APOD possui dados a partir de {APOD_FIRST_DATE.isoformat()}."
                }
            ),
            400,
        )

    if requested > today:
        return jsonify({"error": "A data não pode estar no futuro."}), 400

    nasa_url = "https://api.nasa.gov/planetary/apod"
    params = {
        "api_key": NASA_API_KEY,
        "date": requested.isoformat(),
    }

    try:
        # verify=False contorna o problema de certificado SSL local
        response = requests.get(nasa_url, params=params, timeout=10, verify=False)
    except requests.RequestException as exc:
        # Log simples no console para depuração
        print(f"[ERRO NASA APOD] Falha na requisição: {exc}")
        return (
            jsonify(
                {
                    "error": f"Falha ao conectar com a API da NASA: {exc}",
                }
            ),
            502,
        )

    if not response.ok:
        try:
            payload = response.json()
            msg = payload.get("msg") or payload.get("error") or "Erro na API da NASA."
        except ValueError:
            msg = "Erro na API da NASA."
        return jsonify({"error": msg, "status": response.status_code}), response.status_code

    data = response.json()

    return jsonify(
        {
            "title": data.get("title"),
            "date": data.get("date"),
            "url": data.get("url"),
            "hdurl": data.get("hdurl"),
            "explanation": data.get("explanation"),
            "copyright": data.get("copyright"),
            "media_type": data.get("media_type"),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

