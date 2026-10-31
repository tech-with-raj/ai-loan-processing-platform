interface ConfidenceIndicatorProps {
  score?: number
}

export function ConfidenceIndicator({ score }: ConfidenceIndicatorProps) {
  if (score === undefined || score === null || !Number.isFinite(score)) {
    return <span className="confidence-indicator confidence-unknown">Confidence unavailable</span>
  }

  const percentage = Math.round(Math.min(100, Math.max(0, score * 100)))
  const tone = percentage >= 85 ? 'high' : percentage >= 60 ? 'medium' : 'low'

  return (
    <span
      className={`confidence-indicator confidence-${tone}`}
      aria-label={`Extraction confidence ${percentage} percent. This is not a guarantee of correctness.`}
      title="Confidence indicates extraction certainty; it does not guarantee correctness."
    >
      {percentage}% confidence
    </span>
  )
}
