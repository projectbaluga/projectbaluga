// ============================================================
//  Theme toggle (persists choice in localStorage)
// ============================================================
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  root.setAttribute("data-theme", "dark");
}

function syncToggleIcon() {
  const isDark = root.getAttribute("data-theme") === "dark";
  themeToggle.textContent = isDark ? "☀️" : "🌙";
}
syncToggleIcon();

themeToggle.addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  syncToggleIcon();
});

// ============================================================
//  Mobile nav toggle
// ============================================================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close the mobile menu when a link is clicked
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ============================================================
//  Scroll reveal animations (directional + staggered)
// ============================================================
(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Assign a reveal style to each target, then observe it.
  const tag = (el, variant) => {
    el.classList.add("reveal", "reveal--" + variant);
  };

  // Section titles rise up
  document.querySelectorAll(".section__title").forEach((el) => tag(el, "up"));

  // Hero block fades up
  document.querySelectorAll(".hero__inner").forEach((el) => tag(el, "up"));

  // About: text slides from the left, photo from the right
  document.querySelectorAll(".about__text").forEach((el) => tag(el, "left"));
  document.querySelectorAll(".about__photo").forEach((el) => tag(el, "right"));

  // Skill cards + feature cards + metrics cascade with a stagger
  const staggerGroups = [
    ".skills",
    ".project__grid",
    ".metrics",
    ".project__detail-grid",
    ".contact__info",
  ];
  staggerGroups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        tag(child, "pop");
        child.style.setProperty("--reveal-delay", i * 70 + "ms");
      });
    });
  });

  // Project blocks and the carousel scale in gently
  document.querySelectorAll(".project__overview, .carousel, .project__tags").forEach((el) => tag(el, "scale"));

  // Fallback: any .section that didn't get a child-level reveal still fades up
  document.querySelectorAll(".project__detail-title, .shots__label, .contact__lead, .contact__cta").forEach((el) => tag(el, "up"));

  const revealTargets = document.querySelectorAll(".reveal");

  if (prefersReduced) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => observer.observe(el));
})();

// ============================================================
//  Scroll progress bar
// ============================================================
(function () {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    bar.style.width = pct + "%";
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
})();

// ============================================================
//  Hero parallax (blobs drift as you scroll)
// ============================================================
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const blobs = document.querySelectorAll(".hero__bg .blob");
  const grid = document.querySelector(".hero__bg .grid-overlay");
  if (!blobs.length) return;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    blobs.forEach((b, i) => {
      const speed = (i + 1) * 0.06;
      b.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
    if (grid) grid.style.transform = `translate3d(0, ${y * 0.03}px, 0)`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

// ============================================================
//  Rotating role text (type / delete loop)
// ============================================================
const rotator = document.getElementById("rotator");
if (rotator) {
  const roles = [
    "Developer",
    "Builder of FairLink",
    "Network Tinkerer",
    "Always learning",
  ];
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  function typeLoop() {
    const word = roles[roleIndex];
    rotator.textContent = word.slice(0, charIndex);

    if (!deleting && charIndex < word.length) {
      charIndex++;
      setTimeout(typeLoop, 90);
    } else if (!deleting && charIndex === word.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
    } else if (deleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeLoop, 45);
    } else {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeLoop, 300);
    }
  }
  setTimeout(typeLoop, 1800);
}

// ============================================================
//  Animated count-up stats (runs once when in view)
// ============================================================
const statNums = document.querySelectorAll(".stat__num");
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
statNums.forEach((el) => statObserver.observe(el));

// ============================================================
//  Screenshot carousel + fullscreen lightbox
// ============================================================
(function () {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-track]");
  const slides = Array.from(track.children);
  const dotsWrap = carousel.querySelector("[data-dots]");
  const prevBtn = carousel.querySelector("[data-prev]");
  const nextBtn = carousel.querySelector("[data-next]");
  let index = 0;

  // Build a list of {src, caption} for the lightbox
  const items = slides.map((s) => {
    const img = s.querySelector("img");
    const cap = s.querySelector("figcaption");
    return { src: img.getAttribute("src"), alt: img.getAttribute("alt"), caption: cap ? cap.textContent : "" };
  });

  // Dots
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Go to screenshot " + (i + 1));
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));
  goTo(0);

  // Swipe (touch)
  let startX = null;
  track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) goTo(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  // ---- Lightbox ----
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCaption");
  let lbIndex = 0;

  function openLb(i) {
    lbIndex = (i + items.length) % items.length;
    lbImg.src = items[lbIndex].src;
    lbImg.alt = items[lbIndex].alt;
    lbCap.textContent = items[lbIndex].caption;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }
  function lbStep(d) { openLb(lbIndex + d); }

  // Open on slide image click — also sync carousel position
  slides.forEach((s, i) => {
    const frame = s.querySelector("[data-zoom]");
    if (frame) frame.addEventListener("click", () => { goTo(i); openLb(i); });
  });

  lb.querySelector("[data-lb-close]").addEventListener("click", closeLb);
  lb.querySelector("[data-lb-prev]").addEventListener("click", () => lbStep(-1));
  lb.querySelector("[data-lb-next]").addEventListener("click", () => lbStep(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });

  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") lbStep(-1);
    else if (e.key === "ArrowRight") lbStep(1);
  });
})();

// ============================================================
//  Footer year
// ============================================================
document.getElementById("year").textContent = new Date().getFullYear();
