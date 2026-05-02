// ============================================
// Tracebit Document Scanner
// Detects fraud in emails, receipts,
// invoices, PDFs and uploaded files
// ============================================

import { analyzeEmail, scanForFraud } 
  from '../core/security.js'
import { cleanText } from '../core/chunker.js'
import { Detector } from '../core/detector.js'

const detector = new Detector()

// ============================================
// RECEIPT FRAUD DETECTOR
// Checks receipts and invoices for
// signs of tampering or fakery
// ============================================

export function analyzeReceipt(text) {
  if (!text) return null

  const signals = []
  let fraudScore = 0
  const lowerText = text.toLowerCase()

  // Check 1: Missing essential receipt fields
  const essentialFields = [
    'receipt',
    'total',
    'date',
    'transaction'
  ]

  const missingFields = essentialFields.filter(
    f => !lowerText.includes(f)
  )

  if (missingFields.length >= 2) {
    signals.push(
      `missing receipt fields: ${
        missingFields.join(', ')
      }`
    )
    fraudScore += 20
  }

  // Check 2: Suspicious amount patterns
  // Fraudsters often use round numbers
  // or copy amounts incorrectly
  const amounts = text.match(
    /\$[\d,]+\.?\d*/g
  ) || []

  const roundAmounts = amounts.filter(a => {
    const num = parseFloat(
      a.replace(/[$,]/g, '')
    )
    return num > 0 && num % 100 === 0
  })

  if (
    roundAmounts.length > 0 && 
    amounts.length > 0 &&
    roundAmounts.length / amounts.length > 0.7
  ) {
    signals.push(
      'suspicious round number amounts'
    )
    fraudScore += 15
  }

  // Check 3: Template receipt phrases
  // Fake receipts often use identical
  // template language
  const templatePhrases = [
    'thank you for your purchase',
    'this is your receipt',
    'please keep for your records',
    'no refunds after 30 days',
    'questions call customer service'
  ]

  const templateCount = templatePhrases.filter(
    p => lowerText.includes(p)
  ).length

  if (templateCount >= 3) {
    signals.push(
      'generic template receipt language'
    )
    fraudScore += 20
  }

  // Check 4: Missing tax information
  // Legitimate receipts always show tax
  const hasTax = 
    lowerText.includes('tax') ||
    lowerText.includes('vat') ||
    lowerText.includes('gst')

  if (!hasTax && text.length > 100) {
    signals.push('no tax information present')
    fraudScore += 15
  }

  // Check 5: Inconsistent date formats
  const dates = text.match(
    /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g
  ) || []

  if (dates.length > 1) {
    const formats = new Set(
      dates.map(d => {
        const sep = d.includes('/') ? '/' : '-'
        const parts = d.split(sep)
        return parts.map(p => p.length).join('-')
      })
    )

    if (formats.size > 1) {
      signals.push(
        'inconsistent date formats detected'
      )
      fraudScore += 25
    }
  }

  // Check 6: Fake company signals
  const fakeCompanySignals = [
    'llc inc',
    'corp ltd',
    'company limited incorporated',
    'registered business number',
    'tax id number'
  ]

  const fakeCompanyCount = fakeCompanySignals
    .filter(s => lowerText.includes(s)).length

  if (fakeCompanyCount > 0) {
    signals.push(
      'suspicious company registration language'
    )
    fraudScore += fakeCompanyCount * 15
  }

  const finalScore = Math.min(100, fraudScore)

  return {
    fraudScore: finalScore,
    isFraud: finalScore >= 50,
    isSuspicious: finalScore >= 30,
    signals,
    verdict:
      finalScore >= 75 ? 'fake-receipt' :
      finalScore >= 50 ? 'highly-suspicious' :
      finalScore >= 30 ? 'suspicious' :
      'appears-legitimate',
    recommendation:
      finalScore >= 50
        ? 'This receipt shows strong signs ' +
          'of being fake or tampered with. ' +
          'Do not accept this document.'
        : finalScore >= 30
        ? 'This receipt has some suspicious ' +
          'signals. Verify with the merchant ' +
          'directly before accepting.'
        : 'This receipt appears legitimate ' +
          'but always verify important ' +
          'transactions directly.'
  }
}

