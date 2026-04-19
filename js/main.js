(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Back to top + logo: fixed header was not a valid #top scroll target */
  document.querySelectorAll('a[href="#top"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", "#top");
    });
  });

  /* Mobile navigation */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  if (toggle && header && nav) {
    function syncHeaderHeight() {
      const raw = header.getBoundingClientRect().height;
      const h = Math.max(Math.ceil(raw || 0), 52);
      document.documentElement.style.setProperty("--site-header-h", `${h}px`);
    }

    syncHeaderHeight();
    window.addEventListener("resize", syncHeaderHeight);
    window.addEventListener("orientationchange", syncHeaderHeight);
    window.addEventListener("load", syncHeaderHeight);
    if ("ResizeObserver" in window) {
      new ResizeObserver(syncHeaderHeight).observe(header);
    }

    function setNavOpen(open) {
      syncHeaderHeight();
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", () => {
      const opening = !header.classList.contains("is-open");
      syncHeaderHeight();
      setNavOpen(opening);
      if (opening) {
        requestAnimationFrame(syncHeaderHeight);
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        setNavOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 769px)").matches) {
        setNavOpen(false);
      }
    });
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Work filters */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".work-card");

  function scrollToFirstVisibleProject() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const first = document.querySelector("#work-grid .work-card:not(.is-hidden)");
        if (first) {
          first.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";

      filterBtns.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      cards.forEach((card) => {
        const cat = card.getAttribute("data-category");
        const show = filter === "all" || cat === filter;
        card.classList.toggle("is-hidden", !show);
      });

      scrollToFirstVisibleProject();
    });
  });

  /* Highlight nav link for the section in view */
  const siteNav = document.getElementById("site-nav");
  const sections = document.querySelectorAll("main section[id]");
  const navAnchorLinks = siteNav
    ? siteNav.querySelectorAll('a[href^="#"]:not([href="#"])')
    : [];

  function headerOffsetPx() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      "--site-header-h"
    );
    const n = parseInt(String(raw).replace("px", ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 64;
  }

  function updateNavActive() {
    if (!siteNav || !sections.length || !navAnchorLinks.length) return;

    const line = window.scrollY + headerOffsetPx();
    let activeId = "";
    sections.forEach((sec) => {
      const top =
        window.scrollY + sec.getBoundingClientRect().top;
      if (line + 1 >= top) {
        activeId = sec.id;
      }
    });

    navAnchorLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      const on = id === activeId;
      link.classList.toggle("is-active", on);
      if (on) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  let navSpyTicking = false;
  function onScrollNavSpy() {
    if (!navSpyTicking) {
      requestAnimationFrame(() => {
        updateNavActive();
        navSpyTicking = false;
      });
      navSpyTicking = true;
    }
  }

  if (siteNav && sections.length) {
    updateNavActive();
    window.addEventListener("scroll", onScrollNavSpy, { passive: true });
    window.addEventListener("resize", updateNavActive);
    window.addEventListener("load", updateNavActive);
  }
})();
