// ============================================
// Tracebit Security Layer
// Protects the framework from abuse
// Detects automated content and bots
// Flags AI written emails and messages
// Validates content authenticity signals
// ============================================

// ============================================
// RATE LIMITER
// Prevents abuse of the detection API
// Limits how many scans can happen per minute
// ============================================

class RateLimiter {
  constructor(maxRequests = 30, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = []
  }

  isAllowed() {
    const now = Date.now()

    // Remove requests outside the time window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    )

    if (this.requests.length >= this.maxRequests) {
      console.warn(
        'Tracebit: Rate limit reached. ' +
        'Too many scans in a short time.'
      )
      return false
    }

    this.requests.push(now)
    return true
  }

  getRemainingRequests() {
    const now = Date.now()
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    )
    return Math.max(
      0,
      this.maxRequests - this.requests.length
    )
  }
}

// ============================================
// BOT AND AUTOMATION DETECTOR
// Detects if content was submitted by a bot
// or automated system rather than a human
// ============================================

export function detectBotSignals(text) {
  if (!text) return null

  const signals = []
  let botScore = 0

  // Check 1: Perfect punctuation
  // Humans make small punctuation mistakes
  // Bots and AI are almost always perfect
  const punctuationPerfect = 
    !/[,;]\s{2,}/.test(text) &&
    !/\s[,;.]/.test(text)

  if (punctuationPerfect && text.length > 100) {
    signals.push('perfect punctuation pattern')
    botScore += 15
  }

  // Check 2: No contractions
  // Real humans use contractions naturally
  // AI and bots often avoid them
  const contractions = [
    "don't", "won't", "can't", "isn't",
    "aren't", "wasn't", "weren't", "haven't",
    "hasn't", "hadn't", "wouldn't", "couldn't",
    "shouldn't", "I'm", "I've", "I'll",
    "I'd", "you're", "they're", "we're"
  ]

  const hasContractions = contractions.some(
    c => text.toLowerCase().includes(
      c.toLowerCase()
    )
  )

  if (!hasContractions && text.length > 150) {
    signals.push('no natural contractions found')
    botScore += 20
  }

  // Check 3: Repeated sentence structure
  // AI tends to start sentences the same way
  const sentences = text.match(
    /[^.!?]+[.!?]+/g
  ) || []

  const starters = sentences.map(
    s => s.trim().split(' ')[0].toLowerCase()
  )

  const uniqueStarters = new Set(starters)
  const repetitionRatio = 
    1 - (uniqueStarters.size / starters.length)

  if (repetitionRatio > 0.4 && 
      sentences.length > 4) {
    signals.push('repetitive sentence structure')
    botScore += 25
  }

  // Check 4: Suspiciously uniform sentence length
  // Humans naturally vary sentence length
  // AI tends to write very uniform lengths
  if (sentences.length > 3) {
    const lengths = sentences.map(s => s.length)
    const avgLength = lengths.reduce(
      (a, b) => a + b, 0
    ) / lengths.length

    const variance = lengths.reduce(
      (sum, l) => sum + Math.pow(l - avgLength, 2),
      0
    ) / lengths.length

    const stdDev = Math.sqrt(variance)

    if (stdDev < 20 && avgLength > 50) {
      signals.push('unnaturally uniform sentence length')
      botScore += 20
    }
  }

  // Check 5: Corporate buzzword density
  // High density of buzzwords is a strong
  // signal of AI or template generated content
  const buzzwords = [
    'leverage', 'synergy', 'paradigm',
    'holistic', 'scalable', 'streamline',
    'optimize', 'robust', 'cutting-edge',
    'best-in-class', 'world-class',
    'innovative', 'strategic', 'seamless',
    'proactive', 'dynamic', 'utilize',
    'facilitate', 'implement', 'deliverable',
    'bandwidth', 'ecosystem', 'stakeholder',
    'value-added', 'going forward',
    'at the end of the day', 'circle back',
    'move the needle', 'low-hanging fruit'
  ]

  const lowerText = text.toLowerCase()
  const buzzwordCount = buzzwords.filter(
    w => lowerText.includes(w)
  ).length

  const buzzwordDensity = 
    buzzwordCount / (text.split(' ').length / 100)

  if (buzzwordDensity > 3) {
    signals.push(
      `high buzzword density: ${buzzwordCount} found`
    )
    botScore += Math.min(20, buzzwordCount * 4)
  }

  // Check 6: No personal references
  // Humans naturally reference personal
  // experience. AI almost never does
  const personalWords = [
    'i think', 'i feel', 'i believe',
    'in my experience', 'i remember',
    'personally', 'i noticed', 'i found',
    'i realized', 'my experience',
    'when i was', 'i have seen'
  ]

  const hasPersonal = personalWords.some(
    w => lowerText.includes(w)
  )

  if (!hasPersonal && text.length > 200) {
    signals.push('no personal voice or references')
    botScore += 15
  }

  return {
    botScore: Math.min(100, botScore),
    isBot: botScore >= 50,
    signals,
    verdict: 
      botScore >= 75 ? 'likely-automated' :
      botScore >= 50 ? 'suspicious' :
      botScore >= 25 ? 'low-risk' :
      'human-likely'
  }
}

