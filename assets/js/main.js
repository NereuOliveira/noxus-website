const revealItems = document.querySelectorAll(".reveal");
const siteHeader = document.querySelector(".page > header");
const themePreferenceKey = "theme-preference";
const mobileMenuQuery = window.matchMedia("(max-width: 860px)");

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
  return toggle;
};

const initMobileMenu = (themeToggle) => {
  if (!siteHeader) return { closeMenu: () => {} };

  const desktopNav = siteHeader.querySelector(".nav");
  const desktopCta = siteHeader.querySelector(".pill");
  if (!desktopNav || !desktopCta || !themeToggle) return { closeMenu: () => {} };

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "menu-toggle";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "mobile-menu-drawer");
  trigger.setAttribute("aria-label", "Abrir menu");
  trigger.innerHTML = `
    <span class="menu-toggle-bar"></span>
    <span class="menu-toggle-bar"></span>
    <span class="menu-toggle-bar"></span>
  `;
  siteHeader.insertBefore(trigger, desktopNav);

  const backdrop = document.createElement("div");
  backdrop.className = "menu-backdrop";
  backdrop.hidden = true;

  const drawer = document.createElement("aside");
  drawer.id = "mobile-menu-drawer";
  drawer.className = "menu-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-hidden", "true");

  const drawerTop = document.createElement("div");
  drawerTop.className = "menu-drawer-top";

  const drawerTitle = document.createElement("strong");
  drawerTitle.className = "menu-drawer-title";
  drawerTitle.textContent = "Menu";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "menu-close";
  closeButton.setAttribute("aria-label", "Fechar menu");
  closeButton.textContent = "Fechar";

  const mobileNav = desktopNav.cloneNode(true);
  mobileNav.classList.add("menu-nav");

  const mobileCta = desktopCta.cloneNode(true);
  mobileCta.classList.add("menu-cta");

  drawerTop.append(drawerTitle, themeToggle, closeButton);
  drawer.append(drawerTop, mobileNav, mobileCta);
  document.body.append(backdrop, drawer);

  let isMenuOpen = false;
  let restoreFocusElement = null;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const getFocusable = () => Array.from(drawer.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute("hidden"));

  const placeThemeToggle = () => {
    if (mobileMenuQuery.matches) {
      drawerTop.insertBefore(themeToggle, closeButton);
    } else {
      siteHeader.appendChild(themeToggle);
    }
  };

  const closeMenu = () => {
    if (!isMenuOpen) return;
    isMenuOpen = false;
    document.body.classList.remove("menu-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Abrir menu");
    if (restoreFocusElement && typeof restoreFocusElement.focus === "function") {
      restoreFocusElement.focus();
    }
    restoreFocusElement = null;
  };

  const openMenu = () => {
    if (isMenuOpen) return;
    isMenuOpen = true;
    restoreFocusElement = document.activeElement;
    document.body.classList.add("menu-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Fechar menu");
    const focusables = getFocusable();
    if (focusables.length > 0) {
      focusables[0].focus();
    }
  };

  const handleKeyDown = (event) => {
    if (!isMenuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;

    const focusables = getFocusable();
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  trigger.addEventListener("click", () => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  });
  closeButton.addEventListener("click", closeMenu);
  backdrop.addEventListener("click", closeMenu);
  document.addEventListener("keydown", handleKeyDown);

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  mobileCta.addEventListener("click", closeMenu);

  mobileMenuQuery.addEventListener("change", () => {
    closeMenu();
    placeThemeToggle();
  });
  placeThemeToggle();

  return { closeMenu };
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
  const themeToggle = installThemeToggle();
  const { closeMenu } = initMobileMenu(themeToggle);
  const root = document.documentElement;
  let isCompact = false;

  const updateHeaderOffset = () => {
    root.style.setProperty("--header-offset", `${siteHeader.offsetHeight}px`);
  };

  const syncHeaderState = () => {
    if (mobileMenuQuery.matches) {
      isCompact = false;
      document.body.classList.remove("nav-compact");
      updateHeaderOffset();
      return;
    }

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
  window.addEventListener("orientationchange", updateHeaderOffset);
  window.addEventListener("load", updateHeaderOffset);
  mobileMenuQuery.addEventListener("change", syncHeaderState);
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
      closeMenu();
      scrollToHashTarget(hash);
    });
  });

  if (window.location.hash) {
    window.addEventListener("load", () => {
      scrollToHashTarget(window.location.hash, false);
    });
  }
}
