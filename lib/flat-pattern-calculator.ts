export interface BendCalculation {
  bendNumber: number
  innerLength: number
  bendAngle: number
  radius: number
  thickness: number
  bendAllowance: number
  kFactor: number
}

export interface FlatPatternResult {
  totalFlatLength: number
  calculations: BendCalculation[]
  totalBendAllowance: number
  totalInnerLength: number
}

/**
 * Calculate K-factor based on material and bend radius
 * K-factor represents the neutral axis position in the material
 */
function calculateKFactor(radius: number, thickness: number): number {
  const ratio = radius / thickness

  // Standard K-factor approximations based on R/T ratio
  if (ratio < 1) return 0.33
  if (ratio < 2) return 0.38
  if (ratio < 3) return 0.4
  if (ratio < 4) return 0.42
  if (ratio < 8) return 0.44
  return 0.46
}

/**
 * Calculate bend allowance for a single bend
 * BA = Angle × (π/180) × (R + K × T)
 */
function calculateBendAllowance(angle: number, radius: number, thickness: number, kFactor: number): number {
  const angleRad = (angle * Math.PI) / 180
  return angleRad * (radius + kFactor * thickness)
}

/**
 * Calculate complete flat pattern length from multiple bends
 */
export function calculateFlatPattern(
  bends: Array<{
    innerLength: number
    bendAngle: number
    radius: string
    thickness: number
  }>,
): FlatPatternResult {
  const calculations: BendCalculation[] = []
  let totalInnerLength = 0
  let totalBendAllowance = 0

  bends.forEach((bend, index) => {
    const radiusValue = Number.parseFloat(bend.radius.replace("R", ""))
    const kFactor = calculateKFactor(radiusValue, bend.thickness)
    const bendAllowance = calculateBendAllowance(bend.bendAngle, radiusValue, bend.thickness, kFactor)

    calculations.push({
      bendNumber: index + 1,
      innerLength: bend.innerLength,
      bendAngle: bend.bendAngle,
      radius: radiusValue,
      thickness: bend.thickness,
      bendAllowance,
      kFactor,
    })

    totalInnerLength += bend.innerLength
    totalBendAllowance += bendAllowance
  })

  return {
    totalFlatLength: totalInnerLength + totalBendAllowance,
    calculations,
    totalBendAllowance,
    totalInnerLength,
  }
}
