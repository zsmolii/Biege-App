import Tesseract from "tesseract.js"

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
    // Perform OCR on the image
    const result = await Tesseract.recognize(imageData, "deu+eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })

    const text = result.data.text
    console.log("[v0] OCR Raw Text:", text)

    // Extract dimensions (numbers followed by optional mm or without unit)
    const dimensionPattern = /(\d+(?:[.,]\d+)?)\s*(?:mm)?/gi
    const dimensionMatches = [...text.matchAll(dimensionPattern)]
    const dimensions = dimensionMatches
      .map((m) => Number.parseFloat(m[1].replace(",", ".")))
      .filter((n) => !isNaN(n) && n > 0 && n < 10000) // Filter reasonable dimensions

    // Extract angles (numbers followed by ° or "grad")
    const anglePattern = /(\d+(?:[.,]\d+)?)\s*(?:°|grad)/gi
    const angleMatches = [...text.matchAll(anglePattern)]
    const angles = angleMatches
      .map((m) => Number.parseFloat(m[1].replace(",", ".")))
      .filter((n) => !isNaN(n) && n > 0 && n <= 180)

    // Extract radius (R followed by number)
    const radiusPattern = /R\s*(\d+(?:[.,]\d+)?)/i
    const radiusMatch = text.match(radiusPattern)
    const radius = radiusMatch ? `R${radiusMatch[1].replace(",", ".")}` : null

    // Try to detect material thickness (often marked as "10" or "t=10" or "s=10")
    const thicknessPattern = /(?:t|s|dicke)\s*[=:]\s*(\d+(?:[.,]\d+)?)|^(\d+)$/im
    const thicknessMatch = text.match(thicknessPattern)
    let thickness: number | null = null

    if (thicknessMatch) {
      thickness = Number.parseFloat((thicknessMatch[1] || thicknessMatch[2]).replace(",", "."))
    } else {
      // Try to infer thickness from common values in dimensions
      const commonThicknesses = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]
      for (const t of commonThicknesses) {
        if (dimensions.includes(t)) {
          thickness = t
          break
        }
      }
    }

    // Estimate bend count from angles found or from visual analysis
    const bendCount = angles.length > 0 ? angles.length : estimateBendCount(text, dimensions)

    // Determine what data is missing
    const missingData: string[] = []
    if (dimensions.length < bendCount + 1) {
      missingData.push("Nicht alle Innenlängen erkannt")
    }
    if (angles.length < bendCount) {
      missingData.push("Nicht alle Biegewinkel erkannt")
    }
    if (!radius) {
      missingData.push("Kein Radius erkannt (Standard R5 wird verwendet)")
    }
    if (!thickness) {
      missingData.push("Materialdicke nicht erkannt")
    }

    return {
      dimensions: dimensions.slice(0, 10), // Limit to reasonable number
      angles: angles.length > 0 ? angles : [90], // Default to 90° if none found
      radius: radius || "R5", // Default to R5
      thickness,
      bendCount: Math.max(bendCount, 1),
      confidence: result.data.confidence / 100,
      rawText: text,
      missingData,
    }
  } catch (error) {
    console.error("[v0] OCR Error:", error)
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
