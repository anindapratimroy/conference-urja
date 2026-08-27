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
  { id: 'speakers',   label: 'Speakers' },
  { id: 'programme',  label: 'Programme' },
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
const navbar       = document.getElementById('navbar');
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

let scrollObserver = null;

function initScrollObserver() {
  if (scrollObserver) scrollObserver.disconnect();

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.05
  };

  scrollObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Lazy load iframe if present
        const iframe = entry.target.querySelector('iframe[data-src]') || (entry.target.tagName === 'IFRAME' && entry.target.dataset.src ? entry.target : null);
        if (iframe && iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
          delete iframe.dataset.src;
        }
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => scrollObserver.observe(el));
}

function updateUI() {
  const idx = currentIdx;

  // Nav links active state
  document.querySelectorAll('[data-section]').forEach(el => {
    el.classList.toggle('active', el.dataset.section === SECTIONS[idx]?.id);
  });

  // Navbar scrolled & hidden state for active view
  const activeView = views[idx];
  if (activeView) {
    const st = activeView.scrollTop;
    navbar?.classList.toggle('nav-scrolled', st > 20);
    navbar?.classList.remove('nav-hidden');
    backToTop?.classList.toggle('visible', st > 200);
  }

  // Lazy load venue map if venue active
  if (SECTIONS[idx]?.id === 'venue') {
    const iframe = document.getElementById('google-map-iframe');
    if (iframe && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      delete iframe.dataset.src;
    }
  }

  // Trigger reveal animations in active view
  triggerReveals(views[idx]);
}

/* ============================================================
   SCROLL REVEAL (Fall-back & observer initializer)
   ============================================================ */
function triggerReveals(view) {
  if (!view) return;
  const items = view.querySelectorAll('.reveal');
  items.forEach(el => {
    if (scrollObserver) {
      scrollObserver.observe(el);
    } else {
      el.classList.add('visible');
    }
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
      return;
  }

  const idx = SECTIONS.findIndex(s => s.id === sectionId);
  if (idx >= 0) {
    navigateTo(idx);
    closeMobileMenu();
  }
});

/* ============================================================
   BACK TO TOP — scroll active view to top
   ============================================================ */
