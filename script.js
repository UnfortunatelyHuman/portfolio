const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-link");
const headerLinks = document.querySelectorAll('.header a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const backToTop = document.getElementById("backToTop");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const typingText = document.getElementById("typingText");
const currentYear = document.getElementById("currentYear");
const themeToggle = document.getElementById("themeToggle");
const header = document.querySelector(".header");
const sections = [...document.querySelectorAll("section[id]")];

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
  } catch {
    // Fall back to system preference if storage is unavailable.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

applyTheme(getInitialTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // Theme still changes for the current visit if storage is unavailable.
    }

    applyTheme(nextTheme);
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function closeMenu() {
  navLinks.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

headerLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (!targetSection) return;

    event.preventDefault();

    const headerHeight = header ? header.offsetHeight : 0;
    const targetTop =
      targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    setActiveLink(targetId.replace("#", ""));
    window.history.pushState(null, "", targetId);
    closeMenu();
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -60px",
  },
);

revealElements.forEach((element) => revealObserver.observe(element));

let sectionPositions = [];
let activeSectionId = "home";
let isBackToTopVisible = false;
let scrollTicking = false;
let resizeTimer;

function refreshSectionPositions() {
  sectionPositions = sections.map((section) => ({
    id: section.getAttribute("id"),
    top: section.offsetTop - 140,
    bottom: section.offsetTop + section.offsetHeight - 140,
  }));

  updateScrollState();
}

function setActiveLink(sectionId) {
  if (sectionId === activeSectionId) return;

  activeSectionId = sectionId;
  navItems.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${sectionId}`,
    );
  });
}

function updateScrollState() {
  const scrollY = window.scrollY;
  let currentSectionId = "home";

  sectionPositions.forEach((section) => {
    if (scrollY >= section.top && scrollY < section.bottom) {
      currentSectionId = section.id;
    }
  });

  setActiveLink(currentSectionId);

  const shouldShowBackToTop = scrollY > 360;
  if (shouldShowBackToTop !== isBackToTopVisible) {
    isBackToTopVisible = shouldShowBackToTop;
    backToTop.classList.toggle("show", shouldShowBackToTop);
  }

  scrollTicking = false;
}

function requestScrollUpdate() {
  if (scrollTicking) return;

  scrollTicking = true;
  requestAnimationFrame(updateScrollState);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener(
  "resize",
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshSectionPositions, 120);
  },
  { passive: true },
);
window.addEventListener("load", refreshSectionPositions);

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      formMessage.textContent = "Please fill in all fields.";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.textContent = "Please enter a valid email address.";
      return;
    }

    const formData = new FormData(contactForm);
    formMessage.textContent = "Sending message...";
    submitButton.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      formMessage.textContent = "Thank you. Your message has been sent.";
      contactForm.reset();
    } catch {
      formMessage.textContent =
        "Message could not be sent. Please try again or email directly.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

const typingPhrases = [
  "Building reliable web and mobile applications.",
  "Creating Android, iOS, and React Native apps.",
  "Solving problems with clean architecture and practical delivery.",
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!typingText) return;

  const currentPhrase = typingPhrases[phraseIndex];
  typingText.textContent = currentPhrase.slice(0, charIndex);

  if (!isDeleting && charIndex < currentPhrase.length) {
    charIndex += 1;
    setTimeout(typeEffect, 48);
    return;
  }

  if (isDeleting && charIndex > 0) {
    charIndex -= 1;
    setTimeout(typeEffect, 24);
    return;
  }

  if (!isDeleting) {
    isDeleting = true;
    setTimeout(typeEffect, 1400);
    return;
  }

  isDeleting = false;
  phraseIndex = (phraseIndex + 1) % typingPhrases.length;
  setTimeout(typeEffect, 260);
}

typeEffect();
refreshSectionPositions();
