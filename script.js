/**
 * GEANT4 Workshop 2026 — script.js  v3
 * Section-based SPA: full-screen views, history API
 * No canvas — aurora is pure CSS
 */

'use strict';

/* ============================================================
   SECTION DEFINITIONS
   ============================================================ */
const SECTIONS = [
  { id: 'home',       label: 'Home' },
  { id: 'programme',  label: 'Programme' },
  { id: 'soc',        label: 'SOC' },
  { id: 'loc',        label: 'LOC' },
  { id: 'institutes', label: 'Institutes' },
  { id: 'venue',      label: 'Venue' },
  { id: 'register',   label: 'Register' },
];

/* ============================================================
   STATE
   ============================================================ */
let currentIdx = 0;
let isAnimating = false;

/* ============================================================
   ELEMENTS
   ============================================================ */
const views        = SECTIONS.map(s => document.getElementById(`view-${s.id}`));
const backToTop    = document.getElementById('backToTop');
const navToggle    = document.getElementById('navToggle');
const navMenu      = document.getElementById('navMenu');

/* ============================================================
   NAVIGATION CORE
   ============================================================ */
function navigateTo(targetIdx, pushState = true) {
  if (targetIdx === currentIdx && !isAnimating) {
    // If same section, scroll active view to top
    views[currentIdx]?.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  if (targetIdx < 0 || targetIdx >= SECTIONS.length) return;
  if (isAnimating) return;

  isAnimating = true;

  const fromView = views[currentIdx];
  const toView   = views[targetIdx];
  const dir      = targetIdx > currentIdx ? 'up' : 'down';

  if (fromView) {
    // Exit current
    fromView.classList.remove('active');
    fromView.classList.add(dir === 'up' ? 'exit-up' : 'exit-down');
  }

  if (toView) {
    // Enter next
    toView.style.transform = dir === 'up' ? 'translateY(30px)' : 'translateY(-30px)';
    toView.classList.remove('exit-up', 'exit-down');
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (toView) {
        toView.classList.add('active');
        toView.style.transform = '';
        // Scroll new view to top
        toView.scrollTop = 0;
      }
    });
  });

  setTimeout(() => {
    if (fromView) {
      fromView.classList.remove('exit-up', 'exit-down');
    }
    currentIdx = targetIdx;
    isAnimating = false;
    updateUI();

    if (pushState) {
      const hash = '#' + SECTIONS[targetIdx].id;
      history.pushState({ sectionIdx: targetIdx }, '', hash);
    }
  }, 520);
}

function updateUI() {
  const idx = currentIdx;

  // Nav links
  document.querySelectorAll('[data-section]').forEach(el => {
    // "overview" button in nav might still exist in some older cache, handle it gracefully
    el.classList.toggle('active', el.dataset.section === SECTIONS[idx]?.id);
  });

  // Trigger reveal animations in active view
  triggerReveals(views[idx]);

  // Back to top — show if active view is scrolled
  const activeView = views[idx];
  if (activeView) {
    backToTop.classList.toggle('visible', activeView.scrollTop > 200);
  }
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function triggerReveals(view) {
  if (!view) return;
  const items = view.querySelectorAll('.reveal:not(.visible)');
  items.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, i * 60);
  });
}

/* ============================================================
   HISTORY API (browser back/forward)
   ============================================================ */
function getIndexFromHash() {
  const hash = location.hash.replace('#', '');
  const idx  = SECTIONS.findIndex(s => s.id === hash);
  return idx >= 0 ? idx : 0;
}

window.addEventListener('popstate', (e) => {
  const idx = e.state?.sectionIdx ?? getIndexFromHash();
  navigateTo(idx, false);
});


/* ============================================================
   ALL [data-section] CLICKABLES
   ============================================================ */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-section]');
  if (!el) return;

  const sectionId = el.dataset.section;
  
  // Special case: if clicking overview, navigate to home and scroll to overview
  if (sectionId === 'overview') {
      const homeIdx = SECTIONS.findIndex(s => s.id === 'home');
      if (currentIdx !== homeIdx) {
          navigateTo(homeIdx);
      }
      setTimeout(() => {
          const overviewSection = document.getElementById('overview');
          if(overviewSection && views[homeIdx]) {
              views[homeIdx].scrollTo({ top: overviewSection.offsetTop, behavior: 'smooth' });
          }
      }, currentIdx !== homeIdx ? 550 : 0);
      
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      return;
  }

  const idx = SECTIONS.findIndex(s => s.id === sectionId);
  if (idx >= 0) {
    navigateTo(idx);
    // Close mobile menu
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
});

