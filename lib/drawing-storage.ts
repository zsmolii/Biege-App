export interface BendData {
  id: string
  bendAngle: number
  radius: string
  innerLength: number
  material: string
  thickness: number
  vOpening: string
  withProtectionPlate: boolean
}

export interface DrawingAnalysis {
  id: string
  imageData: string
  bends: BendData[]
  flatPatternLength: number | null
  createdAt: string
  notes: string
}

const STORAGE_KEY = "bending_drawings"

export function getAllDrawings(): DrawingAnalysis[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveDrawing(drawing: Omit<DrawingAnalysis, "id" | "createdAt">): void {
  const drawings = getAllDrawings()
  const newDrawing: DrawingAnalysis = {
    ...drawing,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  drawings.push(newDrawing)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings))
}

export function deleteDrawing(id: string): void {
  const drawings = getAllDrawings()
  const filtered = drawings.filter((d) => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function findSimilarDrawings(bends: BendData[]): DrawingAnalysis[] {
  const allDrawings = getAllDrawings()

  // Find drawings with similar bend patterns
  return allDrawings.filter((drawing) => {
    if (drawing.bends.length !== bends.length) return false

    // Check if bend patterns are similar (same angles and materials)
    return drawing.bends.every((bend, index) => {
      const targetBend = bends[index]
      return (
        Math.abs(bend.bendAngle - targetBend.bendAngle) <= 5 &&
        bend.material === targetBend.material &&
        Math.abs(bend.thickness - targetBend.thickness) <= 0.5
      )
    })
  })
}
