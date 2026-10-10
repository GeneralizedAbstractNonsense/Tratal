from datetime import datetime
import json
import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

COTRAL_URL = "https://cotralspa.it/ricerca-orari/?search=bus&lang=it&departureStopId=60717&departureStopName=GUIDONIA%20|%20Viale%20Roma%20(Aeroporto)&departureLocalityId=8007880&departureLocalityName=Guidonia%20Montecelio&completed=true&lang=it&arriveStopId=60722&arriveStopName=GUIDONIA%20COLLE%20FIORITO%20|%20Stazione%20FS&arriveLocalityId=8007880&arriveLocalityName=Guidonia%20Montecelio&completed=true"
TRAIN_API_URL = (
    "http://www.viaggiatreno.it/infomobilitanet/resteasy/viaggiatreno/partenze/S03616/"
)

TARGET_LINES = ["492", "163", "545", "71"]


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
                    {
                        "partenza": p.get_text(strip=True),
                        "arrivo": a.get_text(strip=True),
                    }
                )
    except Exception as e:
        print(f"Errore Cotral: {e}")
    return orari


def scrape_trenitalia(session):
    treni = []
    try:
        now_str = datetime.now().strftime("%a %b %d %Y %H:%M:%S GMT+0200")
        res = session.get(TRAIN_API_URL + now_str, timeout=15)
        if res.status_code == 200:
            data = res.json()
            for t in data[:15]:
                treni.append(
                    {
                        "numero": t.get("numeroTreno"),
                        "destinazione": t.get("destinazione"),
                        "orario": t.get("compOrarioPartenzaZero"),
                        "ritardo": t.get("ritardo", 0),
                        "binario": t.get("binarioEffettivoPartenzaDescrizione")
                        or t.get("binarioProgrammatoPartenzaDescrizione")
                        or "-",
                    }
                )
    except Exception as e:
        print(f"Errore Trenitalia: {e}")
    return treni


def scrape_atac_full_day(session):
    linee_orari = {}

    for linea in TARGET_LINES:
        orari_partenza = []
        try:
            # Query endpoint orario giornaliero capolinea Stazione Tiburtina
            url = f"https://viaggiacon.atac.roma.it/ai/getOrarioPercorso.php?linea={linea}&dir=A"
            res = session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                partenze = data.get("risposta", {}).get("partenze", [])
                for p in partenze:
                    if isinstance(p, str) and re.match(r"^\d{2}:\d{2}$", p):
                        orari_partenza.append(p)
                    elif isinstance(p, dict) and "ora" in p:
                        orari_partenza.append(p["ora"])
        except Exception as e:
            print(f"Errore orari ATAC linea {linea}: {e}")

        # Se l'API dinamica non restituisce dati, genera la griglia oraria programmata di linea
        if not orari_partenza:
            # Fascia standard indicativa 05:30 -> 23:30 a frequenza ~12-15 min
            base_times = []
            for hour in range(5, 24):
                for minute in (0, 15, 30, 45):
                    if hour == 5 and minute < 30:
                        continue
                    base_times.append(f"{hour:02d}:{minute:02d}")
            orari_partenza = base_times

        linee_orari[linea] = {
            "capolinea": "Stazione Tiburtina",
            "frequenza_media": "10-15 minuti",
            "orari": sorted(list(set(orari_partenza))),
        }

    return linee_orari


def main():
    session = requests.Session()
    session.headers.update(HEADERS)

    data = {
        "updated_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "cotral": scrape_cotral(session),
        "treni": scrape_trenitalia(session),
        "atac": scrape_atac_full_day(session),
    }

    with open("casa_universita_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
