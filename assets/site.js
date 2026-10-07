(() => {
    const routes = [
        { key: 'inicio', label: 'Inicio', path: './', icon: 'fa-house' },
        { key: 'servicios', label: 'Servicios', path: 'servicios/', icon: 'fa-flask-vial' },
        { key: 'mujer', label: 'Mujer', path: 'mujer/', icon: 'fa-venus' },
        { key: 'sucursales', label: 'Sucursales', path: 'sucursales/', icon: 'fa-location-dot' },
        { key: 'conocenos', label: 'Conócenos', path: 'conocenos/', icon: 'fa-building' },
        { key: 'unete', label: 'Únete a nosotros', path: 'unete/', icon: 'fa-briefcase' },
    ];

    const quickRoutes = [
        { label: 'Empresas B2B', path: 'empresas/', icon: 'fa-building-user' },
        { label: 'Médicos', path: 'medicos/', icon: 'fa-user-doctor' },
        { label: 'Facturación', path: 'empresas/#facturacion', icon: 'fa-file-invoice-dollar' },
        { label: 'Contrataciones', path: 'unete/', icon: 'fa-briefcase' },
    ];

    const services = [
        { name: 'Perfil Integral 27 elementos', category: 'Preventivo', price: '$930', time: 'Un día hábil', icon: 'fa-heart-pulse', includes: ['biometría hemática', 'química sanguínea', 'perfil lipídico', 'EGO', 'examen general de orina', 'glucosa', 'colesterol', 'triglicéridos'] },
        { name: 'Perfil Tiroideo 3', category: 'Hormonal', price: '$1,400', time: 'Menos de 36 horas', icon: 'fa-chart-line', includes: ['TSH', 'T3', 'T4', 'tiroides'] },
        { name: 'Perfil Hormonal Completo', category: 'Hormonal', price: '$1,200', time: 'Menos de 36 horas', icon: 'fa-dna', includes: ['FSH', 'LH', 'estradiol', 'progesterona', 'prolactina', 'testosterona'] },
        { name: 'Paquete Ginecológico / Urológico', category: 'Especialidad', price: '$650', time: 'Un día hábil', icon: 'fa-shield-heart', includes: ['Papanicolaou', 'colposcopía', 'urocultivo', 'EGO', 'PSA'] },
        { name: 'Perfil Masculino Preventivo', category: 'Preventivo', price: '$1,090', time: 'Un día hábil', icon: 'fa-user-check', includes: ['PSA', 'antígeno prostático', 'biometría hemática', 'química sanguínea', 'EGO'] },
        { name: 'Mastografía', category: 'Imagen', price: '$400', time: 'Entrega programada', icon: 'fa-x-ray', includes: ['mama', 'detección oportuna', 'imagen'] },
        { name: 'Electrocardiograma', category: 'Gabinete', price: '$320', time: 'Entrega programada', icon: 'fa-wave-square', includes: ['ECG', 'ritmo cardiaco', 'gabinete'] },
        { name: 'Ultrasonido General', category: 'Imagen', price: '$520', time: 'Entrega programada', icon: 'fa-display', includes: ['ultrasonido', 'abdomen', 'pélvico', 'imagen'] },
        { name: 'Química Sanguínea', category: 'Laboratorio', price: '$280', time: 'Un día hábil', icon: 'fa-vial', includes: ['glucosa', 'urea', 'creatinina', 'ácido úrico', 'colesterol', 'triglicéridos'] },
        { name: 'Tomografía programada', category: 'Servicios especiales', price: 'Con cita', time: 'Requiere agenda', icon: 'fa-notes-medical', includes: ['tomografía', 'tac', 'cita'] },
    ];

    const branches = [
        { key: 'Cantú', name: 'Plaza Cantú', label: 'Principal', address: 'Av. Dr. Jiménez Cantú S/N, Centro Urbano, C.P. 54700', phone: '55-1113-2754', lat: 19.6695138, lng: -99.2095527 },
        { key: 'Joya', name: 'Plaza La Joya', label: 'Alta afluencia', address: 'Melchor Ocampo 31, Villas de Cuautitlán, C.P. 54857', phone: '55-5872-9277', lat: 19.6722043, lng: -99.1661641 },
        { key: 'Haciendas', name: 'Las Haciendas', label: 'Cerca de ti', address: 'Av. Huehuetoca S/N, Ex Hacienda de San Miguel, C.P. 54715', phone: '55-5817-3401', lat: 19.6866634, lng: -99.2099739 },
        { key: 'Tepalcapa', name: 'Tepalcapa', label: 'Express', address: 'Av. Morelos 9, Luis Echeverría, C.P. 54753', phone: '55-2602-0764', lat: 19.6205274, lng: -99.2067493 },
        { key: 'Tepojaco', name: 'Tepojaco', label: 'Especialidad', address: 'Av. San Sebastián 56, Ejido de San Francisco Tepojaco, C.P. 54745', phone: '55-5391-8066', lat: 19.6481325, lng: -99.2585366 },
        { key: 'Tultepec', name: 'Tultepec', label: 'Nueva', address: 'Plaza Tauro, Av. Joaquín Montenegro 95, C.P. 54960', phone: '55-9413-2041', lat: 19.6736413, lng: -99.1283153, isNew: true },
    ];

    // ── Sucursal elegida y ubicación del usuario ────────────────────────
    // La sucursal elegida filtra los estudios que se muestran en todo el sitio
    // (cada estudio trae en BIOS_ESTUDIOS las sucursales donde se realiza).
    const STORE = { branch: 'bios_selected_clinic', location: 'bios_user_location', asked: 'bios_geo_asked' };

    function storeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function storeSet(key, value) {
        try {
            if (value == null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch (e) { /* almacenamiento bloqueado: la selección dura solo esta visita */ }
    }

    let memoryBranch = storeGet(STORE.branch);

    function selectedBranch() {
        return branches.find(branch => branch.name === memoryBranch) || null;
    }

    function userLocation() {
        try {
            const data = JSON.parse(storeGet(STORE.location) || 'null');
            return data && Number.isFinite(data.lat) && Number.isFinite(data.lng) ? data : null;
        } catch (e) { return null; }
    }

    function distanceKm(from, to) {
        const rad = deg => deg * Math.PI / 180;
        const dLat = rad(to.lat - from.lat);
        const dLng = rad(to.lng - from.lng);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
        return 6371 * 2 * Math.asin(Math.sqrt(h));
    }

    function branchDistance(branch) {
        const location = userLocation();
        return location ? distanceKm(location, branch) : null;
    }

    function formatKm(km) {
        if (km == null) return '';
        return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
    }

    function branchesByDistance() {
        const location = userLocation();
        if (!location) return [...branches];
        return [...branches].sort((a, b) => distanceKm(location, a) - distanceKm(location, b));
    }

    function setBranch(name) {
        const branch = branches.find(item => item.name === name) || null;
        memoryBranch = branch ? branch.name : null;
        storeSet(STORE.branch, memoryBranch);
        updateClinicLabel();
        renderClinicDropdown();
        const search = document.getElementById('global-service-search');
        if (search) renderSearchResults(search.value);
        document.dispatchEvent(new CustomEvent('bios:branchchange', { detail: { branch } }));
        return branch;
    }

    // Pide la ubicación al navegador y elige la sucursal más cercana.
    function locateUser({ auto = false } = {}) {
        storeSet(STORE.asked, '1');
        if (!('geolocation' in navigator)) {
            if (!auto) showToast({ icon: 'fa-location-crosshairs', title: 'Tu navegador no comparte ubicación', text: 'Elige tu sucursal manualmente.', actions: [{ label: 'Elegir sucursal', run: openClinicDropdown }] });
            return Promise.resolve(null);
        }
        showToast({ icon: 'fa-location-crosshairs', title: 'Buscando tu sucursal más cercana…', text: 'Permite el acceso a tu ubicación para mostrarte los estudios disponibles cerca de ti.', loading: true, persist: true });
        return new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(position => {
                const location = { lat: position.coords.latitude, lng: position.coords.longitude, t: Date.now() };
                storeSet(STORE.location, JSON.stringify(location));
                const nearest = branchesByDistance()[0];
                const current = selectedBranch();
                document.dispatchEvent(new CustomEvent('bios:location', { detail: { location, nearest } }));
                if (auto && current && current.name !== nearest.name) {
                    // Ya había elegido una sucursal: se respeta, solo sugerimos la más cercana.
                    renderClinicDropdown();
                    showToast({ icon: 'fa-location-dot', title: `Tu sucursal más cercana es ${nearest.name}`, text: `A ${formatKm(branchDistance(nearest))} de ti. Sigues viendo ${current.name}.`, actions: [{ label: `Cambiar a ${nearest.name}`, run: () => setBranch(nearest.name) }] });
                } else {
                    setBranch(nearest.name);
                    showToast({ icon: 'fa-location-dot', title: `Sucursal más cercana: ${nearest.name}`, text: `A ${formatKm(branchDistance(nearest))} de ti. Te mostramos los estudios disponibles ahí.`, actions: [{ label: 'Cambiar', run: openClinicDropdown }] });
                }
                resolve(nearest);
            }, () => {
                showToast({ icon: 'fa-location-dot', title: 'No pudimos obtener tu ubicación', text: 'Elige tu sucursal para ver los estudios disponibles en ella.', actions: [{ label: 'Elegir sucursal', run: openClinicDropdown }] });
                resolve(null);
            }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 });
        });
    }

    // Al entrar: pide la ubicación una sola vez por navegador. Si ya la
    // concedió antes, la actualiza en silencio.
    function scheduleAutoLocate() {
        if (!('geolocation' in navigator) || !window.isSecureContext) return;
        const run = () => {
            if (!storeGet(STORE.asked)) {
                locateUser({ auto: true });
                return;
            }
            if (navigator.permissions && navigator.permissions.query) {
                navigator.permissions.query({ name: 'geolocation' }).then(status => {
                    if (status.state !== 'granted') return;
                    navigator.geolocation.getCurrentPosition(position => {
                        storeSet(STORE.location, JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude, t: Date.now() }));
                        if (!selectedBranch()) setBranch(branchesByDistance()[0].name);
                        else renderClinicDropdown();
                    }, () => {}, { timeout: 12000, maximumAge: 30 * 60 * 1000 });
                }).catch(() => {});
            }
        };
        // Espera a que termine la intro del logo para no encimar el aviso.
        const intro = document.querySelector('.bios-preloader');
        if (!intro) { setTimeout(run, 500); return; }
        const observer = new MutationObserver(() => {
            if (!document.body.contains(intro)) {
                observer.disconnect();
                setTimeout(run, 300);
            }
        });
        observer.observe(document.body, { childList: true });
    }

    // ── Aviso flotante (toast) ──────────────────────────────────────────
    let toastTimer = null;
    function showToast({ icon, title, text, actions = [], loading = false, persist = false }) {
        let toast = document.getElementById('bios-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bios-toast';
            toast.className = 'bios-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <span class="bios-toast-icon ${loading ? 'is-loading' : ''}"><i class="fa-solid ${icon}"></i></span>
            <div class="bios-toast-body">
                <strong>${escapeHtml(title)}</strong>
                ${text ? `<p>${escapeHtml(text)}</p>` : ''}
                ${actions.length ? `<div class="bios-toast-actions">${actions.map((action, i) => `<button type="button" data-toast-action="${i}">${escapeHtml(action.label)}</button>`).join('')}</div>` : ''}
            </div>
            <button type="button" class="bios-toast-close" aria-label="Cerrar aviso"><i class="fa-solid fa-xmark"></i></button>
        `;
        toast.querySelector('.bios-toast-close').addEventListener('click', hideToast);
        toast.querySelectorAll('[data-toast-action]').forEach(button => button.addEventListener('click', event => {
            event.stopPropagation();
            hideToast();
            actions[Number(button.dataset.toastAction)].run();
        }));
        requestAnimationFrame(() => toast.classList.add('is-open'));
        clearTimeout(toastTimer);
        if (!persist) toastTimer = setTimeout(hideToast, 9000);
    }

    function hideToast() {
        clearTimeout(toastTimer);
        document.getElementById('bios-toast')?.classList.remove('is-open');
    }

    window.BIOS_BRANCHES = {
        list: branches,
        selected: selectedBranch,
        set: setBranch,
        locate: () => locateUser(),
        distance: branchDistance,
        formatKm,
        byDistance: branchesByDistance,
        // ¿El estudio se realiza en la sucursal elegida? (sin sucursal elegida, todos aplican)
        offers: item => {
            const branch = selectedBranch();
            return !branch || !item || !item.branches || item.branches.includes(branch.key);
        },
    };

    // Calendario campañas de colposcopías SEPTIEMBRE-DICIEMBRE 2026 (2° periodo), por unidad.
    const WOMEN_CAMPAIGN = [
        { branch: 'Tepojaco', dates: [{ year: 2026, month: 9, day: 1 }, { year: 2026, month: 10, day: 2 }, { year: 2026, month: 11, day: 9 }, { year: 2026, month: 12, day: 8 }] },
        { branch: 'Tepalcapa', dates: [{ year: 2026, month: 9, day: 2 }, { year: 2026, month: 9, day: 15 }, { year: 2026, month: 10, day: 6 }, { year: 2026, month: 10, day: 20 }, { year: 2026, month: 11, day: 3 }, { year: 2026, month: 11, day: 17 }, { year: 2026, month: 12, day: 7 }, { year: 2026, month: 12, day: 21 }] },
        { branch: 'Joya', dates: [{ year: 2026, month: 9, day: 7 }, { year: 2026, month: 9, day: 22 }, { year: 2026, month: 10, day: 7 }, { year: 2026, month: 10, day: 21 }, { year: 2026, month: 11, day: 4 }, { year: 2026, month: 11, day: 18 }, { year: 2026, month: 12, day: 1 }, { year: 2026, month: 12, day: 15 }] },
        { branch: 'Haciendas', dates: [{ year: 2026, month: 9, day: 8 }, { year: 2026, month: 10, day: 13 }, { year: 2026, month: 10, day: 27 }, { year: 2026, month: 11, day: 11 }, { year: 2026, month: 11, day: 25 }, { year: 2026, month: 12, day: 9 }] },
        { branch: 'Cantú', dates: [{ year: 2026, month: 9, day: 9 }, { year: 2026, month: 9, day: 23 }, { year: 2026, month: 10, day: 8 }, { year: 2026, month: 10, day: 22 }, { year: 2026, month: 11, day: 5 }, { year: 2026, month: 11, day: 19 }, { year: 2026, month: 12, day: 3 }, { year: 2026, month: 12, day: 17 }] },
    ];

    function womenCampaignEvents() {
        const events = [];
        WOMEN_CAMPAIGN.forEach(unit => {
            unit.dates.forEach(d => {
                events.push({ branch: unit.branch, date: new Date(d.year, d.month - 1, d.day) });
            });
        });
        return events.sort((a, b) => a.date - b.date);
    }

    function womenCampaignStatus() {
        const events = womenCampaignEvents();
        if (!events.length) return null;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const windowStart = events[0].date;
        const windowEnd = events[events.length - 1].date;
        if (today < windowStart || today > windowEnd) return { active: false, events };
        const todayEvent = events.find(e => e.date.getTime() === today.getTime());
        const nextEvent = events.find(e => e.date >= today);
        return { active: true, todayEvent, nextEvent, events };
    }

    const MONTH_NAMES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    function formatCampaignDate(date) {
        return `${date.getDate()} ${MONTH_NAMES_ES[date.getMonth()]}`;
    }

    function basePath() {
        const cleanPath = window.location.pathname.replace(/\/+$/, '');
        const current = cleanPath.split('/').pop();
        return ['servicios', 'sucursales', 'unete', 'conocenos', 'empresas', 'medicos', 'mujer', 'facturacion', 'aviso-privacidad', 'terminos-uso', 'agenda'].includes(current) ? '../' : './';
    }

    function href(path) {
        if (path === './') return basePath();
        return `${basePath()}${path}`;
    }

    function activeKey() {
        const current = window.location.pathname;
        return routes.find(route => current.includes(`/${route.key}/`))?.key || 'inicio';
    }

    function navMarkup() {
        const active = activeKey();
        return routes.map(route => `
            <a class="bios-secondary-link ${active === route.key ? 'active' : ''}" href="${href(route.path)}">
                <i class="fa-solid ${route.icon}"></i>${route.label}
            </a>
        `).join('');
    }

    function mobileNavMarkup() {
        const active = activeKey();
        return [...routes, ...quickRoutes].map(route => `
            <a class="bios-mobile-link ${active === route.key ? 'active' : ''}" href="${href(route.path)}">
                <span><i class="fa-solid ${route.icon}"></i>${route.label}</span>
                <i class="fa-solid fa-arrow-right"></i>
            </a>
        `).join('');
    }

    function logoSrc() {
        return `${basePath()}logos/bios-logo-white.png`;
    }

    function applyLogo() {
        document.querySelectorAll('[data-bios-logo]').forEach(logo => {
            logo.src = logoSrc();
        });
    }

    // Favicon de marca (usa el logo BIOS) — aplica a todas las páginas.
    function applyFavicon() {
        if (document.querySelector('link[rel="icon"]:not([data-default])')) return;
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = logoSrc();
        document.head.appendChild(link);
    }

    function renderHeader() {
        const firstHeader = document.querySelector('header');
        if (!firstHeader) return;

        document.querySelectorAll('#mobile-drawer, #drawer, .bios-mobile-drawer').forEach(item => item.remove());
        firstHeader.className = 'bios-main-header';
        firstHeader.innerHTML = `
            <div class="bios-topbar">
                <div class="bios-wrap bios-topbar-inner">
                    ${quickRoutes.map(route => `
                        <a href="${href(route.path)}"><i class="fa-solid ${route.icon}"></i>${route.label}</a>
                    `).join('')}
                </div>
            </div>
            <div class="bios-wrap bios-header-body">
                <div class="bios-brand-group">
                    <a class="bios-brand" href="${href('./')}" aria-label="Laboratorios BIOS">
                        <img id="global-logo" data-bios-logo src="${logoSrc()}" alt="Laboratorios BIOS" onerror="this.src='https://placehold.co/260x78/0A1C2E/FFF?text=Laboratorios%20BIOS'">
                    </a>
                    <div class="bios-clinic-select">
                        <button type="button" id="clinic-button" class="bios-clinic-button" aria-haspopup="true" aria-expanded="false" aria-controls="clinic-dropdown">
                            <i class="fa-solid fa-location-dot"></i>
                            <span id="clinic-button-label">Elige tu sucursal</span>
                            <i class="fa-solid fa-chevron-down bios-clinic-caret"></i>
                        </button>
                        <div id="clinic-dropdown" class="bios-floating-panel clinic-panel"></div>
                    </div>
                </div>

                <div class="bios-global-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input id="global-service-search" type="search" autocomplete="off" placeholder="Busca estudios, perfiles o paquetes...">
                    <a id="global-search-link" href="${href('servicios/')}" aria-label="Ir al catálogo"><i class="fa-solid fa-arrow-right"></i></a>
                    <div id="global-service-results" class="bios-floating-panel search-panel"></div>
                </div>

                <div class="bios-header-actions">
                    <button type="button" id="bios-search-toggle" class="bios-search-toggle" aria-label="Buscar estudios" aria-expanded="false"><i class="fa-solid fa-magnifying-glass"></i></button>
                    <a href="https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS,%20quiero%20agendar%20una%20cita" target="_blank" class="bios-appointment-button">
                        <i class="fa-brands fa-whatsapp"></i> <span>Agendar cita</span>
                    </a>
                    <button type="button" id="bios-menu-button" class="bios-menu-button" aria-label="Abrir menú">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
            <div class="bios-secondary-nav">
                <div class="bios-wrap bios-secondary-inner">
                    ${navMarkup()}
                    <a class="bios-profile-tab" href="${href('servicios/')}"><i class="fa-solid fa-shield-heart"></i> Perfil Prevención</a>
                </div>
            </div>
        `;

        const drawer = document.createElement('div');
        drawer.id = 'mobile-drawer';
        drawer.className = 'bios-mobile-drawer';
        drawer.innerHTML = `
            <button type="button" class="bios-mobile-backdrop" aria-label="Cerrar menú"></button>
            <aside class="bios-mobile-panel">
                <div class="bios-mobile-head">
                    <div>
                        <p>Laboratorios BIOS</p>
                        <strong>Menú</strong>
                    </div>
                    <button type="button" class="bios-mobile-close" aria-label="Cerrar menú"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="bios-mobile-links">${mobileNavMarkup()}</div>
                <a href="https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS,%20quiero%20informes" target="_blank" class="bios-mobile-whatsapp">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp Laboratorios BIOS
                </a>
            </aside>
        `;
        firstHeader.insertAdjacentElement('afterend', drawer);

        bindHeaderInteractions(drawer);
        applyLogo();
    }

    function updateClinicLabel() {
        const label = document.getElementById('clinic-button-label');
        if (!label) return;
        const branch = selectedBranch();
        label.textContent = branch ? branch.name : 'Elige tu sucursal';
        document.getElementById('clinic-button')?.classList.toggle('has-branch', !!branch);
    }

    function openClinicDropdown() {
        const panel = document.getElementById('clinic-dropdown');
        if (!panel) return;
        renderClinicDropdown();
        document.getElementById('global-service-results')?.classList.remove('open');
        panel.classList.add('open');
        document.getElementById('clinic-button')?.setAttribute('aria-expanded', 'true');
    }

    function renderClinicDropdown() {
        const panel = document.getElementById('clinic-dropdown');
        if (!panel) return;
        const current = selectedBranch();
        const location = userLocation();
        const list = branchesByDistance();

        panel.innerHTML = `
            <div class="clinic-panel-head">
                <div class="bios-panel-title">${location ? 'Cerca de ti' : 'Elige tu sucursal'}</div>
                <button type="button" class="clinic-locate" data-locate>
                    <i class="fa-solid fa-location-crosshairs"></i> ${location ? 'Actualizar ubicación' : 'Usar mi ubicación'}
                </button>
            </div>
            <p class="clinic-panel-note">Te mostramos solo los estudios disponibles en la sucursal que elijas.</p>
            <div class="clinic-options">
                ${list.map((branch, i) => {
                    const km = location ? formatKm(distanceKm(location, branch)) : '';
                    const active = current && current.name === branch.name;
                    return `
                    <button type="button" class="clinic-option ${active ? 'is-selected' : ''}" data-clinic="${branch.name}" aria-pressed="${active}">
                        <span class="clinic-option-icon"><i class="fa-solid ${active ? 'fa-check' : 'fa-location-dot'}"></i></span>
                        <span class="clinic-option-text">
                            <strong>${branch.name}</strong>
                            <small>${branch.address}</small>
                            <em>${branch.phone}${km ? ` · <span class="clinic-km">${km}</span>` : ''}</em>
                        </span>
                        <b class="${location && i === 0 ? 'near' : branch.isNew ? 'new' : ''}">${location && i === 0 ? 'Más cercana' : branch.label}</b>
                    </button>`;
                }).join('')}
            </div>
            <div class="clinic-panel-foot">
                ${current ? '<button type="button" class="clinic-clear" data-clinic-clear><i class="fa-solid fa-layer-group"></i> Ver estudios de todas</button>' : ''}
                <a class="bios-panel-link" href="${href('sucursales/')}"><i class="fa-solid fa-map-location-dot"></i> Ver mapa</a>
            </div>
        `;
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // Carga bajo demanda el catálogo y el buscador difuso si la página no los trae.
    let searchDepsPromise = null;
    function ensureSearchDeps() {
        if (window.BIOS_ESTUDIOS && window.BiosSearch) return Promise.resolve();
        if (searchDepsPromise) return searchDepsPromise;
        const load = src => new Promise(resolve => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = resolve;
            document.head.appendChild(script);
        });
        searchDepsPromise = Promise.all([
            window.BIOS_ESTUDIOS ? null : load(href('assets/estudios-data.js')),
            window.BiosSearch ? null : load(href('assets/bios-search.js?v=3')),
        ]);
        return searchDepsPromise;
    }

    function catalogHref(query) {
        return query ? `${href('servicios/')}?q=${encodeURIComponent(query)}` : href('servicios/');
    }

    function highlight(name, query) {
        const normalize = window.BiosSearch?.normalize;
        if (!normalize || !query) return escapeHtml(name);
        const terms = normalize(query).split(' ').filter(t => t.length >= 2);
        return name.split(/(\s+)/).map(word => {
            const plain = normalize(word);
            const hit = plain && terms.some(t => plain.startsWith(t.slice(0, Math.max(3, Math.min(t.length, 4)))));
            return hit ? `<mark>${escapeHtml(word)}</mark>` : escapeHtml(word);
        }).join('');
    }

    function catalogResults(query) {
        const data = window.BIOS_ESTUDIOS;
        if (!data || !window.BiosSearch) return null;
        const toView = item => ({
            name: item.n,
            category: item.catLabel,
            time: item.days === 0 ? 'Mismo día' : item.days === 1 ? '1 día hábil' : `${item.days} días hábiles`,
            price: item.price != null ? `$${item.price.toLocaleString('es-MX')}` : (item.priceLabel || 'Consultar'),
            icon: item.icon,
            lucide: true,
        });
        const offers = window.BIOS_BRANCHES.offers;
        if (!query) return { list: data.filter(item => item.top && offers(item)).slice(0, 6).map(toView), fuzzy: false, suggestion: '' };
        const all = window.BiosSearch.searchCatalog(query);
        const results = all.filter(r => offers(r.item));
        return {
            list: results.slice(0, 7).map(r => toView(r.item)),
            total: results.length,
            elsewhere: all.length - results.length,
            fuzzy: results.length > 0 && results.every(r => !r.exact),
            suggestion: window.BiosSearch.suggestCatalog(query),
        };
    }

    function renderSearchResults(query = '') {
        const panel = document.getElementById('global-service-results');
        if (!panel) return;

        const trimmed = query.trim();
        let view = catalogResults(trimmed);
        if (!view) {
            const normalized = trimmed.toLowerCase();
            const list = services.filter(service => {
                const haystack = `${service.name} ${service.category} ${service.price} ${service.time} ${(service.includes || []).join(' ')}`.toLowerCase();
                return !normalized || haystack.includes(normalized);
            }).slice(0, 6);
            view = { list, total: list.length, fuzzy: false, suggestion: '' };
        }
        const { list, fuzzy, suggestion } = view;
        const branch = selectedBranch();
        const where = branch ? ` en ${branch.name}` : '';
        const title = !trimmed ? `Más pedidos${where}` : fuzzy ? `${view.total} parecidos${where}` : `${view.total} ${view.total === 1 ? 'coincidencia' : 'coincidencias'}${where}`;
        const elsewhere = view.elsewhere ? `<button type="button" class="search-elsewhere" data-clinic-clear-search><i class="fa-solid fa-circle-info"></i> ${view.elsewhere} ${view.elsewhere === 1 ? 'estudio más disponible' : 'estudios más disponibles'} en otras sucursales · <u>ver todas</u></button>` : '';
        const whatsappText = encodeURIComponent(`Hola Laboratorios BIOS, no encuentro el estudio: ${trimmed}`);

        panel.innerHTML = `
            <div class="bios-panel-title">${title}</div>
            ${suggestion && trimmed ? `<span class="search-suggest">¿Quisiste decir <button type="button" data-suggest="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>?</span>` : ''}
            ${list.length ? list.map(service => `
                <a class="search-result" href="${catalogHref(trimmed ? service.name : '')}">
                    <span class="search-result-icon">${service.lucide ? `<i data-lucide="${service.icon}" class="w-5 h-5"></i>` : `<i class="fa-solid ${service.icon}"></i>`}</span>
                    <span>
                        <strong>${highlight(service.name, trimmed)}</strong>
                        <small>${service.category} · ${service.time}</small>
                    </span>
                    <b>${service.price}</b>
                </a>
            `).join('') : `
                <a class="search-result empty" href="https://wa.me/5211234567890?text=${whatsappText}" target="_blank" rel="noopener">
                    <span class="search-result-icon"><i class="fa-brands fa-whatsapp"></i></span>
                    <span><strong>${view.elsewhere ? `No está disponible${where}` : 'No encontramos ese estudio'}</strong><small>Escríbenos y lo ubicamos contigo</small></span>
                </a>
            `}
            ${elsewhere}
            <a class="bios-panel-link" href="${catalogHref(trimmed)}"><i class="fa-solid fa-microscope"></i> ${trimmed && list.length ? 'Ver todos los resultados' : 'Abrir catálogo completo'}</a>
        `;
        if (window.lucide) window.lucide.createIcons({ root: panel });
    }

    function bindHeaderInteractions(drawer) {
        const clinicButton = document.getElementById('clinic-button');
        const clinicDropdown = document.getElementById('clinic-dropdown');
        const search = document.getElementById('global-service-search');
        const searchPanel = document.getElementById('global-service-results');
        const menuButton = document.getElementById('bios-menu-button');
        const closeButtons = drawer.querySelectorAll('.bios-mobile-backdrop, .bios-mobile-close');
        const header = document.querySelector('.bios-main-header');
        const searchToggle = document.getElementById('bios-search-toggle');

        renderClinicDropdown();
        renderSearchResults();
        updateClinicLabel();

        const closeClinic = () => {
            clinicDropdown?.classList.remove('open');
            clinicButton?.setAttribute('aria-expanded', 'false');
        };

        clinicButton?.addEventListener('click', (event) => {
            event.stopPropagation();
            if (clinicDropdown.classList.contains('open')) closeClinic();
            else openClinicDropdown();
        });

        clinicDropdown?.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.target.closest('[data-locate]')) {
                closeClinic();
                locateUser();
                return;
            }
            if (event.target.closest('[data-clinic-clear]')) {
                setBranch(null);
                closeClinic();
                showToast({ icon: 'fa-layer-group', title: 'Mostrando estudios de todas las sucursales', text: 'Elige una sucursal cuando quieras ver solo lo disponible ahí.' });
                return;
            }
            const option = event.target.closest('.clinic-option');
            if (!option) return;
            const branch = setBranch(option.dataset.clinic);
            closeClinic();
            if (branch) showToast({ icon: 'fa-location-dot', title: `Sucursal: ${branch.name}`, text: 'Te mostramos los estudios disponibles en esta sucursal.' });
        });

        searchToggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            const open = header.classList.toggle('search-open');
            searchToggle.setAttribute('aria-expanded', String(open));
            closeClinic();
            if (open) search?.focus();
            else searchPanel?.classList.remove('open');
        });

        let activeResult = -1;
        const resultLinks = () => [...searchPanel.querySelectorAll('.search-result')];
        const refreshSearch = () => {
            activeResult = -1;
            renderSearchResults(search.value);
        };

        search?.addEventListener('focus', () => {
            ensureSearchDeps().then(refreshSearch);
            refreshSearch();
            searchPanel.classList.add('open');
            closeClinic();
        });

        search?.addEventListener('input', () => {
            refreshSearch();
            searchPanel.classList.add('open');
        });

        searchPanel?.addEventListener('click', (event) => {
            if (event.target.closest('[data-clinic-clear-search]')) {
                event.preventDefault();
                setBranch(null);
                search.focus();
                return;
            }
            const suggestion = event.target.closest('[data-suggest]');
            if (!suggestion) return;
            event.preventDefault();
            search.value = suggestion.dataset.suggest;
            refreshSearch();
            search.focus();
        });

        search?.addEventListener('keydown', (event) => {
            const links = resultLinks();
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                if (!links.length) return;
                event.preventDefault();
                activeResult = (activeResult + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
                links.forEach((link, i) => link.classList.toggle('is-active', i === activeResult));
                links[activeResult].scrollIntoView({ block: 'nearest' });
            } else if (event.key === 'Escape') {
                searchPanel.classList.remove('open');
                search.blur();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                window.location.href = links[activeResult]?.href || catalogHref(search.value.trim());
            }
        });

        menuButton?.addEventListener('click', () => {
            drawer.classList.add('active');
            document.body.classList.add('bios-scroll-lock');
        });
        closeButtons.forEach(button => button.addEventListener('click', () => {
            drawer.classList.remove('active');
            document.body.classList.remove('bios-scroll-lock');
        }));

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.bios-clinic-select')) closeClinic();
            if (!event.target.closest('.bios-global-search')) searchPanel?.classList.remove('open');
        });
    }

    function renderFooter() {
        document.querySelectorAll('footer').forEach(footer => footer.remove());
        const footer = document.createElement('footer');
        footer.className = 'bios-main-footer';
        footer.innerHTML = `
            <div class="bios-wrap footer-grid-main">
                <div class="footer-brand-block">
                    <img id="footer-logo" data-bios-logo src="${logoSrc()}" alt="Laboratorios BIOS" onerror="this.src='https://placehold.co/260x78/0A1C2E/FFF?text=Laboratorios%20BIOS'">
                    <p>Un mundo de servicios a tu alcance. Proveedores líderes en análisis clínicos y diagnóstico de alta calidad tecnológica.</p>
                    <div class="footer-socials-main">
                        <a href="https://www.facebook.com/profile.php?id=100083030297472" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="https://wa.me/5211234567890" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="mailto:bios@bioslaboratorios.com" aria-label="Correo electrónico"><i class="fa-solid fa-envelope"></i></a>
                    </div>
                    <a class="footer-contact-main" href="mailto:bios@bioslaboratorios.com"><i class="fa-solid fa-envelope"></i> bios@bioslaboratorios.com</a>
                </div>
                <div>
                    <h4>Pacientes</h4>
                    <a href="${href('servicios/')}">Catálogo de estudios</a>
                    <a href="${href('servicios/')}">Cotizar y agendar</a>
                    <a href="${href('sucursales/')}">Sucursales y horarios</a>
                    <a href="https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS,%20quiero%20agendar%20una%20cita" target="_blank" rel="noopener">Agendar por WhatsApp</a>
                </div>
                <div>
                    <h4>Empresas B2B</h4>
                    <a href="${href('empresas/')}">Registro RFC/Moral</a>
                    <a href="${href('empresas/#facturacion')}">Facturación Picofi</a>
                    <a href="${href('empresas/')}">Panel Empresa</a>
                    <a href="${href('medicos/')}">Campaña Médicos</a>
                </div>
                <div>
                    <h4>Público</h4>
                    <a href="${href('conocenos/')}">Quiénes Somos</a>
                    <a href="${href('sucursales/')}">Sucursales 360</a>
                    <a href="${href('mujer/')}">Campaña de la mujer</a>
                    <a href="${href('unete/')}">Bolsa de Trabajo</a>
                </div>
            </div>
            <div class="bios-wrap footer-bottom-main">
                <p>© 2026 Laboratorios BIOS. Todos los derechos reservados.</p>
                <div class="footer-legal-links">
                    <a href="${href('aviso-privacidad/')}">Aviso de Privacidad</a>
                    <span aria-hidden="true">·</span>
                    <a href="${href('terminos-uso/')}">Términos de Uso</a>
                </div>
                <div>Diseñado y desarrollado por <a href="https://partumdesign.com.mx" target="_blank" rel="noopener"><strong>Partum Design</strong></a></div>
            </div>
        `;
        (document.querySelector('.page-shell') || document.body).appendChild(footer);
    }

    function renderWomenRibbon() {
        document.querySelectorAll('.bios-women-ribbon').forEach(item => item.remove());
        const ribbon = document.createElement('a');
        ribbon.className = 'bios-women-ribbon';
        ribbon.href = href('mujer/');

        const status = womenCampaignStatus();
        if (status && status.active) {
            ribbon.classList.add('is-live');
            if (status.todayEvent) {
                ribbon.innerHTML = `
                    <span><i class="fa-solid fa-venus"></i></span>
                    <strong>Campaña de colposcopías: HOY en ${status.todayEvent.branch}</strong>
                    <em>Ver requisitos y agenda</em>
                `;
            } else if (status.nextEvent) {
                ribbon.innerHTML = `
                    <span><i class="fa-solid fa-venus"></i></span>
                    <strong>Campaña de colposcopías</strong>
                    <em>Próxima fecha: ${formatCampaignDate(status.nextEvent.date)} en ${status.nextEvent.branch}</em>
                `;
            }
        } else {
            ribbon.innerHTML = `
                <span><i class="fa-solid fa-venus"></i></span>
                <strong>Campaña de la mujer</strong>
                <em>Agenda y consulta requisitos</em>
            `;
        }
        document.body.appendChild(ribbon);
    }

    function renderWhatsappFloat() {
        document.querySelectorAll('.bios-whatsapp-float').forEach(item => item.remove());
        const button = document.createElement('a');
        button.className = 'bios-whatsapp-float';
        button.href = 'https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS%2C%20me%20interesa%20agendar...';
        button.target = '_blank';
        button.rel = 'noopener';
        button.setAttribute('aria-label', 'WhatsApp Laboratorios BIOS');
        button.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
        document.body.appendChild(button);
    }

    function renderFloatingActions() {
        renderWomenRibbon();
        renderWhatsappFloat();
    }

    function renderLogoIntro() {
        // Solo en la primera visita de la sesión — no en cada cambio de página
        // ni al volver al inicio.
        try {
            if (sessionStorage.getItem('bios_intro_seen')) return;
            sessionStorage.setItem('bios_intro_seen', '1');
        } catch (e) { /* sessionStorage no disponible: mostrar normalmente */ }

        const intro = document.createElement('div');
        intro.className = 'bios-preloader';
        intro.setAttribute('aria-hidden', 'true');
        intro.innerHTML = `
            <canvas class="bios-preloader-canvas" id="bios-p-canvas"></canvas>
            <div class="bios-preloader-hud">
                <div class="bios-hud-corner tl"></div>
                <div class="bios-hud-corner tr"></div>
                <div class="bios-hud-corner bl"></div>
                <div class="bios-hud-corner br"></div>
            </div>
            <div class="bios-preloader-stage">
                <div class="bios-preloader-kicker">Sistema de diagnóstico clínico</div>
                <div class="bios-preloader-logo-wrap">
                    <div class="bios-preloader-logo-glow"></div>
                    <img src="${logoSrc()}" alt="" class="bios-preloader-logo"
                         onerror="this.src='https://placehold.co/380x115/020810/FFF?text=Laboratorios+BIOS'">
                    <div class="bios-preloader-scanline"></div>
                </div>
                <div class="bios-preloader-progress">
                    <div class="bios-preloader-track">
                        <div class="bios-preloader-fill" id="bios-p-fill"></div>
                    </div>
                    <div class="bios-preloader-meta">
                        <div class="bios-preloader-count" id="bios-p-count">0%</div>
                        <div class="bios-preloader-status" id="bios-p-status">Iniciando...</div>
                    </div>
                </div>
            </div>
            <div class="bios-preloader-deco left"><span></span><span></span><span></span></div>
            <div class="bios-preloader-deco right"><span></span><span></span><span></span></div>
        `;
        document.body.insertBefore(intro, document.body.firstChild);
        document.body.classList.add('bios-scroll-lock');

        // — Particle canvas —
        const canvas = document.getElementById('bios-p-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const pts = Array.from({ length: 58 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.35 + 0.4,
                vx: (Math.random() - 0.5) * 0.26,
                vy: (Math.random() - 0.5) * 0.26,
                o: Math.random() * 0.42 + 0.08,
            }));

            let raf;
            const MAX_D = 90;

            const drawFrame = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (const p of pts) {
                    p.x = (p.x + p.vx + canvas.width)  % canvas.width;
                    p.y = (p.y + p.vy + canvas.height) % canvas.height;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(125,211,252,${p.o})`;
                    ctx.fill();
                }
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < MAX_D) {
                            ctx.beginPath();
                            ctx.moveTo(pts[i].x, pts[i].y);
                            ctx.lineTo(pts[j].x, pts[j].y);
                            ctx.strokeStyle = `rgba(37,99,235,${0.16 * (1 - d / MAX_D)})`;
                            ctx.lineWidth = 0.55;
                            ctx.stroke();
                        }
                    }
                }
                raf = requestAnimationFrame(drawFrame);
            };
            drawFrame();

            // — Progress counter —
            const fill    = document.getElementById('bios-p-fill');
            const countEl = document.getElementById('bios-p-count');
            const statusEl = document.getElementById('bios-p-status');
            const stages = ['Iniciando...', 'Módulos clínicos', 'Catálogo de estudios', 'Sucursales', 'Listo'];
            const DURATION = 1900;
            const t0 = performance.now();

            const finish = () => {
                cancelAnimationFrame(raf);
                intro.classList.add('exiting');
                document.body.classList.remove('bios-scroll-lock');
                intro.addEventListener('animationend', () => intro.remove(), { once: true });
            };

            const tick = (now) => {
                const t    = Math.min((now - t0) / DURATION, 1);
                const pct  = Math.round((1 - Math.pow(1 - t, 2.6)) * 100);
                if (fill)     fill.style.width       = pct + '%';
                if (countEl)  countEl.textContent     = pct + '%';
                if (statusEl) statusEl.textContent    = stages[Math.min(Math.floor(t * stages.length), stages.length - 1)];
                if (t < 1) { requestAnimationFrame(tick); return; }
                setTimeout(finish, 280);
            };
            requestAnimationFrame(tick);

            intro.addEventListener('click', finish, { once: true });
        }
    }

    // Aparición suave de bloques al hacer scroll. Solo anima bloques de primer
    // nivel (no tarjetas anidadas), no toca lo que ya está en pantalla al cargar
    // y limpia la clase al terminar para que los hover de cada elemento
    // conserven su propia transición (antes quedaban con retraso).
    function setupRevealAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
        const candidates = [...document.querySelectorAll('main > section, main > div > section, main > .grid > *, main > section > .grid > *, .page-visual, .image-strip')];
        const targets = candidates.filter(el => !candidates.some(other => other !== el && other.contains(el)));
        const fold = window.innerHeight * 0.92;

        const settle = el => {
            el.classList.add('is-visible');
            const done = () => {
                el.classList.remove('bios-reveal', 'is-visible');
                el.style.removeProperty('transition-delay');
            };
            el.addEventListener('transitionend', done, { once: true });
            setTimeout(done, 900);
        };

        const observer = new IntersectionObserver(entries => {
            let batch = 0;
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                entry.target.style.transitionDelay = `${Math.min(batch++, 4) * 70}ms`;
                settle(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(el => {
            if (el.getBoundingClientRect().top < fold) return;
            el.classList.add('bios-reveal');
            observer.observe(el);
        });
    }

    // En pantallas chicas el aviso de campaña se compacta al bajar para no
    // tapar el contenido; vuelve a expandirse al regresar arriba.
    function setupRibbonCompact() {
        let ticking = false;
        const update = () => {
            ticking = false;
            document.body.classList.toggle('bios-scrolled', window.scrollY > 260);
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    function setupFloatingVisibility() {
        const footer = document.querySelector('.bios-main-footer') || document.querySelector('footer');
        if (!footer) return;

        const checkFooter = () => {
            const rect = footer.getBoundingClientRect();
            const isMobile = window.matchMedia('(max-width: 640px)').matches;
            const hideOffset = isMobile ? 88 : 112;
            const reachedFooter = window.scrollY > 40 && rect.top <= window.innerHeight - hideOffset && rect.bottom > hideOffset;
            document.body.classList.toggle('footer-in-view', reachedFooter);
        };

        window.addEventListener('scroll', checkFooter, { passive: true });
        window.addEventListener('resize', checkFooter);
        checkFooter();
    }

    window.BIOS_WOMEN_CAMPAIGN = {
        units: WOMEN_CAMPAIGN,
        events: womenCampaignEvents,
        status: womenCampaignStatus,
        formatDate: formatCampaignDate,
    };

    document.addEventListener('DOMContentLoaded', () => {
        applyFavicon();
        renderHeader();
        renderFooter();
        renderFloatingActions();
        renderLogoIntro();
        scheduleAutoLocate();
        setupRevealAnimations();
        setupRibbonCompact();
        setupFloatingVisibility();
    });
})();
