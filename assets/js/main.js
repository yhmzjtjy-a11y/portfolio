/* ==========================================================================
   Rivet 官网 — 交互脚本
   纯原生 JavaScript，无任何依赖
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* --- 1. 主题切换 --- */
  function initTheme() {
    var toggle = $('#themeToggle');
    var root = document.documentElement;
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* 隐私模式下忽略 */ }
    });
  }

  /* --- 2. 顶栏滚动状态 --- */
  function initHeader() {
    var header = $('#siteHeader');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- 3. 移动端导航 --- */
  function initNav() {
    var toggle = $('#navToggle');
    var links = $('#navLinks');
    if (!toggle || !links) return;

    var close = function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开菜单');
      var icon = toggle.querySelector('use');
      if (icon) icon.setAttribute('href', '#i-menu');
    };

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      var icon = toggle.querySelector('use');
      if (icon) icon.setAttribute('href', open ? '#i-close' : '#i-menu');
    });

    $$('a', links).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) close();
    });
  }

  /* --- 4. 首页锚点改页内跳转 / 内页导航高亮 --- */
  function initNavState() {
    var page = document.body.getAttribute('data-page');

    if (page === 'home') {
      $$('.nav-links a[href^="index.html#"]').forEach(function (a) {
        a.setAttribute('href', a.getAttribute('href').replace('index.html', ''));
      });
      return;
    }

    if (!page) return;
    $$('.nav-links a').forEach(function (a) {
      if ((a.getAttribute('href') || '').indexOf(page + '.html') !== -1) {
        a.classList.add('active');
      }
    });
  }

  /* --- 5. 滚动入场动画 --- */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* --- 6. 数字滚动 --- */
  function initCounters() {
    var counters = $$('.counter');
    if (!counters.length) return;

    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-to')) || 0;
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1500;
      var start = null;

      if (reduceMotion) {
        el.textContent = to.toFixed(decimals) + suffix;
        return;
      }

      var step = function (timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (to * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* --- 7. FAQ 手风琴 --- */
  function initFaq() {
    var list = $('#faqList');
    if (!list) return;

    $$('.faq-item', list).forEach(function (item) {
      var btn = $('.faq-q', item);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* --- 8. 复制安装命令 --- */
  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = $(btn.getAttribute('data-copy'));
        if (!target) return;

        var text = (target.textContent || '').replace(/^\$\s*/, '').trim();
        var label = $('span', btn);
        var original = label ? label.textContent : '';

        var done = function () {
          btn.classList.add('done');
          if (label) label.textContent = '已复制';
          setTimeout(function () {
            btn.classList.remove('done');
            if (label) label.textContent = original;
          }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, done);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) { /* 忽略 */ }
          document.body.removeChild(ta);
          done();
        }
      });
    });
  }

  /* --- 9. 订阅表单 --- */
  function initSubscribe() {
    var form = $('#subscribeForm');
    if (!form) return;

    var input = $('#subEmail');
    var note = $('#subNote');
    var original = note ? note.textContent : '';
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var value = (input.value || '').trim();
      if (!re.test(value)) {
        input.classList.add('invalid');
        if (note) {
          note.classList.remove('ok');
          note.textContent = '请填写有效的邮箱地址。';
        }
        input.focus();
        return;
      }

      input.classList.remove('invalid');
      form.reset();
      if (note) {
        note.classList.add('ok');
        note.textContent = '已订阅，下一个版本发布时会第一时间通知你。';
        setTimeout(function () {
          note.classList.remove('ok');
          note.textContent = original;
        }, 6000);
      }
    });

    if (input) {
      input.addEventListener('input', function () { input.classList.remove('invalid'); });
    }
  }

  /* --- 10. 滚动侦测：主导航与文档目录高亮 --- */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    var spy = function (links, targets, map, rootMargin) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('active'); });
          var active = map[entry.target.id];
          if (active) active.classList.add('active');
        });
      }, { threshold: 0, rootMargin: rootMargin });

      targets.forEach(function (t) { io.observe(t); });
    };

    if (document.body.getAttribute('data-page') === 'home') {
      var links = $$('.nav-links a[href^="#"]');
      var map = {};
      var targets = [];
      links.forEach(function (link) {
        var section = document.getElementById(link.getAttribute('href').slice(1));
        if (!section) return;
        map[section.id] = link;
        targets.push(section);
      });
      if (targets.length) spy(links, targets, map, '-45% 0px -50% 0px');
    }

    var docNav = $('#docNav');
    if (docNav) {
      var docLinks = $$('a[href^="#"]', docNav);
      var docMap = {};
      var docTargets = [];
      docLinks.forEach(function (link) {
        var section = document.getElementById(link.getAttribute('href').slice(1));
        if (!section) return;
        docMap[section.id] = link;
        docTargets.push(section);
      });
      if (docTargets.length) spy(docLinks, docTargets, docMap, '-20% 0px -65% 0px');
    }
  }

  /* --- 11. 细腻动效：卡片 3D 倾斜 + 按钮磁吸 --- */
  function initTilt() {
    if (reduceMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    $$('.feature, .step').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transition = 'transform .18s ease-out, border-color .3s ease, box-shadow .3s ease';
        card.style.transform = 'translateY(-6px) perspective(900px) rotateX(' + (-y * 4).toFixed(2) +
          'deg) rotateY(' + (x * 5).toFixed(2) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1), border-color .3s ease, box-shadow .3s ease';
        card.style.transform = '';
      });
    });

    $$('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.12).toFixed(1) + 'px,' + (y * 0.18).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* --- 12. 英雄区光标跟随 --- */
  function initSpotlight() {
    var hero = $('.hero');
    if (!hero || reduceMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var visual = $('.hero-visual');
    if (!visual) return;

    hero.addEventListener('mousemove', function (e) {
      var rect = visual.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      visual.style.setProperty('--mx', (x * 0.05).toFixed(2) + 'px');
      visual.style.setProperty('--my', (y * 0.05).toFixed(2) + 'px');
    });
  }

  /* --- 启动 --- */
  function initTableScroll() {
    var scrolls = document.querySelectorAll('.table-scroll');

    Array.prototype.forEach.call(scrolls, function (box) {
      var wrap = $('.table-wrap', box);
      var hint = $('[data-scroll-hint]', box);
      if (!wrap) return;

      function sync() {
        var overflow = wrap.scrollWidth - wrap.clientWidth;
        var atEnd = wrap.scrollLeft >= overflow - 2;

        box.classList.toggle('scrollable', overflow > 4);
        box.classList.toggle('at-end', atEnd);
        if (hint) hint.classList.toggle('is-hidden', overflow <= 4 || atEnd);
      }

      wrap.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    });
  }

  function boot() {
    initTheme();
    initHeader();
    initNav();
    initNavState();
    initReveal();
    initCounters();
    initFaq();
    initCopy();
    initSubscribe();
    initScrollSpy();
    initTilt();
    initSpotlight();
    initTableScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
