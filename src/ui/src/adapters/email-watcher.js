// ============================================
// Tracebit Email Auto Watcher
// Automatically scans emails as they open
// No manual scanning needed
// Sidebar slides in instantly when risk found
// Works on Gmail, Outlook, Yahoo Mail
// ============================================

import { analyzeEmailFile } from './document.js'
import { scanForFraud } from './news.js'
import { cleanText } from '../core/chunker.js'
import { Detector } from '../core/detector.js'

const detector = new Detector()

// ============================================
// ALREADY SCANNED TRACKER
// Prevents scanning the same email twice
// ============================================

const scannedEmails = new Set()

// ============================================
// AUTO SCAN ENGINE
// Reads the open email and runs full analysis
// Returns result and triggers sidebar
// ============================================

async function autoScanOpenEmail(emailElement) {
  if (!emailElement) return null

  // Create unique ID for this email
  const emailId = emailElement.innerText
    .slice(0, 100)
    .trim()

  // Skip if already scanned
  if (scannedEmails.has(emailId)) return null
  scannedEmails.add(emailId)

  // Extract full email text
  const text = cleanText(
    emailElement.innerText || 
    emailElement.textContent || 
    ''
  )

  if (!text || text.length < 30) return null

  // Run all checks simultaneously
  const [fraudResult, aiResult] = 
    await Promise.all([
      Promise.resolve(scanForFraud(text)),
      detector.analyze(text)
    ])

  const emailAnalysis = analyzeEmailFile(text)

  // Calculate overall risk
  const scores = [
    fraudResult?.fraudScore || 0,
    aiResult?.score || 0,
    emailAnalysis?.fraudScore || 0
  ]

  const overallRisk = Math.round(
    Math.max(...scores) * 0.6 +
    (scores.reduce(
      (a, b) => a + b, 0
    ) / scores.length) * 0.4
  )

  const result = {
    overallRisk,
    isFraud: overallRisk >= 60,
    isSuspicious: overallRisk >= 35,
    fraudResult,
    aiResult,
    emailAnalysis,
    text,
    verdict:
      overallRisk >= 75 ? 'fraudulent' :
      overallRisk >= 60 ? 'highly-suspicious' :
      overallRisk >= 35 ? 'suspicious' :
      'clean',
    recommendation:
      overallRisk >= 60
        ? 'This email shows strong signs ' +
          'of fraud or phishing. Do not ' +
          'click any links or reply.'
        : overallRisk >= 35
        ? 'This email has suspicious signals. ' +
          'Verify the sender before responding.'
        : 'This email appears legitimate.',
    timestamp: new Date().toISOString()
  }

  // Automatically trigger sidebar if suspicious
  if (overallRisk >= 35) {
    triggerAutoAlert(result, emailElement)
  }

  return result
}

// ============================================
// AUTO ALERT
// Slides in the sidebar automatically
// Shows clear warning at top of email
// ============================================

function triggerAutoAlert(result, emailElement) {
  const risk = result.overallRisk

  // Color based on risk level
  const colors = {
    high: {
      bg: 'rgba(226,75,74,0.12)',
      border: '#E24B4A',
      text: '#F09595',
      icon: '⚠'
    },
    medium: {
      bg: 'rgba(239,159,39,0.12)',
      border: '#EF9F27',
      text: '#FAC775',
      icon: '!'
    }
  }

  const theme = risk >= 60 
    ? colors.high 
    : colors.medium

  // Create warning banner above email
  const banner = document.createElement('div')
  banner.setAttribute(
    'data-tracebit-banner', 'true'
  )
  banner.style.cssText = `
    background: ${theme.bg};
    border: 1px solid ${theme.border};
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 12px;
    font-family: -apple-system, sans-serif;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
  `

  // All signals found across all checks
  const allSignals = [
    ...(result.fraudResult?.patterns || []),
    ...(result.emailAnalysis?.signals || [])
  ].slice(0, 3)

  banner.innerHTML = `
    <span style="
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    ">${theme.icon}</span>
    <div style="flex: 1;">
      <div style="
        font-size: 13px;
        font-weight: 600;
        color: ${theme.text};
        margin-bottom: 4px;
      ">
        Tracebit: ${
          risk >= 60 
            ? 'Fraud Risk Detected' 
            : 'Suspicious Email Detected'
        }
      </div>
      <div style="
        font-size: 11px;
        color: rgba(255,255,255,0.5);
        margin-bottom: 6px;
        line-height: 1.4;
      ">
        ${result.recommendation}
      </div>
      ${allSignals.length > 0 ? `
        <div style="
          font-size: 10px;
          color: rgba(255,255,255,0.3);
        ">
          ${allSignals.map(s => 
            `• ${s}`
          ).join(' ')}
        </div>
      ` : ''}
      <div style="
        font-size: 11px;
        color: ${theme.text};
        margin-top: 8px;
        opacity: 0.7;
      ">
        Tap for full analysis →
      </div>
    </div>
    <div style="
      font-size: 12px;
      font-weight: 600;
      color: ${theme.text};
      background: ${theme.bg};
      border: 1px solid ${theme.border};
      padding: 4px 10px;
      border-radius: 20px;
      flex-shrink: 0;
    ">
      ${risk}%
    </div>
  `

  // Clicking banner opens full sidebar
  banner.addEventListener('click', () => {
    window.traceBitSidebar?.open(result)
  })

  // Insert banner at top of email
  emailElement.insertBefore(
    banner,
    emailElement.firstChild
  )

  // Also auto open sidebar for high risk
  if (risk >= 60) {
    setTimeout(() => {
      window.traceBitSidebar?.open(result)
    }, 500)
  }
}

