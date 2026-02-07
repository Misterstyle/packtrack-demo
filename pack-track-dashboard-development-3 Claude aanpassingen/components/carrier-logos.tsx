interface CarrierLogoProps {
  className?: string
}

export function MondialRelayLogo({ className = "w-8 h-8" }: CarrierLogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#E30613" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        MR
      </text>
    </svg>
  )
}

export function DHLLogo({ className = "w-8 h-8" }: CarrierLogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FFCC00" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#D40511"
        fontSize="12"
        fontWeight="800"
        fontFamily="sans-serif"
      >
        DHL
      </text>
    </svg>
  )
}

export function DPDLogo({ className = "w-8 h-8" }: CarrierLogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#DC0032" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="800"
        fontFamily="sans-serif"
      >
        DPD
      </text>
    </svg>
  )
}

export function PostNLLogo({ className = "w-8 h-8" }: CarrierLogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FF6600" />
      <text
        x="50%"
        y="42%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        Post
      </text>
      <text
        x="50%"
        y="64%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="800"
        fontFamily="sans-serif"
      >
        NL
      </text>
    </svg>
  )
}
