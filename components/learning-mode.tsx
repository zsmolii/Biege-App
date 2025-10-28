"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { saveRecipe, getTools } from "@/lib/supabase-storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface LearningModeProps {
  searchParams: {
    material: string
    thickness: number
    radius: string
    targetAngle: number
    targetInnerLength: number
    withProtectionPlate: boolean
  }
  onRecipeLearned: () => void
}

export function LearningMode({ searchParams, onRecipeLearned }: LearningModeProps) {
  const [vOpening, setVOpening] = useState("")
  const [groundSetting, setGroundSetting] = useState("")
  const [pressureSetting, setPressureSetting] = useState("")
  const [lengthAllowance, setLengthAllowance] = useState("")

  const [availableVOpenings, setAvailableVOpenings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadTools = async () => {
      const vOpenings = await getTools("v_opening")
      setAvailableVOpenings(vOpenings)
    }
    loadTools()
  }, [])

  const handleLearn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vOpening || !groundSetting || !pressureSetting || !lengthAllowance) {
      alert("Bitte füllen Sie alle Felder aus")
      return
    }

    setLoading(true)

    const success = await saveRecipe({
      material: searchParams.material,
      thickness: searchParams.thickness,
      radius: searchParams.radius,
      target_angle: searchParams.targetAngle,
      inner_length: searchParams.targetInnerLength,
      with_protection_plate: searchParams.withProtectionPlate,
      v_opening: vOpening,
      ground_setting: Number.parseFloat(groundSetting),
      press_distance: Number.parseFloat(pressureSetting),
      length_allowance: Number.parseFloat(lengthAllowance),
    })

    setLoading(false)

    if (success) {
      alert("Rezept erfolgreich gelernt und gespeichert!")
      onRecipeLearned()

      // Reset form
      setVOpening("")
      setGroundSetting("")
      setPressureSetting("")
      setLengthAllowance("")
    } else {
      alert("Fehler beim Speichern des Rezepts")
    }
  }

  return (
    <Card className="border-orange-500/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <InfoIcon className="h-6 w-6 text-orange-400" />
          </div>
          <CardTitle className="text-2xl text-orange-400">Lernmodus</CardTitle>
        </div>
        <CardDescription className="text-base mt-2">
          Kein gespeichertes Rezept gefunden. Bitte Maschinenparameter eingeben.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-orange-500/30 bg-orange-500/5">
          <InfoIcon className="h-4 w-4 text-orange-400" />
          <AlertTitle className="text-orange-400">Einmalige Eingabe erforderlich</AlertTitle>
          <AlertDescription>
            Führen Sie die Biegung manuell durch und tragen Sie die ermittelten Werte ein. Diese werden für zukünftige
            Verwendung gespeichert.
          </AlertDescription>
        </Alert>

        <div className="bg-muted/50 p-5 rounded-xl space-y-2 text-sm border border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <span className="font-medium text-muted-foreground">Material:</span>
            <span className="font-semibold">{searchParams.material}</span>
            <span className="font-medium text-muted-foreground">Dicke:</span>
            <span className="font-semibold">{searchParams.thickness} mm</span>
            <span className="font-medium text-muted-foreground">Radius:</span>
            <span className="font-semibold">{searchParams.radius}</span>
            <span className="font-medium text-muted-foreground">Winkel:</span>
            <span className="font-semibold">{searchParams.targetAngle}°</span>
            <span className="font-medium text-muted-foreground">Schutzplatte:</span>
            <span className="font-semibold">{searchParams.withProtectionPlate ? "Ja (5mm)" : "Nein"}</span>
          </div>
        </div>

        <form onSubmit={handleLearn} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vOpening" className="text-sm font-medium">
                V-Öffnung (Matrize)
              </Label>
              <Select value={vOpening} onValueChange={setVOpening}>
                <SelectTrigger id="vOpening" className="h-11">
                  <SelectValue placeholder="V-Öffnung wählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableVOpenings.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groundSetting" className="text-sm font-medium">
                Grund Einstellung |{"<-"} (mm)
              </Label>
              <Input
                id="groundSetting"
                type="number"
                step="0.1"
                placeholder="z.B. 100.0"
                value={groundSetting}
                onChange={(e) => setGroundSetting(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pressureSetting" className="text-sm font-medium">
                Druck Einstellung -{">"}| (mm)
              </Label>
              <Input
                id="pressureSetting"
                type="number"
                step="0.1"
                placeholder="z.B. 85.5"
                value={pressureSetting}
                onChange={(e) => setPressureSetting(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lengthAllowance" className="text-sm font-medium">
                Längenzuschlag / K-Wert (mm)
              </Label>
              <Input
                id="lengthAllowance"
                type="number"
                step="0.1"
                placeholder="z.B. 2.5"
                value={lengthAllowance}
                onChange={(e) => setLengthAllowance(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg" disabled={loading}>
            {loading ? "Wird gespeichert..." : "Rezept Speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
