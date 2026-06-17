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

    function basePath() {
        const cleanPath = window.location.pathname.replace(/\/+$/, '');
        const current = cleanPath.split('/').pop();
        return ['servicios', 'seguimiento', 'sucursales', 'unete', 'conocenos', 'portal', 'empresas', 'medicos', 'mujer'].includes(current) ? '../' : './';
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
        return `${basePath()}logos/bios-logo-sin-circulo.png`;
    }

    function applyLogo() {
        document.querySelectorAll('[data-bios-logo]').forEach(logo => {
            logo.src = logoSrc();
        });
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
        renderWomenRibbon();
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

        menuButton?.addEventListener('click', () => drawer.classList.add('active'));
        closeButtons.forEach(button => button.addEventListener('click', () => drawer.classList.remove('active')));

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
                        <a href="https://www.facebook.com/" target="_blank" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/" target="_blank" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                        <a href="https://x.com/" target="_blank" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="https://wa.me/5211234567890" target="_blank" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                    </div>
                </div>
                <div>
                    <h4>Pacientes</h4>
                    <a href="${href('portal/')}">Pre-registro</a>
                    <a href="${href('servicios/')}">Cotizar y agendar</a>
                    <a href="${href('seguimiento/')}">Resultados por Folio</a>
                    <a href="${href('seguimiento/')}">Estado por folio</a>
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
                    <a href="${href('seguimiento/')}">Resultados por Folio</a>
                    <a href="${href('unete/')}">Bolsa de Trabajo</a>
                </div>
                <div>
                    <h4>Módulos</h4>
                    <a href="${href('mujer/')}">Campaña de la mujer</a>
                    <a href="${href('servicios/#especiales')}">Servicios especiales</a>
                    <a href="${href('seguimiento/')}">Resultados y archivos</a>
                </div>
            </div>
            <div class="bios-wrap footer-bottom-main">
                <p>© 2026 Laboratorios BIOS. Todos los derechos reservados.</p>
                <div>Diseñado y Desarrollado por <strong>Partum Design · Laboratorios BIOS</strong></div>
            </div>
        `;
        (document.querySelector('.page-shell') || document.body).appendChild(footer);
    }

    function renderWomenRibbon() {
        document.querySelectorAll('.bios-women-ribbon').forEach(item => item.remove());
        const ribbon = document.createElement('a');
        ribbon.className = 'bios-women-ribbon';
        ribbon.href = href('mujer/');
        ribbon.innerHTML = `
            <span><i class="fa-solid fa-venus"></i></span>
            <strong>Campaña de la mujer</strong>
            <em>Agenda y consulta requisitos</em>
        `;
        document.body.appendChild(ribbon);
    }

    function renderLogoIntro() {
        if (sessionStorage.getItem('bios_logo_intro_seen')) return;
        sessionStorage.setItem('bios_logo_intro_seen', '1');
        const intro = document.createElement('div');
        intro.className = 'bios-logo-intro';
        intro.setAttribute('aria-hidden', 'true');
        intro.innerHTML = `
            <div class="bios-logo-intro-card">
                <img src="${logoSrc()}" alt="">
                <div class="bios-ecg-runner">
                    <span></span>
                </div>
                <p>Laboratorios BIOS</p>
            </div>
        `;
        document.body.appendChild(intro);
        intro.addEventListener('animationend', (event) => {
            if (event.target === intro) intro.remove();
        });
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
                }
            });
        }, { threshold: 0.08 });
        targets.forEach(target => {
            target.classList.add('bios-reveal');
            observer.observe(target);
        });
    }

    function setupFloatingVisibility() {
        const footer = document.querySelector('.bios-main-footer') || document.querySelector('footer');
        if (!footer) return;

        const updateFloatingState = (isVisible) => {
            document.body.classList.toggle('footer-in-view', isVisible);
        };

        if (!('IntersectionObserver' in window)) {
            const checkFooter = () => {
                const rect = footer.getBoundingClientRect();
                updateFloatingState(rect.top < window.innerHeight && rect.bottom > 0);
            };
            window.addEventListener('scroll', checkFooter, { passive: true });
            window.addEventListener('resize', checkFooter);
            checkFooter();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            updateFloatingState(entries.some(entry => entry.isIntersecting));
        }, { threshold: 0.05 });
        observer.observe(footer);
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderHeader();
        renderFooter();
        renderLogoIntro();
        setupRevealAnimations();
        setupFloatingVisibility();
    });
})();
