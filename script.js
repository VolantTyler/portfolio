const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

const THEME_STORAGE_KEY = "portfolio-theme";

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInverseTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}

function updateThemeToggleLabel(theme) {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const nextTheme = getInverseTheme(theme);
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.dataset.nextTheme = nextTheme;
  });
}

function updatePortfolioPreview(theme) {
  const iframe = document.querySelector("[data-portfolio-preview-iframe]");
  if (!iframe) return;

  const previewTheme = getInverseTheme(theme);
  const nextSrc = `preview.html?theme=${previewTheme}`;
  if (iframe.getAttribute("src") !== nextSrc) {
    iframe.setAttribute("src", nextSrc);
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateThemeToggleLabel(theme);
  updatePortfolioPreview(theme);
}

function initTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      applyTheme(getInverseTheme(currentTheme));
    });
  });
}

initTheme();

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const portraitCarousels = document.querySelectorAll("[data-portrait-carousel]");

portraitCarousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-portrait-slide]"));
  const nextButton = carousel.querySelector("[data-portrait-next]");
  const dotsContainer = carousel.querySelector("[data-portrait-dots]");
  let activeIndex = 0;

  if (!slides.length || !nextButton || !dotsContainer) return;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "portrait-dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show portrait ${index + 1}: ${slide.dataset.label || slide.alt}`);
    dot.addEventListener("click", () => setActiveSlide(index));
    dotsContainer.append(dot);
    return dot;
  });

  function updateNextButton() {
    const nextIndex = (activeIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];
    const isRealPhoto = nextSlide.dataset.kind === "me";
    const label = isRealPhoto ? "me" : "+AI";

    nextButton.textContent = label;
    nextButton.setAttribute("aria-label", `Show next portrait: ${nextSlide.dataset.label || nextSlide.alt}`);
  }

  function setActiveSlide(index) {
    activeIndex = index;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });

    updateNextButton();
  }

  nextButton.addEventListener("click", () => {
    setActiveSlide((activeIndex + 1) % slides.length);
  });

  setActiveSlide(activeIndex);
});

const skillList = document.querySelector("[data-skill-list]");

if (skillList) {
  const chips = Array.from(document.querySelectorAll(".chip-row .chip"));
  const pills = Array.from(skillList.querySelectorAll(".skill-pill"));

  function filterSkills(facet) {
    pills.forEach((pill) => {
      const facets = (pill.dataset.facets || "").split(" ");
      pill.hidden = facet !== "all" && !facets.includes(facet);
    });

    chips.forEach((chip) => {
      const isActive = chip.dataset.facet === facet;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });

    skillList.setAttribute(
      "aria-label",
      facet === "all"
        ? "All skills"
        : `Skills in ${chips.find((chip) => chip.dataset.facet === facet)?.textContent.trim()}`,
    );
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => filterSkills(chip.dataset.facet));
  });

  // The markup ships every skill visible so crawlers see the full list; apply
  // the default facet once JS is available.
  const initial = chips.find((chip) => chip.classList.contains("is-active"));
  filterSkills(initial ? initial.dataset.facet : "all");
}
