"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getTools } from "@/lib/supabase-storage"
import { saveDrawing, findSimilarDrawings, type BendData } from "@/lib/drawing-storage"
import { calculateFlatPattern, type FlatPatternResult } from "@/lib/flat-pattern-calculator"
import { Plus, Trash2, AlertCircle, Lightbulb } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BendAnalysisProps {
  imageData: string | null
  onAnalysisComplete: (result: FlatPatternResult) => void
}

export function BendAnalysis({ imageData, onAnalysisComplete }: BendAnalysisProps) {
  const [bends, setBends] = useState<BendData[]>([])
  const [notes, setNotes] = useState("")
  const [missingData, setMissingData] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [vOpenings, setVOpenings] = useState<string[]>([])
  const [radii, setRadii] = useState<string[]>([])
  const [materials, setMaterials] = useState<string[]>([])

  useEffect(() => {
    const loadTools = async () => {
      const [v, r, m] = await Promise.all([getTools("v_opening"), getTools("radius"), getTools("material")])
      setVOpenings(v)
      setRadii(r)
      setMaterials(m)
    }
    loadTools()
  }, [])

  const addBend = () => {
    const newBend: BendData = {
      id: Date.now().toString(),
      bendAngle: 90,
      radius: radii[0] || "R5",
      innerLength: 0,
      material: materials[0] || "Stahl",
      thickness: 0,
      vOpening: vOpenings[0] || "V80",
      withProtectionPlate: false,
    }
    setBends([...bends, newBend])
  }

  const removeBend = (id: string) => {
    setBends(bends.filter((b) => b.id !== id))
  }

  const updateBend = (id: string, field: keyof BendData, value: any) => {
    setBends(bends.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const validateData = (): boolean => {
    const missing: string[] = []

    if (!imageData) {
      missing.push("Keine Zeichnung hochgeladen")
    }

    if (bends.length === 0) {
      missing.push("Mindestens eine Biegung muss definiert werden")
    }

    bends.forEach((bend, index) => {
      if (bend.innerLength === 0) {
        missing.push(`Biegung ${index + 1}: Innenlänge fehlt`)
      }
      if (bend.thickness === 0) {
        missing.push(`Biegung ${index + 1}: Materialdicke fehlt`)
      }
    })

    setMissingData(missing)
    return missing.length === 0
  }

  const checkForSuggestions = () => {
    if (bends.length > 0) {
      const similar = findSimilarDrawings(bends)
      if (similar.length > 0) {
        const suggestionTexts = similar.map((drawing) => {
          const totalLength = drawing.flatPatternLength || 0
          return `Ähnliche Zeichnung gefunden: ${drawing.bends.length} Biegungen, Gesamtlänge: ${totalLength.toFixed(1)}mm`
        })
        setSuggestions(suggestionTexts)
      } else {
        setSuggestions([])
      }
    }
  }

  const handleAnalyze = () => {
    if (!validateData()) {
      return
    }

    checkForSuggestions()

    const result = calculateFlatPattern(bends)

    // Save the analysis
    if (imageData) {
      saveDrawing({
        imageData,
        bends,
        flatPatternLength: result.totalFlatLength,
        notes,
      })
    }

    onAnalysisComplete(result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biegeanalyse</CardTitle>
        <CardDescription>
          Definieren Sie die Biegungen in der Zeichnung. Das System lernt mit der Zeit und schlägt ähnliche Muster vor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {missingData.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Fehlende Daten:</div>
              <ul className="list-disc list-inside space-y-1">
                {missingData.map((msg, i) => (
                  <li key={i} className="text-sm">
                    {msg}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {suggestions.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Vorschläge basierend auf ähnlichen Zeichnungen:</div>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.map((msg, i) => (
                  <li key={i} className="text-sm">
                    {msg}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Biegungen</h3>
            <Button onClick={addBend} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Biegung hinzufügen
            </Button>
          </div>

          {bends.map((bend, index) => (
            <Card key={bend.id} className="bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Biegung {index + 1}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => removeBend(bend.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select value={bend.material} onValueChange={(v) => updateBend(bend.id, "material", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Materialdicke (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={bend.thickness || ""}
                    onChange={(e) => updateBend(bend.id, "thickness", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Biegewinkel (°)</Label>
                  <Input
                    type="number"
                    value={bend.bendAngle || ""}
                    onChange={(e) => updateBend(bend.id, "bendAngle", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Radius</Label>
                  <Select value={bend.radius} onValueChange={(v) => updateBend(bend.id, "radius", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {radii.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Innenlänge (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={bend.innerLength || ""}
                    onChange={(e) => updateBend(bend.id, "innerLength", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>V-Öffnung</Label>
                  <Select value={bend.vOpening} onValueChange={(v) => updateBend(bend.id, "vOpening", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vOpenings.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox
                    id={`protection-${bend.id}`}
                    checked={bend.withProtectionPlate}
                    onCheckedChange={(checked) => updateBend(bend.id, "withProtectionPlate", checked)}
                  />
                  <Label htmlFor={`protection-${bend.id}`} className="cursor-pointer">
                    Mit 5mm Schutzplatte
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Notizen (optional)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Zusätzliche Informationen zur Zeichnung..."
          />
        </div>

        <Button onClick={handleAnalyze} className="w-full" size="lg">
          Analyse durchführen & Gestreckte Länge berechnen
        </Button>
      </CardContent>
    </Card>
  )
}
