/**
 * Call Astro - B2B Vastu Consultant Interactions
 * - Video Player with Live Watching Count & Sound Controls
 * - Before -> After Image Slider
 * - FAQ Accordion
 * - Lead Capture Popup Modal & Automatic WhatsApp Redirect
 */

document.addEventListener('DOMContentLoaded', () => {
  initVideoPlayer();
  initStepCarousel();
  initBeforeAfterSlider();
  initFaqAccordion();
  initLeadModalForm();
});

/* --------------------------------------------------------------------------
   0. 3-STEP LUXURY CAROUSEL (Interactive Gallery Card Showcase)
   -------------------------------------------------------------------------- */
let currentStepIndex = 0;
const totalStepCards = 3;
let autoSlideTimer = null;

function updateStepCarousel() {
  const slides = document.querySelectorAll('.vastu-card-slide');
  const dots = document.querySelectorAll('.vastu-nav-dot');

  slides.forEach((slide, idx) => {
    slide.classList.remove('is-active', 'is-prev', 'is-next');
    if (idx === currentStepIndex) {
      slide.classList.add('is-active');
    } else if (idx === (currentStepIndex - 1 + totalStepCards) % totalStepCards) {
      slide.classList.add('is-prev');
    } else {
      slide.classList.add('is-next');
    }
  });

  dots.forEach((dot, idx) => {
    if (idx === currentStepIndex) {
      dot.classList.add('is-active');
    } else {
      dot.classList.remove('is-active');
    }
  });
}

window.goStepSlide = function(index) {
  currentStepIndex = (index + totalStepCards) % totalStepCards;
  updateStepCarousel();
  restartAutoSlide();
};

window.nextStepSlide = function() {
  currentStepIndex = (currentStepIndex + 1) % totalStepCards;
  updateStepCarousel();
  restartAutoSlide();
};

window.prevStepSlide = function() {
  currentStepIndex = (currentStepIndex - 1 + totalStepCards) % totalStepCards;
  updateStepCarousel();
  restartAutoSlide();
};

function startAutoSlide() {
  stopAutoSlide();
  autoSlideTimer = setInterval(() => {
    currentStepIndex = (currentStepIndex + 1) % totalStepCards;
    updateStepCarousel();
  }, 4200);
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}

function restartAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

function initStepCarousel() {
  const slides = document.querySelectorAll('.vastu-card-slide');
  const track = document.getElementById('vastuStepTrack');
  const wrap = document.querySelector('.vastu-carousel-wrap');

  slides.forEach((slide, idx) => {
    slide.addEventListener('click', (e) => {
      // Don't trigger if user clicked details or arrow buttons
      if (e.target.closest('.vastu-card-action-btn') || e.target.closest('.vastu-card-arrow-btn')) return;
      if (idx !== currentStepIndex) {
        goStepSlide(idx);
      }
    });
  });

  // Pause auto-sliding on desktop hover or touch hold
  if (wrap) {
    wrap.addEventListener('mouseenter', stopAutoSlide);
    wrap.addEventListener('mouseleave', startAutoSlide);
  }

  // Smooth touch swipe handling on mobile
  if (track) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    track.addEventListener('touchstart', (e) => {
      stopAutoSlide();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only trigger if horizontal swipe is intentional and greater than vertical scroll
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          nextStepSlide();
        } else {
          prevStepSlide();
        }
      } else {
        startAutoSlide();
      }
    }, { passive: true });
  }

  updateStepCarousel();
  startAutoSlide();
}

/* --------------------------------------------------------------------------
   1. VIDEO PLAYER
   -------------------------------------------------------------------------- */
function initVideoPlayer() {
  const video = document.getElementById('vastuDemoVideo');
  const overlay = document.getElementById('videoPlayOverlay');
  const muteBtn = document.getElementById('videoMuteToggle');
  const muteIcon = document.getElementById('muteIcon');
  const muteLabel = document.getElementById('muteLabel');
  const viewCountEl = document.getElementById('videoViewCount');

  if (!video) return;

  // View count increment simulator
  let baseViews = 14820;
  setInterval(() => {
    baseViews += Math.floor(Math.random() * 3) + 1;
    if (viewCountEl) {
      viewCountEl.innerHTML = `<i class="fa-solid fa-eye"></i> ${baseViews.toLocaleString('en-IN')} Watching`;
    }
  }, 4000);

  function togglePlay() {
    if (video.paused) {
      video.muted = false;
      video.volume = 1.0;
      video.play().then(() => {
        if (overlay) overlay.style.display = 'none';
        if (muteBtn) muteBtn.style.display = 'inline-flex';
        updateMute(false);
      }).catch(() => {
        video.muted = true;
        video.play();
        if (overlay) overlay.style.display = 'none';
        if (muteBtn) muteBtn.style.display = 'inline-flex';
        updateMute(true);
      });
    } else {
      video.pause();
      if (overlay) overlay.style.display = 'flex';
    }
  }

  function updateMute(isMuted) {
    if (!muteIcon || !muteLabel) return;
    if (isMuted) {
      muteIcon.className = 'fa-solid fa-volume-xmark';
      muteIcon.style.color = '#F87171';
      muteLabel.textContent = 'Unmute';
    } else {
      muteIcon.className = 'fa-solid fa-volume-high';
      muteIcon.style.color = '#4ADE80';
      muteLabel.textContent = 'Sound On';
    }
  }

  if (overlay) overlay.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      updateMute(video.muted);
    });
  }
}

