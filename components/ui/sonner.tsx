"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { cn } from "@/lib/utils"

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      offset={{ top: "12px", left: "12px", right: "12px", bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      mobileOffset={{ top: "12px", left: "12px", right: "12px", bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      className={cn("toaster group", className)}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
