(() => {
    const routes = [
        { key: 'inicio', label: 'Inicio', path: './', icon: 'fa-house' },
        { key: 'servicios', label: 'Servicios', path: 'servicios/', icon: 'fa-flask-vial' },
        { key: 'mujer', label: 'Mujer', path: 'mujer/', icon: 'fa-venus' },
        { key: 'seguimiento', label: 'Seguimiento', path: 'seguimiento/', icon: 'fa-list-check' },
        { key: 'sucursales', label: 'Sucursales', path: 'sucursales/', icon: 'fa-location-dot' },
        { key: 'conocenos', label: 'Conócenos', path: 'conocenos/', icon: 'fa-building' },
        { key: 'unete', label: 'Únete a nosotros', path: 'unete/', icon: 'fa-briefcase' },
    ];

    const quickRoutes = [
        { label: 'Portal Pacientes', path: 'portal/', icon: 'fa-user' },
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
        { name: 'Tomografía programada', category: 'Servicios especiales', price: 'Con cita', time: 'Requiere agenda', icon: 'fa-notes-medical', includes: ['tomografía', 'pago en línea', 'cita'] },
    ];

    const branches = [
        { name: 'Plaza Cantú', label: 'Principal', address: 'Cuautitlán Izcalli, Centro Urbano', phone: '55-1113-2754' },
        { name: 'Plaza La Joya', label: 'Alta afluencia', address: 'Cuautitlán-Melchor Ocampo', phone: '55-5872-9277' },
        { name: 'Las Haciendas', label: 'Cerca de ti', address: 'Av. Huehuetoca, Local D-40', phone: '55-5817-3401' },
        { name: 'Tepalcapa', label: 'Express', address: 'Granjas de Guadalupe', phone: '55-2602-0764' },
        { name: 'Tepojaco', label: 'Especialidad', address: 'San Sebastián', phone: '55-5391-8066' },
        { name: 'Tultepec', label: 'Nueva', address: 'Av. Joaquín Montenegro', phone: '55-9413-2041', isNew: true },
    ];

    // Calendario campañas de colposcopías JULIO-AGOSTO 2026, por unidad.
    const WOMEN_CAMPAIGN = [
        { branch: 'Tepojaco', dates: [{ year: 2026, month: 7, day: 6 }, { year: 2026, month: 8, day: 3 }] },
        { branch: 'Tepalcapa', dates: [{ year: 2026, month: 7, day: 7 }, { year: 2026, month: 8, day: 4 }] },
        { branch: 'Joya', dates: [{ year: 2026, month: 7, day: 8 }, { year: 2026, month: 8, day: 5 }] },
        { branch: 'Haciendas', dates: [{ year: 2026, month: 7, day: 14 }, { year: 2026, month: 8, day: 10 }] },
        { branch: 'Cantú', dates: [{ year: 2026, month: 7, day: 15 }, { year: 2026, month: 8, day: 11 }] },
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
        return ['servicios', 'seguimiento', 'sucursales', 'unete', 'conocenos', 'portal', 'empresas', 'medicos', 'mujer', 'facturacion'].includes(current) ? '../' : './';
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
                        <button type="button" id="clinic-button" class="bios-clinic-button">
                            <i class="fa-solid fa-location-dot"></i>
                            <span id="clinic-button-label">Seleccionar Sucursal</span>
                            <i class="fa-solid fa-chevron-down"></i>
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
                    <a href="${href('seguimiento/')}" class="bios-icon-button" aria-label="Seguimiento"><i class="fa-solid fa-list-check"></i></a>
                    <a href="https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS,%20quiero%20agendar%20una%20cita" target="_blank" class="bios-appointment-button">
                        <i class="fa-brands fa-whatsapp"></i> Agendar Cita
                    </a>
                    <button type="button" id="bios-menu-button" class="bios-menu-button" aria-label="Abrir menú">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
            <div class="bios-secondary-nav">
                <div class="bios-wrap bios-secondary-inner">
                    ${navMarkup()}
                    <a class="bios-profile-tab" href="${href('portal/')}"><i class="fa-solid fa-shield-heart"></i> Perfil Prevención</a>
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

    function renderClinicDropdown() {
        const panel = document.getElementById('clinic-dropdown');
        if (!panel) return;

        panel.innerHTML = `
            <div class="bios-panel-title">Sucursales disponibles</div>
            ${branches.map(branch => `
                <button type="button" class="clinic-option" data-clinic="${branch.name}">
                    <span class="clinic-option-icon"><i class="fa-solid fa-location-dot"></i></span>
                    <span>
                        <strong>${branch.name}</strong>
                        <small>${branch.address}</small>
                        <em>${branch.phone}</em>
                    </span>
                    <b class="${branch.isNew ? 'new' : ''}">${branch.label}</b>
                </button>
            `).join('')}
            <a class="bios-panel-link" href="${href('sucursales/')}"><i class="fa-solid fa-map-location-dot"></i> Ver mapa completo</a>
        `;
    }

    function renderSearchResults(query = '') {
        const panel = document.getElementById('global-service-results');
        if (!panel) return;

        const normalized = query.trim().toLowerCase();
        const list = services.filter(service => {
            const haystack = `${service.name} ${service.category} ${service.price} ${service.time} ${(service.includes || []).join(' ')}`.toLowerCase();
            return !normalized || haystack.includes(normalized);
        }).slice(0, 6);

        panel.innerHTML = `
            <div class="bios-panel-title">${normalized ? `${list.length} coincidencias` : 'Servicios populares'}</div>
            ${list.length ? list.map(service => `
                <a class="search-result" href="${href('servicios/')}">
                    <span class="search-result-icon"><i class="fa-solid ${service.icon}"></i></span>
                    <span>
                        <strong>${service.name}</strong>
                        <small>${service.category} · ${service.time}${normalized && (service.includes || []).some(item => item.toLowerCase().includes(normalized)) ? ' · incluye coincidencia' : ''}</small>
                    </span>
                    <b>${service.price}</b>
                </a>
            `).join('') : `
                <a class="search-result empty" href="https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS,%20no%20encuentro%20un%20estudio" target="_blank">
                    <span class="search-result-icon"><i class="fa-brands fa-whatsapp"></i></span>
                    <span><strong>No encontramos ese estudio</strong><small>Escríbenos y lo ubicamos contigo</small></span>
                </a>
            `}
            <a class="bios-panel-link" href="${href('servicios/')}"><i class="fa-solid fa-microscope"></i> Abrir catálogo completo</a>
        `;
    }

    function bindHeaderInteractions(drawer) {
        const clinicButton = document.getElementById('clinic-button');
        const clinicDropdown = document.getElementById('clinic-dropdown');
        const search = document.getElementById('global-service-search');
        const searchPanel = document.getElementById('global-service-results');
        const menuButton = document.getElementById('bios-menu-button');
        const closeButtons = drawer.querySelectorAll('.bios-mobile-backdrop, .bios-mobile-close');
        const savedClinic = localStorage.getItem('bios_selected_clinic');

        renderClinicDropdown();
        renderSearchResults();
        if (savedClinic) {
            document.getElementById('clinic-button-label').textContent = savedClinic;
        }

        clinicButton?.addEventListener('click', (event) => {
            event.stopPropagation();
            clinicDropdown.classList.toggle('open');
            searchPanel?.classList.remove('open');
        });

        clinicDropdown?.addEventListener('click', (event) => {
            const option = event.target.closest('.clinic-option');
            if (!option) return;
            const clinic = option.dataset.clinic;
            localStorage.setItem('bios_selected_clinic', clinic);
            document.getElementById('clinic-button-label').textContent = clinic;
            clinicDropdown.classList.remove('open');
        });

        search?.addEventListener('focus', () => {
            renderSearchResults(search.value);
            searchPanel.classList.add('open');
            clinicDropdown?.classList.remove('open');
        });

        search?.addEventListener('input', () => {
            renderSearchResults(search.value);
            searchPanel.classList.add('open');
        });

        search?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                window.location.href = href('servicios/');
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
            if (!event.target.closest('.bios-clinic-select')) clinicDropdown?.classList.remove('open');
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
                    </div>
                </div>
                <div>
                    <h4>Pacientes</h4>
                    <a href="${href('portal/')}">Pre-registro</a>
                    <a href="${href('servicios/')}">Cotizar y agendar</a>
                    <a href="${href('seguimiento/')}">Estado por folio</a>
                    <a href="${href('portal/')}">Descargar resultados</a>
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
            const stages = ['Iniciando...', 'Módulos clínicos', 'Catálogo de estudios', 'Sucursales en línea', 'Listo'];
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

    function setupRevealAnimations() {
        const targets = document.querySelectorAll('.panel, .dark-panel, .page-visual, .image-strip img, section');
        if (!('IntersectionObserver' in window)) {
            targets.forEach(target => target.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);

                    // stagger direct children in grids
                    const gridChildren = entry.target.querySelectorAll(':scope > .grid > *, :scope > div > .grid > *');
                    gridChildren.forEach((child, i) => {
                        if (!child.classList.contains('bios-reveal')) {
                            child.style.transitionDelay = `${i * 55}ms`;
                            child.classList.add('bios-reveal');
                            requestAnimationFrame(() => child.classList.add('is-visible'));
                        }
                    });
                }
            });
        }, { threshold: 0.06 });
        targets.forEach(target => {
            target.classList.add('bios-reveal');
            observer.observe(target);
        });
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
        setupRevealAnimations();
        setupFloatingVisibility();
    });
})();
