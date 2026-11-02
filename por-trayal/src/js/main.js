/*
Template Name: PortRayal (v2.0)
File Name: main.js
Author Name: ThemeVault
Author URI: https://www.themevault.net/
License URI: https://www.themevault.net/license/

Replaces jQuery, custom.js and bxSlider. Plain JavaScript, no dependencies
beyond Bootstrap's own bundle.
*/
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =====================================================
       slideToggle: the jQuery animation the v1 accordions used
       ===================================================== */
    function slideToggle(el, duration) {
        if (!el) return;
        if (reduceMotion) {
            el.style.display = el.offsetHeight ? "none" : "";
            return;
        }
        duration = duration || 300;
        var isOpen = el.offsetHeight > 0 && getComputedStyle(el).display !== "none";
        el.classList.add("pr-collapsible");
        if (isOpen) {
            el.style.height = el.scrollHeight + "px";
            requestAnimationFrame(function () {
                el.style.transitionDuration = duration + "ms";
                el.style.height = "0px";
            });
            window.setTimeout(function () {
                el.style.display = "none";
                el.style.height = "";
                el.style.transitionDuration = "";
            }, duration);
        } else {
            el.style.display = "";
            el.style.height = "0px";
            var target = el.scrollHeight;
            requestAnimationFrame(function () {
                el.style.transitionDuration = duration + "ms";
                el.style.height = target + "px";
            });
            window.setTimeout(function () {
                el.style.height = "";
                el.style.transitionDuration = "";
            }, duration);
        }
    }

    /* =====================================================
       Category tree (sidebar): the +/- toggles
       ===================================================== */
    document.querySelectorAll(".box-category .menu li > i").forEach(function (icon) {
        icon.setAttribute("role", "button");
        icon.setAttribute("tabindex", "0");
        icon.setAttribute("aria-label", "Toggle sub-categories");
        var fire = function (e) {
            e.preventDefault();
            var li = icon.closest("li");
            var sub = li ? li.querySelector(":scope > ul") : null;
            var opening = icon.classList.contains("fa-plus");
            icon.classList.toggle("fa-plus", !opening);
            icon.classList.toggle("fa-minus", opening);
            icon.setAttribute("aria-expanded", opening ? "true" : "false");
            slideToggle(sub);
        };
        icon.addEventListener("click", fire);
        icon.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") fire(e);
        });
    });

    /* =====================================================
       Sidebar boxes and footer columns collapse on tap
       (v1 bound these to the heading icons)
       ===================================================== */
    function bindHeadingToggle(selector, panelSelector) {
        document.querySelectorAll(selector).forEach(function (icon) {
            icon.setAttribute("role", "button");
            icon.setAttribute("tabindex", "0");
            icon.setAttribute("aria-label", "Toggle section");
            var fire = function (e) {
                e.preventDefault();
                var scope = icon.closest(panelSelector.scope);
                var panel = scope ? scope.querySelector(panelSelector.panel) : null;
                var opening = icon.classList.contains("fa-angle-down");
                icon.classList.toggle("fa-angle-down", !opening);
                icon.classList.toggle("fa-angle-up", opening);
                icon.setAttribute("aria-expanded", opening ? "true" : "false");
                slideToggle(panel);
            };
            icon.addEventListener("click", fire);
            icon.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") fire(e);
            });
        });
    }
    bindHeadingToggle(".category h3 i", { scope: ".category", panel: ".box-content" });
    bindHeadingToggle(".footer-block h4 i", { scope: ".footer-block", panel: ".list-unstyled" });

    /* =====================================================
       Back to top: shows past 100px, scrolls up in 600ms
       ===================================================== */
    var toTop = document.getElementById("back-to-top");
    if (toTop) {
        toTop.style.display = "";
        toTop.style.opacity = "0";
        toTop.style.pointerEvents = "none";
        toTop.style.transition = "opacity 0.4s ease";
        var syncToTop = function () {
            var show = window.scrollY > 100;
            toTop.style.opacity = show ? "1" : "0";
            toTop.style.pointerEvents = show ? "auto" : "none";
        };
        syncToTop();
        window.addEventListener("scroll", syncToTop, { passive: true });
        toTop.addEventListener("click", function (e) {
            e.preventDefault();
            smoothScrollTo(0, 600);
        });
    }

    function smoothScrollTo(target, duration) {
        if (reduceMotion) { window.scrollTo(0, target); return; }
        var start = window.scrollY;
        var change = target - start;
        var startTime = null;
        function step(now) {
            if (startTime === null) startTime = now;
            var elapsed = now - startTime;
            var t = Math.min(1, elapsed / duration);
            // easeInOutQuad, matching jQuery's default "swing" closely enough
            var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            window.scrollTo(0, start + change * eased);
            if (elapsed < duration) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* =====================================================
       Single product: thumbnails swap the main image
       ===================================================== */
    var mainImg = document.querySelector(".changeimg");
    var thumbs = document.querySelectorAll(".galleryimg");
    if (mainImg && thumbs.length) {
        thumbs.forEach(function (thumb) {
            thumb.classList.add("pr-gallery-thumb");
            var link = thumb.closest("a") || thumb;
            link.setAttribute("role", "button");
            link.setAttribute("tabindex", "0");
            var pick = function (e) {
                e.preventDefault();
                mainImg.setAttribute("src", thumb.getAttribute("src"));
                thumbs.forEach(function (t) { t.classList.remove("is-active"); });
                thumb.classList.add("is-active");
            };
            link.addEventListener("click", pick);
            link.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") pick(e);
            });
        });
        thumbs[0].classList.add("is-active");
    }

    /* =====================================================
       Related products strip (bxSlider replacement):
       a scroll-snapping row with prev/next controls
       ===================================================== */
    var strip = document.querySelector(".related-slider");
    if (strip) {
        strip.classList.add("pr-strip");
        var nav = document.createElement("div");
        nav.className = "pr-strip-nav";
        var prev = document.createElement("button");
        prev.type = "button";
        prev.setAttribute("aria-label", "Previous products");
        prev.innerHTML = '<i class="fa fa-angle-left" aria-hidden="true"></i>';
        var next = document.createElement("button");
        next.type = "button";
        next.setAttribute("aria-label", "More products");
        next.innerHTML = '<i class="fa fa-angle-right" aria-hidden="true"></i>';
        nav.appendChild(prev);
        nav.appendChild(next);
        strip.parentNode.insertBefore(nav, strip);
        var step = function () {
            var first = strip.firstElementChild;
            return first ? first.getBoundingClientRect().width + 30 : 230;
        };
        prev.addEventListener("click", function () { strip.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
        next.addEventListener("click", function () { strip.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    }

    /* =====================================================
       Gallery page category filter
       ===================================================== */
    var filterBar = document.querySelector(".gallery-filter");
    if (filterBar) {
        var items = document.querySelectorAll(".gallery-item");
        filterBar.querySelectorAll("button").forEach(function (btn) {
            btn.addEventListener("click", function () {
                filterBar.querySelectorAll("button").forEach(function (b) {
                    b.classList.remove("active");
                    b.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-pressed", "true");
                var want = btn.getAttribute("data-filter");
                items.forEach(function (item) {
                    var match = want === "all" || item.getAttribute("data-category") === want;
                    item.classList.toggle("is-hidden", !match);
                });
            });
        });
    }

    /* =====================================================
       Lightbox for the gallery page
       ===================================================== */
    var lbLinks = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (lbLinks.length) {
        var box = document.createElement("div");
        box.className = "pr-lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Artwork viewer");
        box.innerHTML =
            '<img alt="Artwork, enlarged">' +
            '<button type="button" class="pr-lb-prev" aria-label="Previous artwork">&#10094;</button>' +
            '<button type="button" class="pr-lb-next" aria-label="Next artwork">&#10095;</button>' +
            '<button type="button" class="pr-lb-close" aria-label="Close viewer">&times;</button>';
        document.body.appendChild(box);
        var lbImg = box.querySelector("img");
        var current = 0;
        var show = function (i) {
            current = (i + lbLinks.length) % lbLinks.length;
            var src = lbLinks[current].getAttribute("data-lightbox") || lbLinks[current].getAttribute("href");
            lbImg.setAttribute("src", src);
        };
        var close = function () { box.classList.remove("is-open"); };
        lbLinks.forEach(function (link, i) {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                show(i);
                box.classList.add("is-open");
                box.querySelector(".pr-lb-close").focus();
            });
        });
        box.querySelector(".pr-lb-prev").addEventListener("click", function () { show(current - 1); });
        box.querySelector(".pr-lb-next").addEventListener("click", function () { show(current + 1); });
        box.querySelector(".pr-lb-close").addEventListener("click", close);
        box.addEventListener("click", function (e) { if (e.target === box) close(); });
        document.addEventListener("keydown", function (e) {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") show(current - 1);
            if (e.key === "ArrowRight") show(current + 1);
        });
    }

    /* =====================================================
       Tabs: BS5 marks the link active, the template's CSS
       keys on li.active — keep the parent in sync.
       ===================================================== */
    document.querySelectorAll('.nav-tabs [data-bs-toggle="tab"]').forEach(function (el) {
        el.addEventListener("shown.bs.tab", function () {
            var nav = el.closest(".nav-tabs");
            if (!nav) return;
            nav.querySelectorAll("li.active").forEach(function (li) { li.classList.remove("active"); });
            var li = el.closest("li");
            if (li) li.classList.add("active");
        });
    });

    /* =====================================================
       Desktop dropdowns open on hover (CSS), so stop BS5
       from also click-pinning them open; taps still work
       below 992px.
       ===================================================== */
    function syncDropdownMode() {
        var desktop = window.innerWidth >= 992;
        document.querySelectorAll(".navbar .dropdown-toggle, .top-line .dropdown-toggle").forEach(function (el) {
            if (desktop) el.removeAttribute("data-bs-toggle");
            else if (!el.getAttribute("data-bs-toggle")) el.setAttribute("data-bs-toggle", "dropdown");
        });
        if (desktop) {
            document.querySelectorAll(".dropdown-menu.show").forEach(function (m) { m.classList.remove("show"); });
        }
    }
    syncDropdownMode();
    window.addEventListener("resize", syncDropdownMode);
    document.querySelectorAll(".navbar .dropdown-toggle, .top-line .dropdown-toggle").forEach(function (el) {
        el.addEventListener("click", function (e) {
            if (window.innerWidth >= 992) { e.preventDefault(); el.blur(); }
        });
    });
})();
