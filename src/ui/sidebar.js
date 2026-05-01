// ============================================
// Tracebit Sidebar
// The most advanced AI detection sidebar
// ever built for a browser extension
// Slides in on any platform instantly
// Shows full breakdown, fraud alerts,
// sentence analysis and real time scoring
// ============================================

const SIDEBAR_ID = 'tracebit-sidebar-root'
const STYLES_ID = 'tracebit-sidebar-styles'

// ============================================
// INJECT STYLES
// All sidebar styles injected into the page
// Works on every website automatically
// ============================================

function injectStyles() {
  if (document.getElementById(STYLES_ID)) return

  const style = document.createElement('style')
  style.id = STYLES_ID
  style.textContent = `
    #tracebit-sidebar-root {
      position: fixed;
      top: 0;
      right: -420px;
      width: 380px;
      height: 100vh;
      background: #0A0A0F;
      border-left: 1px solid rgba(255,255,255,0.08);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 
        'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      transition: right 0.4s cubic-bezier(0.16,1,0.3,1);
      box-shadow: -20px 0 60px rgba(0,0,0,0.5);
      overflow: hidden;
    }

    #tracebit-sidebar-root.open {
      right: 0;
    }

    .tb-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0D0D14;
      flex-shrink: 0;
    }

    .tb-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tb-logo-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(
        135deg, #E24B4A, #9333EA
      );
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .tb-logo-text {
      font-size: 15px;
      font-weight: 600;
      color: #FFFFFF;
      letter-spacing: -0.3px;
    }

    .tb-logo-version {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      font-weight: 400;
    }

    .tb-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .tb-close:hover {
      background: rgba(226,75,74,0.2);
      color: #E24B4A;
    }

    .tb-score-section {
      padding: 24px 20px;
      background: #0D0D14;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .tb-score-ring-wrap {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .tb-ring-container {
      position: relative;
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }

    .tb-ring-container svg {
      transform: rotate(-90deg);
    }

    .tb-ring-number {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .tb-ring-score {
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1;
    }

    .tb-ring-label {
      font-size: 9px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tb-verdict-wrap {
      flex: 1;
    }

    .tb-verdict-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
    }

    .tb-verdict-badge.ai-generated {
      background: rgba(226,75,74,0.15);
      color: #F09595;
      border: 1px solid rgba(226,75,74,0.3);
    }

    .tb-verdict-badge.likely-ai {
      background: rgba(239,159,39,0.15);
      color: #FAC775;
      border: 1px solid rgba(239,159,39,0.3);
    }

    .tb-verdict-badge.uncertain {
      background: rgba(99,153,34,0.15);
      color: #C0DD97;
      border: 1px solid rgba(99,153,34,0.3);
    }

    .tb-verdict-badge.human {
      background: rgba(29,158,117,0.15);
      color: #5DCAA5;
      border: 1px solid rgba(29,158,117,0.3);
    }

    .tb-verdict-badge.error {
      background: rgba(136,135,128,0.15);
      color: #B4B2A9;
      border: 1px solid rgba(136,135,128,0.3);
    }

    .tb-verdict-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: tb-pulse 2s infinite;
    }

    @keyframes tb-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .tb-site-label {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
    }

    .tb-site-name {
      font-size: 13px;
      color: rgba(255,255,255,0.6);
      font-weight: 500;
    }

    .tb-signals {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .tb-signal-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 10px 12px;
    }

    .tb-signal-name {
      font-size: 10px;
      color: rgba(255,255,255,0.35);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .tb-signal-value {
      font-size: 20px;
      font-weight: 600;
      color: #FFFFFF;
      line-height: 1;
      margin-bottom: 6px;
    }

    .tb-signal-bar {
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    .tb-signal-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.8s ease;
    }

    .tb-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
      background: #0D0D14;
    }

    .tb-tab {
      flex: 1;
      padding: 12px 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.35);
      text-align: center;
      cursor: pointer;
      border: none;
      background: transparent;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      font-weight: 500;
    }

    .tb-tab.active {
      color: #FFFFFF;
      border-bottom-color: #E24B4A;
    }

    .tb-tab:hover {
      color: rgba(255,255,255,0.7);
      background: rgba(255,255,255,0.03);
    }

    .tb-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .tb-content::-webkit-scrollbar {
      width: 4px;
    }

    .tb-content::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
    }

    .tb-tab-panel {
      display: none;
    }

    .tb-tab-panel.active {
      display: block;
    }

    .tb-sentence {
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid rgba(255,255,255,0.04);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .tb-sentence:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.1);
    }

    .tb-sentence-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .tb-sentence-score {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .tb-sentence-score.high {
      background: rgba(226,75,74,0.2);
      color: #F09595;
    }

    .tb-sentence-score.med {
      background: rgba(239,159,39,0.2);
      color: #FAC775;
    }

    .tb-sentence-score.low {
      background: rgba(250,199,117,0.2);
      color: #FAC775;
    }

    .tb-sentence-score.clean {
      background: rgba(29,158,117,0.2);
      color: #5DCAA5;
    }

    .tb-sentence-reason {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
    }

    .tb-sentence-text {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      line-height: 1.5;
    }

    .tb-fraud-alert {
      background: rgba(226,75,74,0.08);
      border: 1px solid rgba(226,75,74,0.25);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }

    .tb-fraud-title {
      font-size: 13px;
      font-weight: 600;
      color: #F09595;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tb-fraud-risk {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 8px;
    }

    .tb-fraud-pattern {
      display: inline-block;
      background: rgba(226,75,74,0.15);
      color: #F09595;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      margin: 2px;
    }

    .tb-empty {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255,255,255,0.25);
      font-size: 13px;
      line-height: 1.6;
    }

    .tb-empty-icon {
      font-size: 32px;
      margin-bottom: 12px;
      display: block;
      opacity: 0.4;
    }

    .tb-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: #0D0D14;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tb-footer-text {
      font-size: 11px;
      color: rgba(255,255,255,0.2);
    }

    .tb-footer-link {
      font-size: 11px;
      color: rgba(226,75,74,0.6);
      text-decoration: none;
      cursor: pointer;
    }

    .tb-footer-link:hover {
      color: #E24B4A;
    }

    .tb-scan-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(
        135deg, 
        rgba(226,75,74,0.8), 
        rgba(147,51,234,0.8)
      );
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 12px;
      transition: all 0.2s;
      letter-spacing: 0.3px;
    }

    .tb-scan-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(226,75,74,0.3);
    }

    .tb-scan-btn:active {
      transform: translateY(0);
    }

    .tb-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px;
      color: rgba(255,255,255,0.4);
      font-size: 13px;
    }

    .tb-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.1);
      border-top-color: #E24B4A;
      border-radius: 50%;
      animation: tb-spin 0.8s linear infinite;
    }

    @keyframes tb-spin {
      to { transform: rotate(360deg); }
    }

    .tb-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .tb-stat-label {
      font-size: 12px;
      color: rgba(255,255,255,0.35);
    }

    .tb-stat-value {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.7);
    }

    .tb-toggle-btn {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 80px;
      background: #E24B4A;
      border: none;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: vertical-rl;
      color: white;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      transition: all 0.3s;
      font-family: -apple-system, sans-serif;
      box-shadow: -4px 0 20px rgba(226,75,74,0.4);
    }

    .tb-toggle-btn:hover {
      width: 42px;
      background: #C93635;
    }
  `

  document.head.appendChild(style)
}

