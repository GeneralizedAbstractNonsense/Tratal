// js/components.js
const TransportComponents = {
    initCotral() {
        document.querySelectorAll('[data-cotral-url]').forEach(el => {
            const url = el.dataset.cotralUrl;
            const label = el.dataset.label || 'Cotral';
            
            el.innerHTML = `
                <div style="margin-bottom: 12px; display:flex; justify-content:flex-end;">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="direct-btn">
                        <span>${label}</span>
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                </div>
                <div class="iframe-container">
                    <iframe src="${url}" 
                            title="${label}" 
                            loading="lazy" 
                            style="background-color: #000000; opacity: 0; transition: opacity 0.4s ease;" 
                            onload="this.style.opacity='1'">
                    </iframe>
                </div>
            `;
        });
    },

    initTrenitalia() {
        document.querySelectorAll('[data-treni-station]').forEach(widget => {
            const stationId = widget.dataset.treniStation;
            const filter = widget.dataset.treniFilter ? widget.dataset.treniFilter.split(',') : [];
            const rfiUrl = widget.dataset.rfiUrl || '';

            widget.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:8px; flex-wrap:wrap;">
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                        <button type="button" class="direct-btn btn-refresh-trains">Reload</button>
                        ${rfiUrl ? `
                            <a href="${rfiUrl}" target="_blank" rel="noopener noreferrer" class="direct-btn">
                                <span>RFI Monitor</span>
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                        ` : ''}
                    </div>
                    <span class="update-label train-last-update" style="font-size:0.8rem; color:var(--text-muted)">Ultimo agg: --:--</span>
                </div>
                <div class="train-list-container">
                    <div class="timetable-placeholder">Caricamento treni in corso...</div>
                </div>
            `;

            const container = widget.querySelector('.train-list-container');
            const updateLabel = widget.querySelector('.train-last-update');
            const refreshBtn = widget.querySelector('.btn-refresh-trains');

            const load = async () => {
                container.innerHTML = '<div class="timetable-placeholder">Caricamento partenze...</div>';
                try {
                    const dateStr = new Date().toUTCString();
                    const targetUrl = `http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/partenze/${stationId}/${dateStr}`;
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

                    let res = await fetch(proxyUrl);
                    if (!res.ok) {
                        res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
                    }
                    const trains = await res.json();

                    const filtered = filter.length > 0 
                        ? trains.filter(t => filter.some(d => (t.destinazione || '').toUpperCase().includes(d.trim().toUpperCase())))
                        : trains;

                    const now = new Date();
                    updateLabel.innerText = `Ultimo agg: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

                    if (!filtered || filtered.length === 0) {
                        container.innerHTML = '<div class="timetable-placeholder">Nessun treno in partenza al momento.</div>';
                        return;
                    }

                    let html = '<div class="train-list">';
                    filtered.slice(0, 8).forEach(t => {
                        const delay = t.ritardo || 0;
                        const statusClass = delay > 0 ? 'delay' : 'ontime';
                        const statusText = delay > 0 ? `+${delay} min` : 'In orario';
                        const track = t.binarioEffettivoPartenzaDescrizione || t.binarioProgrammatoPartenzaDescrizione || '--';

                        html += `
                            <div class="train-item">
                                <div><span class="train-time">${t.compOrarioPartenza || '--:--'}</span></div>
                                <div style="flex:1; margin:0 12px;">
                                    <div class="train-dest">${t.destinazione}</div>
                                    <div class="train-meta">${t.compTipologiaTreno || 'REG'} ${t.numeroTreno} • Binario ${track}</div>
                                </div>
                                <span class="status-badge ${statusClass}">${statusText}</span>
                            </div>`;
                    });
                    html += '</div>';
                    container.innerHTML = html;
                } catch (err) {
                    container.innerHTML = `
                        <div class="timetable-placeholder">
                            Impossibile recuperare i dati live in questo momento.
                        </div>`;
                }
            };

            refreshBtn.addEventListener('click', load);
            load();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    TransportComponents.initCotral();
    TransportComponents.initTrenitalia();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