// ============================================
// EMAIL FILE ANALYZER
// Reads raw email content including
// headers, body and attachments
// Detects spoofing and impersonation
// ============================================

export function analyzeEmailFile(emailContent) {
  if (!emailContent) return null

  const signals = []
  let fraudScore = 0
  const lines = emailContent.split('\n')

  // Extract email headers
  const headers = {}
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':')
      headers[key.trim().toLowerCase()] = 
        valueParts.join(':').trim()
    }
    if (line.trim() === '') break
  }

  // Check 1: From and Reply-To mismatch
  // This is a classic email spoofing technique
  const fromHeader = headers['from'] || ''
  const replyTo = headers['reply-to'] || ''

  if (fromHeader && replyTo) {
    const fromDomain = fromHeader
      .match(/@([^>]+)/)?.[1]
    const replyDomain = replyTo
      .match(/@([^>]+)/)?.[1]

    if (
      fromDomain && 
      replyDomain && 
      fromDomain !== replyDomain
    ) {
      signals.push(
        `reply-to domain mismatch: ` +
        `from ${fromDomain} ` +
        `but reply-to ${replyDomain}`
      )
      fraudScore += 40
    }
  }

  // Check 2: Spoofed sender domain
  // Fraudsters use lookalike domains
  const legitimateDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com',
    'hotmail.com', 'icloud.com',
    'paypal.com', 'amazon.com',
    'apple.com', 'microsoft.com',
    'google.com', 'facebook.com',
    'instagram.com', 'bank.com'
  ]

  const fromEmail = fromHeader
    .match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || ''
  const fromDomain = fromEmail
    .split('@')[1] || ''

  // Check for lookalike domains
  // Example: paypa1.com instead of paypal.com
  for (const legitimate of legitimateDomains) {
    const legitimateName = legitimate
      .split('.')[0]
    const fromName = fromDomain.split('.')[0]

    if (
      fromDomain !== legitimate &&
      fromName.includes(legitimateName) &&
      fromName !== legitimateName
    ) {
      signals.push(
        `lookalike domain detected: ` +
        `${fromDomain} mimics ${legitimate}`
      )
      fraudScore += 50
    }
  }

  // Check 3: Suspicious subject lines
  const subject = headers['subject'] || ''
  const suspiciousSubjects = [
    'urgent', 'action required',
    'your account', 'verify',
    'suspended', 'limited',
    'winner', 'congratulations',
    'free', 'claim', 'prize',
    'final notice', 'last warning',
    'security alert', 'unusual activity'
  ]

  const subjectHits = suspiciousSubjects
    .filter(s => 
      subject.toLowerCase().includes(s)
    ).length

  if (subjectHits >= 2) {
    signals.push(
      `suspicious subject line: "${
        subject.slice(0, 50)
      }"`
    )
    fraudScore += subjectHits * 10
  }

  // Check 4: Analyze the email body
  const bodyStart = emailContent.indexOf('\n\n')
  const body = bodyStart > -1
    ? emailContent.slice(bodyStart).trim()
    : emailContent

  const bodyAnalysis = analyzeEmail(body)
  const fraudAnalysis = scanForFraud(body)

  if (bodyAnalysis.aiScore > 50) {
    signals.push(
      `AI generated body text: ` +
      `${bodyAnalysis.aiScore}% confidence`
    )
    fraudScore += 20
  }

  if (fraudAnalysis.isFraud) {
    signals.push(...fraudAnalysis.patterns
      .slice(0, 3)
      .map(p => `fraud pattern: ${p}`)
    )
    fraudScore += 25
  }

  const finalScore = Math.min(100, fraudScore)

  return {
    fraudScore: finalScore,
    isSpoof: finalScore >= 60,
    isSuspicious: finalScore >= 30,
    fromEmail,
    fromDomain,
    subject,
    signals,
    bodyAnalysis,
    fraudAnalysis,
    verdict:
      finalScore >= 75 ? 'email-fraud' :
      finalScore >= 50 ? 'likely-spoofed' :
      finalScore >= 30 ? 'suspicious' :
      'appears-legitimate',
    recommendation:
      finalScore >= 60
        ? 'This email shows strong signs ' +
          'of being fraudulent or spoofed. ' +
          'Do not click any links or reply.'
        : finalScore >= 30
        ? 'This email has suspicious signals. ' +
          'Verify the sender independently ' +
          'before responding.'
        : 'This email appears legitimate.'
  }
}

