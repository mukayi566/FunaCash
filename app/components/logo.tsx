import Link from "next/link"
import { cn } from "@/lib/utils"

type LogoProps = {
  size?: "small" | "medium" | "large"
  href?: string | null
  className?: string
}

export function Logo({ size = "medium", href = "/", className }: LogoProps) {
  // Define font sizes for different variants
  const fontSizes = {
    small: "text-xl font-bold",
    medium: "text-2xl font-bold",
    large: "text-3xl font-bold",
  }

  const fontSize = fontSizes[size]

  const logoText = (
    <div className={cn("relative", className)}>
      <span
        className={cn(
          fontSize,
          "text-black dark:text-white font-extrabold tracking-tight",
          "transition-all duration-200",
        )}
      >
        Funacash
      </span>
    </div>
  )

  // If href is null, return just the text without a link
  if (href === null) {
    return logoText
  }

  // Otherwise, wrap in a Link
  return (
    <Link href={href} className="flex items-center">
      {logoText}
    </Link>
  )
}
