/**
 * CA VASTU - Consultant Landing Page Interactions
 * Handles:
 * 1. Video Player with View Counter & Sound Controls
 * 2. Before -> After Image Comparison Slider
 * 3. FAQ Accordion
 * 4. Lead Capture Form with ₹9 Payment Simulation & Automatic WhatsApp Redirect
 */

document.addEventListener('DOMContentLoaded', () => {
  initVideoPlayer();
  initBeforeAfterSlider();
  initFaqAccordion();
  initTrialForm();
});

/* --------------------------------------------------------------------------
   1. VIDEO PLAYER (Thumb + Video + Live View Count)
   -------------------------------------------------------------------------- */
function initVideoPlayer() {
  const video = document.getElementById('vastuDemoVideo');
  const overlay = document.getElementById('videoPlayOverlay');
  const muteBtn = document.getElementById('videoMuteToggle');
  const muteIcon = document.getElementById('muteIcon');
  const muteLabel = document.getElementById('muteLabel');
  const viewCountEl = document.getElementById('videoViewCount');

  if (!video) return;

  // Simulate dynamic view count updates
  let baseViews = 14820;
  setInterval(() => {
    baseViews += Math.floor(Math.random() * 3) + 1;
    if (viewCountEl) {
      viewCountEl.innerHTML = `<i class="fa-solid fa-eye"></i> ${baseViews.toLocaleString('en-IN')} Consultants Watching`;
    }
  }, 4000);

  function togglePlay() {
    if (video.paused) {
      video.muted = false; // Start with sound enabled
      video.volume = 1.0;
      video.play().then(() => {
        if (overlay) overlay.style.display = 'none';
        if (muteBtn) muteBtn.style.display = 'inline-flex';
        updateMuteState(false);
      }).catch(err => {
        console.warn('Autoplay with audio blocked, fallback to muted:', err);
        video.muted = true;
        video.play();
        if (overlay) overlay.style.display = 'none';
        if (muteBtn) muteBtn.style.display = 'inline-flex';
        updateMuteState(true);
      });
    } else {
      video.pause();
      if (overlay) overlay.style.display = 'flex';
    }
  }

  function updateMuteState(isMuted) {
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
      updateMuteState(video.muted);
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

  function updatePosition(val) {
    overlay.style.width = `${val}%`;
    handle.style.left = `${val}%`;
  }

  slider.addEventListener('input', (e) => {
    updatePosition(e.target.value);
  });

  // Touch and mouse dragging
  updatePosition(slider.value || 50);
}

/* --------------------------------------------------------------------------
   3. FAQ ACCORDION (Google Review App style)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.neo-faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.neo-faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all items
      items.forEach(other => other.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. CONSULTANT LEAD CAPTURE & ₹9 PAYMENT
   -------------------------------------------------------------------------- */
const consultantState = {
  name: '',
  mobile: '',
  email: '',
  practice: '',
  refId: ''
};

function initTrialForm() {
  const form = document.getElementById('caVastuTrialForm');
  const nameInput = document.getElementById('consultantName');
  const mobileInput = document.getElementById('consultantMobile');
  const emailInput = document.getElementById('consultantEmail');
  const practiceSelect = document.getElementById('consultantPractice');
  const modal = document.getElementById('paymentModal');
  const closeModalBtn = document.getElementById('closePaymentModal');

  if (!form) return;

  // Sanitize mobile input (digits only, max 10)
  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const mob = mobileInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || name.length < 2) {
      alert('Please enter your full name.');
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

    // Save state
    consultantState.name = name;
    consultantState.mobile = mob;
    consultantState.email = email;
    consultantState.practice = practiceSelect ? practiceSelect.value : 'Residential Vastu';
    consultantState.refId = 'CAV-' + Math.floor(10000 + Math.random() * 90000);

    // Save lead to local storage
    persistLead(consultantState, false);

    // Open Modal
    openPaymentModal();
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

function openPaymentModal() {
  const modal = document.getElementById('paymentModal');
  const nameDisplay = document.getElementById('modalConsultantDisplay');
  const phoneDisplay = document.getElementById('modalPhoneDisplay');

  if (nameDisplay) nameDisplay.textContent = consultantState.name;
  if (phoneDisplay) phoneDisplay.textContent = '+91 ' + consultantState.mobile;

  if (modal) modal.classList.add('active');
}

window.executeTrialPayment = function(methodName) {
  const payBtn = document.getElementById('btnPayInstantUpi');
  if (payBtn) {
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing ₹9 via ${methodName}...`;
    payBtn.disabled = true;
  }

  setTimeout(() => {
    // 1. Mark as paid
    persistLead(consultantState, true);

    // 2. Hide checkout view, show success view
    const checkoutView = document.getElementById('modalCheckoutView');
    const successView = document.getElementById('modalSuccessView');
    const refDisplay = document.getElementById('activationRefDisplay');

    if (checkoutView) checkoutView.style.display = 'none';
    if (successView) successView.style.display = 'block';
    if (refDisplay) refDisplay.textContent = '#' + consultantState.refId;

    // 3. Construct WhatsApp Message and Link
    const waNumber = '919999999999'; // Support / Onboarding number
    const message = encodeURIComponent(
      `Hello CA Vastu Team! I have started my 7-Day Free Trial for ₹9.\n\n` +
      `• Consultant Name: ${consultantState.name}\n` +
      `• Mobile: ${consultantState.mobile}\n` +
      `• Focus: ${consultantState.practice}\n` +
      `• Activation Ref: #${consultantState.refId}\n\n` +
      `Please share my CA Vastu App login credentials and download link.`
    );
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;

    const waBtn = document.getElementById('directWhatsappBtn');
    if (waBtn) waBtn.href = waUrl;

    // 4. Auto-Redirect countdown (3 seconds)
    let secondsLeft = 3;
    const countEl = document.getElementById('countdownSeconds');

    const countdownTimer = setInterval(() => {
      secondsLeft--;
      if (countEl) countEl.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        window.location.href = waUrl;
      }
    }, 1000);

  }, 1200);
};

function persistLead(data, isPaid) {
  try {
    const key = 'cavastu_consultant_trials';
    const existing = localStorage.getItem(key);
    const list = existing ? JSON.parse(existing) : [];

    const record = {
      ...data,
      paid: isPaid,
      created: new Date().toISOString()
    };

    const idx = list.findIndex(item => item.refId === record.refId);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }

    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error('Storage error:', e);
  }
}