// ============================================
// BUILD THE SIDEBAR HTML STRUCTURE
// ============================================

function buildSidebar() {
  const sidebar = document.createElement('div')
  sidebar.id = SIDEBAR_ID

  sidebar.innerHTML = `
    <div class="tb-header">
      <div class="tb-logo">
        <div class="tb-logo-icon">T</div>
        <div>
          <div class="tb-logo-text">Tracebit</div>
          <div class="tb-logo-version">
            AI Detection Engine v1.0
          </div>
        </div>
      </div>
      <button class="tb-close" id="tb-close-btn">
        ✕
      </button>
    </div>

    <div class="tb-score-section">
      <div class="tb-score-ring-wrap">
        <div class="tb-ring-container">
          <svg width="80" height="80" 
            viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              stroke-width="6"/>
            <circle cx="40" cy="40" r="32"
              fill="none"
              stroke="#E24B4A"
              stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="201"
              stroke-dashoffset="201"
              id="tb-ring-progress"/>
          </svg>
          <div class="tb-ring-number">
            <span class="tb-ring-score" 
              id="tb-score-num">--</span>
            <span class="tb-ring-label">score</span>
          </div>
        </div>
        <div class="tb-verdict-wrap">
          <div class="tb-verdict-badge uncertain"
            id="tb-verdict-badge">
            <span class="tb-verdict-dot"></span>
            <span id="tb-verdict-text">
              Awaiting scan
            </span>
          </div>
          <div class="tb-site-label">
            Scanning
          </div>
          <div class="tb-site-name" 
            id="tb-site-name">
            ${window.location.hostname}
          </div>
        </div>
      </div>

      <div class="tb-signals" id="tb-signals">
        ${buildSignalCard(
          'Sentence Flow', '--', 0, '#E24B4A'
        )}
        ${buildSignalCard(
          'Vocabulary', '--', 0, '#EF9F27'
        )}
        ${buildSignalCard(
          'Perplexity', '--', 0, '#9333EA'
        )}
        ${buildSignalCard(
          'Burstiness', '--', 0, '#1D9E75'
        )}
      </div>
    </div>

    <div class="tb-tabs">
      <button class="tb-tab active" 
        data-tab="overview">Overview</button>
      <button class="tb-tab" 
        data-tab="sentences">Sentences</button>
      <button class="tb-tab" 
        data-tab="fraud">Fraud Check</button>
      <button class="tb-tab" 
        data-tab="info">Info</button>
    </div>

    <div class="tb-content">

      <div class="tb-tab-panel active" 
        id="tb-panel-overview">
        <button class="tb-scan-btn" 
          id="tb-scan-page-btn">
          Scan This Page Now
        </button>
        <div id="tb-overview-content">
          <div class="tb-empty">
            <span class="tb-empty-icon">⬡</span>
            Press scan to analyze this page
            for AI generated content and
            fraud patterns
          </div>
        </div>
      </div>

      <div class="tb-tab-panel" 
        id="tb-panel-sentences">
        <div id="tb-sentences-list">
          <div class="tb-empty">
            <span class="tb-empty-icon">⬡</span>
            Sentence analysis will appear
            here after scanning
          </div>
        </div>
      </div>

      <div class="tb-tab-panel" 
        id="tb-panel-fraud">
        <div id="tb-fraud-content">
          <div class="tb-empty">
            <span class="tb-empty-icon">⬡</span>
            Fraud and scam pattern detection
            will appear here after scanning
          </div>
        </div>
      </div>

      <div class="tb-tab-panel" 
        id="tb-panel-info">
        <div class="tb-stat-row">
          <span class="tb-stat-label">
            Framework
          </span>
          <span class="tb-stat-value">
            Tracebit v1.0
          </span>
        </div>
        <div class="tb-stat-row">
          <span class="tb-stat-label">
            Detection engine
          </span>
          <span class="tb-stat-value">
            Claude AI
          </span>
        </div>
        <div class="tb-stat-row">
          <span class="tb-stat-label">
            Platform
          </span>
          <span class="tb-stat-value" 
            id="tb-platform-name">
            ${detectPlatform()}
          </span>
        </div>
        <div class="tb-stat-row">
          <span class="tb-stat-label">
            Page title
          </span>
          <span class="tb-stat-value">
            ${document.title.slice(0, 30)}...
          </span>
        </div>
        <div class="tb-stat-row">
          <span class="tb-stat-label">
            License
          </span>
          <span class="tb-stat-value">
            MIT — Open Source
          </span>
        </div>
      </div>

    </div>

    <div class="tb-footer">
      <span class="tb-footer-text">
        Powered by Tracebit
      </span>
      <a class="tb-footer-link" 
        href="https://github.com/simon39soft/tracebit"
        target="_blank">
        GitHub ↗
      </a>
    </div>
  `

  return sidebar
}

