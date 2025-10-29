"use client"

import { useEffect, useState } from "react"
import { findRecipe, type BendingRecipe } from "@/lib/supabase-storage"
import { createClient } from "@/lib/supabase/client"
import { AuthGuard } from "@/components/auth-guard"
import { RecipeSearch } from "@/components/recipe-search"
import { LearningMode } from "@/components/learning-mode"
import { ParameterDisplay } from "@/components/parameter-display"
import { ToolManagement } from "@/components/tool-management"
import { DrawingUpload } from "@/components/drawing-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

function BendingMachineContent() {
  const [foundRecipe, setFoundRecipe] = useState<BendingRecipe | null>(null)
  const [searchParams, setSearchParams] = useState<{
    material: string
    thickness: number
    radius: string
    targetAngle: number
    targetInnerLength: number
    withProtectionPlate: boolean
  } | null>(null)
  const [currentUser, setCurrentUser] = useState<string>("")

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const username = user.user_metadata?.username || user.email?.split("@")[0] || "User"
        setCurrentUser(username)
      }
    } catch (error) {
      console.error("[v0] Error loading user:", error)
    }
  }

  const handleSearch = async (params: {
    material: string
    thickness: number
    radius: string
    targetAngle: number
    targetInnerLength: number
    withProtectionPlate: boolean
  }) => {
    setSearchParams(params)
    const recipe = await findRecipe({
      material: params.material,
      thickness: params.thickness,
      radius: params.radius,
      target_angle: params.targetAngle,
      inner_length: params.targetInnerLength,
      with_protection_plate: params.withProtectionPlate,
    })
    setFoundRecipe(recipe)
  }

  const handleRecipeLearned = () => {
    if (searchParams) {
      handleSearch(searchParams)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.reload()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-3 tracking-tight">Biege-Regisseur</h1>
            <p className="text-lg text-muted-foreground">
              Präzise Maschineneinstellungen für wiederholbare Biegeprozesse
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-muted-foreground">Angemeldet als: {currentUser}</p>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </header>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="search" className="text-base">
              Biege-Parameter
            </TabsTrigger>
            <TabsTrigger value="drawing" className="text-base">
              Zeichnung
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-base">
              Werkzeuge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <RecipeSearch onSearch={handleSearch} />

            {searchParams && !foundRecipe && (
              <LearningMode searchParams={searchParams} onRecipeLearned={handleRecipeLearned} />
            )}

            {foundRecipe && searchParams && (
              <ParameterDisplay recipe={foundRecipe} targetInnerLength={searchParams.targetInnerLength} />
            )}
          </TabsContent>

          <TabsContent value="drawing" className="space-y-6">
            <DrawingUpload />
          </TabsContent>

          <TabsContent value="tools">
            <ToolManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function BendingMachinePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Während des Server-Side Renders und ersten Client-Renders nichts anzeigen
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Lädt...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <BendingMachineContent />
    </AuthGuard>
  )
}