// ============================================
// GMAIL WATCHER
// Detects when user opens any email in Gmail
// Automatically scans it immediately
// ============================================

export function watchGmail() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue

          // Gmail email body containers
          const emailBodies = node.querySelectorAll(
            '[data-message-id], ' +
            '.a3s.aiL, ' +
            '.ii.gt, ' +
            '[role="listitem"] .gs'
          )

          for (const body of emailBodies) {
            if (body.dataset.traceBitScanned) {
              continue
            }
            body.dataset.traceBitScanned = 'true'

            // Small delay to let email fully load
            await new Promise(r => setTimeout(r, 800))
            await autoScanOpenEmail(body)
          }
        }
      }
    }
  )

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log('Tracebit watching Gmail')
  return observer
}

// ============================================
// OUTLOOK WATCHER
// Works on outlook.com and outlook.live.com
// ============================================

export function watchOutlook() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue

          const emailBodies = node.querySelectorAll(
            '[class*="ReadingPaneContent"], ' +
            '[class*="messageBody"], ' +
            '[class*="EmailBody"], ' +
            'div[role="document"]'
          )

          for (const body of emailBodies) {
            if (body.dataset.traceBitScanned) {
              continue
            }
            body.dataset.traceBitScanned = 'true'

            await new Promise(
              r => setTimeout(r, 800)
            )
            await autoScanOpenEmail(body)
          }
        }
      }
    }
  )

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log('Tracebit watching Outlook')
  return observer
}

// ============================================
// YAHOO MAIL WATCHER
// ============================================

export function watchYahooMail() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue

          const emailBodies = node.querySelectorAll(
            '[data-test-id="message-body"], ' +
            '.yk-message-body, ' +
            '[class*="message-content"]'
          )

          for (const body of emailBodies) {
            if (body.dataset.traceBitScanned) {
              continue
            }
            body.dataset.traceBitScanned = 'true'

            await new Promise(
              r => setTimeout(r, 800)
            )
            await autoScanOpenEmail(body)
          }
        }
      }
    }
  )

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log('Tracebit watching Yahoo Mail')
  return observer
}

// ============================================
// AUTO DETECT EMAIL PLATFORM
// Figures out which email app is open
// and starts the right watcher automatically
// ============================================

export function watchEmails() {
  const hostname = window.location.hostname

  if (hostname.includes('mail.google') ||
      hostname.includes('gmail')) {
    return watchGmail()
  }

  if (hostname.includes('outlook') ||
      hostname.includes('hotmail') ||
      hostname.includes('live.com')) {
    return watchOutlook()
  }

  if (hostname.includes('yahoo')) {
    return watchYahooMail()
  }

  // Generic fallback for any email client
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue

          // Generic email content selectors
          const emailBodies = node.querySelectorAll(
            '[role="document"], ' +
            '[class*="email-body"], ' +
            '[class*="message-body"], ' +
            '[class*="mail-content"]'
          )

          for (const body of emailBodies) {
            if (body.dataset.traceBitScanned) {
              continue
            }
            body.dataset.traceBitScanned = 'true'

            await new Promise(
              r => setTimeout(r, 800)
            )
            await autoScanOpenEmail(body)
          }
        }
      }
    }
  )

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log(
    'Tracebit watching generic email client'
  )
  return observer
}
