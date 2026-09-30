/**
 * Call Astro - Vastu Audit Funnel Application Logic
 * High conversion lead capture, interactive scoring, and ₹9 payment flow.
 */

// Global State
const appState = {
  currentStep: 1,
  totalQuestions: 4,
  currentQuestionIndex: 1,
  lead: {
    id: null,
    name: '',
    mobile: '',
    email: '',
    propertyType: 'Apartment / Flat',
    answers: {},
    totalScore: 58,
    financeScore: 52,
    healthScore: 48,
    harmonyScore: 64,
    paid: false,
    timestamp: null
  }
};

const STORAGE_KEY = 'callastro_vastu_leads_v1';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initLeadForm();
  initQuizOptions();
  initFaqAccordion();
  initModals();
  updateLeadsBadge();
  initKeyboardShortcuts();
});

/* --------------------------------------------------------------------------
   1. STEP 1: LEAD CAPTURE VALIDATION & INSTANT RECORDING
   -------------------------------------------------------------------------- */
function initLeadForm() {
  const form = document.getElementById('leadCaptureForm');
  const nameInput = document.getElementById('userName');
  const mobileInput = document.getElementById('userMobile');
  const emailInput = document.getElementById('userEmail');
  const propertySelect = document.getElementById('propertyType');

  // Format mobile to allow only numbers
  mobileInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset error messages
    document.querySelectorAll('.field-error').forEach(el => el.style.display = 'none');

    // Name Validation
    const nameVal = nameInput.value.trim();
    if (!nameVal || nameVal.length < 2) {
      document.getElementById('nameError').style.display = 'block';
      isValid = false;
    }

    // Mobile Validation (10 digits Indian number)
    const mobileVal = mobileInput.value.trim();
    if (!/^[6-9]\d{9}$/.test(mobileVal)) {
      document.getElementById('mobileError').style.display = 'block';
      isValid = false;
    }

    // Email Validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      document.getElementById('emailError').style.display = 'block';
      isValid = false;
    }

    if (!isValid) return;

    // CAPTURE LEAD IMMEDIATELY - NO LOSS OF DATA!
    appState.lead.id = 'CA_' + Date.now();
    appState.lead.name = nameVal;
    appState.lead.mobile = mobileVal;
    appState.lead.email = emailVal;
    appState.lead.propertyType = propertySelect.value;
    appState.lead.timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    saveLeadToStorage(appState.lead);

    // Transition to Step 2: Interactive Quiz
    switchView('step2View');
    updateProgressBar(1);
  });
}

/* --------------------------------------------------------------------------
   2. STEP 2: INTERACTIVE VASTU QUIZ QUESTIONS
   -------------------------------------------------------------------------- */
function initQuizOptions() {
  const optionButtons = document.querySelectorAll('.option-card');

  optionButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.getAttribute('data-key');
      const val = this.getAttribute('data-val');
      const score = parseInt(this.getAttribute('data-score'), 10) || 10;

      // Save answer in state
      appState.lead.answers[key] = {
        selection: val,
        score: score
      };

      // Visually select card
      const parentGrid = this.closest('.options-grid');
      parentGrid.querySelectorAll('.option-card').forEach(c => c.style.borderColor = '');
      this.style.borderColor = '#F29F05';
      this.style.background = '#FFFBEB';

      // Move to next question after small tap feedback
      setTimeout(() => {
        advanceQuestion();
      }, 240);
    });
  });
}

function advanceQuestion() {
  if (appState.currentQuestionIndex < appState.totalQuestions) {
    appState.currentQuestionIndex++;
    
    // Switch active question card
    document.querySelectorAll('.question-container').forEach(qc => qc.classList.remove('active'));
    const nextQ = document.querySelector(`.question-container[data-qindex="${appState.currentQuestionIndex}"]`);
    if (nextQ) nextQ.classList.add('active');

    // Update Progress
    updateProgressBar(appState.currentQuestionIndex);
  } else {
    // All 4 questions answered! Move to computing animation
    computeVastuScore();
  }
}

