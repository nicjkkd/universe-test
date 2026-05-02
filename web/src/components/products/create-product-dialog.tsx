"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New Product</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
        </DialogHeader>
        <CreateProductForm
          onSuccess={() => {
            setOpen(false)
            onCreated()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
