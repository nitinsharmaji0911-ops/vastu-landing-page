/**
 * Call Astro - B2B Vastu Consultant Landing Page Application
 * Handles Photo Carousel, Consultant Lead Capture, ₹9 Payment, & Auto-Redirect to WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initB2bForm();
  initB2bPayment();
});

/* --------------------------------------------------------------------------
   1. PHOTOS CAROUSEL (App Screens)
   -------------------------------------------------------------------------- */
function initCarousel() {
  const track = document.getElementById('b2bCarouselTrack');
  const slides = document.querySelectorAll('.b2b-carousel-slide');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dots = document.querySelectorAll('.b2b-dot');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4500);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(i);
      startAutoplay();
    });
  });

  // Touch Swipe for Mobile
  let startX = 0;
  let endX = 0;

  track.addEventListener('touchstart', (e) => {
    stopAutoplay();
    startX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].screenX;
    if (startX - endX > 40) {
      goToSlide(currentIndex + 1);
    } else if (endX - startX > 40) {
      goToSlide(currentIndex - 1);
    }
    startAutoplay();
  }, { passive: true });

  // Pause on hover
  const container = document.getElementById('b2bCarouselContainer');
  if (container) {
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

/* --------------------------------------------------------------------------
   2. CONSULTANT REGISTRATION FORM
   -------------------------------------------------------------------------- */
const consultantState = {
  name: '',
  mobile: '',
  email: '',
  expertise: '',
  experience: '',
  city: '',
  bookingId: ''
};

function initB2bForm() {
  const form = document.getElementById('b2bRegisterForm');
  const nameInput = document.getElementById('consultantName');
  const mobileInput = document.getElementById('consultantMobile');
  const emailInput = document.getElementById('consultantEmail');
  const expSelect = document.getElementById('consultantExpertise');
  const phoneWrap = document.getElementById('phoneWrap');

  if (!form) return;

  // Format mobile to 10 digits
  mobileInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    phoneWrap.classList.remove('has-error');
    const err = document.getElementById('mobileErr');
    if (err) err.style.display = 'none';
  });

  [nameInput, emailInput, expSelect].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
      const err = input.parentElement?.querySelector('.b2b-error-msg');
      if (err) err.style.display = 'none';
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    let firstInvalid = null;

    // Reset errors
    document.querySelectorAll('.b2b-error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      document.getElementById('nameErr').style.display = 'block';
      nameInput.classList.add('has-error');
      if (!firstInvalid) firstInvalid = nameInput;
      isValid = false;
    }

    // Validate Mobile
    const mob = mobileInput.value.trim();
    if (!/^\d{10}$/.test(mob)) {
      document.getElementById('mobileErr').style.display = 'block';
      phoneWrap.classList.add('has-error');
      if (!firstInvalid) firstInvalid = mobileInput;
      isValid = false;
    }

    // Validate Email
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('emailErr').style.display = 'block';
      emailInput.classList.add('has-error');
      if (!firstInvalid) firstInvalid = emailInput;
      isValid = false;
    }

    if (!isValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Store state
    consultantState.name = nameInput.value.trim();
    consultantState.mobile = mob;
    consultantState.email = email;
    consultantState.expertise = expSelect?.value || 'Vastu Shastra';
    consultantState.experience = '3-7 Years';
    consultantState.city = 'India';
    consultantState.bookingId = 'EXP-' + Math.floor(10000 + Math.random() * 90000);

    // Save lead to local storage immediately
    saveConsultantLead(consultantState, false);

    // Open Payment Modal
    openPaymentModal();
  });
}

function openPaymentModal() {
  const modal = document.getElementById('b2bPaymentModal');
  const clientNameEl = document.getElementById('modalConsultantName');
  const clientPhoneEl = document.getElementById('modalConsultantPhone');

  if (clientNameEl) clientNameEl.textContent = consultantState.name;
  if (clientPhoneEl) clientPhoneEl.textContent = '+91 ' + consultantState.mobile;

  if (modal) modal.classList.add('active');
}

/* --------------------------------------------------------------------------
   3. PAYMENT PROCESSING & AUTO REDIRECT TO WHATSAPP
   -------------------------------------------------------------------------- */
function initB2bPayment() {
  const closeBtn = document.getElementById('closeB2bModal');
  const modal = document.getElementById('b2bPaymentModal');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

window.simulateB2bPayment = function(provider) {
  const payBtn = document.getElementById('btnPay9Consultant');
  if (payBtn) {
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing ₹9 via ${provider}...`;
    payBtn.disabled = true;
  }

  setTimeout(() => {
    // 1. Mark as paid & persist
    saveConsultantLead(consultantState, true);

    // 2. Hide payment view in modal, show success card
    const payContent = document.getElementById('b2bPaymentContent');
    const successCard = document.getElementById('b2bSuccessCard');

    if (payContent) payContent.style.display = 'none';
    if (successCard) successCard.classList.add('active');

    // 3. Set up prefilled WhatsApp link
    const waPhone = '919999999999'; // Call Astro Partner Onboarding WhatsApp
    const message = encodeURIComponent(
      `Namaste Call Astro Team! My name is ${consultantState.name}. I am a ${consultantState.expertise} Consultant. ` +
      `I have paid ₹9 for my 7-Day Free Consultant App Trial (Registration ID: #${consultantState.bookingId}). ` +
      `Please activate my expert panel account and share the app download link.`
    );
    const whatsappUrl = `https://wa.me/${waPhone}?text=${message}`;

    const waBtn = document.getElementById('btnWhatsappRedirect');
    if (waBtn) waBtn.href = whatsappUrl;

    const bookingIdEl = document.getElementById('successBookingId');
    if (bookingIdEl) bookingIdEl.textContent = '#' + consultantState.bookingId;

    // 4. Auto-redirect countdown (3 seconds)
    let secondsLeft = 3;
    const countdownEl = document.getElementById('redirectCountdown');

    const interval = setInterval(() => {
      secondsLeft--;
      if (countdownEl) countdownEl.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(interval);
        // Automatic redirection to WhatsApp
        window.location.href = whatsappUrl;
      }
    }, 1000);

  }, 1200);
};

function saveConsultantLead(consultant, isPaid) {
  try {
    const key = 'callastro_b2b_consultants_v1';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    const record = {
      ...consultant,
      paid: isPaid,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    const existingIdx = list.findIndex(c => c.bookingId === record.bookingId);
    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }

    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

// Video play modal or simulation
window.playConsultantVideo = function() {
  const box = document.getElementById('videoPlayerBox');
  if (box) {
    box.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0F1D36; padding: 20px; text-align: center;">
        <i class="fa-solid fa-circle-check text-gold" style="font-size: 40px; color: #F29F05; margin-bottom: 12px;"></i>
        <h4 style="color: #FFFFFF; font-size: 16px; margin-bottom: 6px;">How Call Astro Delivers 20+ Vastu Clients / Week</h4>
        <p style="color: #94A3B8; font-size: 12px; max-width: 420px; margin-bottom: 14px;">Clients request audits directly through the Call Astro user app. Verified consultants accept instant audio/video sessions and receive daily direct bank payouts.</p>
        <button type="button" class="btn-primary" style="padding: 8px 18px; font-size: 13px; max-width: 240px;" onclick="scrollToForm()">
          Claim ₹9 Trial Access <i class="fa-solid fa-arrow-down"></i>
        </button>
      </div>
    `;
  }
};

window.scrollToForm = function() {
  const form = document.getElementById('b2bFormCard');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nameInput = document.getElementById('consultantName');
    if (nameInput) setTimeout(() => nameInput.focus(), 400);
  }
};
