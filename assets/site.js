(() => {
    const pages = [
        { key: 'inicio', label: 'Inicio', href: './', icon: 'fa-house' },
        { key: 'servicios', label: 'Servicios', href: 'servicios/', icon: 'fa-microscope' },
        { key: 'seguimiento', label: 'Seguimiento', href: 'seguimiento/', icon: 'fa-clock-rotate-left' },
        { key: 'sucursales', label: 'Sucursales', href: 'sucursales/', icon: 'fa-location-dot' },
        { key: 'conocenos', label: 'Conócenos', href: 'conocenos/', icon: 'fa-building' },
        { key: 'unete', label: 'Únete', href: 'unete/', icon: 'fa-briefcase' },
    ];

    const quickLinks = [
        { label: 'Portal Pacientes', href: 'portal/', icon: 'fa-user' },
        { label: 'Empresas B2B', href: 'empresas/', icon: 'fa-building-user' },
        { label: 'Médicos', href: 'medicos/', icon: 'fa-user-doctor' },
    ];

    function basePath() {
        const path = window.location.pathname.replace(/\/+$/, '');
        const last = path.split('/').pop();
        const nested = ['servicios', 'seguimiento', 'sucursales', 'unete', 'conocenos', 'portal', 'empresas', 'medicos'].includes(last);
        return nested ? '../' : './';
    }

    function activeKey() {
        const path = window.location.pathname;
        return pages.find(page => path.includes(`/${page.key}/`))?.key || 'inicio';
    }

    function linkHref(base, href) {
        if (href === './') return base;
        return `${base}${href}`;
    }

    function navLinks(base, active) {
        return pages.map(page => `
            <a class="shared-nav-link ${page.key === active ? 'active' : ''}" href="${linkHref(base, page.href)}">
                <i class="fa-solid ${page.icon}"></i><span>${page.label}</span>
            </a>
        `).join('');
    }

    function renderHeader() {
        const base = basePath();
        const active = activeKey();
        const header = document.querySelector('.site-header');
        if (!header) return;

        document.querySelectorAll('#drawer, #mobile-drawer').forEach(drawer => drawer.remove());
        header.className = 'site-header';
        header.innerHTML = `
            <div class="shared-topbar">
                <div class="shared-container shared-topbar-inner">
                    ${quickLinks.map(link => `
                        <a href="${linkHref(base, link.href)}"><i class="fa-solid ${link.icon}"></i>${link.label}</a>
                    `).join('')}
                </div>
            </div>
            <div class="shared-container shared-header-main">
                <a class="shared-brand" href="${base}">
                    <img src="${base}logos/P2.png" alt="BIOS" onerror="this.src='https://placehold.co/170x58/0A1C2E/FFFFFF?text=BIOS'">
                </a>
                <nav class="shared-nav" aria-label="Navegación principal">
                    ${navLinks(base, active)}
                </nav>
                <div class="shared-actions">
                    <a class="shared-cta" href="https://wa.me/5211234567890?text=Hola%20BIOS,%20quiero%20informes" target="_blank">
                        <i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span>
                    </a>
                    <button class="shared-menu-button" type="button" aria-label="Abrir menú" data-shared-menu-open>
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>
        `;

        const drawer = document.createElement('div');
        drawer.id = 'drawer';
        drawer.className = 'drawer fixed inset-0 z-50 lg:hidden';
        drawer.innerHTML = `
            <div class="absolute inset-0 bg-slate-950/55" data-shared-menu-close></div>
            <aside class="drawer-panel absolute right-0 top-0 h-full w-[min(86vw,360px)] bg-white p-5 shadow-2xl">
                <div class="flex items-center justify-between mb-5">
                    <strong class="brand-type text-2xl text-[#0A1C2E]">BIOS</strong>
                    <button class="secondary-button !min-h-10 !p-2" type="button" aria-label="Cerrar menú" data-shared-menu-close>
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="grid gap-2 font-black text-[#0A1C2E]">
                    ${pages.map(page => `
                        <a href="${linkHref(base, page.href)}" class="mobile-shared-link ${page.key === active ? 'active' : ''}">
                            <i class="fa-solid ${page.icon}"></i>${page.label}
                        </a>
                    `).join('')}
                </div>
                <div class="mt-5 grid gap-2">
                    ${quickLinks.map(link => `
                        <a href="${linkHref(base, link.href)}" class="mobile-shared-link">
                            <i class="fa-solid ${link.icon}"></i>${link.label}
                        </a>
                    `).join('')}
                </div>
            </aside>
        `;
        header.insertAdjacentElement('afterend', drawer);

        document.querySelectorAll('[data-shared-menu-open]').forEach(button => {
            button.addEventListener('click', () => drawer.classList.add('open'));
        });
        document.querySelectorAll('[data-shared-menu-close]').forEach(button => {
            button.addEventListener('click', () => drawer.classList.remove('open'));
        });
    }

    function renderFooter() {
        const base = basePath();
        document.querySelectorAll('footer').forEach(footer => footer.remove());

        const footer = document.createElement('footer');
        footer.className = 'site-footer';
        footer.innerHTML = `
            <div class="shared-container footer-grid">
                <div class="footer-brand">
                    <img src="${base}logos/P2.png" alt="BIOS" onerror="this.src='https://placehold.co/170x58/0A1C2E/FFFFFF?text=BIOS'">
                    <p>Laboratorio médico diagnóstico con análisis clínicos, gabinete e imagenología para pacientes, médicos y empresas.</p>
                    <div class="footer-socials">
                        <a href="https://www.facebook.com/" target="_blank" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/" target="_blank" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                        <a href="https://x.com/" target="_blank" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="https://wa.me/5211234567890" target="_blank" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                    </div>
                </div>
                <div>
                    <h3>Pacientes</h3>
                    <a href="${base}portal/">Portal</a>
                    <a href="${base}servicios/">Cotizar estudios</a>
                    <a href="${base}seguimiento/">Resultados por folio</a>
                </div>
                <div>
                    <h3>BIOS</h3>
                    <a href="${base}conocenos/">Conócenos</a>
                    <a href="${base}sucursales/">Sucursales</a>
                    <a href="${base}unete/">Únete a nosotros</a>
                </div>
                <div>
                    <h3>Profesional</h3>
                    <a href="${base}empresas/">Empresas B2B</a>
                    <a href="${base}medicos/">Médicos</a>
                    <a href="https://wa.me/5211234567890" target="_blank">WhatsApp</a>
                </div>
            </div>
            <div class="shared-container footer-bottom">
                <span>© 2026 Laboratorios BIOS. Todos los derechos reservados.</span>
                <strong>Partum Design · Laboratorios BIOS</strong>
            </div>
        `;

        const shell = document.querySelector('.page-shell') || document.body;
        shell.appendChild(footer);
    }

    function revealOnScroll() {
        const targets = document.querySelectorAll('.animate-in, .panel, .dark-panel, .page-visual, .image-strip img');
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
        }, { threshold: 0.12 });
        targets.forEach(target => observer.observe(target));
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderHeader();
        renderFooter();
        revealOnScroll();
    });
})();
