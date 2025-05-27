interface SentimentBarProps {
  value: number | null | undefined
  className?: string
}

export default function SentimentBar({ value, className }: SentimentBarProps) {
  // Ensure value is a number and between 1 and 5
  const numValue = typeof value === 'number' ? value : 3.5
  const clampedValue = Math.max(1, Math.min(5, numValue))

  // Calculate position percentage (0-100%)
  const position = ((clampedValue - 1) / 4) * 100

  return (
    <div className={`relative h-8 ${className}`}>
      <div className="absolute inset-0 flex justify-between items-center px-2 bg-gray-100 rounded-md">
        <span>😟</span>
        <span>😐</span>
        <span>😊</span>
        <span>😄</span>
        <span>🤩</span>
      </div>
      <div
        className="absolute top-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black"
        style={{
          left: `calc(${position}% - 8px)`,
          top: "-8px",
        }}
      />
    </div>
  )
}