function buildSignalCard(
  name, value, percent, color
) {
  return `
    <div class="tb-signal-card">
      <div class="tb-signal-name">${name}</div>
      <div class="tb-signal-value">${value}</div>
      <div class="tb-signal-bar">
        <div class="tb-signal-fill" 
          style="width:${percent}%;
          background:${color}">
        </div>
      </div>
    </div>
  `
}

function detectPlatform() {
  const host = window.location.hostname
  if (host.includes('tiktok')) return 'TikTok'
  if (host.includes('instagram')) return 'Instagram'
  if (host.includes('facebook')) return 'Facebook'
  if (host.includes('twitter') || 
      host.includes('x.com')) return 'X'
  if (host.includes('linkedin')) return 'LinkedIn'
  if (host.includes('whatsapp')) return 'WhatsApp'
  return 'Web Article'
}

// ============================================
// TOGGLE BUTTON — the red tab on the right
// edge of every page that opens the sidebar
// ============================================

function buildToggleButton() {
  const btn = document.createElement('button')
  btn.className = 'tb-toggle-btn'
  btn.id = 'tb-toggle-btn'
  btn.innerText = 'AI'
  return btn
}

// ============================================
// UPDATE SIDEBAR WITH SCAN RESULTS
// Called after detection runs on the page
// ============================================

