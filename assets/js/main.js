const revealItems = document.querySelectorAll(".reveal");
const siteHeader = document.querySelector(".page > header");
const themePreferenceKey = "theme-preference";

const getActiveTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

const setTheme = (theme, persist = true) => {
  document.documentElement.dataset.theme = theme;
  if (persist) {
    localStorage.setItem(themePreferenceKey, theme);
  }
};

const installThemeToggle = () => {
  if (!siteHeader) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "theme-toggle";
  toggle.setAttribute("role", "switch");
  toggle.innerHTML = `
    <span class="theme-toggle-track" aria-hidden="true">
      <span class="theme-day">
        <svg class="theme-day-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.25" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 2.5V5.1M12 18.9V21.5M21.5 12H18.9M5.1 12H2.5M18.7 5.3L16.8 7.2M7.2 16.8L5.3 18.7M18.7 18.7L16.8 16.8M7.2 7.2L5.3 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </span>
      <span class="theme-night">
        <svg class="theme-night-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 14.5a7 7 0 1 1-8.5-8.5 6 6 0 1 0 8.5 8.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        </svg>
        <span class="theme-night-star star-1"></span>
        <span class="theme-night-star star-2"></span>
        <span class="theme-night-star star-3"></span>
      </span>
      <span class="theme-toggle-thumb"></span>
    </span>
  `;

  const updateToggleState = () => {
    const theme = getActiveTheme();
    const next = theme === "dark" ? "light" : "dark";
    toggle.dataset.theme = theme;
    toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
    toggle.setAttribute("aria-label", `Switch to ${next} mode`);
    toggle.title = `Switch to ${next} mode`;
  };

  updateToggleState();
  toggle.addEventListener("click", () => {
    const next = getActiveTheme() === "dark" ? "light" : "dark";
    setTheme(next, true);
    updateToggleState();
  });

  siteHeader.appendChild(toggle);
};

if (revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

if (siteHeader) {
  installThemeToggle();
  const root = document.documentElement;
  let isCompact = false;

  const updateHeaderOffset = () => {
    root.style.setProperty("--header-offset", `${siteHeader.offsetHeight}px`);
  };

  const syncHeaderState = () => {
    const nextCompact = window.scrollY > 24;
    if (nextCompact !== isCompact) {
      isCompact = nextCompact;
      document.body.classList.toggle("nav-compact", isCompact);
      // Re-measure during and after the header transition so main offset stays accurate.
      updateHeaderOffset();
      requestAnimationFrame(updateHeaderOffset);
      setTimeout(updateHeaderOffset, 280);
    }
  };

  const scrollToHashTarget = (hash, updateHistory = true) => {
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;

    const top = window.scrollY + target.getBoundingClientRect().top - siteHeader.offsetHeight - 16;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(top, 0), behavior: prefersReduced ? "auto" : "smooth" });

    if (updateHistory) {
      history.pushState(null, "", hash);
    }
  };

  updateHeaderOffset();
  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
  window.addEventListener("resize", updateHeaderOffset);
  window.addEventListener("load", updateHeaderOffset);
  siteHeader.addEventListener("transitionend", (event) => {
    if (event.propertyName === "padding-top" || event.propertyName === "padding-bottom") {
      updateHeaderOffset();
    }
  });

  const navHashLinks = document.querySelectorAll('a[href^="#"]');
  navHashLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      event.preventDefault();
      scrollToHashTarget(hash);
    });
  });

  if (window.location.hash) {
    window.addEventListener("load", () => {
      scrollToHashTarget(window.location.hash, false);
    });
  }
}
