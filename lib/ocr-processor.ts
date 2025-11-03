import { fetch } from "node-fetch"

export interface RecognizedDimension {
  value: number
  confidence: number
  type: "length" | "angle" | "radius" | "thickness"
}

export interface DrawingAnalysisResult {
  dimensions: number[]
  angles: number[]
  radius: string | null
  thickness: number | null
  bendCount: number
  confidence: number
  rawText: string
  missingData: string[]
}

export async function analyzeDrawing(imageData: string): Promise<DrawingAnalysisResult> {
  try {
    console.log("[v0] Starting AI-powered drawing analysis...")

    // Call OpenAI GPT-4 Vision API for intelligent drawing analysis
    const response = await fetch("/api/analyze-drawing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageData }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] AI Analysis Result:", result)

    return result
  } catch (error) {
    console.error("[v0] Drawing Analysis Error:", error)
    throw new Error("Fehler bei der Zeichnungserkennung")
  }
}

function estimateBendCount(text: string, dimensions: number[]): number {
  // Look for bend indicators in text
  const bendKeywords = ["biegung", "bend", "winkel", "angle"]
  let count = 0

  for (const keyword of bendKeywords) {
    const regex = new RegExp(keyword, "gi")
    const matches = text.match(regex)
    if (matches) count = Math.max(count, matches.length)
  }

  // If no keywords found, estimate from number of dimensions
  // Typically: n bends = n+1 dimensions
  if (count === 0 && dimensions.length > 1) {
    count = dimensions.length - 1
  }

  return Math.max(count, 1) // At least 1 bend
}

// Process the recognized data and create bend instructions
export function processBendData(
  analysis: DrawingAnalysisResult,
  material: string,
): Array<{
  innerLength: number
  bendAngle: number
  radius: string
  thickness: number
  material: string
  vOpening: string
}> {
  const bends = []
  const { dimensions, angles, radius, thickness, bendCount } = analysis

  // Use default thickness if not detected
  const finalThickness = thickness || 10

  // Determine V-opening based on thickness
  const vOpening = finalThickness <= 6 ? "V50" : "V80"

  for (let i = 0; i < bendCount; i++) {
    // Get inner length for this bend
    // For first bend, use first dimension
    // For subsequent bends, use next available dimension
    const innerLength = dimensions[i] || 0

    // Get angle for this bend
    const bendAngle = angles[i] || angles[0] || 90

    bends.push({
      innerLength,
      bendAngle,
      radius: radius || "R5",
      thickness: finalThickness,
      material,
      vOpening,
    })
  }

  return bends
}
