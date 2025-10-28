export interface BendingRecipe {
  id: string
  material: string
  thickness: number
  radius: string
  targetAngle: number
  targetInnerLength: number
  withProtectionPlate: boolean
  vOpening: string
  groundSetting: number
  pressureSetting: number
  lengthAllowance: number
}

export interface ToolData {
  vOpenings: string[]
  radii: string[]
  materials: string[]
}

const STORAGE_KEYS = {
  RECIPES: "bending_recipes",
  TOOLS: "bending_tools",
}

// Initialize default tools if not exists
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.TOOLS)) {
    const defaultTools: ToolData = {
      vOpenings: ["V50", "V80"],
      radii: ["R1.5", "R5", "R10"],
      materials: ["Stahl", "Kupfer", "V2A", "V4A", "Aluminium"],
    }
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(defaultTools))
  }

  if (!localStorage.getItem(STORAGE_KEYS.RECIPES)) {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify([]))
  }
}

// Recipe operations
export function getAllRecipes(): BendingRecipe[] {
  const data = localStorage.getItem(STORAGE_KEYS.RECIPES)
  return data ? JSON.parse(data) : []
}

export function findRecipe(
  material: string,
  thickness: number,
  radius: string,
  targetAngle: number,
  withProtectionPlate: boolean,
): BendingRecipe | null {
  const recipes = getAllRecipes()
  return (
    recipes.find(
      (r) =>
        r.material === material &&
        r.thickness === thickness &&
        r.radius === radius &&
        r.targetAngle === targetAngle &&
        r.withProtectionPlate === withProtectionPlate,
    ) || null
  )
}

export function saveRecipe(recipe: Omit<BendingRecipe, "id">): void {
  const recipes = getAllRecipes()
  const newRecipe: BendingRecipe = {
    ...recipe,
    id: Date.now().toString(),
  }
  recipes.push(newRecipe)
  localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes))
}

export function deleteRecipe(id: string): void {
  const recipes = getAllRecipes()
  const filtered = recipes.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filtered))
}

// Tool operations
export function getTools(): ToolData {
  const data = localStorage.getItem(STORAGE_KEYS.TOOLS)
  return data ? JSON.parse(data) : { vOpenings: [], radii: [], materials: [] }
}

export function addVOpening(vOpening: string): void {
  const tools = getTools()
  if (!tools.vOpenings.includes(vOpening)) {
    tools.vOpenings.push(vOpening)
    tools.vOpenings.sort()
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
  }
}

export function removeVOpening(vOpening: string): void {
  const tools = getTools()
  tools.vOpenings = tools.vOpenings.filter((v) => v !== vOpening)
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
}

export function addRadius(radius: string): void {
  const tools = getTools()
  if (!tools.radii.includes(radius)) {
    tools.radii.push(radius)
    tools.radii.sort()
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
  }
}

export function removeRadius(radius: string): void {
  const tools = getTools()
  tools.radii = tools.radii.filter((r) => r !== radius)
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
}

export function addMaterial(material: string): void {
  const tools = getTools()
  if (!tools.materials.includes(material)) {
    tools.materials.push(material)
    tools.materials.sort()
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
  }
}

export function removeMaterial(material: string): void {
  const tools = getTools()
  tools.materials = tools.materials.filter((m) => m !== material)
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
}
