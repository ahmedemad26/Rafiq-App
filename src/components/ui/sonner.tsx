"use client"

import type { CSSProperties } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--color-surface-highest)",
          "--normal-text": "var(--color-slate-dark)",
          "--normal-border": "var(--color-primary-container)",
          "--success-bg": "var(--color-surface-highest)",
          "--success-text": "var(--color-primary)",
          "--success-border": "var(--color-primary)",
          "--info-bg": "var(--color-surface-highest)",
          "--info-text": "var(--color-slate-dark)",
          "--info-border": "var(--color-primary-container)",
          "--warning-bg": "var(--color-surface-highest)",
          "--warning-text": "var(--color-slate-dark)",
          "--warning-border": "var(--color-primary-container)",
          "--error-bg": "var(--color-surface-highest)",
          "--error-text": "hsl(var(--destructive))",
          "--error-border": "hsl(var(--destructive))",
          "--border-radius": "8px",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "border text-sm shadow-sm",
          title: "font-semibold",
          description: "text-[var(--color-slate-mid)]",
          success: "border-[var(--color-primary)] text-[var(--color-primary)]",
          info: "border-[var(--color-primary-container)] text-[var(--color-slate-dark)]",
          warning: "border-[var(--color-primary-container)] text-[var(--color-slate-dark)]",
          error: "border-destructive text-destructive",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
