// Learning system for bend allowances and corrections
export interface LearnedBendData {
  id: string
  material: string
  thickness: number
  radius: string
  angle: number
  vOpening: string
  // Learned values
  bendAllowance: number // mm to add for this bend
  experienceCorrection: number // Additional mm from experience
  groundSetting: number // Back gauge position in mm
  pressDistance: number // Press travel distance in mm
  // Metadata
  usageCount: number
  lastUsed: string
  createdAt: string
}

const LEARNING_STORAGE_KEY = "bending_learned_data"

export function getAllLearnedData(): LearnedBendData[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(LEARNING_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveLearnedData(data: Omit<LearnedBendData, "id" | "usageCount" | "lastUsed" | "createdAt">): void {
  const allData = getAllLearnedData()

  // Check if we already have data for this exact combination
  const existing = allData.find(
    (d) =>
      d.material === data.material &&
      d.thickness === data.thickness &&
      d.radius === data.radius &&
      d.angle === data.angle &&
      d.vOpening === data.vOpening,
  )

  if (existing) {
    // Update existing data
    existing.bendAllowance = data.bendAllowance
    existing.experienceCorrection = data.experienceCorrection
    existing.groundSetting = data.groundSetting
    existing.pressDistance = data.pressDistance
    existing.usageCount += 1
    existing.lastUsed = new Date().toISOString()
  } else {
    // Add new learned data
    const newData: LearnedBendData = {
      ...data,
      id: Date.now().toString(),
      usageCount: 1,
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    allData.push(newData)
  }

  localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(allData))
}

export function findLearnedData(
  material: string,
  thickness: number,
  radius: string,
  angle: number,
  vOpening: string,
): LearnedBendData | null {
  const allData = getAllLearnedData()

  // Try exact match first
  let found = allData.find(
    (d) =>
      d.material === material &&
      Math.abs(d.thickness - thickness) < 0.1 &&
      d.radius === radius &&
      Math.abs(d.angle - angle) < 1 &&
      d.vOpening === vOpening,
  )

  if (found) return found

  // Try similar match (same material, thickness, radius but different angle)
  found = allData.find(
    (d) =>
      d.material === material &&
      Math.abs(d.thickness - thickness) < 0.1 &&
      d.radius === radius &&
      d.vOpening === vOpening,
  )

  return found || null
}

// Calculate default bend allowance if no learned data exists
export function calculateDefaultBendAllowance(thickness: number, radius: string, angle: number): number {
  const radiusValue = Number.parseFloat(radius.replace("R", ""))

  // Standard formula: (angle / 90) * (radius + thickness/2) * 0.5
  // This is a simplified approximation
  const factor = angle / 90
  const allowance = factor * (radiusValue + thickness / 2) * 0.5

  return Math.round(allowance * 10) / 10 // Round to 1 decimal
}

// Get default machine settings if no learned data exists
export function getDefaultMachineSettings(
  thickness: number,
  vOpening: string,
  angle: number,
): { groundSetting: number; pressDistance: number } {
  const vValue = Number.parseFloat(vOpening.replace("V", ""))

  // Default ground setting is typically V-opening + some offset
  const groundSetting = vValue + 7

  // Press distance depends on angle
  // For 90°: typically V-opening + 30-40mm
  // For other angles: adjust proportionally
  const basePressDistance = vValue + 35
  const pressDistance = basePressDistance + (angle - 90) * 0.15

  return {
    groundSetting: Math.round(groundSetting * 10) / 10,
    pressDistance: Math.round(pressDistance * 10) / 10,
  }
}
