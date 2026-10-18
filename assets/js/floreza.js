/*--------------------------------------------
    Floreza design layer: scroll reveal + footer year
----------------------------------------------*/
(function () {
    'use strict';

    // Footer year
    var year = String(new Date().getFullYear());
    document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = year; });

    // Reveal elements marked with data-reveal when they enter the viewport
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('is-visible'); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            // also reveal anything already scrolled past (e.g. page restored mid-scroll)
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
})();

/*--------------------------------------------
    Drawers: hamburger links are href="#", so stop the jump to top;
    Esc closes; focus moves into the drawer and back to the button.
----------------------------------------------*/
(function () {
    'use strict';
    var lastButton = null;
    document.querySelectorAll('.off-canvas-menu-btn, .off-canvas-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            lastButton = btn;
            var drawer = document.getElementById(btn.getAttribute('aria-controls'));
            if (drawer) {
                var close = drawer.querySelector('.btn-close-off-canvas');
                setTimeout(function () { if (close) close.focus(); }, 300);
            }
        });
    });
    function closeAll() {
        document.querySelectorAll('.fz-drawer.open .btn-close-off-canvas').forEach(function (b) { b.click(); });
        if (lastButton) lastButton.focus();
    }
    document.querySelectorAll('.fz-drawer .btn-close-off-canvas').forEach(function (b) {
        b.addEventListener('click', function () { if (lastButton) lastButton.focus(); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.querySelector('.fz-drawer.open')) closeAll();
    });
})();