function updateProgressBar(qIndex) {
  const pct = Math.round((qIndex / appState.totalQuestions) * 100);
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('questionStepLabel');
  const pctLabel = document.getElementById('progressPercentage');

  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `Question ${qIndex} of ${appState.totalQuestions}`;
  if (pctLabel) pctLabel.textContent = `${pct}%`;
}

/* --------------------------------------------------------------------------
   3. STEP 3: COMPUTING ANIMATION & SCORING ALGORITHM
   -------------------------------------------------------------------------- */
function computeVastuScore() {
  switchView('calculatingView');

  const statusText = document.getElementById('calculationStatusText');
  const calcStep2 = document.getElementById('calcStep2');
  const calcStep3 = document.getElementById('calcStep3');

  setTimeout(() => {
    if (statusText) statusText.textContent = "Synthesizing planetary zones & directional harmony...";
    if (calcStep2) {
      calcStep2.className = 'step-item done';
      calcStep2.innerHTML = '<i class="fa-solid fa-check"></i> Agni & Jal Tatva Analyzed';
    }
    if (calcStep3) {
      calcStep3.className = 'step-item active';
      calcStep3.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating Dosha Severity Index...';
    }
  }, 900);

  setTimeout(() => {
    // Generate realistic custom score based on inputs
    const answers = appState.lead.answers;
    let baseScore = 48;

    if (answers.entrance) baseScore += Math.min(18, answers.entrance.score);
    if (answers.kitchen) baseScore += Math.min(16, answers.kitchen.score);
    if (answers.bedroom) baseScore += Math.min(14, answers.bedroom.score);

    // Keep it in realistic dosha range (52 to 74) to prompt the ₹9 remedy purchase
    const finalScore = Math.min(72, Math.max(52, baseScore));
    appState.lead.totalScore = finalScore;
    appState.lead.financeScore = Math.max(42, finalScore - 8);
    appState.lead.healthScore = Math.max(45, finalScore - 12);
    appState.lead.harmonyScore = Math.min(68, finalScore + 6);

    // Update lead in storage with complete answers
    saveLeadToStorage(appState.lead);

    // Render results
    renderResults();
    switchView('step4View');

    // Show mobile sticky bar on mobile
    if (window.innerWidth <= 768) {
      const stickyCta = document.getElementById('stickyMobileCta');
      if (stickyCta) stickyCta.style.display = 'block';
    }
  }, 1900);
}

/* --------------------------------------------------------------------------
   4. STEP 4: RENDER RESULT SCORECARD & WHATSAPP LINK
   -------------------------------------------------------------------------- */
function renderResults() {
  const lead = appState.lead;
  
  // Set User Name in Headers
  const firstName = lead.name.split(' ')[0] || 'Friend';
  document.getElementById('resUserName').textContent = firstName;
  document.getElementById('modalClientName').textContent = lead.name;
  document.getElementById('modalClientPhone').textContent = '+91 ' + lead.mobile;

  // Set Score Values
  document.getElementById('finalScoreDisplay').textContent = lead.totalScore;
  document.getElementById('financePct').textContent = lead.financeScore + '%';
  document.getElementById('healthPct').textContent = lead.healthScore + '%';
  document.getElementById('harmonyPct').textContent = lead.harmonyScore + '%';

  document.getElementById('financeBar').style.width = lead.financeScore + '%';
  document.getElementById('healthBar').style.width = lead.healthScore + '%';
  document.getElementById('harmonyBar').style.width = lead.harmonyScore + '%';

  // Radial Meter Animation
  // Circumference: 2 * PI * 50 = ~314
  const offset = 314 - (314 * (lead.totalScore / 100));
  const radialMeter = document.getElementById('radialMeter');
  if (radialMeter) {
    radialMeter.style.strokeDashoffset = offset;
    if (lead.totalScore < 60) {
      radialMeter.style.stroke = '#EF4444';
      document.getElementById('scoreStatusWord').textContent = 'High Vastu Risk';
      document.getElementById('scoreStatusWord').style.color = '#B91C1C';
      document.getElementById('scoreStatusWord').style.background = '#FEE2E2';
    } else {
      radialMeter.style.stroke = '#F59E0B';
      document.getElementById('scoreStatusWord').textContent = 'Moderate Dosha';
      document.getElementById('scoreStatusWord').style.color = '#B45309';
      document.getElementById('scoreStatusWord').style.background = '#FEF3C7';
    }
  }

  // No WhatsApp or exit links rendered here prior to payment!
}

