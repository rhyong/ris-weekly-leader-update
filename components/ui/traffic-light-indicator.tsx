import type { TrafficLight } from "../weekly-update-form"

interface TrafficLightIndicatorProps {
  value: TrafficLight
  className?: string
}

export default function TrafficLightIndicator({ value, className }: TrafficLightIndicatorProps) {
  const colorMap = {
    Green: "bg-green-500",
    Yellow: "bg-yellow-500",
    Red: "bg-red-500",
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-4 h-4 rounded-full ${colorMap[value]}`} />
    </div>
  )
}
