// Calculate marking points and machine settings for bends
import { findLearnedData, calculateDefaultBendAllowance, getDefaultMachineSettings } from "./learning-system"

export interface BendInstruction {
  bendNumber: number
  markingPoint: number // Where to mark on the material (mm from start)
  angle: number
  radius: string
  vOpening: string
  material: string
  thickness: number
  groundSetting: number // |<- back gauge position
  pressDistance: number // ->| press travel distance
  bendAllowance: number
  experienceCorrection: number
  isLearned: boolean // Whether this uses learned data or defaults
}

export interface MarkingResult {
  flatLength: number // Total flat pattern length
  instructions: BendInstruction[]
  hasLearnedData: boolean // Whether any learned data was used
  missingDimensions: string[]
}

export function calculateMarkingPoints(
  bends: Array<{
    innerLength: number
    bendAngle: number
    radius: string
    thickness: number
    material: string
    vOpening: string
  }>,
): MarkingResult {
  const instructions: BendInstruction[] = []
  const missingDimensions: string[] = []
  let hasLearnedData = false
  let cumulativeLength = 0

  // Validate input
  bends.forEach((bend, index) => {
    if (!bend.innerLength || bend.innerLength === 0) {
      missingDimensions.push(`Biegung ${index + 1}: Innenlänge fehlt`)
    }
    if (!bend.thickness || bend.thickness === 0) {
      missingDimensions.push(`Biegung ${index + 1}: Materialdicke fehlt`)
    }
    if (!bend.radius) {
      missingDimensions.push(`Biegung ${index + 1}: Radius fehlt (Standard: R5)`)
    }
  })

  // Calculate marking points for each bend
  bends.forEach((bend, index) => {
    // Use R5 as default if no radius specified
    const radius = bend.radius || "R5"

    // Try to find learned data
    const learned = findLearnedData(bend.material, bend.thickness, radius, bend.bendAngle, bend.vOpening)

    let bendAllowance: number
    let experienceCorrection: number
    let groundSetting: number
    let pressDistance: number
    let isLearned: boolean

    if (learned) {
      // Use learned values
      bendAllowance = learned.bendAllowance
      experienceCorrection = learned.experienceCorrection
      groundSetting = learned.groundSetting
      pressDistance = learned.pressDistance
      isLearned = true
      hasLearnedData = true
    } else {
      // Use calculated defaults
      bendAllowance = calculateDefaultBendAllowance(bend.thickness, radius, bend.bendAngle)
      experienceCorrection = 0
      const defaults = getDefaultMachineSettings(bend.thickness, bend.vOpening, bend.bendAngle)
      groundSetting = defaults.groundSetting
      pressDistance = defaults.pressDistance
      isLearned = false
    }

    // Calculate marking point
    // First bend: innerLength + bendAllowance + experienceCorrection
    // Subsequent bends: previous cumulative + current innerLength + allowances
    if (index === 0) {
      cumulativeLength = bend.innerLength + bendAllowance + experienceCorrection
    } else {
      cumulativeLength += bend.innerLength + bendAllowance + experienceCorrection
    }

    instructions.push({
      bendNumber: index + 1,
      markingPoint: Math.round(cumulativeLength),
      angle: bend.bendAngle,
      radius,
      vOpening: bend.vOpening,
      material: bend.material,
      thickness: bend.thickness,
      groundSetting,
      pressDistance,
      bendAllowance,
      experienceCorrection,
      isLearned,
    })
  })

  // Calculate total flat length
  const totalInnerLength = bends.reduce((sum, b) => sum + b.innerLength, 0)
  const totalAllowances = instructions.reduce((sum, i) => sum + i.bendAllowance + i.experienceCorrection, 0)
  const flatLength = Math.round(totalInnerLength + totalAllowances)

  return {
    flatLength,
    instructions,
    hasLearnedData,
    missingDimensions,
  }
}
