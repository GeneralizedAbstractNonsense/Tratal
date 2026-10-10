from datetime import datetime
import json
import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "it-IT,it;q=0.9",
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


def scrape_atac_real(session):
    linee_orari = {}

    for linea in TARGET_LINES:
        orari_partenza = []
        try:
            # Query endpoint orari di linea ufficiali Roma Mobilitá / ATAC
            url = f"https://romamobilita.it/it/servizi/orari-linee-bus?linea={linea}"
            res = session.get(url, timeout=10)

            if res.status_code == 200:
                soup = BeautifulSoup(res.text, "html.parser")
                # Estrazione orari visibili nella pagina della linea
                time_tags = soup.find_all(
                    ["span", "td", "div"], text=re.compile(r"^\d{2}:\d{2}$")
                )
                for tag in time_tags:
                    t_str = tag.get_text(strip=True)
                    if t_str not in orari_partenza:
                        orari_partenza.append(t_str)

            # API secondaria di fallback diretta ViaggiaCon ATAC
            if not orari_partenza:
                api_url = f"https://viaggiacon.atac.roma.it/ai/getOrarioPercorso.php?linea={linea}&dir=A"
                res_api = session.get(api_url, timeout=10)
                if res_api.status_code == 200:
                    data = res_api.json()
                    partenze = data.get("risposta", {}).get("partenze", [])
                    for p in partenze:
                        if isinstance(p, str) and re.match(
                            r"^\d{2}:\d{2}$", p
                        ):
                            orari_partenza.append(p)
                        elif isinstance(p, dict) and "ora" in p:
                            orari_partenza.append(p["ora"])
        except Exception as e:
            print(f"Errore caricamento ATAC per linea {linea}: {e}")

        # Salva solo i dati reali trovati (senza generare mai orari finti)
        linee_orari[linea] = {
            "capolinea": "Stazione Tiburtina",
            "orari": sorted(list(set(orari_partenza))),
            "totale": len(orari_partenza),
        }

    return linee_orari


def main():
    session = requests.Session()
    session.headers.update(HEADERS)

    data = {
        "updated_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "cotral": scrape_cotral(session),
        "treni": scrape_trenitalia(session),
        "atac": scrape_atac_real(session),
    }

    with open("casa_universita_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
