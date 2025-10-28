"use client"

import type { BendingRecipe } from "@/lib/supabase-storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface ParameterDisplayProps {
  recipe: BendingRecipe
  targetInnerLength: number
}

export function ParameterDisplay({ recipe, targetInnerLength }: ParameterDisplayProps) {
  const calculatedPressLength = targetInnerLength + recipe.length_allowance

  return (
    <Card className="border-primary/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">Parameter Gefunden</CardTitle>
        </div>
        <CardDescription className="text-base mt-2">Verwenden Sie die folgenden Maschineneinstellungen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-5 rounded-xl space-y-2 text-sm border border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <span className="font-medium text-muted-foreground">Material:</span>
            <span className="font-semibold">{recipe.material}</span>
            <span className="font-medium text-muted-foreground">Dicke:</span>
            <span className="font-semibold">{recipe.thickness} mm</span>
            <span className="font-medium text-muted-foreground">Radius:</span>
            <span className="font-semibold">{recipe.radius}</span>
            <span className="font-medium text-muted-foreground">Winkel:</span>
            <span className="font-semibold">{recipe.target_angle}°</span>
            <span className="font-medium text-muted-foreground">Schutzplatte:</span>
            <span className="font-semibold">{recipe.with_protection_plate ? "Ja (5mm)" : "Nein"}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium text-blue-400 uppercase tracking-wider">V-Öffnung</div>
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                Matrize
              </Badge>
            </div>
            <div className="text-4xl font-bold text-blue-400 mb-1">{recipe.v_opening}</div>
            <div className="text-xs text-muted-foreground">wird benötigt</div>
          </div>

          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium text-purple-400 uppercase tracking-wider">Hinteranschlag</div>
              <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                Position
              </Badge>
            </div>
            <div className="text-4xl font-bold text-purple-400 mb-1">
              {recipe.ground_setting.toFixed(1)}
              <span className="text-xl ml-2 text-purple-400/70">mm</span>
            </div>
            <div className="text-xs text-muted-foreground">Grund Einstellung |{"<-"}</div>
          </div>

          <div className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium text-orange-400 uppercase tracking-wider">Pressweg</div>
              <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-400">
                Distanz
              </Badge>
            </div>
            <div className="text-4xl font-bold text-orange-400 mb-1">
              {recipe.press_distance.toFixed(1)}
              <span className="text-xl ml-2 text-orange-400/70">mm</span>
            </div>
            <div className="text-xs text-muted-foreground">Druck Einstellung -{">"}|</div>
          </div>

          <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium text-green-400 uppercase tracking-wider">Markierpunkt</div>
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                Berechnet
              </Badge>
            </div>
            <div className="text-4xl font-bold text-green-400 mb-1">
              {calculatedPressLength.toFixed(1)}
              <span className="text-xl ml-2 text-green-400/70">mm</span>
            </div>
            <div className="text-xs text-muted-foreground">Punkt am Material markieren und dort drücken</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
