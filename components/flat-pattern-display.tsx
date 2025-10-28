"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlatPatternResult } from "@/lib/flat-pattern-calculator"
import { Ruler, Calculator } from "lucide-react"

interface FlatPatternDisplayProps {
  result: FlatPatternResult
}

export function FlatPatternDisplay({ result }: FlatPatternDisplayProps) {
  return (
    <div className="space-y-4">
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Ruler className="h-5 w-5" />
            Gestreckte Länge (Flat Pattern)
          </CardTitle>
          <CardDescription>Berechnete Abwicklungslänge für die Blechzuschnitt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Gesamtlänge</p>
              <p className="text-5xl font-bold text-primary">{result.totalFlatLength.toFixed(2)} mm</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Summe Innenlängen</p>
                <p className="text-xl font-semibold">{result.totalInnerLength.toFixed(2)} mm</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Summe Biegezugaben</p>
                <p className="text-xl font-semibold text-chart-3">{result.totalBendAllowance.toFixed(2)} mm</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4" />
            Detaillierte Berechnung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.calculations.map((calc) => (
              <div key={calc.bendNumber} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Biegung {calc.bendNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {calc.bendAngle}° @ R{calc.radius}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Innenlänge</p>
                    <p className="font-medium">{calc.innerLength.toFixed(1)} mm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">K-Faktor</p>
                    <p className="font-medium">{calc.kFactor.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Biegezugabe</p>
                    <p className="font-medium text-chart-3">{calc.bendAllowance.toFixed(2)} mm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