// ============================================
// DOCUMENT TEXT EXTRACTOR
// Extracts text from different file types
// so Tracebit can analyze the content
// ============================================

export async function extractFromFile(file) {
  if (!file) return null

  const fileType = file.type
  const fileName = file.name.toLowerCase()

  // Handle plain text files and emails
  if (
    fileType === 'text/plain' ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.eml') ||
    fileName.endsWith('.msg')
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Handle HTML emails
  if (
    fileType === 'text/html' ||
    fileName.endsWith('.html')
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(
          e.target.result, 'text/html'
        )
        resolve(doc.body.innerText)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  return null
}

// ============================================
// FULL DOCUMENT SCANNER
// The main function that handles everything
// Pass any file or text and get full report
// ============================================

export async function scanDocument(input) {
  let text = ''
  let fileType = 'text'

  // Handle file uploads
  if (input instanceof File) {
    const extracted = await extractFromFile(input)
    if (!extracted) {
      return {
        error: true,
        message: 
          'Could not read this file type. ' +
          'Supported formats: .txt .eml .html'
      }
    }
    text = extracted
    fileType = input.name.toLowerCase()
      .endsWith('.eml') ? 'email' : 'document'
  } else if (typeof input === 'string') {
    text = input
  } else {
    return null
  }

  const cleanedText = cleanText(text)

  // Determine what kind of document this is
  const isEmail = 
    fileType === 'email' ||
    text.includes('From:') ||
    text.includes('Subject:') ||
    text.includes('Reply-To:')

  const isReceipt =
    text.toLowerCase().includes('receipt') ||
    text.toLowerCase().includes('invoice') ||
    text.toLowerCase().includes('transaction') ||
    text.toLowerCase().includes('amount due')

  // Run appropriate analysis
  const results = {}

  if (isEmail) {
    results.emailAnalysis = 
      analyzeEmailFile(text)
  }

  if (isReceipt) {
    results.receiptAnalysis = 
      analyzeReceipt(text)
  }

  // Always run general fraud and AI checks
  results.fraudCheck = scanForFraud(cleanedText)
  results.aiCheck = await detector.analyze(
    cleanedText
  )

  // Calculate overall fraud risk
  const scores = [
    results.emailAnalysis?.fraudScore,
    results.receiptAnalysis?.fraudScore,
    results.fraudCheck?.fraudScore,
    results.aiCheck?.score
  ].filter(s => s !== null && s !== undefined)

  const overallRisk = scores.length > 0
    ? Math.round(
        Math.max(...scores) * 0.6 +
        (scores.reduce(
          (a, b) => a + b, 0
        ) / scores.length) * 0.4
      )
    : 0

  return {
    overallRisk: Math.min(100, overallRisk),
    documentType: isEmail 
      ? 'email' 
      : isReceipt 
        ? 'receipt' 
        : 'document',
    isFraud: overallRisk >= 60,
    isSuspicious: overallRisk >= 35,
    verdict:
      overallRisk >= 75 ? 'fraudulent' :
      overallRisk >= 60 ? 'highly-suspicious' :
      overallRisk >= 35 ? 'suspicious' :
      'appears-legitimate',
    recommendation:
      overallRisk >= 60
        ? 'This document shows strong signs ' +
          'of fraud. Do not trust or act on ' +
          'this document without independent ' +
          'verification.'
        : overallRisk >= 35
        ? 'This document has suspicious signals. ' +
          'Verify its authenticity before ' +
          'taking any action.'
        : 'This document appears legitimate.',
    details: results,
    timestamp: new Date().toISOString()
  }
}
