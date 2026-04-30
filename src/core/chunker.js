// ============================================
// Tracebit Chunker
// Splits long text into analyzable pieces
// so even massive articles get fully detected
// ============================================

export function chunkText(text, maxLength = 1500) {
  if (!text) return []
  if (text.length <= maxLength) return [text]

  // Split text into individual sentences
  const sentences = text.match(
    /[^.!?]+[.!?]+/g
  ) || [text]

  const chunks = []
  let currentChunk = ''

  for (const sentence of sentences) {
    // If adding this sentence keeps us under
    // the limit add it to the current chunk
    if (
      currentChunk.length + sentence.length 
      <= maxLength
    ) {
      currentChunk += sentence
    } else {
      // Current chunk is full
      // Save it and start a new one
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
      currentChunk = sentence
    }
  }

  // Add the last remaining chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

export function extractSentences(text) {
  if (!text) return []
  
  // Split into sentences and clean each one
  const sentences = text
    .match(/[^.!?]+[.!?]+/g) || []
    
  return sentences
    .map(s => s.trim())
    .filter(s => s.length >= 30)
}

export function extractParagraphs(element) {
  if (!element) return []
  
  // Get all paragraph elements from 
  // a webpage element
  const paragraphs = element.querySelectorAll(
    'p, article, section, div.post, ' +
    'div.content, div.caption, span.caption'
  )
  
  return Array.from(paragraphs)
    .map(p => p.innerText || p.textContent)
    .map(t => t.trim())
    .filter(t => t.length >= 50)
}

export function cleanText(text) {
  if (!text) return ''
  
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that
    // break the detection API
    .replace(/[^\w\s.,!?;:'"()-]/g, '')
    .trim()
}
