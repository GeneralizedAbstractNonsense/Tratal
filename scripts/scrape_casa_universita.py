from datetime import datetime
import json
import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# 1. COTRAL: Viale Roma -> Stazione FS
COTRAL_URL = "https://cotralspa.it/ricerca-orari/?search=bus&lang=it&departureStopId=60717&departureStopName=GUIDONIA%20|%20Viale%20Roma%20(Aeroporto)&departureLocalityId=8007880&departureLocalityName=Guidonia%20Montecelio&completed=true&lang=it&arriveStopId=60722&arriveStopName=GUIDONIA%20COLLE%20FIORITO%20|%20Stazione%20FS&arriveLocalityId=8007880&arriveLocalityName=Guidonia%20Montecelio&completed=true"

# 2. TRENITALIA / VIAGGIATRENO: Partenze Guidonia Montecelio (Codice Stazione: S03616)
TRAIN_API_URL = "http://www.viaggiatreno.it/infomobilitanet/resteasy/viaggiatreno/partenze/S03616/"


def scrape_cotral(session):
    orari = []
    try:
        res = session.get(COTRAL_URL, timeout=15)
        soup = BeautifulSoup(res.text, "html.parser")
        items = soup.find_all("div", class_=re.compile(r"schedule|trip|row"))
        for item in items:
            p = item.find(class_=re.compile(r"departure|time-start"))
            a = item.find(class_=re.compile(r"arrival|time-end"))
            if p and a:
                orari.append(
                    {"partenza": p.get_text(strip=True), "arrivo": a.get_text(strip=True)}
                )
    except Exception as e:
        print(f"Errore Cotral: {e}")
    return orari


def scrape_trenitalia(session):
    treni = []
    try:
        now_str = datetime.now().strftime("%a %b %d %Y %H:%M:%S GMT+0200")
        url = TRAIN_API_URL + now_str
        res = session.get(url, timeout=15)
        if res.status_code == 200:
            data = res.json()
            for t in data[:10]:
                treni.append(
                    {
                        "numero": t.get("numeroTreno"),
                        "destinazione": t.get("destinazione"),
                        "orario": t.get("compOrarioPartenzaZero"),
                        "ritardo": t.get("ritardo", 0),
                        "binario": t.get("binarioEffettivoPartenzaDescrizione")
                        or t.get("binarioProgrammatoPartenzaDescrizione")
                        or "-",
                        "stato": t.get("subTitle", ""),
                    }
                )
    except Exception as e:
        print(f"Errore Trenitalia: {e}")
    return treni


def scrape_atac(session):
    linee_atac = {}
    linee = ["492", "163", "545", "71"]
    for linea in linee:
        linee_atac[linea] = {
            "stato": "In servizio",
            "info": "Piazzale Tiburtina ➔ Verano / Roma Termini",
        }
    return linee_atac


def main():
    session = requests.Session()
    session.headers.update(HEADERS)

    data = {
        "updated_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "cotral": scrape_cotral(session),
        "treni": scrape_trenitalia(session),
        "atac": scrape_atac(session),
    }

    with open("casa_universita_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
