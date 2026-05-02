import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="form-item" className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
}

function FormLabel({
  error,
  className,
  ...props
}: React.ComponentProps<typeof Label> & { error?: boolean }) {
  return <Label className={cn(error && "text-destructive", className)} {...props} />
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null
  return (
    <p className={cn("text-destructive text-xs", className)} {...props}>
      {children}
    </p>
  )
}

export { FormItem, FormLabel, FormMessage }
