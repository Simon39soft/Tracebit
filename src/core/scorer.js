export function scoreToVerdict(score) {
  if (score === null) return 'unknown'
  if (score < 40) return 'human'
  if (score < 60) return 'uncertain'
  if (score < 80) return 'likely-ai'
  return 'ai-generated'
}

export function scoreToColor(score) {
  if (score === null) return 'clean'
  if (score < 40) return 'clean'
  if (score < 60) return 'low'
  if (score < 80) return 'med'
  return 'high'
}

export function averageScores(scores) {
  if (!scores || scores.length === 0) return null
  const valid = scores.filter(s => s !== null)
  if (valid.length === 0) return null
  return Math.round(
    valid.reduce((sum, s) => sum + s, 0) / valid.length
  )
}

export function confidenceLabel(score) {
  if (score === null) return 'none'
  if (score < 40) return 'low'
  if (score < 70) return 'medium'
  return 'high'
}
