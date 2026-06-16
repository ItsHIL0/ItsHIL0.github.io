// ═══════════════════════════════════════════
// TAB / PAGE SWITCHING
// ═══════════════════════════════════════════

function switchPage(targetId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Deactivate all nav buttons
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Show the target page
  const target = document.getElementById(targetId);
  if (target) target.classList.add('active');

  // Activate the matching nav button
  const btn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
  if (btn) btn.classList.add('active');

  // Restart skill bar animations when skills page is opened
  if (targetId === 'skills') {
    document.querySelectorAll('.skill-fill').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // force reflow
      el.style.animation = '';
    });
  }

  // Close mobile menu if open
  document.querySelector('.nav-links').classList.remove('open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Wire up nav buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    switchPage(btn.dataset.target);
  });
});

// Wire up "View Projects" hero button
document.querySelector('.btn-primary')?.addEventListener('click', e => {
  const target = e.currentTarget.dataset.target;
  if (target) {
    e.preventDefault();
    switchPage(target);
  }
});

// ═══════════════════════════════════════════
// MOBILE NAV TOGGLE
// ═══════════════════════════════════════════

document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

// ═══════════════════════════════════════════
// NAVBAR SCROLL SHADOW
// ═══════════════════════════════════════════

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ═══════════════════════════════════════════
// TYPING ANIMATION (hero subtitle)
// ✏️ EDIT: Change the phrases array to whatever you want to cycle through
// ═══════════════════════════════════════════

const phrases = [
  'Computer Science Student',
  'Cybersecurity Enthusiast',
  'Systems Programmer',
  'CTF Competitor',
  'Lifelong Learner',
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const current = phrases[phraseIndex];

  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 50 : 80;

  if (!isDeleting && charIndex === current.length) {
    // Finished typing — pause then start deleting
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    // Finished deleting — move to next phrase
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400;
  }

  setTimeout(type, delay);
}

type();

// ═══════════════════════════════════════════
// MATRIX RAIN CANVAS (hero background)
// ═══════════════════════════════════════════

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Characters to use in the rain — mix of binary, hex, and symbols
const chars = '01アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF!@#$%^&*';

const fontSize = 14;
let columns, drops;

function initMatrix() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = Math.floor(canvas.width / fontSize);
  drops   = Array(columns).fill(1);
}

initMatrix();
window.addEventListener('resize', initMatrix);

function drawMatrix() {
  // Fade previous frame
  ctx.fillStyle = 'rgba(5, 10, 15, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00ffe5';
  ctx.font = `${fontSize}px JetBrains Mono, monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);

    // Randomize reset point to create variation
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

// Respect user's reduced-motion preference
const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (motionOK) {
  setInterval(drawMatrix, 40); // ~25fps — intentionally slow for atmosphere
} else {
  // Static fallback: just draw a single dim frame
  drawMatrix();
}

// ═══════════════════════════════════════════
// SCROLL REVEAL (cards and timeline items)
// ═══════════════════════════════════════════

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

function observeRevealElements() {
  document.querySelectorAll('.card, .timeline-item, .skill-group').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    revealObserver.observe(el);
  });
}

// Run after DOM is ready
observeRevealElements();

// Re-observe when switching pages (new elements become visible)
const originalSwitch = switchPage;
window.switchPage = function(id) {
  originalSwitch(id);
  setTimeout(observeRevealElements, 50);
};
