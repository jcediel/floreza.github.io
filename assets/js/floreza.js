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