/* ============================================================
   BACK TO TOP — scroll active view to top
   ============================================================ */
backToTop.addEventListener('click', () => {
  views[currentIdx]?.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   BACK TO TOP VISIBILITY on section scroll
   ============================================================ */
SECTIONS.forEach((s, i) => {
  views[i]?.addEventListener('scroll', () => {
    if (i !== currentIdx) return;
    backToTop.classList.toggle('visible', views[i].scrollTop > 200);
  }, { passive: true });
});

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

/* ============================================================
   PROGRAMME TABS
   ============================================================ */
function initProgrammeTabs() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const panels   = document.querySelectorAll('.programme-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = document.getElementById(btn.getAttribute('aria-controls'));
      if (target) target.classList.add('active');
    });
  });
}

/* ============================================================
   CAMPUS PHOTO SLIDER (auto-rotates in venue section)
   ============================================================ */
function initCampusSlider() {
  const slides = document.querySelectorAll('.campus-slide');
  if (!slides.length) return;
  let idx = 0;
  setInterval(() => {
    slides[idx].classList.remove('active-slide');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active-slide');
  }, 4000);
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function initCountdown() {
  const target = new Date('2026-10-01T09:00:00+05:30').getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById('cd-days').textContent  = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent  = '00';
      document.getElementById('cd-secs').textContent  = '00';
      if(document.getElementById('cd-msecs')) document.getElementById('cd-msecs').textContent = '000';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const ms = Math.floor(diff % 1000);
    const dEl = document.getElementById('cd-days');
    if (dEl) {
      dEl.textContent  = String(d).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-mins').textContent  = String(m).padStart(2, '0');
      document.getElementById('cd-secs').textContent  = String(s).padStart(2, '0');
      const msEl = document.getElementById('cd-msecs');
      if(msEl) msEl.textContent = String(ms).padStart(3, '0');
    }
  }

  tick();
  setInterval(tick, 10);
}

/* ============================================================
   STRUCTURED SPIRAL GALAXY BACKGROUND
   ============================================================ */
