import { createClient } from "@/lib/supabase/client"

export interface BendingRecipe {
  id?: string
  material: string
  thickness: number
  radius: string
  target_angle: number
  inner_length: number
  with_protection_plate: boolean
  v_opening: string
  ground_setting: number
  press_distance: number
  length_allowance: number
}

export interface DrawingData {
  id?: string
  image_data: string
  material?: string
  thickness?: number
  created_by?: string
}

export interface DrawingBend {
  id?: string
  drawing_id: string
  bend_sequence: number
  inner_length: number
  angle: number
  radius: string
  marking_point?: number
  v_opening?: string
  ground_setting?: number
  press_distance?: number
}

export interface LearnedAllowance {
  material: string
  thickness: number
  radius: string
  angle: number
  allowance: number
  usage_count?: number
}

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || "00000000-0000-0000-0000-000000000001"
}

// Werkzeuge abrufen
export async function getTools(type: "v_opening" | "radius" | "material"): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("tools").select("value").eq("tool_type", type).order("value")

  if (error) {
    console.error("Error fetching tools:", error)
    return []
  }

  return data.map((t) => t.value)
}

// Werkzeug hinzufügen
export async function addTool(type: "v_opening" | "radius" | "material", value: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("tools").insert({ tool_type: type, value })

  if (error) {
    console.error("Error adding tool:", error)
    return false
  }

  return true
}

// Werkzeug löschen
export async function removeTool(type: "v_opening" | "radius" | "material", value: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("tools").delete().eq("tool_type", type).eq("value", value)

  if (error) {
    console.error("Error removing tool:", error)
    return false
  }

  return true
}

// Rezept suchen
export async function findRecipe(
  params: Omit<BendingRecipe, "id" | "v_opening" | "ground_setting" | "press_distance" | "length_allowance">,
): Promise<BendingRecipe | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("bending_recipes")
    .select("*")
    .eq("material", params.material)
    .eq("thickness", params.thickness)
    .eq("radius", params.radius)
    .eq("target_angle", params.target_angle)
    .eq("inner_length", params.inner_length)
    .eq("with_protection_plate", params.with_protection_plate)
    .single()

  if (error || !data) {
    return null
  }

  return data as BendingRecipe
}

// Rezept speichern
export async function saveRecipe(recipe: BendingRecipe): Promise<boolean> {
  const supabase = createClient()

  const userId = await getCurrentUserId()

  const { error } = await supabase.from("bending_recipes").insert({
    ...recipe,
    created_by: userId,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error saving recipe:", error)
    return false
  }

  return true
}

// Zeichnung speichern
export async function saveDrawing(drawing: DrawingData): Promise<string | null> {
  const supabase = createClient()

  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from("drawings")
    .insert({
      ...drawing,
      created_by: userId,
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("Error saving drawing:", error)
    return null
  }

  return data.id
}

// Biegungen für Zeichnung speichern
export async function saveDrawingBends(bends: DrawingBend[]): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("drawing_bends").insert(bends)

  if (error) {
    console.error("Error saving bends:", error)
    return false
  }

  return true
}

// Gelernte Zugabe speichern oder aktualisieren
export async function saveLearnedAllowance(allowance: LearnedAllowance): Promise<boolean> {
  const supabase = createClient()

  // Prüfen ob bereits vorhanden
  const { data: existing } = await supabase
    .from("learned_allowances")
    .select("*")
    .eq("material", allowance.material)
    .eq("thickness", allowance.thickness)
    .eq("radius", allowance.radius)
    .eq("angle", allowance.angle)
    .single()

  if (existing) {
    // Aktualisieren
    const { error } = await supabase
      .from("learned_allowances")
      .update({
        allowance: allowance.allowance,
        usage_count: (existing.usage_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) {
      console.error("Error updating allowance:", error)
      return false
    }
  } else {
    // Neu erstellen
    const { error } = await supabase.from("learned_allowances").insert(allowance)

    if (error) {
      console.error("Error inserting allowance:", error)
      return false
    }
  }

  return true
}

// Gelernte Zugabe abrufen
export async function getLearnedAllowance(
  material: string,
  thickness: number,
  radius: string,
  angle: number,
): Promise<number | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("learned_allowances")
    .select("allowance")
    .eq("material", material)
    .eq("thickness", thickness)
    .eq("radius", radius)
    .eq("angle", angle)
    .single()

  if (error || !data) {
    return null
  }

  return data.allowance
}
