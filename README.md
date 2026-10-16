# Tratal - Public Transport Dashboard

## Purpose & Scope
Commuting across Rome and its province requires constantly checking multiple fragmented transit services—including Trenitalia, Cotral, and ATAC, each with its own separate website or application[cite: 3]. **Tratal** was created to fix this personal problem[cite: 3].

Beyond route timetables, the dashboard aggregates transit alerts (such as strikes and line disruptions) and real-time weather forecasts to provide a complete overview of the daily commute at a glance[cite: 3].

## Why I decided to create a Web App?
* **Simplicity & Lightweight Architecture:** Built using standard HTML, CSS, and vanilla JavaScript without heavy frameworks in order to be easy to mantain[cite: 1, 3].
* **Cross-Platform Portability:** Runs seamlessly on any operating system (iOS, Android, Windows, macOS, Linux) through any modern web browser.
* **PWA Ready:** Configured with a Service Worker and Web App Manifest, allowing it to be installed directly on mobile home screens as a progressive web app[cite: 6, 8].

## Technical Notes

### ATAC Timetable Integration & Route Code Extraction
The application retrieves live timetables for Rome's transit network (ATAC) by querying ATAC's public proxy endpoint (`proxy.ashx`). The frontend script parses server responses and dynamically renders line schedules into containers specified by custom data attributes like `data-atac-lines`[cite: 2, 5].

To identify the specific route codes (`pathCode`) used by ATAC's backend (such as `METROB1R`, `163R`, or `492A`)[cite: 2], the following reverse-engineering process was performed using **Waterfox Developer Tools**:
1. Opened the official ATAC / ViaggaConATAC timetable portal in Waterfox and launched Developer Tools (`F12`).
2. Navigated to the **Network** tab and filtered traffic by **XHR / Fetch**.
3. Selected and interacted with specific transit lines on the website.
4. Located outgoing `GET` requests targeting `proxy.ashx` formatted as:
   `https://viaggiacon.atac.roma.it/proxy/proxy.ashx?url=url.tpPortalPathTimetable/pathCode=CODE&daysFromNow=0`
5. Extracted the exact `pathCode` values and embedded them directly into HTML attributes (e.g., `data-atac-lines="492A, 163R, 545R, 71A, MEBA, METROB1R, ..."`)[cite: 2].

## Incomplete To-Do List
- [ ] **Trenitalia Scraping / API Integration:** Implement direct status scraping/fetching for FL2 regional trains to display route-specific delays and real-time monitor alerts[cite: 2, 3].
- [ ] **Cotral Live Route Alerts:** Scrape and parse Cotral advisories for specific extraurban routes.
- [ ] **Targeted Push Notifications:** Add visual indicators and alert banners dedicated strictly to saved personal routes[cite: 3].
