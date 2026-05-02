"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreateProductForm } from "./create-product-form"

interface Props {
  onCreated: () => void
}

export function CreateProductDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handleOpenChange(next: boolean) {
    if (!next) setFormKey((k) => k + 1)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>New Product</DialogTrigger>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
        </DialogHeader>
        <CreateProductForm
          key={formKey}
          onSuccess={() => {
            setOpen(false)
            onCreated()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