/* --------------------------------------------------------------------------
   5. ₹9 PAYMENT CHECKOUT & POST-PAYMENT HUB TRANSITION
   -------------------------------------------------------------------------- */
function initModals() {
  const btnPay9 = document.getElementById('btnPay9');
  const payModal = document.getElementById('paymentModal');
  const closePayModal = document.getElementById('closePaymentModal');

  if (btnPay9 && payModal) {
    btnPay9.addEventListener('click', () => {
      payModal.classList.add('active');
    });
  }

  if (closePayModal && payModal) {
    closePayModal.addEventListener('click', () => {
      payModal.classList.remove('active');
    });
  }

  // Admin Leads Modal
  const openAdminBtn = document.getElementById('openAdminBtn');
  const footerAdminLink = document.getElementById('footerAdminLink');
  const adminModal = document.getElementById('adminModal');
  const closeAdminModal = document.getElementById('closeAdminModal');

  function openAdmin() {
    renderLeadsTable();
    adminModal.classList.add('active');
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openAdmin);
  if (footerAdminLink) {
    footerAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      openAdmin();
    });
  }

  if (closeAdminModal && adminModal) {
    closeAdminModal.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  // Export CSV button
  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) btnExportCSV.addEventListener('click', exportLeadsCSV);

  // Copy JSON button
  const btnCopyJSON = document.getElementById('btnCopyJSON');
  if (btnCopyJSON) btnCopyJSON.addEventListener('click', copyLeadsJSON);

  // Clear Leads button
  const btnClearLeads = document.getElementById('btnClearLeads');
  if (btnClearLeads) btnClearLeads.addEventListener('click', clearAllLeads);
}

// Global direct trigger for sticky mobile button
window.openPaymentModalDirect = function() {
  const payModal = document.getElementById('paymentModal');
  if (payModal) payModal.classList.add('active');
};

// Simulate UPI / Payment Completion & Transition to Post-Payment App Hub
window.simulatePayment = function(providerName) {
  const payNowBtn = document.getElementById('btnModalPayNow');
  if (payNowBtn) {
    payNowBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing ₹9 with ${providerName}...`;
    payNowBtn.disabled = true;
  }

  const bookingId = 'CA-' + Math.floor(10000 + Math.random() * 90000);

  setTimeout(() => {
    // 1. Mark as paid in state & storage
    appState.lead.paid = true;
    appState.lead.bookingId = bookingId;
    saveLeadToStorage(appState.lead);
    updateLeadsBadge();

    // 2. Hide modal
    const payModal = document.getElementById('paymentModal');
    if (payModal) payModal.classList.remove('active');

    // 3. Hide sticky bottom payment bar
    const stickyCta = document.getElementById('stickyMobileCta');
    if (stickyCta) stickyCta.style.display = 'none';

    // 4. Populate Step 5 (The Post-Payment Success & App Download Hub)
    const firstName = appState.lead.name.split(' ')[0] || 'Friend';
    const hubUserName = document.getElementById('successHubUserName');
    const hubBookingId = document.getElementById('successHubBookingId');
    const btnPostWa = document.getElementById('btnPostWhatsApp');

    if (hubUserName) hubUserName.textContent = firstName;
    if (hubBookingId) hubBookingId.textContent = '#' + bookingId;

    if (btnPostWa) {
      const waMsg = encodeURIComponent(
        `Namaste Call Astro! My name is ${appState.lead.name}. I have paid ₹9 for my Home Vastu Consultation (Booking ID: #${bookingId}). My Vastu Score is ${appState.lead.totalScore}/100. Please share my consultation time with the Senior Astrologer.`
      );
      btnPostWa.href = `https://wa.me/919999999999?text=${waMsg}`;
    }

    // 5. Reveal Step 5 View and scroll up smoothly
    switchView('step5View');

  }, 1200);
};

