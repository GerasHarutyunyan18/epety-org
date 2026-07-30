var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Age gate
(function () {
  var gate = document.getElementById('ageGate');
  var yesBtn = document.getElementById('ageYes');
  if (sessionStorage.getItem('vz_age_ok') === '1') {
    gate.classList.add('hidden');
  }
  yesBtn.addEventListener('click', function () {
    sessionStorage.setItem('vz_age_ok', '1');
    gate.classList.add('hidden');
  });
})();

// Horizontal product row scroll
function scrollRow(id, dir) {
  var row = document.getElementById('row-' + id);
  if (!row) return;
  row.scrollBy({ left: dir * 480, behavior: 'smooth' });
}

// Category pills: click sets active immediately; scroll-spy keeps it in sync below
var pills = Array.prototype.slice.call(document.querySelectorAll('.category-nav .pill'));
pills.forEach(function (pill) {
  pill.addEventListener('click', function () {
    pills.forEach(function (p) { p.classList.remove('active'); });
    pill.classList.add('active');
  });
});

// Mobile hamburger menu
(function () {
  var siteHeader = document.getElementById('siteHeader');
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (!siteHeader || !hamburgerBtn || !mobileMenu) return;

  function closeMenu() {
    siteHeader.classList.remove('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    var open = siteHeader.classList.toggle('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  hamburgerBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });
  mobileMenu.querySelectorAll('.mobile-menu-links a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('click', function (e) {
    if (siteHeader.classList.contains('menu-open') && !e.target.closest('#mobileMenu') && !e.target.closest('#hamburgerBtn')) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

// Sticky header state on scroll
var header = document.querySelector('.site-header');
var scrollProgress = document.querySelector('.scroll-progress');
var backToTop = document.querySelector('.back-to-top');

function onScroll() {
  var y = window.scrollY;
  if (header) header.classList.toggle('scrolled', y > 8);
  if (backToTop) backToTop.classList.toggle('show', y > 700);
  if (scrollProgress) {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
    scrollProgress.style.width = pct + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// Scroll-reveal animations. Product cards live inside horizontally-scrolling
// rows, so cards past the initial scroll position sit outside the viewport
// on the x-axis and would never self-intersect — reveal them as a group when
// their section header (or standalone banner/strip) comes into view instead.
function revealGroup(el) {
  el.classList.add('in-view');
  if (el.classList.contains('section-head')) {
    var row = el.parentElement.querySelector('.product-row');
    if (row) {
      row.querySelectorAll('.reveal').forEach(function (card) { card.classList.add('in-view'); });
    }
  }
}
var revealTargets = document.querySelectorAll('.banners .reveal, .trust-strip.reveal, .section-head.reveal, .game-section.reveal, .info-section.reveal, .reviews-section.reveal, .faq-section.reveal');
if (prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
} else if ('IntersectionObserver' in window) {
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revealGroup(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(function (el) { revealObserver.observe(el); });

  // Safety net: if IntersectionObserver never fires for an element (some
  // embedding contexts throttle it), force-reveal anything still hidden
  // once it's actually been on-screen for a moment so content is never
  // stuck permanently invisible.
  setInterval(function () {
    revealTargets.forEach(function (el) {
      if (!el.classList.contains('in-view')) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          revealGroup(el);
          revealObserver.unobserve(el);
        }
      }
    });
  }, 700);
} else {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
}

// Scroll-spy: highlight nav pill for the section currently in view
var sections = document.querySelectorAll('.category-section[id]');
if ('IntersectionObserver' in window && sections.length) {
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        pills.forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach(function (s) { spyObserver.observe(s); });
}

// Top announcement ticker
(function () {
  var items = document.querySelectorAll('.ticker-item');
  if (!items.length) return;
  var idx = 0;
  items[0].classList.add('active');
  if (prefersReducedMotion || items.length < 2) return;
  setInterval(function () {
    items[idx].classList.remove('active');
    idx = (idx + 1) % items.length;
    items[idx].classList.add('active');
  }, 3200);
})();

// Subtle cursor-tilt on promo banners (desktop / fine-pointer only)
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.banner').forEach(function (banner) {
    banner.addEventListener('mousemove', function (e) {
      var rect = banner.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      banner.style.transform = 'perspective(600px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-2px)';
    });
    banner.addEventListener('mouseleave', function () {
      banner.style.transform = '';
    });
  });
}

// Live search
(function () {
  var input = document.getElementById('searchInput');
  var resultsBox = document.getElementById('searchResults');
  if (!input || !resultsBox) return;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  var productIndex = Array.prototype.slice.call(document.querySelectorAll('.product-card')).map(function (card) {
    var h3 = card.querySelector('h3');
    var brandEl = card.querySelector('.brand-tag');
    var img = card.querySelector('img');
    return {
      type: 'product',
      title: h3 ? h3.textContent.trim() : '',
      brand: brandEl ? brandEl.textContent.trim() : '',
      img: img ? img.getAttribute('src') : '',
      href: card.getAttribute('href')
    };
  });
  var categoryIndex = Array.prototype.slice.call(document.querySelectorAll('.category-section[id]')).map(function (sec) {
    var h2 = sec.querySelector('h2');
    return { type: 'category', title: h2 ? h2.textContent.trim() : sec.id, href: '#' + sec.id };
  });
  var allIndex = categoryIndex.concat(productIndex);

  function render(query) {
    var q = normalize(query.trim());
    if (!q) { resultsBox.classList.remove('show'); resultsBox.innerHTML = ''; return; }
    var matches = allIndex.filter(function (item) {
      return normalize(item.title).indexOf(q) !== -1 || (item.brand && normalize(item.brand).indexOf(q) !== -1);
    }).slice(0, 8);

    if (!matches.length) {
      resultsBox.innerHTML = '<div class="search-empty">Brak wyników dla „' + escapeHtml(query) + '”. Spróbuj: epety, MerryMi, JNR, Fumot, Al Fakher, Adalya</div>';
      resultsBox.classList.add('show');
      return;
    }

    resultsBox.innerHTML = matches.map(function (item) {
      if (item.type === 'category') {
        return '<a class="search-result-item sr-category" href="' + item.href + '">' +
          '<span style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:18px;">📂</span>' +
          '<div class="sr-info"><div class="sr-title">Kategoria: ' + escapeHtml(item.title) + '</div></div></a>';
      }
      return '<a class="search-result-item" href="' + item.href + '" target="_blank" rel="noopener">' +
        '<img src="' + item.img + '" alt="">' +
        '<div class="sr-info"><div class="sr-brand">' + escapeHtml(item.brand) + '</div><div class="sr-title">' + escapeHtml(item.title) + '</div></div></a>';
    }).join('');
    resultsBox.classList.add('show');
  }

  input.addEventListener('input', function () {
    render(input.value);
    var bar = input.closest('.search-bar');
    if (bar) bar.classList.toggle('filled', input.value.trim().length > 0);
  });
  input.addEventListener('focus', function () { if (input.value.trim()) render(input.value); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrap')) resultsBox.classList.remove('show');
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = resultsBox.querySelector('.search-result-item');
      if (first) first.click();
    } else if (e.key === 'Escape') {
      resultsBox.classList.remove('show');
      input.blur();
    }
  });
})();

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(function (item) {
  var btn = item.querySelector('.faq-q');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!wasOpen) item.classList.add('open');
  });
});

