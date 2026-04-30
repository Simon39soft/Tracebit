export class Detector {

  constructor(config = {}) {
    this.apiKey = config.apiKey || null
    this.threshold = config.threshold || 60
    this.model = config.model || 
      'claude-sonnet-4-20250514'
    this.cache = new Map()
  }

  async analyze(text) {
    if (!text) return null
    if (text.length < 50) return null
    
    const cached = this.cache.get(text)
    if (cached) return cached
    
    try {
      const response = await fetch(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `You are an AI content 
              detection expert. Analyze the 
              following text and determine if 
              it was written by AI or a human.
              
              Return ONLY valid JSON exactly 
              like this with no extra text:
              {
                "score": 75,
                "verdict": "likely-ai",
                "confidence": "high",
                "signals": {
                  "sentenceFlow": 80,
                  "vocabulary": 70,
                  "perplexity": 65,
                  "burstiness": 40
                },
                "sentences": [
                  {
                    "text": "sentence here",
                    "score": 85,
                    "reason": "generic phrasing"
                  }
                ]
              }
              
              Score guide:
              0-39   = human written
              40-59  = uncertain
              60-79  = likely AI
              80-100 = AI generated
              
              Verdict must be exactly one of:
              human
              uncertain
              likely-ai
              ai-generated
              
              Text to analyze:
              "${text}"`
            }]
          })
        }
      )

      const data = await response.json()
      const rawText = data.content[0].text
      const result = JSON.parse(rawText)
      
      result.analyzedText = text
      result.timestamp = new Date().toISOString()
      
      this.cache.set(text, result)
      
      return result

    } catch (error) {
      console.error('Tracebit error:', error)
      return {
        score: null,
        verdict: 'error',
        confidence: 'none',
        error: error.message,
        analyzedText: text,
        timestamp: new Date().toISOString()
      }
    }
  }

  async analyzeMany(texts) {
    const validTexts = texts.filter(
      t => t && t.length >= 50
    )
    
    const results = await Promise.all(
      validTexts.map(t => this.analyze(t))
    )
    
    const validResults = results.filter(
      r => r !== null
    )
    
    if (validResults.length === 0) return null
    
    const avgScore = Math.round(
      validResults.reduce(
        (sum, r) => sum + (r.score || 0), 0
      ) / validResults.length
    )
    
    return {
      overallScore: avgScore,
      verdict: this.scoreToVerdict(avgScore),
      totalAnalyzed: validResults.length,
      results: validResults,
      timestamp: new Date().toISOString()
    }
  }

  scoreToVerdict(score) {
    if (score === null) return 'unknown'
    if (score < 40) return 'human'
    if (score < 60) return 'uncertain'
    if (score < 80) return 'likely-ai'
    return 'ai-generated'
  }

  clearCache() {
    this.cache.clear()
  }
}

export const detector = new Detector()
