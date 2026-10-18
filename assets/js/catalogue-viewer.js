/*--------------------------------------------
    Catalogue viewer (flip book)
    Pages are WebP images in assets/catalogues/<slug>/01.webp, 02.webp...
    Open with: <a href="#" data-catalogue="<slug>" data-page="3">
    Requires assets/js/plugins/page-flip.browser.js (StPageFlip, MIT)
----------------------------------------------*/
(function () {
    'use strict';

    // To add a catalogue: render its PDF pages to assets/catalogues/<slug>/ and add an entry here.
    // width/height = pixel size of the page images (all pages of a catalogue must match).
    // pdf = downloadable file (assets/media/), shown as "Download PDF" in the viewer.
    var CATALOGUES = {
        'holidays': { title: "Valentine's, Mother's Day, St. Patrick's & Christmas", pages: 8, width: 1001, height: 1410, pdf: 'assets/media/catalogue_holidays.pdf' },
        'halloween': { title: 'Halloween', pages: 2, width: 1002, height: 1252, pdf: 'assets/media/catalogue_halloween.pdf' },
        'minor-holidays': { title: 'Minor Holidays', pages: 14, width: 1001, height: 1410, pdf: 'assets/media/catalogue_minor-holidays.pdf' },
        'seasonal-celebration': { title: 'Seasonal & Celebration Collection', pages: 17, width: 1002, height: 1252, pdf: 'assets/media/catalogue_seasonal-celebration.pdf' },
        'hydrangeas': { title: 'Hydrangeas', pages: 7, width: 1001, height: 1416, pdf: 'assets/media/catalogue_hydrangeas.pdf' },
        'bouquets': { title: 'Bouquets & Arrangements', pages: 10, width: 1400, height: 788, pdf: 'assets/media/catalogue_bqts.pdf' },
        'roses': { title: 'Roses', pages: 2, width: 995, height: 2089, pdf: 'assets/media/catalogue_roses.pdf' }
    };

    var viewer, stage, titleEl, counterEl, downloadEl, pageFlip, current, lastTrigger, resizeTimer;

    function pageUrls(slug, count) {
        var urls = [];
        for (var i = 1; i <= count; i++) {
            urls.push('assets/catalogues/' + slug + '/' + (i < 10 ? '0' + i : i) + '.webp');
        }
        return urls;
    }

    function buildViewer() {
        viewer = document.createElement('div');
        viewer.className = 'catalogue-viewer';
        viewer.setAttribute('role', 'dialog');
        viewer.setAttribute('aria-modal', 'true');
        viewer.setAttribute('aria-labelledby', 'cv-title');
        viewer.hidden = true;
        viewer.innerHTML =
            '<div class="cv-header">' +
            '  <h2 class="cv-title" id="cv-title"></h2>' +
            '  <button type="button" class="cv-close" aria-label="Close catalogue">&times;</button>' +
            '</div>' +
            '<div class="cv-stage"></div>' +
            '<div class="cv-controls">' +
            '  <button type="button" class="cv-prev" aria-label="Previous page"><i class="lnr lnr-arrow-left"></i></button>' +
            '  <span class="cv-counter" aria-live="polite"></span>' +
            '  <button type="button" class="cv-next" aria-label="Next page"><i class="lnr lnr-arrow-right"></i></button>' +
            '  <a class="cv-download" download hidden>Download PDF</a>' +
            '</div>';
        document.body.appendChild(viewer);

        stage = viewer.querySelector('.cv-stage');
        titleEl = viewer.querySelector('.cv-title');
        counterEl = viewer.querySelector('.cv-counter');
        downloadEl = viewer.querySelector('.cv-download');

        viewer.querySelector('.cv-close').addEventListener('click', close);
        viewer.querySelector('.cv-prev').addEventListener('click', function () { if (pageFlip) pageFlip.flipPrev(); });
        viewer.querySelector('.cv-next').addEventListener('click', function () { if (pageFlip) pageFlip.flipNext(); });
        // Click on the dark backdrop (outside the book) closes the viewer
        stage.addEventListener('click', function (e) { if (e.target === stage) close(); });
    }

    function updateCounter(index) {
        var n = index + 1;
        // Two-page spread: the cover (page 1) shows alone, then pages pair up
        var spread = pageFlip && pageFlip.getOrientation() === 'landscape' && index > 0 && n < current.pages;
        counterEl.textContent = spread
            ? 'Pages ' + n + '\u2013' + (n + 1) + ' of ' + current.pages
            : 'Page ' + n + ' of ' + current.pages;
    }

    // Size the book so it fits the stage: two pages side by side when there is room, otherwise one.
    function render(startPage) {
        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
        }
        stage.innerHTML = '';

        var ratio = current.width / current.height;
        var availW = stage.clientWidth - 16;
        var availH = stage.clientHeight - 16;
        var pageH = availH;
        var pageW = pageH * ratio;
        var spread = true;

        if (pageW * 2 > availW) {
            spread = false;
            if (pageW > availW) {
                pageW = availW;
                pageH = pageW / ratio;
            }
        }
        pageW = Math.floor(pageW);
        pageH = Math.floor(pageH);

        var book = document.createElement('div');
        book.className = 'cv-book';
        book.style.width = (spread ? pageW * 2 : pageW) + 'px';
        book.style.height = pageH + 'px';
        stage.appendChild(book);

        pageFlip = new St.PageFlip(book, {
            width: pageW,
            height: pageH,
            size: 'fixed',
            usePortrait: true,
            showCover: current.pages > 2,
            startPage: startPage || 0,
            maxShadowOpacity: 0.4,
            mobileScrollSupport: false
        });
        pageFlip.on('flip', function (e) { updateCounter(e.data); });
        pageFlip.on('init', function (e) { updateCounter(e.data.page); });
        pageFlip.loadFromImages(pageUrls(current.slug, current.pages));
        counterEl.textContent = '';
    }

    function open(slug, startPage, trigger) {
        var cat = CATALOGUES[slug];
        if (!cat || typeof St === 'undefined') return false;
        if (!viewer) buildViewer();

        current = { slug: slug, pages: cat.pages, width: cat.width, height: cat.height };
        lastTrigger = trigger || null;
        titleEl.textContent = cat.title;
        downloadEl.hidden = !cat.pdf;
        if (cat.pdf) {
            downloadEl.href = cat.pdf;
            downloadEl.setAttribute('download', 'Floreza - ' + cat.title + '.pdf');
        }

        viewer.hidden = false;
        document.body.classList.add('cv-open');
        render(Math.min(Math.max(startPage, 0), cat.pages - 1));
        viewer.querySelector('.cv-close').focus();
        return true;
    }

    function close() {
        if (!viewer || viewer.hidden) return;
        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
        }
        stage.innerHTML = '';
        viewer.hidden = true;
        document.body.classList.remove('cv-open');
        if (lastTrigger) lastTrigger.focus();
    }

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-catalogue]');
        if (!trigger) return;
        var page = parseInt(trigger.getAttribute('data-page'), 10) || 1;
        if (open(trigger.getAttribute('data-catalogue'), page - 1, trigger)) {
            e.preventDefault();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!viewer || viewer.hidden || !pageFlip) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') pageFlip.flipNext();
        else if (e.key === 'ArrowLeft') pageFlip.flipPrev();
    });

    window.addEventListener('resize', function () {
        if (!viewer || viewer.hidden || !pageFlip) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            render(pageFlip.getCurrentPageIndex());
        }, 250);
    });
})();
