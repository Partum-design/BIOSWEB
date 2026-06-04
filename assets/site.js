(() => {
    const routes = [
        { key: 'inicio', label: 'Inicio', path: './', icon: 'fa-house' },
        { key: 'servicios', label: 'Servicios', path: 'servicios/', icon: 'fa-flask-vial' },
        { key: 'seguimiento', label: 'Seguimiento', path: 'seguimiento/', icon: 'fa-clock-rotate-left' },
        { key: 'sucursales', label: 'Sucursales', path: 'sucursales/', icon: 'fa-location-dot' },
        { key: 'conocenos', label: 'Conócenos', path: 'conocenos/', icon: 'fa-building' },
        { key: 'unete', label: 'Únete a nosotros', path: 'unete/', icon: 'fa-briefcase' },
    ];

    const quickRoutes = [
        { label: 'Portal Pacientes', path: 'portal/', icon: 'fa-user' },
        { label: 'Empresas B2B', path: 'empresas/', icon: 'fa-building-user' },
        { label: 'Médicos', path: 'medicos/', icon: 'fa-user-doctor' },
        { label: 'Contrataciones', path: 'unete/', icon: 'fa-briefcase' },
    ];

    const services = [
        { name: 'Check Up Completo', category: 'Preventivo', price: '$930', time: 'Rastreo activo', icon: 'fa-heart-pulse' },
        { name: 'Perfil Tiroideo 3', category: 'Hormonal', price: '$1,400', time: '6 horas', icon: 'fa-chart-line' },
        { name: 'Perfil Hormonal Completo', category: 'Hormonal', price: '$1,200', time: '24 horas', icon: 'fa-dna' },
        { name: 'Campaña Ginecológica / Urológica', category: 'Especialidad', price: '$650', time: '48 horas', icon: 'fa-shield-heart' },
        { name: 'Check Up Masculino', category: 'Preventivo', price: '$1,090', time: '24 horas', icon: 'fa-user-check' },
        { name: 'Mastografía', category: 'Imagen', price: '$400', time: '1 hora', icon: 'fa-x-ray' },
        { name: 'Electrocardiograma', category: 'Gabinete', price: '$320', time: '1 hora', icon: 'fa-wave-square' },
        { name: 'Ultrasonido General', category: 'Imagen', price: '$520', time: '2 horas', icon: 'fa-display' },
        { name: 'Química Sanguínea', category: 'Laboratorio', price: '$280', time: '8 horas', icon: 'fa-vial' },
    ];

    const branches = [
        { name: 'Plaza Cantú', label: 'Principal', address: 'Cuautitlán Izcalli, Centro Urbano', phone: '55-1113-2754' },
        { name: 'Plaza La Joya', label: 'Alta afluencia', address: 'Cuautitlán-Melchor Ocampo', phone: '55-5872-9277' },
        { name: 'Las Haciendas', label: 'Cerca de ti', address: 'Av. Huehuetoca, Local D-40', phone: '55-5817-3401' },
        { name: 'Tepalcapa', label: 'Express', address: 'Granjas de Guadalupe', phone: '55-2602-0764' },
        { name: 'Tepojaco', label: 'Especialidad', address: 'San Sebastián', phone: '55-5391-8066' },
        { name: 'Tultepec', label: 'Nueva', address: 'Av. Joaquín Montenegro', phone: '55-9413-2041', isNew: true },
    ];

    const logoThemes = [
        { logo: 'P1', label: 'Medical Emerald', color1: '#059669', color2: '#10b981', desc: 'Verde clínico' },
        { logo: 'P2', label: 'Clinical Blue', color1: '#1e3a8a', color2: '#3b82f6', desc: 'Azul BIOS' },
        { logo: 'P3', label: 'High-Tech Cyan', color1: '#0891b2', color2: '#06b6d4', desc: 'Cian tecnológico' },
        { logo: 'P4', label: 'BIOS Premium', color1: '#4f46e5', color2: '#22d3ee', desc: 'Premium digital' },
    ];

    function basePath() {
        const cleanPath = window.location.pathname.replace(/\/+$/, '');
        const current = cleanPath.split('/').pop();
        return ['servicios', 'seguimiento', 'sucursales', 'unete', 'conocenos', 'portal', 'empresas', 'medicos'].includes(current) ? '../' : './';
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

    function currentTheme() {
        const saved = localStorage.getItem('bios_logo_theme') || 'P2';
        return logoThemes.find(theme => theme.logo === saved) || logoThemes[1];
    }

    function logoSrc(theme = currentTheme()) {
        return `${basePath()}logos/${theme.logo}.png`;
    }

    function logoThemeMarkup() {
        const active = currentTheme().logo;
        return `
            <div class="bios-panel-title">Temas visuales BIOS</div>
            ${logoThemes.map(theme => `
                <button type="button" class="logo-theme-option ${theme.logo === active ? 'active' : ''}" data-logo="${theme.logo}" data-color-1="${theme.color1}" data-color-2="${theme.color2}">
                    <span class="logo-theme-swatch" style="--swatch-a:${theme.color1};--swatch-b:${theme.color2};"></span>
                    <span>
                        <strong>${theme.label}</strong>
                        <small>${theme.desc}</small>
                    </span>
                    <i class="fa-solid ${theme.logo === active ? 'fa-circle-check' : 'fa-arrow-right'}"></i>
                </button>
            `).join('')}
            <a class="bios-panel-link" href="${href('./')}"><i class="fa-solid fa-house"></i> Ir al inicio</a>
        `;
    }

    function applyTheme(theme) {
        if (!theme) return;
        document.documentElement.style.setProperty('--bios-accent-1', theme.color1);
        document.documentElement.style.setProperty('--bios-accent-2', theme.color2);
        document.querySelectorAll('[data-bios-logo]').forEach(logo => {
            logo.src = logoSrc(theme);
        });
    }

    function renderHeader() {
        const firstHeader = document.querySelector('header');
        if (!firstHeader) return;
        const theme = currentTheme();

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
                    <div class="bios-logo-switcher">
                        <button type="button" id="logo-switcher-button" class="bios-brand" aria-label="Cambiar tema visual">
                            <img id="global-logo" data-bios-logo src="${logoSrc(theme)}" alt="BIOS" onerror="this.src='https://placehold.co/200x70/0A1C2E/FFF?text=BIOS'">
                            <span><i class="fa-solid fa-chevron-down"></i></span>
                        </button>
                        <div id="logo-dropdown" class="bios-floating-panel logo-panel">${logoThemeMarkup()}</div>
                    </div>
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
                    <a href="${href('seguimiento/')}" class="bios-icon-button" aria-label="Seguimiento"><i class="fa-solid fa-clock-rotate-left"></i></a>
                    <a href="https://wa.me/5211234567890?text=Hola%20BIOS,%20quiero%20agendar%20una%20cita" target="_blank" class="bios-appointment-button">
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
                        <p>BIOS</p>
                        <strong>Menú</strong>
                    </div>
                    <button type="button" class="bios-mobile-close" aria-label="Cerrar menú"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="bios-mobile-links">${mobileNavMarkup()}</div>
                <a href="https://wa.me/5211234567890?text=Hola%20BIOS,%20quiero%20informes" target="_blank" class="bios-mobile-whatsapp">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp BIOS
                </a>
            </aside>
        `;
        firstHeader.insertAdjacentElement('afterend', drawer);

        bindHeaderInteractions(drawer);
        applyTheme(theme);
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
            const haystack = `${service.name} ${service.category} ${service.price} ${service.time}`.toLowerCase();
            return !normalized || haystack.includes(normalized);
        }).slice(0, 6);

        panel.innerHTML = `
            <div class="bios-panel-title">${normalized ? `${list.length} coincidencias` : 'Servicios populares'}</div>
            ${list.length ? list.map(service => `
                <a class="search-result" href="${href('servicios/')}">
                    <span class="search-result-icon"><i class="fa-solid ${service.icon}"></i></span>
                    <span>
                        <strong>${service.name}</strong>
                        <small>${service.category} · ${service.time}</small>
                    </span>
                    <b>${service.price}</b>
                </a>
            `).join('') : `
                <a class="search-result empty" href="https://wa.me/5211234567890?text=Hola%20BIOS,%20no%20encuentro%20un%20estudio" target="_blank">
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
        const logoButton = document.getElementById('logo-switcher-button');
        const logoDropdown = document.getElementById('logo-dropdown');
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

        logoButton?.addEventListener('click', (event) => {
            event.stopPropagation();
            logoDropdown.classList.toggle('open');
            clinicDropdown?.classList.remove('open');
            searchPanel?.classList.remove('open');
        });

        logoDropdown?.addEventListener('click', (event) => {
            const option = event.target.closest('.logo-theme-option');
            if (!option) return;
            const theme = logoThemes.find(item => item.logo === option.dataset.logo);
            localStorage.setItem('bios_logo_theme', theme.logo);
            applyTheme(theme);
            logoDropdown.innerHTML = logoThemeMarkup();
            logoDropdown.classList.remove('open');
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
            if (!event.target.closest('.bios-logo-switcher')) logoDropdown?.classList.remove('open');
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
                    <img id="footer-logo" data-bios-logo src="${logoSrc()}" alt="BIOS" onerror="this.src='https://placehold.co/200x70/0A1C2E/FFF?text=BIOS'">
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
                    <a href="${href('seguimiento/')}">Rastreo en Tiempo Real</a>
                </div>
                <div>
                    <h4>Empresas B2B</h4>
                    <a href="${href('empresas/')}">Registro RFC/Moral</a>
                    <a href="${href('empresas/')}">Facturación SICOFI</a>
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
                    <a href="${href('sucursales/')}">Tour Virtual 360</a>
                    <a href="${href('seguimiento/')}">Mapas admin</a>
                    <a href="${href('unete/')}">Gestión de Imágenes</a>
                </div>
            </div>
            <div class="bios-wrap footer-bottom-main">
                <p>© 2026 Laboratorios BIOS. Todos los derechos reservados.</p>
                <div>Diseñado y Desarrollado por <strong>Partum Design · Laboratorios BIOS</strong></div>
            </div>
        `;
        (document.querySelector('.page-shell') || document.body).appendChild(footer);
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

    document.addEventListener('DOMContentLoaded', () => {
        renderHeader();
        renderFooter();
        setupRevealAnimations();
    });
})();