backToTop.addEventListener('click', () => {
  views[currentIdx]?.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   NAVBAR SCROLL (Floating Pill & Auto-Hide per section)
   ============================================================ */
const lastScrollTopMap = {};

SECTIONS.forEach((s, i) => {
  const view = views[i];
  if (!view) return;

  view.addEventListener('scroll', () => {
    if (i !== currentIdx) return;
    const st = view.scrollTop;
    const lastSt = lastScrollTopMap[i] || 0;

    // Toggle floating glass pill
    navbar?.classList.toggle('nav-scrolled', st > 20);

    // Auto-hide on scroll down, reveal on scroll up
    if (st > 100 && st > lastSt) {
      navbar?.classList.add('nav-hidden');
    } else if (st < lastSt || st <= 100) {
      navbar?.classList.remove('nav-hidden');
    }

    lastScrollTopMap[i] = st;

    // Back to top visibility
    backToTop?.classList.toggle('visible', st > 200);
  }, { passive: true });
});

/* ============================================================
   MOBILE HAMBURGER MENU
   ============================================================ */
function closeMobileMenu() {
  navMenu?.classList.remove('open');
  navToggle?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

navToggle?.addEventListener('click', (e) => {
  e.stopPropagation();
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
  const target = new Date('2026-11-12T09:00:00+05:30').getTime();

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById('cd-days').textContent  = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent  = '00';
      document.getElementById('cd-secs').textContent  = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const dEl = document.getElementById('cd-days');
    if (dEl) {
      dEl.textContent  = String(d).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-mins').textContent  = String(m).padStart(2, '0');
      document.getElementById('cd-secs').textContent  = String(s).padStart(2, '0');
    }
  }

  tick();
  setInterval(tick, 1000);
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

  // Initialize ScrollObserver for lazy reveals
  initScrollObserver();
  
  // Hydrate data instantly from cache/default to eliminate loading delay
  loadInitialData();
  
  updateUI();

  // Hide preloader quickly after DOM is interactive
  setTimeout(hidePreloader, 300);
});

/* ============================================================
   PERSISTENT CACHING & INSTANT DATA HYDRATION
   ============================================================ */
const API_URL = "https://script.google.com/macros/s/AKfycbxeeLobD2arY5YcmOc9ec28X4pj77WLgpLiKGacfKUhQ3xf_YmqH1tExM3SNrci0RqV/exec";
const CACHE_KEY = "geant4_website_cache_v2";
const preloader = document.getElementById('preloader');

const DEFAULT_DATA = {
  soc: [
    { name: "Prof. Pankaj Jain", role: "Chair, SOC" },
    { name: "Dr. Archana Sharma", role: "Member" },
    { name: "Prof. Ranjeev Misra", role: "Member" },
    { name: "Dr. Santosh Kumar", role: "Member" },
    { name: "Prof. Dipankar Bhattacharya", role: "Member" },
    { name: "Dr. Varun Bhalerao", role: "Member" },
    { name: "Prof. Subir Sarkar", role: "Member" },
    { name: "Dr. Nandita Rana", role: "Member" }
  ],
  loc: [
    { name: "Prof. Anil Kumar Singal", role: "Chair, LOC" },
    { name: "Dr. Manjari Bagchi", role: "Convenor" },
    { name: "Dr. Ramij Raja", role: "Member" },
    { name: "Dr. Pankaj Kushwaha", role: "Member" },
    { name: "Dr. Tushar Mondal", role: "Member" },
    { name: "Dr. Subhash Bose", role: "Member" }
  ],
  institutes: [
    { name: "IIT Indore", logo: "./images/iiti_logo.png", website: "https://www.iiti.ac.in" },
    { name: "TIFR", logo: "./images/tifr_logo.png", website: "https://www.tifr.res.in" },
    { name: "IUCAA", logo: "./images/iucaa_logo.png", website: "https://www.iucaa.in" },
    { name: "IIST", logo: "./images/iist_logo.png", website: "https://www.iist.ac.in" }
  ]
};

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
  let repetitions = Math.max(2, Math.ceil(12 / itemCount));
  if (repetitions % 2 !== 0) repetitions += 1;
  
  let html = '';
  for(let i=0; i<repetitions; i++) {
    html += baseHtml;
  }
  container.innerHTML = html;
  
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
  let repetitions = Math.max(2, Math.ceil(12 / itemCount));
  if (repetitions % 2 !== 0) repetitions += 1;
  
  let html = '';
  for(let i=0; i<repetitions; i++) {
    html += baseHtml;
  }
  container.innerHTML = html;

  container.style.animation = 'none';
  void container.offsetHeight; 
  container.style.animation = '';
}

function extractGoogleDriveId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = 
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i) ||
    url.match(/docs\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/d\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  if (!url) return '';

  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  if (url.includes('dropbox.com')) {
    return url.replace('dl=0', 'raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  }

  if (url.includes('imgur.com/') && !url.includes('i.imgur.com/')) {
    const imgurId = url.split('imgur.com/')[1].split('.')[0].replace('gallery/', '').replace('a/', '');
    if (imgurId) return `https://i.imgur.com/${imgurId}.png`;
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('./') || url.startsWith('/')) {
    return url;
  }

  return `./images/${url}`;
}

function getFallbackLogo(instName) {
  const nameLower = (instName || '').toLowerCase();
  if (nameLower.includes('iit') || nameLower.includes('indore')) return './images/iiti_logo.png';
  if (nameLower.includes('tifr') || nameLower.includes('tata')) return './images/tifr_logo.png';
  if (nameLower.includes('iucaa') || nameLower.includes('pune')) return './images/iucaa_logo.png';
  if (nameLower.includes('iist') || nameLower.includes('space') || nameLower.includes('thiruvananthapuram')) return './images/iist_logo.png';
  return './images/iiti_logo.png';
}

function renderInstitutes(instData) {
  const containers = document.querySelectorAll('.institutes-marquee-inner');
  if (!containers || !containers.length) return;

  if (!instData || instData.length === 0) {
    return;
  }

  let baseHtml = '';
  instData.forEach(inst => {
    const instName = typeof inst === 'string' ? inst : (inst.name || inst.institution || inst.institute || 'Participating Institute');
    const rawLogo = typeof inst === 'object' ? (inst.logo || inst.logo_url || inst.image || inst.icon) : null;
    const driveId = extractGoogleDriveId(rawLogo);
    const formattedLogo = formatImageUrl(rawLogo);
    const fallbackLogo = getFallbackLogo(instName);
    const logoUrl = formattedLogo || fallbackLogo;
    const website = (typeof inst === 'object' && inst.website) ? inst.website : '#';
    const secondTry = driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w800` : fallbackLogo;

    baseHtml += `
      <a href="${website}" target="_blank" rel="noopener noreferrer" class="inst-marquee-card">
        <img src="${logoUrl}" 
             class="inst-logo-img" 
             alt="${instName} Logo" 
             referrerpolicy="no-referrer"
             onerror="if(this.src!=='${secondTry}'){this.src='${secondTry}';}else{this.onerror=null;this.src='${fallbackLogo}';}">
        <div class="inst-name">${instName}</div>
      </a>`;
  });
  
  const itemCount = instData.length;
  let repetitions = Math.max(4, Math.ceil(16 / itemCount));
  if (repetitions % 2 !== 0) repetitions += 1;
  
  let html = '';
  for(let i=0; i<repetitions; i++) {
    html += baseHtml;
  }

  containers.forEach(container => {
    container.innerHTML = html;
    container.style.animation = 'none';
    void container.offsetWidth; 
    container.style.animation = '';
  });
}

function formatTextWithLineBreaks(str) {
  if (!str || typeof str !== 'string') return str;
  if (/<br\s*\/?>|<p>/i.test(str)) return str;
  return str.replace(/\r\n|\r|\n/g, '<br />');
}

function renderOverview(overviewData) {
  if (!overviewData) return;
  const leadEl  = document.getElementById('overview-lead');
  const body1El = document.getElementById('overview-body-1');
  const body2El = document.getElementById('overview-body-2');

  const processText = (txt) => {
    if (!txt) return '';
    return typeof txt === 'string' ? formatTextWithLineBreaks(txt) : txt;
  };

  if (typeof overviewData === 'string') {
    const paragraphs = overviewData.split(/\n\s*\n/);
    if (paragraphs.length >= 1 && leadEl)  { leadEl.innerHTML  = processText(paragraphs[0]); leadEl.style.display = ''; }
    if (paragraphs.length >= 2 && body1El) { body1El.innerHTML = processText(paragraphs[1]); body1El.style.display = ''; } else if (body1El && paragraphs.length === 1) { body1El.style.display = 'none'; }
    if (paragraphs.length >= 3 && body2El) { body2El.innerHTML = processText(paragraphs[2]); body2El.style.display = ''; } else if (body2El && paragraphs.length <= 2) { body2El.style.display = 'none'; }
  } else if (Array.isArray(overviewData)) {
    if (overviewData[0] && leadEl)  { leadEl.innerHTML  = processText(overviewData[0]); leadEl.style.display = ''; }
    if (overviewData[1] && body1El) { body1El.innerHTML = processText(overviewData[1]); body1El.style.display = ''; } else if (body1El && !overviewData[1]) { body1El.style.display = 'none'; }
    if (overviewData[2] && body2El) { body2El.innerHTML = processText(overviewData[2]); body2El.style.display = ''; } else if (body2El && !overviewData[2]) { body2El.style.display = 'none'; }
  } else if (typeof overviewData === 'object') {
    const lead  = overviewData.lead || overviewData.overview_lead || overviewData.title || overviewData.text;
    const body1 = overviewData.body1 || overviewData.paragraph1 || overviewData.overview_body1;
    const body2 = overviewData.body2 || overviewData.paragraph2 || overviewData.overview_body2;

    if (lead && leadEl)   { leadEl.innerHTML  = processText(lead); leadEl.style.display = ''; }
    if (body1 && body1El) { body1El.innerHTML = processText(body1); body1El.style.display = ''; } else if (body1El && !body1) { body1El.style.display = 'none'; }
    if (body2 && body2El) { body2El.innerHTML = processText(body2); body2El.style.display = ''; } else if (body2El && !body2) { body2El.style.display = 'none'; }
  }
}

function renderSpeakers(speakersData) {
  const container = document.getElementById('speakers-scroller');
  if (!container) return;

  if (!speakersData || speakersData.length === 0) {
    container.innerHTML = `
      <div class="speaker-card glass-card">
        <div class="speaker-avatar-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="speaker-badge">Invited Speaker</div>
        <div class="speaker-name" style="color:var(--c-text-faint);">To Be Announced</div>
        <div class="speaker-affil">Invited Delegate / Speaker</div>
        <div class="speaker-topic">Details Coming Soon</div>
      </div>
      <div class="speaker-card glass-card">
        <div class="speaker-avatar-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="speaker-badge">Invited Speaker</div>
        <div class="speaker-name" style="color:var(--c-text-faint);">To Be Announced</div>
        <div class="speaker-affil">Invited Delegate / Speaker</div>
        <div class="speaker-topic">Details Coming Soon</div>
      </div>
      <div class="speaker-card glass-card">
        <div class="speaker-avatar-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="speaker-badge">Invited Speaker</div>
        <div class="speaker-name" style="color:var(--c-text-faint);">To Be Announced</div>
        <div class="speaker-affil">Invited Delegate / Speaker</div>
        <div class="speaker-topic">Details Coming Soon</div>
      </div>
      <div class="speaker-card glass-card">
        <div class="speaker-avatar-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="speaker-badge">Invited Speaker</div>
        <div class="speaker-name" style="color:var(--c-text-faint);">To Be Announced</div>
        <div class="speaker-affil">Invited Delegate / Speaker</div>
        <div class="speaker-topic">Details Coming Soon</div>
      </div>
    `;
    return;
  }

  let html = '';
  speakersData.forEach(spk => {
    const name = spk.name || 'Distinguished Speaker';
    const affil = spk.affiliation || spk.institution || spk.institute || spk.role || 'Invited Delegate';
    const topic = spk.topic || spk.talk_title || spk.title || '';
    const rawPhoto = spk.photo || spk.image || spk.avatar || '';
    const photoUrl = formatImageUrl(rawPhoto);

    html += `
      <div class="speaker-card glass-card">
        ${photoUrl ? `<div class="speaker-avatar-img"><img src="${photoUrl}" alt="${name}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'speaker-avatar-ph\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><path d=\\'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2\\'/><circle cx=\\'12\\' cy=\\'7\\' r=\\'4\\'/></svg></div>'"/></div>` : `<div class="speaker-avatar-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`}
        <div class="speaker-badge">Invited Delegate</div>
        <div class="speaker-name">${name}</div>
        <div class="speaker-affil">${affil}</div>
        ${topic ? `<div class="speaker-topic">${topic}</div>` : ''}
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderAllData(data) {
  if (!data) return;
  renderSOC(data.soc || []);
  renderLOC(data.loc || []);
  if (data.institutes && data.institutes.length > 0) {
    renderInstitutes(data.institutes);
  }
  if (data.overview) {
    renderOverview(data.overview);
  }
  renderSpeakers(data.speakers || data.delegates || data.invited_speakers || data.invitedSpeakers || data.invited_delegates || []);
}

function loadInitialData() {
  try {
    const cachedStr = localStorage.getItem(CACHE_KEY);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      renderAllData(cached);
      return;
    }
  } catch (e) {
    console.warn("Failed to load cached data:", e);
  }
  renderAllData(DEFAULT_DATA);
}

async function fetchDynamicData() {
  try {
    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {}

    renderAllData(data);
  } catch (error) {
    console.error("Failed to fetch dynamic data from API:", error);
  }
}

// Start dynamic fetch in background
fetchDynamicData();