// ============================================
// EMAIL AUTHENTICITY DETECTOR
// Detects AI written emails that were not
// typed naturally by a real human
// Flags template emails and mass campaigns
// ============================================

export function analyzeEmail(emailText) {
  if (!emailText) return null

  const signals = []
  let aiScore = 0
  const lowerText = emailText.toLowerCase()

  // Email signal 1: Generic greetings
  const genericGreetings = [
    'dear valued customer',
    'dear sir or madam',
    'to whom it may concern',
    'dear user',
    'hello there',
    'greetings of the day',
    'i hope this email finds you well',
    'i hope this message finds you well',
    'i trust this email finds you',
    'i am reaching out to you today'
  ]

  const hasGenericGreeting = genericGreetings
    .some(g => lowerText.includes(g))

  if (hasGenericGreeting) {
    signals.push('generic AI email greeting detected')
    aiScore += 30
  }

  // Email signal 2: Template closing phrases
  const genericClosings = [
    'please do not hesitate to contact',
    'feel free to reach out',
    'looking forward to hearing from you',
    'thank you for your time and consideration',
    'i look forward to your prompt response',
    'please let me know if you have any questions',
    'thank you for your understanding',
    'best regards', 'warm regards',
    'yours sincerely', 'yours faithfully'
  ]

  const closingCount = genericClosings.filter(
    c => lowerText.includes(c)
  ).length

  if (closingCount >= 2) {
    signals.push('multiple template closing phrases')
    aiScore += 25
  }

  // Email signal 3: Urgency manipulation
  // Common in both AI scam emails and
  // AI generated marketing emails
  const urgencyPhrases = [
    'act now', 'limited time',
    'urgent action required',
    'immediate response needed',
    'do not delay', 'expires soon',
    'last chance', 'final notice',
    'time sensitive', 'respond immediately',
    'within 24 hours', 'by end of day',
    'as soon as possible', 'asap'
  ]

  const urgencyCount = urgencyPhrases.filter(
    p => lowerText.includes(p)
  ).length

  if (urgencyCount >= 2) {
    signals.push(
      `urgency manipulation: ${urgencyCount} phrases`
    )
    aiScore += urgencyCount * 10
  }

  // Email signal 4: Suspicious links pattern
  const hasSuspiciousLinks = 
    /click here/i.test(emailText) ||
    /verify your account/i.test(emailText) ||
    /confirm your details/i.test(emailText) ||
    /update your information/i.test(emailText)

  if (hasSuspiciousLinks) {
    signals.push('suspicious link language detected')
    aiScore += 25
  }

  // Email signal 5: Impersonation patterns
  const impersonation = [
    'your bank', 'your financial institution',
    'microsoft support', 'apple support',
    'google security', 'amazon security',
    'paypal security', 'irs notice',
    'government grant', 'federal bureau',
    'your account has been',
    'we have detected suspicious',
    'unusual activity on your account'
  ]

  const impersonationFound = impersonation
    .filter(p => lowerText.includes(p))

  if (impersonationFound.length > 0) {
    signals.push(
      `impersonation attempt: ${
        impersonationFound.slice(0,2).join(', ')
      }`
    )
    aiScore += impersonationFound.length * 20
  }

  // Email signal 6: Money requests
  const moneyPhrases = [
    'wire transfer', 'bank transfer',
    'send money', 'payment required',
    'processing fee', 'advance fee',
    'bitcoin', 'cryptocurrency',
    'gift card', 'money order',
    'western union', 'money gram',
    'your inheritance', 'million dollars',
    'lottery winner', 'prize money'
  ]

  const moneyFound = moneyPhrases.filter(
    p => lowerText.includes(p)
  )

  if (moneyFound.length > 0) {
    signals.push(
      `financial manipulation: ${
        moneyFound.slice(0,2).join(', ')
      }`
    )
    aiScore += moneyFound.length * 25
  }

  const finalScore = Math.min(100, aiScore)

  return {
    aiScore: finalScore,
    isAIGenerated: finalScore >= 50,
    isSuspicious: finalScore >= 40,
    isScam: finalScore >= 70,
    signals,
    verdict:
      finalScore >= 80 ? 'scam-likely' :
      finalScore >= 60 ? 'highly-suspicious' :
      finalScore >= 40 ? 'suspicious' :
      finalScore >= 20 ? 'low-risk' :
      'clean',
    recommendation:
      finalScore >= 70
        ? 'Do not respond. Block this sender.'
        : finalScore >= 40
        ? 'Be cautious. Verify sender identity.'
        : 'Content appears legitimate.'
  }
}

