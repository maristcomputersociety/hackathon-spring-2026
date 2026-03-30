const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const menuToggle = document.querySelector(".menu-toggle");
const sectionIds = [
  "intro",
  "sponsors",
  "themes",
  "awards",
  "activity-day",
  "sign-up",
  "about-mcs",
];

// April 17, 2026, 5:00 PM Eastern Time (America/New_York; EDT on this date)
const THEME_REVEAL_UTC_MS = Date.UTC(2026, 3, 17, 21, 0, 0);
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function getHeaderHeight() {
  return header ? header.offsetHeight : 0;
}

function closeMobileMenu() {
  if (!nav || !menuToggle) return;
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function setActiveLink(activeId) {
  navLinks.forEach((link) => {
    const target = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("active", target === activeId);
  });
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight() + 1;
  window.scrollTo({ top, behavior: "smooth" });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    event.preventDefault();
    const id = href.slice(1);
    scrollToSection(id);
    history.replaceState(null, "", `#${id}`);
    closeMobileMenu();
  });
});

const cta = document.querySelector('a[href="#sign-up"]');
if (cta) {
  cta.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToSection("sign-up");
    history.replaceState(null, "", "#sign-up");
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.addEventListener("click", (event) => {
  if (!nav || !menuToggle) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (nav.contains(target) || menuToggle.contains(target)) return;
  closeMobileMenu();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    root: null,
    rootMargin: `-${Math.max(getHeaderHeight() + 20, 80)}px 0px -55% 0px`,
    threshold: 0.1,
  }
);

sections.forEach((section) => observer.observe(section));

function initScrollReveals() {
  const targets = document.querySelectorAll("main section.section:not(.hero), .site-footer");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  targets.forEach((el) => {
    if (prefersReduced) {
      el.classList.add("is-revealed");
      return;
    }
    el.classList.add("reveal-on-scroll");
  });

  if (prefersReduced) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    }
  );

  targets.forEach((el) => revealObserver.observe(el));
}

initScrollReveals();

function updateThemeCountdown() {
  const root = document.getElementById("theme-countdown");
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  if (!root || !elDays || !elHours || !elMinutes) return;

  const now = Date.now();
  let diff = THEME_REVEAL_UTC_MS - now;

  if (diff <= 0) {
    elDays.textContent = "0";
    elHours.textContent = "0";
    elMinutes.textContent = "0";
    root.dataset.complete = "true";
    return;
  }

  root.dataset.complete = "false";
  const days = Math.floor(diff / 86400000);
  diff %= 86400000;
  const hours = Math.floor(diff / 3600000);
  diff %= 3600000;
  const minutes = Math.floor(diff / 60000);

  elDays.textContent = String(days);
  elHours.textContent = String(hours);
  elMinutes.textContent = String(minutes);
}

updateThemeCountdown();
setInterval(updateThemeCountdown, 1000);

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMobileMenu();
});
