import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormItemContextValue {
  id: string
  hasError: boolean
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

function useFormItemContext(): FormItemContextValue {
  const ctx = React.useContext(FormItemContext)
  if (!ctx) throw new Error("useFormItemContext must be used within FormItem")
  return ctx
}

function FormItem({
  className,
  hasError = false,
  ...props
}: React.ComponentProps<"div"> & { hasError?: boolean }) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id, hasError }}>
      <div data-slot="form-item" className={cn("flex flex-col gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { id, hasError } = useFormItemContext()
  return (
    <Label
      htmlFor={id}
      className={cn(hasError && "text-destructive", className)}
      {...props}
    />
  )
}

function FormControl({ children }: { children: React.ReactElement }) {
  const { id, hasError } = useFormItemContext()
  return React.cloneElement(children, {
    id,
    "aria-describedby": hasError ? `${id}-message` : undefined,
    "aria-invalid": hasError || undefined,
  } as React.HTMLAttributes<HTMLElement>)
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { id } = useFormItemContext()
  if (!children) return null
  return (
    <p
      id={`${id}-message`}
      role="alert"
      aria-live="polite"
      className={cn("text-destructive text-xs", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export { FormItem, FormLabel, FormControl, FormMessage }
