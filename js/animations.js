(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer:coarse)').matches;
  var isMobile = window.innerWidth < 780;

  /* ======================================================
     LENIS SMOOTH SCROLL
  ====================================================== */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); }

  /* ======================================================
     LOADER
  ====================================================== */
  var loaderFill = document.getElementById('loaderFill');
  var loader = document.getElementById('loader');
  var progress = 0;
  var loaderSafetyTimer = setTimeout(function(){
    if (loader) loader.classList.add('hide');
    if (typeof playHeroIntro === 'function') playHeroIntro();
  }, 5000);
  var loadTimer = setInterval(function(){
    progress += Math.random() * 18;
    if (progress >= 100) progress = 100;
    loaderFill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(loadTimer);
      clearTimeout(loaderSafetyTimer);
      setTimeout(function(){
        loader.classList.add('hide');
        playHeroIntro();
      }, 280);
    }
  }, 140);

  /* ======================================================
     CUSTOM CURSOR
  ====================================================== */
  if (!isTouch) {
    document.body.classList.add('no-touch');
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mx = window.innerWidth/2, my = window.innerHeight/2;
    var rx = mx, ry = my;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    (function loopCursor(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loopCursor);
    })();
    document.querySelectorAll('a, button, .magnetic').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('is-link'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('is-link'); });
    });
    document.querySelectorAll('.work-item').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('is-project'); ring.classList.remove('is-link'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('is-project'); });
    });
    // magnetic buttons
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var relX = e.clientX - r.left - r.width/2;
        var relY = e.clientY - r.top - r.height/2;
        el.style.transform = 'translate(' + relX*0.22 + 'px,' + relY*0.28 + 'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ======================================================
     NAV
  ====================================================== */
  var siteNav = document.getElementById('siteNav');
  window.addEventListener('scroll', function(){
    siteNav.classList.toggle('scrolled', window.scrollY > 40);
  });
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', function(){
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('[data-mnav]').forEach(function(a){
    a.addEventListener('click', function(){ mobileMenu.classList.remove('open'); });
  });
  // active section indicator
  var navLinks = document.querySelectorAll('[data-nav]');
  var sections = ['about','services','work','process','contact'].map(function(id){ return document.getElementById(id); });
  function updateActiveNav(){
    var pos = window.scrollY + window.innerHeight * 0.4;
    var current = null;
    sections.forEach(function(sec){ if (sec && sec.offsetTop <= pos) current = sec.id; });
    navLinks.forEach(function(a){
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  /* ======================================================
     SCROLL REVEAL TEXT (hero + section headlines)
  ====================================================== */
  if (window.gsap) {
    gsap.set('.line-inner', { opacity: 1 });

    function splitHeadline(el){
      var text = el.textContent;
      var words = text.trim().split(/\s+/);
      el.innerHTML = words.map(function(w){
        return '<span class="split-word"><span>' + w + '</span></span>';
      }).join(' ');
    }
    document.querySelectorAll('.section-headline, .about-split').forEach(splitHeadline);
    gsap.set('.split-word span', { yPercent: 110 });

    document.querySelectorAll('.section-headline, .about-split').forEach(function(el){
      gsap.to(el.querySelectorAll('.split-word span'), {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.03,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    gsap.utils.toArray('.reveal').forEach(function(el){
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    gsap.utils.toArray('.stat').forEach(function(el, i){
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, delay: i*0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // process fill line
    gsap.to('#processFill', {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.process-track',
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: 0.6
      }
    });
    document.querySelectorAll('.process-step').forEach(function(step){
      ScrollTrigger.create({
        trigger: step, start: 'top 65%', end: 'bottom 35%',
        onEnter: function(){ step.classList.add('in-view'); },
        onLeaveBack: function(){ step.classList.remove('in-view'); }
      });
      gsap.from(step, {
        opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 85%' }
      });
    });

    // service card tilt
    document.querySelectorAll('.tilt-card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px*100) + '%');
        card.style.setProperty('--my', (py*100) + '%');
        if (!isTouch) {
          var rotX = (py - 0.5) * -8;
          var rotY = (px - 0.5) * 8;
          card.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
        }
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = 'perspective(700px) rotateX(0) rotateY(0)'; });
    });

    // work item preview
    var workVisual = document.getElementById('workVisual');
    var toneGrads = {
      '1': 'linear-gradient(135deg, rgba(155,139,255,0.55), rgba(61,107,255,0.35))',
      '2': 'linear-gradient(135deg, rgba(61,107,255,0.5), rgba(155,139,255,0.3))',
      '3': 'linear-gradient(135deg, rgba(125,107,255,0.5), rgba(155,139,255,0.4))'
    };
    document.querySelectorAll('.work-item').forEach(function(item){
      item.addEventListener('mousemove', function(e){
        workVisual.style.left = e.clientX + 'px';
        workVisual.style.top = e.clientY + 'px';
        workVisual.style.transform = 'translate(-50%,-120%) scale(1)';
      });
      item.addEventListener('mouseenter', function(){
        workVisual.style.background = toneGrads[item.getAttribute('data-tone')] || toneGrads['1'];
        workVisual.classList.add('active');
      });
      item.addEventListener('mouseleave', function(){ workVisual.classList.remove('active'); });
    });

    // stack cloud float layout
    var cloud = document.getElementById('stackCloud');
    if (cloud && !isMobile) {
      var items = cloud.querySelectorAll('.stack-item');
      var positions = [
        [4,10],[30,4],[58,14],[80,2],[10,45],[38,52],[64,44],[86,50],
        [18,80],[46,84],[70,78]
      ];
      items.forEach(function(el, i){
        var p = positions[i % positions.length];
        el.style.left = p[0] + '%';
        el.style.top = p[1] + '%';
        gsap.to(el, {
          y: '+=' + (10 + (i%4)*4),
          duration: 3 + (i % 3),
          yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.15
        });
      });
    }
  }

  /* ======================================================
     HERO INTRO TIMELINE
  ====================================================== */
  function playHeroIntro(){
    if (!window.gsap) return;
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero-eyebrow', { opacity: 1, duration: 0.6 }, 0.1)
      .to('.line-inner', { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0.15)
      .to('.hero-support', { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, 0.68);
  }
  if (window.gsap) {
    gsap.set('.hero-eyebrow', { opacity: 0 });
    gsap.set('.line-inner', { yPercent: 110 });
    gsap.set('.hero-support, .hero-actions', { opacity: 0, y: 18 });
  }



})();