// Spin-the-wheel discount minigame
(function () {
  var wheelEl = document.getElementById('wheelEl');
  var spinBtn = document.getElementById('spinBtn');
  var gameNote = document.getElementById('gameNote');
  var winModal = document.getElementById('winModal');
  var winPercent = document.getElementById('winPercent');
  var winModalClose = document.getElementById('winModalClose');
  var winBadge = document.getElementById('winBadge');
  var winBadgeText = document.getElementById('winBadgeText');
  var playBadge = document.getElementById('playBadge');
  if (!wheelEl || !spinBtn) return;

  var segments = [5, 10, 15, 20, 10, 15, 5, 30];

  function showWinModal(pct) {
    winPercent.textContent = '-' + pct + '%';
    winModal.classList.add('show');
  }

  function applyWonState(pct) {
    if (winBadge && winBadgeText) {
      winBadgeText.textContent = '-' + pct + '%';
      winBadge.style.display = 'flex';
    }
    if (playBadge) playBadge.style.display = 'none';
    spinBtn.disabled = true;
    spinBtn.textContent = 'Nagroda zdobyta ✓';
    if (gameNote) gameNote.textContent = 'Wygrałeś -' + pct + '%!';
  }

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('epety_discount') || 'null'); } catch (e) {}
  if (saved && saved.percent) {
    applyWonState(saved.percent);
  }

  spinBtn.addEventListener('click', function () {
    if (spinBtn.disabled) return;
    spinBtn.disabled = true;

    var idx = Math.floor(Math.random() * segments.length);
    var pct = segments[idx];
    var segmentCenter = idx * 45 + 22.5;
    var fullSpins = 5 + Math.floor(Math.random() * 3);
    var targetRotation = fullSpins * 360 + (360 - segmentCenter);

    wheelEl.style.transform = 'rotate(' + targetRotation + 'deg)';

    var duration = prefersReducedMotion ? 50 : 4500;
    setTimeout(function () {
      try { localStorage.setItem('epety_discount', JSON.stringify({ percent: pct, ts: Date.now() })); } catch (e) {}
      applyWonState(pct);
      showWinModal(pct);
    }, duration);
  });

  if (winModalClose) {
    winModalClose.addEventListener('click', function () { winModal.classList.remove('show'); });
  }
  if (winModal) {
    winModal.addEventListener('click', function (e) {
      if (e.target === winModal) winModal.classList.remove('show');
    });
  }
})();

(function () {
  var slider = document.getElementById('bannersSlider');
  var dots = document.querySelectorAll('#bannerDots .banner-dot');
  if (!slider || !dots.length) return;

  function setActive(idx) {
    dots.forEach(function (dot, i) { dot.classList.toggle('active', i === idx); });
  }

  var ticking = false;
  slider.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var idx = Math.round(slider.scrollLeft / slider.clientWidth);
      setActive(idx);
      ticking = false;
    });
  }, { passive: true });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      slider.scrollTo({ left: i * slider.clientWidth, behavior: 'smooth' });
    });
  });
})();
