// js/atac.js
const ATAC = {
    async fetchTimetable(pathCode, daysFromNow = 0) {
        const endpoint = `https://viaggiacon.atac.roma.it/proxy/proxy.ashx?url=url.tpPortalPathTimetable/pathCode=${pathCode}&daysFromNow=${daysFromNow}`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Errore di rete ATAC');
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.timinglist)) {
            return data.timinglist;
        }
        throw new Error(`Nessun orario trovato per la linea ${pathCode}`);
    },

    renderTable(container, timinglist, pathCode, days) {
        const sorted = [...timinglist].sort((a, b) => {
            const hA = parseInt(a.time, 10);
            const hB = parseInt(b.time, 10);
            return (hA < 4 ? hA + 24 : hA) - (hB < 4 ? hB + 24 : hB);
        });

        let html = `
            <table class="atac-table">
                <thead>
                    <tr>
                        <th>Ora</th>
                        <th>Minuti di passaggio (${pathCode} — Giorno +${days})</th>
                    </tr>
                </thead>
                <tbody>`;

        sorted.forEach(item => {
            const hour = item.time.padStart(2, '0');
            const minutes = item.minute ? item.minute.split(' ').join(', ') : '-';
            html += `<tr><td class="hour-cell">${hour}</td><td class="minutes-cell">${minutes}</td></tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    },

    initWidgets() {
        document.querySelectorAll('[data-atac-lines]').forEach(widget => {
            const lines = widget.dataset.atacLines.split(',').map(s => s.trim());
            if (!lines.length) return;

            const initialLine = lines[0];

            const buttonsHtml = lines.map((line, idx) => 
                `<button type="button" class="line-btn ${idx === 0 ? 'active' : ''}" data-line="${line}">${line}</button>`
            ).join('');

            widget.innerHTML = `
                <div class="timetable-controls">
                    <div class="lines-list">${buttonsHtml}</div>
                    <div class="control-inputs" style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; margin-top:8px;">
                        <div class="input-item" style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size:0.725rem; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Codice Tratta:</label>
                            <input type="text" class="atac-path-input" value="${initialLine}" style="padding:6px 10px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--surface); color:var(--text-main); font-size:0.85rem; width:100px;">
                        </div>
                        <div class="input-item" style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size:0.725rem; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Giorni da oggi:</label>
                            <input type="number" class="atac-days-input" value="0" min="0" max="7" style="padding:6px 10px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--surface); color:var(--text-main); font-size:0.85rem; width:90px;">
                        </div>
                        <button type="button" class="fetch-btn atac-fetch-btn" style="padding:7px 14px; background:var(--primary); color:#fff; border:none; border-radius:var(--radius-sm); font-weight:600; font-size:0.825rem; cursor:pointer;">Carica Orari</button>
                    </div>
                </div>
                <div class="timetable-wrapper" style="margin-top:12px;">
                    <div class="timetable-placeholder">Caricamento orari in corso...</div>
                </div>
            `;

            const wrapper = widget.querySelector('.timetable-wrapper');
            const pathInput = widget.querySelector('.atac-path-input');
            const daysInput = widget.querySelector('.atac-days-input');
            const fetchBtn = widget.querySelector('.atac-fetch-btn');

            const load = async () => {
                const line = pathInput.value.trim();
                const days = daysInput.value || '0';
                if (!line) return;

                wrapper.innerHTML = '<div class="timetable-placeholder">Caricamento in corso...</div>';
                try {
                    const data = await ATAC.fetchTimetable(line, days);
                    ATAC.renderTable(wrapper, data, line, days);
                } catch (err) {
                    wrapper.innerHTML = `
                        <div class="timetable-placeholder">
                            Impossibile caricare direttamente (blocco CORS browser).<br>
                            <a href="https://viaggiacon.atac.roma.it/proxy/proxy.ashx?url=url.tpPortalPathTimetable/pathCode=${line}&daysFromNow=${days}" target="_blank" style="color:var(--primary); font-weight:600; margin-top:8px; display:inline-block;">Apri JSON Orari ATAC ➔</a>
                        </div>`;
                }
            };

            widget.querySelectorAll('.line-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    widget.querySelectorAll('.line-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    pathInput.value = btn.dataset.line;
                    load();
                });
            });

            fetchBtn.addEventListener('click', load);
            daysInput.addEventListener('change', load);

            load();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ATAC.initWidgets());
