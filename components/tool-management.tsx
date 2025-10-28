"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTools, addTool, removeTool } from "@/lib/supabase-storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus } from "lucide-react"

export function ToolManagement() {
  const [vOpenings, setVOpenings] = useState<string[]>([])
  const [radii, setRadii] = useState<string[]>([])
  const [materials, setMaterials] = useState<string[]>([])

  const [newVOpening, setNewVOpening] = useState("")
  const [newRadius, setNewRadius] = useState("")
  const [newMaterial, setNewMaterial] = useState("")

  const loadTools = async () => {
    const vOpeningsData = await getTools("v_opening")
    const radiiData = await getTools("radius")
    const materialsData = await getTools("material")
    setVOpenings(vOpeningsData)
    setRadii(radiiData)
    setMaterials(materialsData)
  }

  useEffect(() => {
    loadTools()
  }, [])

  const handleAddVOpening = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newVOpening.trim()) {
      await addTool("v_opening", newVOpening.trim())
      setNewVOpening("")
      loadTools()
    }
  }

  const handleRemoveVOpening = async (vOpening: string) => {
    if (confirm(`V-Öffnung "${vOpening}" wirklich löschen?`)) {
      await removeTool("v_opening", vOpening)
      loadTools()
    }
  }

  const handleAddRadius = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newRadius.trim()) {
      await addTool("radius", newRadius.trim())
      setNewRadius("")
      loadTools()
    }
  }

  const handleRemoveRadius = async (radius: string) => {
    if (confirm(`Radius "${radius}" wirklich löschen?`)) {
      await removeTool("radius", radius)
      loadTools()
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMaterial.trim()) {
      await addTool("material", newMaterial.trim())
      setNewMaterial("")
      loadTools()
    }
  }

  const handleRemoveMaterial = async (material: string) => {
    if (confirm(`Material "${material}" wirklich löschen?`)) {
      await removeTool("material", material)
      loadTools()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Werkzeuge & Parameter Verwalten</CardTitle>
        <CardDescription>V-Öffnungen, Radien und Materialien hinzufügen oder entfernen</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vOpenings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vOpenings">V-Öffnungen</TabsTrigger>
            <TabsTrigger value="radii">Radien</TabsTrigger>
            <TabsTrigger value="materials">Materialien</TabsTrigger>
          </TabsList>

          <TabsContent value="vOpenings" className="space-y-4">
            <form onSubmit={handleAddVOpening} className="flex gap-2">
              <div className="flex-1">
                <Input placeholder="z.B. V140" value={newVOpening} onChange={(e) => setNewVOpening(e.target.value)} />
              </div>
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {vOpenings.map((v) => (
                <Badge key={v} variant="secondary" className="text-sm px-3 py-1.5">
                  {v}
                  <button type="button" onClick={() => handleRemoveVOpening(v)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {vOpenings.length === 0 && <p className="text-sm text-muted-foreground">Keine V-Öffnungen vorhanden</p>}
            </div>
          </TabsContent>

          <TabsContent value="radii" className="space-y-4">
            <form onSubmit={handleAddRadius} className="flex gap-2">
              <div className="flex-1">
                <Input placeholder="z.B. R12.5" value={newRadius} onChange={(e) => setNewRadius(e.target.value)} />
              </div>
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {radii.map((r) => (
                <Badge key={r} variant="secondary" className="text-sm px-3 py-1.5">
                  {r}
                  <button type="button" onClick={() => handleRemoveRadius(r)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {radii.length === 0 && <p className="text-sm text-muted-foreground">Keine Radien vorhanden</p>}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <form onSubmit={handleAddMaterial} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="z.B. Edelstahl"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                />
              </div>
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <Badge key={m} variant="secondary" className="text-sm px-3 py-1.5">
                  {m}
                  <button type="button" onClick={() => handleRemoveMaterial(m)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {materials.length === 0 && <p className="text-sm text-muted-foreground">Keine Materialien vorhanden</p>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
