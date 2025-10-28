"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTools } from "@/lib/supabase-storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface RecipeSearchProps {
  onSearch: (params: {
    material: string
    thickness: number
    radius: string
    targetAngle: number
    targetInnerLength: number
    withProtectionPlate: boolean
  }) => void
}

export function RecipeSearch({ onSearch }: RecipeSearchProps) {
  const [material, setMaterial] = useState("")
  const [thickness, setThickness] = useState("")
  const [radius, setRadius] = useState("")
  const [targetAngle, setTargetAngle] = useState("")
  const [targetInnerLength, setTargetInnerLength] = useState("")
  const [withProtectionPlate, setWithProtectionPlate] = useState(false)

  const [availableMaterials, setAvailableMaterials] = useState<string[]>([])
  const [availableRadii, setAvailableRadii] = useState<string[]>([])

  useEffect(() => {
    const loadTools = async () => {
      const materials = await getTools("material")
      const radii = await getTools("radius")
      setAvailableMaterials(materials)
      setAvailableRadii(radii)
    }
    loadTools()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!material || !thickness || !radius || !targetAngle || !targetInnerLength) {
      alert("Bitte füllen Sie alle Felder aus")
      return
    }

    onSearch({
      material,
      thickness: Number.parseFloat(thickness),
      radius,
      targetAngle: Number.parseFloat(targetAngle),
      targetInnerLength: Number.parseFloat(targetInnerLength),
      withProtectionPlate,
    })
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">Biege-Parameter Suchen</CardTitle>
        <CardDescription className="text-base">Geben Sie die 6 entscheidenden Faktoren ein</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="material">Materialart</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger id="material">
                  <SelectValue placeholder="Material wählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableMaterials.map((mat) => (
                    <SelectItem key={mat} value={mat}>
                      {mat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thickness">Material-Dicke (mm)</Label>
              <Input
                id="thickness"
                type="number"
                step="0.1"
                placeholder="z.B. 10"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Radius (R-Werkzeug)</Label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger id="radius">
                  <SelectValue placeholder="Radius wählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableRadii.map((rad) => (
                    <SelectItem key={rad} value={rad}>
                      {rad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAngle">Ziel-Winkel (Grad)</Label>
              <Input
                id="targetAngle"
                type="number"
                step="0.1"
                placeholder="z.B. 90"
                value={targetAngle}
                onChange={(e) => setTargetAngle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetInnerLength">Ziel-Innenlänge (mm)</Label>
              <Input
                id="targetInnerLength"
                type="number"
                step="0.1"
                placeholder="z.B. 100"
                value={targetInnerLength}
                onChange={(e) => setTargetInnerLength(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="protectionPlate"
                checked={withProtectionPlate}
                onCheckedChange={(checked) => setWithProtectionPlate(checked === true)}
              />
              <Label htmlFor="protectionPlate" className="font-medium cursor-pointer">
                Mit 5mm Schutzplatte
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Parameter Suchen
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
