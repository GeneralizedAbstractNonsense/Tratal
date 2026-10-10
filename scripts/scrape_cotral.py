from datetime import datetime
import json
import re
import requests
from bs4 import BeautifulSoup

# URL di ricerca orari per la tratta Bagni di Tivoli -> Guidonia
SEARCH_URL = "https://cotralspa.it/ricerca-orari/?search=bus&lang=it&departureStopId=60719&departureStopName=GUIDONIA%20|%20Via%20Morante%20Via%20Tiburtina&departureLocalityId=8001858&departureLocalityName=Bagni%20di%20Tivoli&completed=true&lang=it&arriveStopId=60717&arriveStopName=GUIDONIA%20|%20Viale%20Roma%20(Aeroporto)&arriveLocalityId=8007880&arriveLocalityName=Guidonia%20Montecelio&completed=true"
AVVISI_URL = "https://cotralspa.it/avvisi/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def get_cotral_data():
    session = requests.Session()
    session.headers.update(HEADERS)

    # 1. Recupero Orari
    orari = []
    try:
        response = session.get(SEARCH_URL, timeout=15)
        soup = BeautifulSoup(response.text, "html.parser")

        # Parsing degli elementi orario dalla pagina Cotral
        schedule_items = soup.find_all("div", class_=re.compile(r"schedule|trip|row"))
        for item in schedule_items:
            partenza = item.find(class_=re.compile(r"departure|time-start"))
            arrivo = item.find(class_=re.compile(r"arrival|time-end"))
            if partenza and arrivo:
                orari.append(
                    {
                        "partenza": partenza.get_text(strip=True),
                        "arrivo": arrivo.get_text(strip=True),
                    }
                )
    except Exception as e:
        print(f"Errore recupero orari: {e}")

    # 2. Recupero Avvisi / Notizie
    avvisi = []
    try:
        res_avvisi = session.get(AVVISI_URL, timeout=15)
        soup_avvisi = BeautifulSoup(res_avvisi.text, "html.parser")

        # Filtra gli avvisi pertinenti (Tivoli, Guidonia, Tiburtina)
        articles = soup_avvisi.find_all(["article", "div"], class_=re.compile(r"post|news|avviso"))
        for art in articles[:5]:
            titolo = art.find(["h2", "h3", "a"])
            link = art.find("a", href=True)
            if titolo:
                txt = titolo.get_text(strip=True)
                # Verifica pertinenza geografica
                if any(k in txt.lower() for k in ["guidonia", "tivoli", "tiburtina", "reparto"]):
                    avvisi.append(
                        {
                            "titolo": txt,
                            "link": link["href"] if link else AVVISI_URL,
                        }
                    )
    except Exception as e:
        print(f"Errore recupero avvisi: {e}")

    # Struttura finale JSON
    output_data = {
        "updated_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "tratta": "Bagni di Tivoli ➔ Guidonia",
        "orari": orari,
        "avvisi": avvisi,
    }

    with open("cotral_data.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    get_cotral_data()
