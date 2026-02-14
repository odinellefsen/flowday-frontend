"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { cn } from "@/lib/utils"

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset={{ top: "calc(env(safe-area-inset-top) + 32px)", left: "12px", right: "12px", bottom: "12px" }}
      mobileOffset={{ top: "calc(env(safe-area-inset-top) + 32px)", left: "12px", right: "12px", bottom: "12px" }}
      richColors
      closeButton
      expand
      visibleToasts={3}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast: "flow-toast",
          title: "flow-toast-title",
          description: "flow-toast-description",
          actionButton: "flow-toast-action",
          cancelButton: "flow-toast-cancel",
          closeButton: "flow-toast-close",
        },
      }}
      style={
        {
          "--normal-bg": "var(--flow-surface)",
          "--normal-text": "var(--flow-text)",
          "--normal-border": "var(--flow-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