function updateWithResults(data) {
  if (!data) return

  const score = data.score || 0
  const verdict = data.verdict || 'uncertain'

  // Update score ring
  const progress = document.getElementById(
    'tb-ring-progress'
  )
  if (progress) {
    const offset = 201 - (201 * score / 100)
    progress.style.strokeDashoffset = offset

    const ringColor = 
      score >= 80 ? '#E24B4A' :
      score >= 60 ? '#EF9F27' :
      score >= 40 ? '#639922' :
      '#1D9E75'

    progress.setAttribute('stroke', ringColor)
  }

  // Update score number
  const scoreNum = document.getElementById(
    'tb-score-num'
  )
  if (scoreNum) {
    animateNumber(scoreNum, 0, score, 800)
  }

  // Update verdict badge
  const badge = document.getElementById(
    'tb-verdict-badge'
  )
  const verdictText = document.getElementById(
    'tb-verdict-text'
  )

  if (badge && verdictText) {
    badge.className = 
      `tb-verdict-badge ${verdict}`
    verdictText.innerText = 
      verdict === 'ai-generated' 
        ? 'AI Generated' :
      verdict === 'likely-ai' 
        ? 'Likely AI' :
      verdict === 'uncertain' 
        ? 'Uncertain' :
      verdict === 'human' 
        ? 'Human Written' :
      'Unknown'
  }

  // Update signal cards
  const signals = data.signals || {}
  const signalsEl = document.getElementById(
    'tb-signals'
  )
  if (signalsEl) {
    signalsEl.innerHTML = `
      ${buildSignalCard(
        'Sentence Flow',
        signals.sentenceFlow || '--',
        signals.sentenceFlow || 0,
        '#E24B4A'
      )}
      ${buildSignalCard(
        'Vocabulary',
        signals.vocabulary || '--',
        signals.vocabulary || 0,
        '#EF9F27'
      )}
      ${buildSignalCard(
        'Perplexity',
        signals.perplexity || '--',
        signals.perplexity || 0,
        '#9333EA'
      )}
      ${buildSignalCard(
        'Burstiness',
        signals.burstiness || '--',
        signals.burstiness || 0,
        '#1D9E75'
      )}
    `
  }

  // Update overview stats
  const overview = document.getElementById(
    'tb-overview-content'
  )
  if (overview) {
    overview.innerHTML = `
      <div class="tb-stat-row">
        <span class="tb-stat-label">
          Overall score
        </span>
        <span class="tb-stat-value">
          ${score}/100
        </span>
      </div>
      <div class="tb-stat-row">
        <span class="tb-stat-label">
          Verdict
        </span>
        <span class="tb-stat-value">
          ${verdictText?.innerText || verdict}
        </span>
      </div>
      <div class="tb-stat-row">
        <span class="tb-stat-label">
          Sentences analyzed
        </span>
        <span class="tb-stat-value">
          ${data.sentences?.length || 0}
        </span>
      </div>
      <div class="tb-stat-row">
        <span class="tb-stat-label">
          Scanned at
        </span>
        <span class="tb-stat-value">
          ${new Date().toLocaleTimeString()}
        </span>
      </div>
    `
  }

  // Update sentences tab
  const sentencesList = document.getElementById(
    'tb-sentences-list'
  )
  if (sentencesList && data.sentences) {
    sentencesList.innerHTML = data.sentences
      .map(s => {
        const color = 
          s.score >= 80 ? 'high' :
          s.score >= 60 ? 'med' :
          s.score >= 40 ? 'low' :
          'clean'

        return `
          <div class="tb-sentence">
            <div class="tb-sentence-header">
              <span class="tb-sentence-score 
                ${color}">
                ${s.score}%
              </span>
              <span class="tb-sentence-reason">
                ${s.reason || ''}
              </span>
            </div>
            <div class="tb-sentence-text">
              ${s.text?.slice(0, 120)}...
            </div>
          </div>
        `
      })
      .join('')
  }

  // Update fraud tab
  const fraudContent = document.getElementById(
    'tb-fraud-content'
  )
  if (fraudContent) {
    if (
      data.fraudResult && 
      data.fraudResult.isFraud
    ) {
      fraudContent.innerHTML = `
        <div class="tb-fraud-alert">
          <div class="tb-fraud-title">
            ⚠ Fraud Risk Detected
          </div>
          <div class="tb-fraud-risk">
            Risk level: 
            ${data.fraudResult.verdict
              ?.toUpperCase()}
            — Score: 
            ${data.fraudResult.fraudScore}/100
          </div>
          <div>
            ${data.fraudResult.patterns
              ?.map(p => `
                <span class="tb-fraud-pattern">
                  ${p}
                </span>
              `).join('') || ''
            }
          </div>
        </div>
      `
    } else {
      fraudContent.innerHTML = `
        <div class="tb-empty">
          <span class="tb-empty-icon">✓</span>
          No fraud or scam patterns detected
          in this content
        </div>
      `
    }
  }
}