// ============================================
// CONTENT INTEGRITY VALIDATOR
// Checks if content meets minimum standards
// before sending to detection API
// Prevents API abuse and saves costs
// ============================================

export function validateContent(text) {
  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      reason: 'No text content provided'
    }
  }

  if (text.length < 20) {
    return {
      valid: false,
      reason: 'Text too short to analyze'
    }
  }

  if (text.length > 50000) {
    return {
      valid: false,
      reason: 'Text too long — use chunker first'
    }
  }

  // Check if text is just repeated characters
  const uniqueChars = new Set(text).size
  if (uniqueChars < 10) {
    return {
      valid: false,
      reason: 'Text appears to be spam or noise'
    }
  }

  // Check if text has actual words
  const wordCount = text.trim().split(/\s+/).length
  if (wordCount < 5) {
    return {
      valid: false,
      reason: 'Too few words to analyze accurately'
    }
  }

  return {
    valid: true,
    wordCount,
    characterCount: text.length
  }
}

// ============================================
// HASH FUNCTION
// Creates a unique fingerprint of any text
// Used for caching and deduplication
// ============================================

export async function hashText(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256', data
  )
  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  )
  return hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ============================================
// EXPORTED RATE LIMITER INSTANCE
// ============================================

export const rateLimiter = new RateLimiter(
  30,   // 30 requests
  60000 // per 60 seconds
)

// ============================================
// MAIN SECURITY SCANNER
// Runs all security checks at once
// Returns complete security report
// ============================================

export async function runSecurityScan(text) {
  // Validate content first
  const validation = validateContent(text)
  if (!validation.valid) {
    return {
      safe: false,
      reason: validation.reason,
      blocked: true
    }
  }

  // Check rate limit
  if (!rateLimiter.isAllowed()) {
    return {
      safe: false,
      reason: 'Rate limit exceeded',
      blocked: true,
      remainingRequests: 0
    }
  }

  // Run all detection checks in parallel
  const [botResult, emailResult] = 
    await Promise.all([
      Promise.resolve(detectBotSignals(text)),
      Promise.resolve(analyzeEmail(text))
    ])

  // Generate content hash for caching
  const contentHash = await hashText(text)

  const overallRisk = Math.max(
    botResult?.botScore || 0,
    emailResult?.aiScore || 0
  )

  return {
    safe: overallRisk < 50,
    overallRisk,
    blocked: false,
    contentHash,
    remainingRequests: 
      rateLimiter.getRemainingRequests(),
    bot: botResult,
    email: emailResult,
    verdict:
      overallRisk >= 75 ? 'high-risk' :
      overallRisk >= 50 ? 'suspicious' :
      overallRisk >= 25 ? 'low-risk' :
      'clean',
    timestamp: new Date().toISOString()
  }
}
