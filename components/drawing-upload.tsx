"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, X } from "lucide-react"
import { AutomaticDrawingAnalysis } from "@/components/automatic-drawing-analysis"

export function DrawingUpload() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        setPreviewImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    setPreviewImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Technische Zeichnung</CardTitle>
          <CardDescription>Laden Sie eine technische Zeichnung hoch oder fotografieren Sie diese</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewImage ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Datei hochladen
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Foto aufnehmen
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Technische Zeichnung"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleClear} className="w-full bg-transparent">
                <X className="mr-2 h-4 w-4" />
                Neue Zeichnung hochladen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {previewImage && <AutomaticDrawingAnalysis imageData={previewImage} />}
    </div>
  )
}