/* --------------------------------------------------------------------------
   2. IMAGE BEFORE -> AFTER SLIDER
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const slider = document.getElementById('baSlider');
  const overlay = document.getElementById('baOverlay');
  const handle = document.getElementById('baHandle');

  if (!slider || !overlay || !handle) return;

  function setPos(val) {
    overlay.style.width = `${val}%`;
    handle.style.left = `${val}%`;
  }

  slider.addEventListener('input', (e) => setPos(e.target.value));
  setPos(slider.value || 50);
}

/* --------------------------------------------------------------------------
   3. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.ca-faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.ca-faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(other => other.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   4. MODAL POPUP & LEAD FORM (Opens when clicking any CTA button)
   -------------------------------------------------------------------------- */
const consultantState = {
  name: '',
  mobile: '',
  email: '',
  focus: '',
  refId: ''
};

window.openLeadModal = function() {
  const modal = document.getElementById('leadModalOverlay');
  const formStep = document.getElementById('modalFormStep');
  const payStep = document.getElementById('modalPaymentStep');
  const successStep = document.getElementById('modalSuccessStep');

  if (formStep) formStep.style.display = 'block';
  if (payStep) payStep.style.display = 'none';
  if (successStep) successStep.style.display = 'none';

  if (modal) modal.classList.add('active');
  const nameInput = document.getElementById('popupName');
  if (nameInput) setTimeout(() => nameInput.focus(), 300);
};

window.closeLeadModal = function() {
  const modal = document.getElementById('leadModalOverlay');
  if (modal) modal.classList.remove('active');
};

function initLeadModalForm() {
  const form = document.getElementById('popupTrialForm');
  const nameInput = document.getElementById('popupName');
  const mobileInput = document.getElementById('popupMobile');
  const emailInput = document.getElementById('popupEmail');
  const focusSelect = document.getElementById('popupFocus');
  const modal = document.getElementById('leadModalOverlay');

  // Close when clicking outside modal card
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLeadModal();
    });
  }

  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const mob = mobileInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || name.length < 2) {
      alert('Please enter your name.');
      nameInput.focus();
      return;
    }

    if (!/^\d{10}$/.test(mob)) {
      alert('Please enter a valid 10-digit mobile number.');
      mobileInput.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    consultantState.name = name;
    consultantState.mobile = mob;
    consultantState.email = email;
    consultantState.focus = focusSelect ? focusSelect.value : 'Residential Vastu';
    consultantState.refId = 'CAV-' + Math.floor(10000 + Math.random() * 90000);

    // Save lead record
    persistLead(consultantState, false);

    // Switch to payment options
    const formStep = document.getElementById('modalFormStep');
    const payStep = document.getElementById('modalPaymentStep');
    const summaryName = document.getElementById('summaryName');
    const summaryPhone = document.getElementById('summaryPhone');

    if (summaryName) summaryName.textContent = consultantState.name;
    if (summaryPhone) summaryPhone.textContent = '+91 ' + consultantState.mobile;

    if (formStep) formStep.style.display = 'none';
    if (payStep) payStep.style.display = 'block';
  });
}

window.executeTrialPayment = function(providerName) {
  const payBtn = document.getElementById('btnPayNow');
  if (payBtn) {
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing ₹9 via ${providerName}...`;
    payBtn.disabled = true;
  }

  setTimeout(() => {
    persistLead(consultantState, true);

    const payStep = document.getElementById('modalPaymentStep');
    const successStep = document.getElementById('modalSuccessStep');
    const refEl = document.getElementById('successRef');

    if (payStep) payStep.style.display = 'none';
    if (successStep) successStep.style.display = 'block';
    if (refEl) refEl.textContent = '#' + consultantState.refId;

    // Prefilled WhatsApp message
    const waNumber = '919999999999';
    const message = encodeURIComponent(
      `Hello Call Astro Team! I have paid ₹9 for my 7-Day Vastu Software Trial.\n\n` +
      `• Consultant: ${consultantState.name}\n` +
      `• Mobile: ${consultantState.mobile}\n` +
      `• Focus: ${consultantState.focus}\n` +
      `• Ref ID: #${consultantState.refId}\n\n` +
      `Please send my consultant login credentials and app download link.`
    );
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;

    const waBtn = document.getElementById('directWhatsappBtn');
    if (waBtn) waBtn.href = waUrl;

    // Countdown 3s to auto-redirect
    let count = 3;
    const countEl = document.getElementById('countdownSeconds');

    const timer = setInterval(() => {
      count--;
      if (countEl) countEl.textContent = count;
      if (count <= 0) {
        clearInterval(timer);
        window.location.href = waUrl;
      }
    }, 1000);

  }, 1100);
};

function persistLead(data, isPaid) {
  try {
    const key = 'callastro_vastu_consultant_leads';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    const record = {
      ...data,
      paid: isPaid,
      created: new Date().toISOString()
    };

    const idx = list.findIndex(i => i.refId === record.refId);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }

    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error('Storage error:', err);
  }
}
