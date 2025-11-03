"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { getTools } from "@/lib/supabase-storage"
import { analyzeDrawing, processBendData, type DrawingAnalysisResult } from "@/lib/ocr-processor"
import { calculateMarkingPoints, type BendInstruction } from "@/lib/marking-calculator"
import { saveLearnedData } from "@/lib/learning-system"
import { AlertCircle, Brain, CheckCircle2, Loader2, Ruler, Scan, Sparkles } from "lucide-react"

interface AutomaticDrawingAnalysisProps {
  imageData: string | null
}

export function AutomaticDrawingAnalysis({ imageData }: AutomaticDrawingAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [ocrResult, setOcrResult] = useState<DrawingAnalysisResult | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string>("")
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
  const [manualCorrections, setManualCorrections] = useState<{
    [key: number]: { innerLength?: number; angle?: number }
  }>({})

  const [materials, setMaterials] = useState<string[]>([])

  useEffect(() => {
    const loadTools = async () => {
      const m = await getTools("material")
      setMaterials(m)
      if (m.length > 0 && !selectedMaterial) {
        setSelectedMaterial(m[0])
      }
    }
    loadTools()
  }, [])

  const handleAutoAnalyze = async () => {
    if (!imageData) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      console.log("[v0] Starting drawing analysis...")

      // Perform OCR analysis
      const analysis = await analyzeDrawing(imageData)

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      console.log("[v0] Analysis Result:", analysis)
      setOcrResult(analysis)

      // Auto-select first material if not selected
      if (!selectedMaterial && materials.length > 0) {
        setSelectedMaterial(materials[0])
      }
    } catch (error) {
      console.error("[v0] Analysis failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
      alert(
        `Fehler bei der automatischen Analyse:\n\n${errorMessage}\n\nBitte versuchen Sie es erneut oder geben Sie die Werte manuell ein.`,
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCalculate = () => {
    if (!ocrResult || !selectedMaterial) return

    // Process the OCR data into bend instructions
    const bends = processBendData(ocrResult, selectedMaterial)

    // Apply manual corrections
    const correctedBends = bends.map((bend, index) => {
      const correction = manualCorrections[index]
      return {
        ...bend,
        innerLength: correction?.innerLength ?? bend.innerLength,
        bendAngle: correction?.angle ?? bend.bendAngle,
      }
    })

    // Calculate marking points
    const calculationResult = calculateMarkingPoints(correctedBends)
    setResult(calculationResult)
  }

  const updateManualCorrection = (bendIndex: number, field: "innerLength" | "angle", value: number) => {
    setManualCorrections({
      ...manualCorrections,
      [bendIndex]: {
        ...manualCorrections[bendIndex],
        [field]: value,
      },
    })
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
    handleCalculate()
    setLearningMode(false)
    setLearningBendIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Auto-Analyze Button */}
      {imageData && !ocrResult && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Automatische Zeichnungserkennung
            </CardTitle>
            <CardDescription>
              Das System analysiert die Zeichnung automatisch und erkennt Maße, Biegungen, Winkel und Radius
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAutoAnalyze} disabled={isAnalyzing} size="lg" className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysiere Zeichnung...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Zeichnung automatisch analysieren
                </>
              )}
            </Button>
            {isAnalyzing && (
              <div className="mt-4">
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-center">{analysisProgress}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* OCR Results & Manual Corrections */}
      {ocrResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Erkannte Daten
              </CardTitle>
              <CardDescription>Überprüfen Sie die erkannten Werte und korrigieren Sie bei Bedarf</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Missing Data Warnings */}
              {ocrResult.missingData.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">Hinweise:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {ocrResult.missingData.map((msg, i) => (
                        <li key={i} className="text-sm">
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Material Selection */}
              <div className="space-y-2">
                <Label>Material auswählen</Label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Material wählen..." />
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

              {/* Recognized Bends */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Erkannte Biegungen: {ocrResult.bendCount}</h4>
                {Array.from({ length: ocrResult.bendCount }).map((_, index) => {
                  const dimension = ocrResult.dimensions[index] || 0
                  const angle = ocrResult.angles[index] || ocrResult.angles[0] || 90

                  return (
                    <Card key={index} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Biegung {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Innenlänge (mm)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="h-9"
                            value={manualCorrections[index]?.innerLength ?? dimension}
                            onChange={(e) =>
                              updateManualCorrection(index, "innerLength", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Winkel (°)</Label>
                          <Input
                            type="number"
                            className="h-9"
                            value={manualCorrections[index]?.angle ?? angle}
                            onChange={(e) =>
                              updateManualCorrection(index, "angle", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-muted-foreground text-xs">Radius</div>
                  <div className="font-semibold">{ocrResult.radius || "R5 (Standard)"}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded">
                  <div className="text-muted-foreground text-xs">Materialdicke</div>
                  <div className="font-semibold">{ocrResult.thickness || "10"} mm</div>
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full" size="lg" disabled={!selectedMaterial}>
                <Ruler className="mr-2 h-4 w-4" />
                Biegeanweisungen berechnen
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Results Section - Same as before */}
      {result && (
        <>
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
                    <Button variant="outline" size="sm" onClick={() => startLearning(index)}>
                      <Brain className="mr-2 h-3 w-3" />
                      Werte korrigieren
                    </Button>
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
              Werte für Biegung {learningBendIndex + 1} korrigieren
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