// ============================================
// ANIMATE NUMBER — counts up smoothly
// from 0 to the final score
// ============================================

function animateNumber(el, from, to, duration) {
  const start = performance.now()
  const update = (time) => {
    const progress = Math.min(
      (time - start) / duration, 1
    )
    const eased = 1 - Math.pow(1 - progress, 3)
    el.innerText = Math.round(
      from + (to - from) * eased
    )
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

// ============================================
// SIDEBAR CONTROLLER
// The main object exported for use everywhere
// ============================================

export const Sidebar = {

  isOpen: false,
  element: null,
  toggleBtn: null,

  init() {
    if (document.getElementById(SIDEBAR_ID)) return

    injectStyles()

    this.element = buildSidebar()
    this.toggleBtn = buildToggleButton()

    document.body.appendChild(this.element)
    document.body.appendChild(this.toggleBtn)

    this.bindEvents()

    // Store reference globally so adapters
    // can open sidebar from anywhere
    window.traceBitSidebar = this
  },

  bindEvents() {
    // Close button
    document.getElementById('tb-close-btn')
      ?.addEventListener('click', () => {
        this.close()
      })

    // Toggle button on page edge
    document.getElementById('tb-toggle-btn')
      ?.addEventListener('click', () => {
        this.isOpen ? this.close() : this.open()
      })

    // Tab switching
    document.querySelectorAll('.tb-tab')
      .forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab

          document.querySelectorAll('.tb-tab')
            .forEach(t => t.classList
              .remove('active'))

          document.querySelectorAll(
            '.tb-tab-panel'
          ).forEach(p => p.classList
            .remove('active'))

          tab.classList.add('active')

          document.getElementById(
            `tb-panel-${target}`
          )?.classList.add('active')
        })
      })

    // Scan page button
    document.getElementById('tb-scan-page-btn')
      ?.addEventListener('click', async () => {
        this.showLoading()
        
        // Dynamically import scanner
        const { scanArticle } = await import(
          '../adapters/news.js'
        )
        const result = await scanArticle()
        
        if (result) {
          this.update(result)
        } else {
          this.showError(
            'Could not scan this page. ' +
            'Try on a news article or blog post.'
          )
        }
      })

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  },

  open(data) {
    this.element?.classList.add('open')
    this.isOpen = true

    if (data) {
      updateWithResults(data)
    }
  },

  close() {
    this.element?.classList.remove('open')
    this.isOpen = false
  },

  update(data) {
    updateWithResults(data)
  },

  showLoading() {
    const overview = document.getElementById(
      'tb-overview-content'
    )
    if (overview) {
      overview.innerHTML = `
        <div class="tb-loading">
          <div class="tb-spinner"></div>
          Analyzing page content...
        </div>
      `
    }
  },

  showError(message) {
    const overview = document.getElementById(
      'tb-overview-content'
    )
    if (overview) {
      overview.innerHTML = `
        <div class="tb-empty">
          <span class="tb-empty-icon">⚠</span>
          ${message}
        </div>
      `
    }
  }
}

// Auto initialize when loaded
Sidebar.init()
