// ============================================
// Tracebit v1.0
// Main entry point
// This is what developers import when they
// install Tracebit in their own projects
// ============================================

import { Detector, detector } from './core/detector.js'
import { 
  scoreToVerdict, 
  scoreToColor,
  averageScores,
  confidenceLabel
} from './core/scorer.js'
import { 
  chunkText, 
  extractSentences,
  extractParagraphs,
  cleanText
} from './core/chunker.js'
import {
  watchTikTok,
  watchInstagram,
  watchFacebook,
  watchX,
  watchLinkedIn,
  watchAll
} from './adapters/social.js'
import {
  scanArticle,
  watchWhatsApp,
  scanForFraud
} from './adapters/news.js'
import {
  runSecurityScan,
  detectBotSignals,
  analyzeEmail,
  validateContent,
  rateLimiter
} from './core/security.js'
import { Sidebar } from './ui/sidebar.js'

// ============================================
// THE MAIN TRACEBIT OBJECT
// This is what every developer uses
// Simple clean API over everything
// ============================================

export const tracebit = {

  version: '1.0.0',
  author: 'Tracebit Contributors',
  license: 'MIT',
  github: 'https://github.com/simon39soft/tracebit',

  // ==========================================
  // SCAN — analyze any text immediately
  // Usage: await tracebit.scan(text)
  // ==========================================

  async scan(input, config = {}) {
    // Accept either a string or a DOM element
    let text = ''

    if (typeof input === 'string') {
      text = cleanText(input)
    } else if (input instanceof Element) {
      text = cleanText(
        input.innerText || 
        input.textContent || 
        ''
      )
    } else {
      return null
    }

    // Run security check first
    const security = await runSecurityScan(text)

    if (security.blocked) {
      console.warn('Tracebit:', security.reason)
      return {
        score: null,
        verdict: 'blocked',
        reason: security.reason,
        security
      }
    }

    // Handle long content by chunking
    const chunks = chunkText(text)

    if (chunks.length === 1) {
      // Short content — single analysis
      const d = new Detector(config)
      const result = await d.analyze(text)
      return {
        ...result,
        security,
        chunks: 1
      }
    }

    // Long content — analyze all chunks
    const d = new Detector(config)
    const result = await d.analyzeMany(chunks)
    return {
      ...result,
      security,
      chunks: chunks.length
    }
  },

  // ==========================================
  // HIGHLIGHT — show heatmap on any element
  // Usage: tracebit.highlight(document.body)
  // ==========================================

  async highlight(element, config = {}) {
    if (!element) return

    const paragraphs = extractParagraphs(element)

    for (const text of paragraphs) {
      const d = new Detector(config)
      const result = await d.analyze(text)
      if (!result) continue

      // Find and highlight the element
      const elements = Array.from(
        element.querySelectorAll('p')
      ).find(
        el => cleanText(
          el.innerText
        ).includes(text.slice(0, 50))
      )

      if (elements) {
        const color = scoreToColor(result.score)
        const styles = {
          high: {
            background: 'rgba(226,75,74,0.15)',
            borderLeft: '3px solid #E24B4A'
          },
          med: {
            background: 'rgba(239,159,39,0.12)',
            borderLeft: '3px solid #EF9F27'
          },
          low: {
            background: 'rgba(250,238,218,0.3)',
            borderLeft: '3px solid #FAC775'
          },
          clean: {
            background: 'transparent',
            borderLeft: 'none'
          }
        }

        const style = styles[color]
        elements.style.background = 
          style.background
        elements.style.borderLeft = 
          style.borderLeft
        elements.style.paddingLeft = '10px'
        elements.style.transition = 
          'all 0.3s ease'
        elements.title = 
          `Tracebit: ${result.score}% AI probability`
      }
    }
  },

  // ==========================================
  // WATCH — monitor social media platforms
  // Usage: tracebit.watch('tiktok')
  // ==========================================

  watch(platform) {
    const platforms = {
      tiktok: watchTikTok,
      instagram: watchInstagram,
      facebook: watchFacebook,
      x: watchX,
      twitter: watchX,
      linkedin: watchLinkedIn,
      whatsapp: watchWhatsApp
    }

    const fn = platforms[
      platform.toLowerCase()
    ]

    if (!fn) {
      console.warn(
        `Tracebit: Unknown platform "${platform}". ` +
        `Use: tiktok, instagram, facebook, ` +
        `x, linkedin, or whatsapp`
      )
      return null
    }

    console.log(`Tracebit: Watching ${platform}`)
    return fn()
  },

  // ==========================================
  // WATCH ALL — auto detect current platform
  // Usage: tracebit.watchAll()
  // ==========================================

  watchAll() {
    return watchAll()
  },

  // ==========================================
  // SCAN ARTICLE — full page news scanner
  // Usage: await tracebit.scanArticle()
  // ==========================================

  async scanArticle() {
    return await scanArticle()
  },

  // ==========================================
  // CHECK EMAIL — analyze email content
  // Usage: tracebit.checkEmail(emailText)
  // ==========================================

  checkEmail(emailText) {
    return analyzeEmail(emailText)
  },

  // ==========================================
  // CHECK FRAUD — scan for scam patterns
  // Usage: tracebit.checkFraud(text)
  // ==========================================

  checkFraud(text) {
    return scanForFraud(text)
  },

  // ==========================================
  // CHECK BOTS — detect automated content
  // Usage: tracebit.checkBots(text)
  // ==========================================

  checkBots(text) {
    return detectBotSignals(text)
  },

  // ==========================================
  // SECURITY SCAN — full security report
  // Usage: await tracebit.security(text)
  // ==========================================

  async security(text) {
    return await runSecurityScan(text)
  },

  // ==========================================
  // SIDEBAR — control the detection panel
  // Usage: tracebit.sidebar.open()
  // ==========================================

  sidebar: Sidebar,

  // ==========================================
  // UTILS — helper functions for developers
  // ==========================================

  utils: {
    scoreToVerdict,
    scoreToColor,
    averageScores,
    confidenceLabel,
    chunkText,
    extractSentences,
    cleanText,
    validateContent
  }
}

// Also export everything individually
// so developers can import just what they need
export {
  Detector,
  detector,
  scoreToVerdict,
  scoreToColor,
  averageScores,
  chunkText,
  extractSentences,
  cleanText,
  watchTikTok,
  watchInstagram,
  watchFacebook,
  watchX,
  watchLinkedIn,
  watchAll,
  watchWhatsApp,
  scanArticle,
  scanForFraud,
  runSecurityScan,
  detectBotSignals,
  analyzeEmail,
  validateContent,
  Sidebar
}
export {
  scanDocument,
  analyzeReceipt,
  analyzeEmailFile,
  extractFromFile
} from './adapters/document.js'
export default tracebit