function initSpiralGalaxy() {
  const canvas = document.getElementById('cosmicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  
  const particles = [];
  const numParticles = 2500; // Dense, highly structured galaxy
  
  // Interaction state
  let mouse = { x: -1000, y: -1000 };
  let isRippling = false;
  let rippleRadius = 0;
  let clickPoint = { x: 0, y: 0 };
  
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });
  
  document.addEventListener('click', (e) => {
    isRippling = true;
    rippleRadius = 0;
    clickPoint.x = e.clientX;
    clickPoint.y = e.clientY;
  });

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  class Star {
    constructor() {
      this.arm = Math.floor(Math.random() * 3); // 3 spiral arms
      
      // Bias towards center for high density core
      const randomRadius = Math.pow(Math.random(), 1.8);
      this.distance = randomRadius * Math.max(w, h) * 0.8;
      
      // Spiral math: angle increases heavily with distance to form arms
      const spiralWarp = this.distance * 0.006;
      this.baseAngle = (this.arm * Math.PI * 2 / 3) + spiralWarp;
      
      // Add scatter based on distance (tighter at core, looser at edges)
      const scatter = (Math.random() - 0.5) * (this.distance * 0.002 + 0.15);
      this.baseAngle += scatter;
      
      this.size = Math.random() * 1.2 + 0.3;
      
      // Fade out at edges
      this.opacity = Math.max(0.1, 1 - (this.distance / (Math.max(w, h) * 0.6)));
      
      // Color based on distance (Core: Yellow-white, Mid: Blue, Edge: Purple)
      const normDist = this.distance / (Math.max(w, h) * 0.5);
      let r = 255, g = 255, b = 255;
      
      if (normDist < 0.15) {
        // Core
        r = 254; g = 240; b = 138;
      } else if (normDist < 0.5) {
        // Mid (Blue transition)
        const t = (normDist - 0.15) / 0.35;
        r = 254 + (96 - 254) * t;
        g = 240 + (165 - 240) * t;
        b = 138 + (250 - 138) * t;
      } else {
        // Edge (Purple transition)
        const t = Math.min(1, (normDist - 0.5) / 0.5);
        r = 96 + (168 - 96) * t;
        g = 165 + (85 - 165) * t;
        b = 250 + (247 - 250) * t;
      }
      
      this.color = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${this.opacity})`;
      
      this.x = 0;
      this.y = 0;
      
      // Spring physics for mouse warp
      this.warpAngle = 0;
    }

    update(time) {
      // Global slow majestic rotation
      const rotation = time * 0.00015;
      let targetAngle = this.baseAngle + rotation;
      
      const centerX = w / 2;
      const centerY = h / 2;
      
      // Calculate unwarped position to check mouse distance
      const tempX = centerX + Math.cos(targetAngle) * this.distance;
      const tempY = centerY + Math.sin(targetAngle) * this.distance;
      
      // Gravitational lensing (mouse hover)
      const dx = mouse.x - tempX;
      const dy = mouse.y - tempY;
      const distSq = dx*dx + dy*dy;
      
      if (distSq < 40000 && mouse.x > -500) { // 200px radius
        const dist = Math.sqrt(distSq);
        const force = (200 - dist) / 200; 
        
        // Warp stars rotationally around the mouse (Lensing)
        this.warpAngle += force * 0.04;
      }
      
      // Spring back to perfectly structured arm
      this.warpAngle *= 0.90;
      
      const finalAngle = targetAngle + this.warpAngle;
      
      this.x = centerX + Math.cos(finalAngle) * this.distance;
      this.y = centerY + Math.sin(finalAngle) * this.distance;
      
      // Ripple effect on click (Gravitational Wave)
      if (isRippling) {
        const dxR = this.x - clickPoint.x;
        const dyR = this.y - clickPoint.y;
        const distToClick = Math.sqrt(dxR*dxR + dyR*dyR);
        const rDist = Math.abs(distToClick - rippleRadius);
        
        if (rDist < 40) {
          // Push outward along the wave front
          const rForce = (40 - rDist) / 40;
          this.x += (dxR / distToClick) * rForce * 15;
          this.y += (dyR / distToClick) * rForce * 15;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < numParticles; i++) {
    particles.push(new Star());
  }

  function animate(time) {
    // Clear completely for maximum crispness (no messy trails)
    ctx.clearRect(0, 0, w, h);
    
    // Draw subtle spotlight glow underneath galaxy
    if (mouse.x > -500) {
      ctx.globalCompositeOperation = 'screen';
      const spotlight = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
      spotlight.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      spotlight.addColorStop(1, 'rgba(2, 5, 18, 0)');
      ctx.fillStyle = spotlight;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Update ripple state
    if (isRippling) {
      rippleRadius += 10; // Fast crisp wave
      if (rippleRadius > Math.max(w, h) * 1.5) {
        isRippling = false;
      }
    }

    for (let p of particles) {
      p.update(time);
      p.draw();
    }
    
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
}

/* ============================================================
   FOOTER INJECTION
   ============================================================ */
function initFooter() {
  const template = document.getElementById('footer-template');
  if (!template) return;
  
  views.forEach(view => {
    if (view) {
      view.appendChild(template.content.cloneNode(true));
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFooter();
  initProgrammeTabs();
  initCountdown();
  initCampusSlider();
  initSpiralGalaxy();

  // Determine starting section from URL hash
  const startIdx = getIndexFromHash();

  // Set initial state without transition
  views.forEach((v, i) => {
    if(v) {
        v.classList.remove('active', 'exit-up', 'exit-down');
        if (i === startIdx) v.classList.add('active');
    }
  });
  currentIdx = startIdx;

  // Push initial history state
  if (SECTIONS[startIdx]) {
    history.replaceState({ sectionIdx: startIdx }, '', '#' + SECTIONS[startIdx].id);
  }

  updateUI();
  triggerReveals(views[startIdx]);
});

/* ============================================================
   DYNAMIC DATA FETCHING & PRELOADER
   ============================================================ */
const API_URL = "https://script.google.com/macros/s/AKfycbyEXU1-MBP3WSJiIw-VpgE8VpZVQjBot2Otwb5lTCN9lke878GTh8WKJ1NpmqcjvZOf/exec";
const preloader = document.getElementById('preloader');

function hidePreloader() {
  if (preloader) preloader.classList.add('hide');
}

function renderSOC(socData) {
  const container = document.getElementById('soc-scroller');
  if (!container) return;
  let baseHtml = '';
  if (!socData || socData.length === 0) {
    baseHtml = `<div class="scroller-card"><div class="scroller-name" style="color:var(--c-text-faint);">To Be Announced</div><div class="scroller-role">Coming Soon</div></div>`;
  } else {
    socData.forEach(member => {
      baseHtml += `<div class="scroller-card"><div class="scroller-name">${member.name}</div><div class="scroller-role">${member.role}</div></div>`;
    });
  }
  
  const itemCount = (socData && socData.length > 0) ? socData.length : 1;
  const repetitions = Math.max(2, Math.ceil(12 / itemCount));
  
  let html = '';
  for(let i=0; i<repetitions; i++) {
    html += baseHtml;
  }
  container.innerHTML = html;
  
  // Force browser to recalculate height and restart animation
  container.style.animation = 'none';
  void container.offsetHeight; 
  container.style.animation = '';
}

function renderLOC(locData) {
  const container = document.getElementById('loc-scroller');
  if (!container) return;
  let baseHtml = '';
  if (!locData || locData.length === 0) {
    baseHtml = `<div class="scroller-card"><div class="scroller-name" style="color:var(--c-text-faint);">To Be Announced</div><div class="scroller-role">Coming Soon</div></div>`;
  } else {
    locData.forEach(member => {
      baseHtml += `<div class="scroller-card"><div class="scroller-name">${member.name}</div><div class="scroller-role">${member.role}</div></div>`;
    });
  }
  
  const itemCount = (locData && locData.length > 0) ? locData.length : 1;
  const repetitions = Math.max(2, Math.ceil(12 / itemCount));
  
  let html = '';
  for(let i=0; i<repetitions; i++) {
    html += baseHtml;
  }
  container.innerHTML = html;

  // Force browser to recalculate height and restart animation
  container.style.animation = 'none';
  void container.offsetHeight; 
  container.style.animation = '';
}

function renderInstitutes(instData) {
  const container = document.getElementById('institutes-scroller');
  if (!container) return;
  let baseHtml = '';
  if (!instData || instData.length === 0) {
    baseHtml = `<div class="inst-marquee-card"><div class="inst-name" style="color:var(--c-text-faint);">More Institutes</div><div class="inst-loc">Coming Soon...</div></div>`;
  } else {
    instData.forEach(inst => {
      const logoUrl = inst.logo || './images/iiti_logo.svg';
      const website = inst.website || '#';
      baseHtml += `<a href="${website}" target="_blank" rel="noopener noreferrer" class="inst-marquee-card"><img src="${logoUrl}" class="inst-logo-img" alt="${inst.name} Logo"><div class="inst-name">${inst.name}</div><div class="inst-loc">Participating Institute</div></a>`;
    });
  }
  
  const itemCount = (instData && instData.length > 0) ? instData.length : 1;
  const repetitions = Math.max(2, Math.ceil(15 / itemCount));
  
  let html = '';
  for(let i=0; i<repetitions; i++) {
    html += baseHtml;
  }
  container.innerHTML = html;

  // Force browser to recalculate width and restart animation
  container.style.animation = 'none';
  void container.offsetWidth; 
  container.style.animation = '';
}

async function fetchDynamicData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    renderSOC(data.soc || []);
    renderLOC(data.loc || []);
    renderInstitutes(data.institutes || []);
  } catch (error) {
    console.error("Failed to fetch dynamic data:", error);
    renderSOC([]);
    renderLOC([]);
    renderInstitutes([]);
  }
}

// Start the fetch immediately
const fetchPromise = fetchDynamicData();

// Hide preloader as soon as either data loads OR 2.5 seconds passes
const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2500));
Promise.race([fetchPromise, timeoutPromise]).then(() => {
  hidePreloader();
});

