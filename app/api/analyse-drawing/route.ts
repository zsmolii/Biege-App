import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    console.log("[v0] Analyzing drawing with AI...")

    // Use GPT-4 Vision to analyze the technical drawing
    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Du bist ein Experte für technische Zeichnungen und Blechbearbeitung. Analysiere diese technische Zeichnung eines gebogenen Blechteils und extrahiere folgende Informationen:

1. **Biegungen**: Wie viele Biegungen gibt es? Zähle alle Biegungen von links nach rechts.
2. **Innenlängen**: Für jede Biegung, was ist die Innenlänge (die Länge zwischen den Biegungen)? Gib die Maße in mm an.
3. **Winkel**: Welche Biegewinkel haben die Biegungen? (z.B. 30°, 90°, etc.)
4. **Radius**: Welcher Biegeradius wird verwendet? (z.B. R5, R10, etc.)
5. **Materialdicke**: Wie dick ist das Material? (z.B. 10mm)

WICHTIG: 
- Gib die Innenlängen in der Reihenfolge an, wie sie auf der Zeichnung erscheinen (von links nach rechts oder von oben nach unten)
- Wenn ein Maß wie "50" angegeben ist, ist das die Innenlänge VOR der Biegung
- Wenn ein Maß wie "161.5" angegeben ist, ist das die Innenlänge zwischen zwei Biegungen
- Achte auf alle Maßangaben und Winkelangaben auf der Zeichnung

Antworte im folgenden JSON-Format:
{
  "bendCount": <Anzahl der Biegungen>,
  "dimensions": [<Innenlänge 1>, <Innenlänge 2>, ...],
  "angles": [<Winkel 1>, <Winkel 2>, ...],
  "radius": "<Radius, z.B. R5>",
  "thickness": <Materialdicke in mm>,
  "confidence": <Dein Vertrauen in die Analyse, 0-1>,
  "explanation": "<Kurze Erklärung deiner Analyse>"
}`,
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
    })

    console.log("[v0] AI Response:", text)

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not parse AI response")
    }

    const analysis = JSON.parse(jsonMatch[0])

    // Validate and format the response
    const result: {
      dimensions: number[]
      angles: number[]
      radius: string | null
      thickness: number | null
      bendCount: number
      confidence: number
      rawText: string
      missingData: string[]
    } = {
      dimensions: analysis.dimensions || [],
      angles: analysis.angles || [],
      radius: analysis.radius || "R5",
      thickness: analysis.thickness || null,
      bendCount: analysis.bendCount || 1,
      confidence: analysis.confidence || 0.8,
      rawText: analysis.explanation || "",
      missingData: [],
    }

    // Determine what data is missing
    if (result.dimensions.length < result.bendCount + 1) {
      result.missingData.push("Nicht alle Innenlängen erkannt")
    }
    if (result.angles.length < result.bendCount) {
      result.missingData.push("Nicht alle Biegewinkel erkannt")
    }
    if (!result.radius) {
      result.missingData.push("Kein Radius erkannt (Standard R5 wird verwendet)")
    }
    if (!result.thickness) {
      result.missingData.push("Materialdicke nicht erkannt")
    }

    console.log("[v0] Formatted Analysis:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Analysis Error:", error)
    return NextResponse.json({ error: "Failed to analyze drawing" }, { status: 500 })
  }
}
