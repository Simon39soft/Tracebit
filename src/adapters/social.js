// ============================================
// Tracebit Social Media Adapter
// Automatically detects AI content on
// TikTok, Instagram, Facebook, X, LinkedIn
// as new posts load in real time
// ============================================

import { Detector } from '../core/detector.js'
import { scoreToColor } from '../core/scorer.js'
import { cleanText } from '../core/chunker.js'

const detector = new Detector()

// ============================================
// BADGE — the small score bubble that appears
// on every AI detected post automatically
// ============================================

function createBadge(score, verdict) {
  const badge = document.createElement('div')
  const color = scoreToColor(score)
  
  const colors = {
    high: '#E24B4A',
    med:  '#EF9F27',
    low:  '#639922',
    clean: '#888780'
  }

  badge.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: ${colors[color]};
    color: white;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 20px;
    z-index: 9999;
    cursor: pointer;
    font-family: sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `
  
  badge.innerText = `AI ${score}%`
  badge.setAttribute('data-tracebit', 'true')
  badge.setAttribute('data-score', score)
  badge.setAttribute('data-verdict', verdict)
  
  return badge
}

// ============================================
// TIKTOK ADAPTER
// Watches for new videos loading in the feed
// and scans every caption automatically
// ============================================

export function watchTikTok() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue
          
          // Find TikTok caption elements
          const captions = node.querySelectorAll(
            '[class*="caption"], ' +
            '[class*="desc"], ' +
            '[data-e2e="video-desc"]'
          )
          
          for (const caption of captions) {
            const text = cleanText(
              caption.innerText
            )
            
            if (!text || text.length < 30) continue
            if (caption.dataset.tracebit) continue
            
            // Mark as processed so we dont
            // scan the same caption twice
            caption.dataset.tracebit = 'true'
            
            // Analyze the caption text
            const result = await detector.analyze(
              text
            )
            
            if (!result || result.score < 40) continue
            
            // Add badge to the video card
            const card = caption.closest(
              '[class*="video"], ' +
              '[class*="item"], ' +
              '[class*="card"]'
            )
            
            if (card) {
              card.style.position = 'relative'
              const badge = createBadge(
                result.score,
                result.verdict
              )
              
              // Clicking badge opens full sidebar
              badge.addEventListener('click', () => {
                window.traceBitSidebar?.open(result)
              })
              
              card.appendChild(badge)
            }
          }
        }
      }
    }
  )
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  console.log('Tracebit watching TikTok')
  return observer
}

// ============================================
// INSTAGRAM ADAPTER
// Watches for new posts and stories loading
// and scans every caption automatically
// ============================================

export function watchInstagram() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue
          
          // Find Instagram caption elements
          const captions = node.querySelectorAll(
            '[class*="Caption"], ' +
            'h1, ' +
            '._aacl, ' +
            '[data-testid="post-comment-root"]'
          )
          
          for (const caption of captions) {
            const text = cleanText(
              caption.innerText
            )
            
            if (!text || text.length < 30) continue
            if (caption.dataset.tracebit) continue
            
            caption.dataset.tracebit = 'true'
            
            const result = await detector.analyze(
              text
            )
            
            if (!result || result.score < 40) continue
            
            const card = caption.closest(
              'article, ' +
              '[class*="post"], ' +
              '[role="presentation"]'
            )
            
            if (card) {
              card.style.position = 'relative'
              const badge = createBadge(
                result.score,
                result.verdict
              )
              
              badge.addEventListener('click', () => {
                window.traceBitSidebar?.open(result)
              })
              
              card.appendChild(badge)
            }
          }
        }
      }
    }
  )
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  console.log('Tracebit watching Instagram')
  return observer
}

// ============================================
// FACEBOOK ADAPTER
// Watches the feed for new posts and
// handles the expand button automatically
// ============================================

export function watchFacebook() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue
          
          const posts = node.querySelectorAll(
            '[data-ad-preview="message"], ' +
            '[class*="userContent"], ' +
            'div[dir="auto"]'
          )
          
          for (const post of posts) {
            const text = cleanText(
              post.innerText
            )
            
            if (!text || text.length < 50) continue
            if (post.dataset.tracebit) continue
            
            post.dataset.tracebit = 'true'
            
            const result = await detector.analyze(
              text
            )
            
            if (!result || result.score < 40) continue
            
            const card = post.closest(
              '[class*="story"], ' +
              '[class*="post"], ' +
              'article'
            )
            
            if (card) {
              card.style.position = 'relative'
              const badge = createBadge(
                result.score,
                result.verdict
              )
              
              badge.addEventListener('click', () => {
                window.traceBitSidebar?.open(result)
              })
              
              card.appendChild(badge)
            }
          }
        }
      }
    }
  )
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  console.log('Tracebit watching Facebook')
  return observer
}

// ============================================
// X / TWITTER ADAPTER
// ============================================

export function watchX() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue
          
          const tweets = node.querySelectorAll(
            '[data-testid="tweetText"], ' +
            '[class*="tweet-text"]'
          )
          
          for (const tweet of tweets) {
            const text = cleanText(
              tweet.innerText
            )
            
            if (!text || text.length < 30) continue
            if (tweet.dataset.tracebit) continue
            
            tweet.dataset.tracebit = 'true'
            
            const result = await detector.analyze(
              text
            )
            
            if (!result || result.score < 40) continue
            
            const card = tweet.closest(
              'article, [data-testid="tweet"]'
            )
            
            if (card) {
              card.style.position = 'relative'
              const badge = createBadge(
                result.score,
                result.verdict
              )
              
              badge.addEventListener('click', () => {
                window.traceBitSidebar?.open(result)
              })
              
              card.appendChild(badge)
            }
          }
        }
      }
    }
  )
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  console.log('Tracebit watching X')
  return observer
}

// ============================================
// LINKEDIN ADAPTER
// ============================================

export function watchLinkedIn() {
  const observer = new MutationObserver(
    async (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue
          
          const posts = node.querySelectorAll(
            '.feed-shared-text, ' +
            '[class*="commentary"], ' +
            '.feed-shared-update-v2__description'
          )
          
          for (const post of posts) {
            const text = cleanText(
              post.innerText
            )
            
            if (!text || text.length < 50) continue
            if (post.dataset.tracebit) continue
            
            post.dataset.tracebit = 'true'
            
            const result = await detector.analyze(
              text
            )
            
            if (!result || result.score < 40) continue
            
            const card = post.closest(
              '.feed-shared-update-v2, ' +
              '[class*="post"], ' +
              'article'
            )
            
            if (card) {
              card.style.position = 'relative'
              const badge = createBadge(
                result.score,
                result.verdict
              )
              
              badge.addEventListener('click', () => {
                window.traceBitSidebar?.open(result)
              })
              
              card.appendChild(badge)
            }
          }
        }
      }
    }
  )
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  console.log('Tracebit watching LinkedIn')
  return observer
}

// ============================================
// WATCH ALL PLATFORMS AT ONCE
// The main function developers call
// ============================================

export function watchAll() {
  const hostname = window.location.hostname
  
  if (hostname.includes('tiktok')) {
    return watchTikTok()
  }
  
  if (hostname.includes('instagram')) {
    return watchInstagram()
  }
  
  if (hostname.includes('facebook')) {
    return watchFacebook()
  }
  
  if (
    hostname.includes('twitter') ||
    hostname.includes('x.com')
  ) {
    return watchX()
  }
  
  if (hostname.includes('linkedin')) {
    return watchLinkedIn()
  }
  
  console.log(
    'Tracebit: No matching platform found. ' +
    'Use watchTikTok(), watchInstagram(), ' +
    'watchFacebook(), watchX(), ' +
    'or watchLinkedIn() directly.'
  )
}
