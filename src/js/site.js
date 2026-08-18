/* karinabrown.xyz — two small behaviours, no dependencies. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Navigation panel (below 900px) ----------------------------------- */

  var nav = document.querySelector('[data-nav]');
  var toggle = nav && nav.querySelector('[data-nav-toggle]');

  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setOpen(nav.classList.contains('is-open') === false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(event.target)) setOpen(false);
    });
  }

  /* --- Fade and rise on scroll, once ------------------------------------ */

  var targets = document.querySelectorAll('[data-reveal]');

  if (!targets.length || reduced.matches || !('IntersectionObserver' in window)) {
    return;
  }

  document.documentElement.classList.add('js-motion');

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );

  targets.forEach(function (target) {
    observer.observe(target);
  });
})();
