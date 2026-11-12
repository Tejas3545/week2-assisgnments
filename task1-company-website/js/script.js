/**
 * Apex Core Technologies — Corporate Web Platform Controller
 * Architecture: Vanilla ES6+, Zero Third-Party Dependencies
 */

document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileNavigation();
  initContactFormValidation();
});

/**
 * Adds elevation shadow on scroll
 */
function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Drawer Menu with ARIA states
 */
function initMobileNavigation() {
  const hamburger = document.querySelector(".hamburger-btn");
  const drawer = document.querySelector(".mobile-nav-drawer");
  if (!hamburger || !drawer) return;

  const toggleMenu = () => {
    const isOpen = drawer.classList.contains("is-open");
    if (isOpen) {
      drawer.classList.remove("is-open");
      hamburger.classList.remove("is-active");
      hamburger.setAttribute("aria-expanded", "false");
    } else {
      drawer.classList.add("is-open");
      hamburger.classList.add("is-active");
      hamburger.setAttribute("aria-expanded", "true");
    }
  };

  hamburger.addEventListener("click", toggleMenu);

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!drawer.contains(e.target) && !hamburger.contains(e.target) && drawer.classList.contains("is-open")) {
      drawer.classList.remove("is-open");
      hamburger.classList.remove("is-active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

  // Close on resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && drawer.classList.contains("is-open")) {
      drawer.classList.remove("is-open");
      hamburger.classList.remove("is-active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * Form validation with accessible live feedback
 */
function initContactFormValidation() {
  const form = document.getElementById("corporateContactForm");
  if (!form) return;

  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const subjectSelect = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const termsCheckbox = document.getElementById("termsConsent");
  const successBanner = document.getElementById("formSuccessBanner");

  const validators = {
    fullName: (val) => {
      const trimmed = val.trim();
      if (!trimmed) return "Full legal name is required.";
      if (trimmed.length < 3) return "Name must be at least 3 characters in length.";
      if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return "Name must only contain standard alphabetic characters.";
      return null;
    },
    email: (val) => {
      const trimmed = val.trim();
      if (!trimmed) return "Work email address is required.";
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) return "Please enter a valid business email address.";
      return null;
    },
    subject: (val) => {
      if (!val || val === "") return "Please select a consultation subject.";
      return null;
    },
    message: (val) => {
      const trimmed = val.trim();
      if (!trimmed) return "Consultation briefing notes are required.";
      if (trimmed.length < 20) return `Message must be at least 20 characters (currently ${trimmed.length}).`;
      return null;
    },
    terms: (checked) => {
      if (!checked) return "You must accept the privacy policy to submit an inquiry.";
      return null;
    }
  };

  const validateField = (input, errorElement, validatorFn, isCheckbox = false) => {
    const errorMsg = validatorFn(isCheckbox ? input.checked : input.value);
    if (errorMsg) {
      input.classList.add("is-invalid");
      errorElement.textContent = errorMsg;
      errorElement.classList.add("is-visible");
      return false;
    } else {
      input.classList.remove("is-invalid");
      errorElement.textContent = "";
      errorElement.classList.remove("is-visible");
      return true;
    }
  };

  // Real-time input validation triggers
  if (fullNameInput) {
    fullNameInput.addEventListener("input", () => {
      validateField(fullNameInput, document.getElementById("fullNameError"), validators.fullName);
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      validateField(emailInput, document.getElementById("emailError"), validators.email);
    });
  }

  if (subjectSelect) {
    subjectSelect.addEventListener("change", () => {
      validateField(subjectSelect, document.getElementById("subjectError"), validators.subject);
    });
  }

  if (messageInput) {
    messageInput.addEventListener("input", () => {
      validateField(messageInput, document.getElementById("messageError"), validators.message);
    });
  }

  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", () => {
      validateField(termsCheckbox, document.getElementById("termsError"), validators.terms, true);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const isNameValid = validateField(fullNameInput, document.getElementById("fullNameError"), validators.fullName);
    const isEmailValid = validateField(emailInput, document.getElementById("emailError"), validators.email);
    const isSubjectValid = validateField(subjectSelect, document.getElementById("subjectError"), validators.subject);
    const isMessageValid = validateField(messageInput, document.getElementById("messageError"), validators.message);
    const isTermsValid = validateField(termsCheckbox, document.getElementById("termsError"), validators.terms, true);

    const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid && isTermsValid;

    if (!isFormValid) {
      // Focus on first invalid field
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Submit action simulation
    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Transmitting Briefing...";

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      if (successBanner) {
        successBanner.classList.add("is-visible");
        successBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      form.reset();

      // Clear any invalid states
      [fullNameInput, emailInput, subjectSelect, messageInput, termsCheckbox].forEach((el) => {
        if (el) el.classList.remove("is-invalid");
      });
    }, 800);
  });
}
