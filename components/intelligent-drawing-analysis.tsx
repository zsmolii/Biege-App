"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTools } from "@/lib/supabase-storage"
import { calculateMarkingPoints, type BendInstruction } from "@/lib/marking-calculator"
import { saveLearnedData } from "@/lib/learning-system"
import { Plus, Trash2, AlertCircle, Brain, CheckCircle2, Ruler } from "lucide-react"

interface BendInput {
  id: string
  innerLength: number
  bendAngle: number
  radius: string
  thickness: number
  material: string
  vOpening: string
}

interface IntelligentDrawingAnalysisProps {
  imageData: string | null
}

export function IntelligentDrawingAnalysis({ imageData }: IntelligentDrawingAnalysisProps) {
  const [bends, setBends] = useState<BendInput[]>([])
  const [result, setResult] = useState<{
    flatLength: number
    instructions: BendInstruction[]
    hasLearnedData: boolean
    missingDimensions: string[]
  } | null>(null)
  const [learningMode, setLearningMode] = useState(false)
  const [learningBendIndex, setLearningBendIndex] = useState<number | null>(null)
  const [learningValues, setLearningValues] = useState({
    bendAllowance: 0,
    experienceCorrection: 0,
    groundSetting: 0,
    pressDistance: 0,
  })

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
    const newBend: BendInput = {
      id: Date.now().toString(),
      innerLength: 0,
      bendAngle: 90,
      radius: "R5", // Default to R5
      thickness: 10,
      material: materials[0] || "Stahl",
      vOpening: "V50",
    }
    setBends([...bends, newBend])
  }

  const removeBend = (id: string) => {
    setBends(bends.filter((b) => b.id !== id))
  }

  const updateBend = (id: string, field: keyof BendInput, value: any) => {
    setBends(bends.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const handleAnalyze = () => {
    const calculationResult = calculateMarkingPoints(bends)
    setResult(calculationResult)
    setLearningMode(false)
    setLearningBendIndex(null)
  }

  const startLearning = (bendIndex: number) => {
    if (!result) return

    const instruction = result.instructions[bendIndex]
    setLearningBendIndex(bendIndex)
    setLearningValues({
      bendAllowance: instruction.bendAllowance,
      experienceCorrection: instruction.experienceCorrection,
      groundSetting: instruction.groundSetting,
      pressDistance: instruction.pressDistance,
    })
    setLearningMode(true)
  }

  const saveLearning = () => {
    if (learningBendIndex === null || !result) return

    const instruction = result.instructions[learningBendIndex]

    saveLearnedData({
      material: instruction.material,
      thickness: instruction.thickness,
      radius: instruction.radius,
      angle: instruction.angle,
      vOpening: instruction.vOpening,
      bendAllowance: learningValues.bendAllowance,
      experienceCorrection: learningValues.experienceCorrection,
      groundSetting: learningValues.groundSetting,
      pressDistance: learningValues.pressDistance,
    })

    // Recalculate with new learned data
    handleAnalyze()
    setLearningMode(false)
    setLearningBendIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Bend Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Biegungen definieren</CardTitle>
          <CardDescription>
            Geben Sie die Biegungen aus der Zeichnung ein. Das System lernt mit der Zeit und schlägt optimale Werte vor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={addBend} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Biegung hinzufügen
          </Button>

          {bends.map((bend, index) => (
            <Card key={bend.id} className="bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Biegung {index + 1}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => removeBend(bend.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Material</Label>
                  <Select value={bend.material} onValueChange={(v) => updateBend(bend.id, "material", v)}>
                    <SelectTrigger className="h-9">
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
                  <Label className="text-xs">Dicke (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-9"
                    value={bend.thickness || ""}
                    onChange={(e) => updateBend(bend.id, "thickness", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Innenlänge (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-9"
                    value={bend.innerLength || ""}
                    onChange={(e) => updateBend(bend.id, "innerLength", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Winkel (°)</Label>
                  <Input
                    type="number"
                    className="h-9"
                    value={bend.bendAngle || ""}
                    onChange={(e) => updateBend(bend.id, "bendAngle", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Radius (Standard: R5)</Label>
                  <Select value={bend.radius} onValueChange={(v) => updateBend(bend.id, "radius", v)}>
                    <SelectTrigger className="h-9">
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
                  <Label className="text-xs">V-Öffnung</Label>
                  <Select value={bend.vOpening} onValueChange={(v) => updateBend(bend.id, "vOpening", v)}>
                    <SelectTrigger className="h-9">
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
              </CardContent>
            </Card>
          ))}

          {bends.length > 0 && (
            <Button onClick={handleAnalyze} className="w-full" size="lg">
              <Ruler className="mr-2 h-4 w-4" />
              Analyse durchführen
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Missing Dimensions Warning */}
          {result.missingDimensions.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Fehlende Maße:</div>
                <ul className="list-disc list-inside space-y-1">
                  {result.missingDimensions.map((msg, i) => (
                    <li key={i} className="text-sm">
                      {msg}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Flat Length */}
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-blue-400" />
                Gestreckte Länge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-400">{result.flatLength} mm</div>
              {result.hasLearnedData && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
                  <Brain className="h-4 w-4" />
                  Berechnung basiert auf gelernten Daten
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bend Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Biegeanweisungen</h3>
            {result.instructions.map((instruction, index) => (
              <Card key={index} className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      Biegung {instruction.bendNumber}
                      {instruction.isLearned && (
                        <span className="text-xs font-normal text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Gelernt
                        </span>
                      )}
                    </CardTitle>
                    {!instruction.isLearned && (
                      <Button variant="outline" size="sm" onClick={() => startLearning(index)}>
                        <Brain className="mr-2 h-3 w-3" />
                        Werte lernen
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Markierpunkt</div>
                      <div className="text-2xl font-bold text-blue-400">{instruction.markingPoint} mm</div>
                      <div className="text-xs text-muted-foreground mt-1">Hier markieren und drücken</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Winkel & Werkzeug</div>
                      <div className="text-lg font-semibold">
                        {instruction.angle}° mit {instruction.radius}
                      </div>
                      <div className="text-sm text-muted-foreground">V-Öffnung: {instruction.vOpening}</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="text-sm font-semibold mb-2">Maschineneinstellungen:</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background/50 p-2 rounded">
                        <div className="text-muted-foreground text-xs">Hinteranschlag |&lt;-</div>
                        <div className="font-mono font-semibold">{instruction.groundSetting} mm</div>
                      </div>
                      <div className="bg-background/50 p-2 rounded">
                        <div className="text-muted-foreground text-xs">Pressweg -&gt;|</div>
                        <div className="font-mono font-semibold">{instruction.pressDistance} mm</div>
                      </div>
                    </div>
                  </div>

                  {!instruction.isLearned && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Dies sind berechnete Standardwerte. Nach dem ersten Biegen können Sie die tatsächlichen Werte
                        speichern, damit das System lernt.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Learning Mode Dialog */}
      {learningMode && learningBendIndex !== null && result && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-400" />
              Werte für Biegung {learningBendIndex + 1} lernen
            </CardTitle>
            <CardDescription>
              Geben Sie die tatsächlichen Werte ein, die Sie an der Maschine ermittelt haben
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Biegezugabe (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={learningValues.bendAllowance}
                  onChange={(e) =>
                    setLearningValues({ ...learningValues, bendAllowance: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Erfahrungskorrektur (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={learningValues.experienceCorrection}
                  onChange={(e) =>
                    setLearningValues({
                      ...learningValues,
                      experienceCorrection: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hinteranschlag |&lt;- (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={learningValues.groundSetting}
                  onChange={(e) =>
                    setLearningValues({ ...learningValues, groundSetting: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Pressweg -&gt;| (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={learningValues.pressDistance}
                  onChange={(e) =>
                    setLearningValues({ ...learningValues, pressDistance: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveLearning} className="flex-1">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Werte speichern
              </Button>
              <Button variant="outline" onClick={() => setLearningMode(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
