<p align="center">
  <img src="icon-512.png" width="120" height="120" alt="Logo">
</p>

<h1 align="center">Tratal</h1>

<p align="center">
  <strong>All you need, where it should be.</strong>
</p>

<p align="center">
  A PWA designed to monitor transit timetables, weather and travel alerts in a single interface.
</p>

<p align="center">
  <a href="https://generalizedabstractnonsense.github.io/Tratal/">Website</a> ·
  <a href="#">Latest release</a> ·
  <a href="#">Issues</a>
</p>

## Purpose
Commuting across Rome and its province requires constantly checking multiple fragmented transit services, each with its own separate website or application. **Tratal** (whose name is a blend of **Tr**enitalia, **AT**AC and Cotr**al**) was created to fix this **personal** problem, indeed the application is designed only to be used by me. 

Beyond route timetables, the dashboard aggregates transit alerts (such as strikes and line disruptions) and real-time weather forecasts to provide a complete overview of the daily commute at a glance.

## Why I decided to create a Web App?
* **Simplicity and Lightweight Architecture:** Built using standard HTML, CSS and vanilla JavaScript without heavy frameworks in order to be easy to mantain.
* **Cross-Platform Portability:** Runs seamlessly on any operating system (iOS, Android, Windows, macOS, Linux) through any modern web browser.
* **PWA Ready:** Configured with a Service Worker and Web App Manifest, allowing it to be installed directly on mobile home screens as a progressive web app.

## How was this application developed?
Gemini free plan was used to generate an initial draft, which I then reviewed, edited and refined as needed.

## Technical Notes

### ATAC Timetable Integration and Route Code Extraction
The application retrieves live timetables for Rome's transit network (ATAC) by querying ATAC's public proxy endpoint (`proxy.ashx`). The frontend script parses server responses and dynamically renders line schedules into containers specified by custom data attributes like `data-atac-lines`.

To identify the specific route codes (`pathCode`) used by ATAC's backend (such as `METROB1R`, `163R`, or `492A`), the following reverse-engineering process was performed using **Waterfox Developer Tools**:
1. Opened the official ATAC / ViaggaConATAC timetable portal in Waterfox and launched Developer Tools (`F12`).
2. Navigated to the **Network** tab and filtered traffic by **XHR / Fetch**.
3. Selected and interacted with specific transit lines on the website.
4. Located outgoing `GET` requests targeting `proxy.ashx` formatted as:
   `https://viaggiacon.atac.roma.it/proxy/proxy.ashx?url=url.tpPortalPathTimetable/pathCode=CODE&daysFromNow=0`
5. Extracted the exact `pathCode` values and embedded them directly into HTML attributes (e.g., `data-atac-lines="492A, 163R, 545R, 71A, MEBA, METROB1R, ..."`).

### Weather Data Integration and Local Accuracy
* **Forecast Accuracy and ilMeteo:** *ilMeteo.it* was chosen as the primary weather reference for external links because it consistently delivers the most precise local forecasts according to my experience.
* **Real-time Processing and Severity Alerts:** Meteorological data (current temperature, WMO weather condition codes, wind speed and maximum precipitation probability) is fetched dynamically via the Open-Meteo API for both location coordinates. The client-side script parses these metrics to generate contextual alert badges directly within the weather cards flagging severe weather conditions (e.g., rain probability > 50% or winds > 30 km/h) that could disrupt extraurban Cotral buses and road traffic.

### Live Transit Alerts and News Aggregation
* **RSS Feed Processing:** Real-time mobility news and service disruptions are asynchronously retrieved from regional transportation feeds (such as *Astral Mobilità*) using a client-side proxy.
* **Sanitization and Categorization:** Raw feed items are parsed through a browser `DOMParser` instance to strip HTML tags and decode HTML entities cleanly. The script applies keyword-matching regex patterns (detecting terms like *sciopero*, *FL2*, *Cotral*, *ATAC*) to classify items, apply visual priority tags, and sort advisories hierarchically (placing strikes and critical alerts at the top).


## Incomplete To-Do List
- [ ] **Trenitalia Scraping / API Integration:** Implement direct status scraping/fetching for FL2 regional trains to display route-specific delays and real-time monitor alerts.
- [ ] **Cotral Live Route Alerts:** Scrape and parse Cotral advisories for specific extraurban routes.
- [ ] **Targeted Push Notifications:** Add visual indicators and alert banners dedicated strictly to saved personal routes.
- [ ] **Redesign:** Replace functional AI-made design with a self-made one.
