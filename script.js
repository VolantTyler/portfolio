const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

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
  const caption = carousel.querySelector("[data-portrait-caption]");
  let activeIndex = 0;

  if (!slides.length || !nextButton || !dotsContainer) return;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "portrait-dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show portrait ${index + 1}: ${slide.dataset.caption || slide.alt}`);
    dot.addEventListener("click", () => setActiveSlide(index));
    dotsContainer.append(dot);
    return dot;
  });

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

    if (caption) {
      caption.textContent = slides[activeIndex].dataset.caption || "Portrait version";
    }
  }

  nextButton.addEventListener("click", () => {
    setActiveSlide((activeIndex + 1) % slides.length);
  });

  setActiveSlide(activeIndex);
});