// Download Vastu Report Summary
window.downloadVastuReportPDF = function() {
  const lead = appState.lead;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to download your Vastu Report");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Call Astro - Vastu Consultation Report #${lead.bookingId || 'CA-78192'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1E293B; line-height: 1.6; }
        .header { border-bottom: 2px solid #EEB100; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { color: #1A2E51; margin: 0; font-size: 24px; }
        .score-box { background: #FFF8EB; border: 1px solid #FDE68A; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
        .score-val { font-size: 32px; font-weight: bold; color: #B45309; }
        .section-title { color: #1A2E51; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .footer { margin-top: 40px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>CALL ASTRO - VASTU DOSHA & REMEDY REPORT</h1>
          <p>Verified Vedic Astrology & Vastu Consultation</p>
        </div>
        <div>
          <strong>Booking ID:</strong> #${lead.bookingId || 'CA-78192'}<br>
          <strong>Date:</strong> ${lead.timestamp || new Date().toLocaleDateString()}
        </div>
      </div>

      <p><strong>Client Name:</strong> ${lead.name} | <strong>Mobile:</strong> +91 ${lead.mobile} | <strong>Property:</strong> ${lead.propertyType}</p>

      <div class="score-box">
        <div class="score-val">Home Vastu Health Score: ${lead.totalScore || 58} / 100</div>
        <p>Status: Moderate to High Elemental Vastu Imbalance Detected.</p>
      </div>

      <h3 class="section-title">1. Directional Audit Summary</h3>
      <ul>
        <li><strong>Main Entrance:</strong> ${lead.answers?.entrance?.selection || 'Audited'}</li>
        <li><strong>Kitchen Location:</strong> ${lead.answers?.kitchen?.selection || 'Audited'}</li>
        <li><strong>Master Bedroom:</strong> ${lead.answers?.bedroom?.selection || 'Audited'}</li>
        <li><strong>Primary Issue:</strong> ${lead.answers?.issue?.selection || 'Elemental disharmony'}</li>
      </ul>

      <h3 class="section-title">2. Certified Vedic Remedies (Zero Demolition)</h3>
      <ul>
        <li><strong>Agni Balance (SE Zone):</strong> Install Copper Energy Helix or Brass Swastik on the southern border to arrest unexpected cash drain.</li>
        <li><strong>Kubera Wealth Alignment (North):</strong> Keep North-East zone clutter-free. Use green plants or running water fountain to activate wealth influx.</li>
        <li><strong>Geopathic Stability (SW Zone):</strong> Place Lead / Yellow Jasper pyramid in master bedroom to eliminate sleep restlessness and marital friction.</li>
      </ul>

      <div class="footer">
        <p>Call Astro • www.call-astro.com • Available on Google Play Store</p>
      </div>
      <script>window.onload = function() { window.print(); }<\/script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

/* --------------------------------------------------------------------------
   6. LEAD STORAGE & CSV EXPORT (Zero Data Loss)
   -------------------------------------------------------------------------- */
function getAllLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Storage error:", err);
    return [];
  }
}

function saveLeadToStorage(leadObj) {
  try {
    const list = getAllLeads();
    const existingIndex = list.findIndex(item => item.id === leadObj.id);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...leadObj };
    } else {
      list.unshift({ ...leadObj });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    updateLeadsBadge();

    // NOTE: Optional Webhook integration:
    // If you have a Google Sheets Webhook or CRM URL, you can send it here:
    /*
    fetch('https://your-crm-webhook.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadObj)
    }).catch(e => console.log('Webhook dispatched'));
    */
  } catch (err) {
    console.error("Error saving lead:", err);
  }
}

function updateLeadsBadge() {
  const leads = getAllLeads();
  const badge = document.getElementById('leadsBadge');
  if (badge) badge.textContent = leads.length;
}

function renderLeadsTable() {
  const tbody = document.getElementById('leadsTableBody');
  const leads = getAllLeads();

  if (!tbody) return;

  if (leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 20px;">No leads captured yet. Test by submitting the form above!</td></tr>`;
    return;
  }

  tbody.innerHTML = leads.map(l => `
    <tr>
      <td>${l.timestamp || '-'}</td>
      <td><strong>${escapeHtml(l.name || '')}</strong></td>
      <td><a href="tel:${l.mobile}" style="color:#0284C7; font-weight:600;">+91 ${l.mobile || ''}</a></td>
      <td>${escapeHtml(l.email || '')}</td>
      <td>${escapeHtml(l.propertyType || '')}</td>
      <td><span style="font-weight:700; color:${l.totalScore < 60 ? '#DC2626' : '#D97706'};">${l.totalScore || '-'} / 100</span></td>
      <td>${l.paid ? '<span style="color:#16A34A; font-weight:700;">✅ Paid ₹9</span>' : '<span style="color:#9CA3AF;">Pending</span>'}</td>
    </tr>
  `).join('');
}

function exportLeadsCSV() {
  const leads = getAllLeads();
  if (leads.length === 0) {
    alert("No leads available to export!");
    return;
  }

  const headers = ["ID", "Timestamp", "Name", "Mobile", "Email", "Property Type", "Entrance", "Kitchen", "Bedroom", "Current Issue", "Vastu Score", "Paid ₹9"];
  const rows = leads.map(l => [
    `"${l.id || ''}"`,
    `"${l.timestamp || ''}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${l.mobile || ''}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${l.propertyType || ''}"`,
    `"${(l.answers?.entrance?.selection || '').replace(/"/g, '""')}"`,
    `"${(l.answers?.kitchen?.selection || '').replace(/"/g, '""')}"`,
    `"${(l.answers?.bedroom?.selection || '').replace(/"/g, '""')}"`,
    `"${(l.answers?.issue?.selection || '').replace(/"/g, '""')}"`,
    `"${l.totalScore || ''}"`,
    `"${l.paid ? 'YES' : 'NO'}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `call_astro_vastu_leads_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyLeadsJSON() {
  const leads = getAllLeads();
  navigator.clipboard.writeText(JSON.stringify(leads, null, 2)).then(() => {
    alert("Copied " + leads.length + " leads to clipboard!");
  }).catch(() => {
    alert("Failed to copy leads to clipboard.");
  });
}

function clearAllLeads() {
  if (confirm("Are you sure you want to clear all stored leads? This cannot be undone.")) {
    localStorage.removeItem(STORAGE_KEY);
    renderLeadsTable();
    updateLeadsBadge();
  }
}

/* --------------------------------------------------------------------------
   7. UTILITIES & FAQ ACCORDION
   -------------------------------------------------------------------------- */
function switchView(viewId) {
  document.querySelectorAll('.step-view').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    // Smooth scroll into view
    const funnelCard = document.getElementById('funnelCard');
    if (funnelCard) {
      funnelCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

function initKeyboardShortcuts() {
  // Shortcut: Ctrl + Shift + L opens leads dashboard
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
      const adminModal = document.getElementById('adminModal');
      if (adminModal) {
        renderLeadsTable();
        adminModal.classList.add('active');
      }
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
