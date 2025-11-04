import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Received drawing analysis request")

    const { imageData } = await request.json()

    if (!imageData) {
      console.error("[v0] API: No image data provided")
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    console.log("[v0] API: Analyzing drawing with AI...")

    let text: string
    try {
      const result = await generateText({
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
      text = result.text
    } catch (aiError) {
      console.error("[v0] API: AI generation failed:", aiError)

      const errorMessage = aiError instanceof Error ? aiError.message : "Unbekannter Fehler"

      // Check if it's an authentication error
      if (errorMessage.includes("401") || errorMessage.includes("authentication") || errorMessage.includes("API key")) {
        return NextResponse.json(
          {
            error:
              "Die automatische Zeichnungsanalyse benötigt einen OpenAI API-Key. Bitte fügen Sie einen OPENAI_API_KEY in den Umgebungsvariablen hinzu oder geben Sie die Werte manuell ein.",
          },
          { status: 401 },
        )
      }

      // Generic AI error
      return NextResponse.json(
        {
          error: `Die AI-Analyse ist momentan nicht verfügbar: ${errorMessage}. Bitte geben Sie die Werte manuell ein.`,
        },
        { status: 500 },
      )
    }

    console.log("[v0] API: AI Response:", text)

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] API: Could not parse AI response")
      return NextResponse.json(
        {
          error:
            "Die AI-Antwort konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut oder geben Sie die Werte manuell ein.",
        },
        { status: 500 },
      )
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

    console.log("[v0] API: Formatted Analysis:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] API: Analysis Error:", error)
    return NextResponse.json(
      {
        error: `Fehler bei der Analyse: ${error instanceof Error ? error.message : "Unbekannter Fehler"}. Bitte geben Sie die Werte manuell ein.`,
      },
      { status: 500 },
    )
  }
}
