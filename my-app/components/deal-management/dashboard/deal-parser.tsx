"use client"

import { useState } from "react"
import { Plus, Copy, Check, X, Edit2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// Language mapping for standardization
const LANGUAGE_MAPPING: Record<string, string> = {
  // Two-letter codes (ISO 639-1)
  'en': 'English',
  'nl': 'Dutch',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'es': 'Spanish',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'pl': 'Polish',
  'tr': 'Turkish',
  'ar': 'Arabic',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  
  // Common variations
  'eng': 'English',
  'dut': 'Dutch',
  'fre': 'French',
  'ger': 'German',
  'ita': 'Italian',
  'spa': 'Spanish',
  'por': 'Portuguese',
  'rus': 'Russian',
  'pol': 'Polish',
  'tur': 'Turkish',
  'ara': 'Arabic',
  'chi': 'Chinese',
  'jpn': 'Japanese',
  'kor': 'Korean',
};

const standardizeLanguage = (lang: string | null): string | null => {
  if (!lang) return null;
  
  // Convert to lowercase for case-insensitive matching
  const normalizedLang = lang.toLowerCase().trim();
  
  // Return the standardized version if it exists, otherwise return original
  return LANGUAGE_MAPPING[normalizedLang] || lang;
};

interface ParsedDealData {
  partner: string
  region: string
  geo: string
  language: string | null
  source: string
  pricing_model: string
  cpa: number | null
  crg: number | null
  cpl: number | null
  funnels: string[]
  cr: number | null
  deduction_limit: number | null
}

interface ParsedDeal {
  raw_text: string
  parsed_data: ParsedDealData
}

export function DealParser() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [parsedDeals, setParsedDeals] = useState<ParsedDeal[]>([])
  const [editingDeal, setEditingDeal] = useState<number | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealText: inputText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse deals');
      }

      const result = await response.json();
      setParsedDeals(Array.isArray(result) ? result : [result]);
    } catch (error: any) {
      console.error('Error parsing deals:', error)
      toast.error(error.message || 'Failed to parse deals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (index: number, field: keyof ParsedDealData, value: any) => {
    setParsedDeals(deals => deals.map((deal, i) => {
      if (i !== index) return deal;
      return {
        ...deal,
        parsed_data: {
          ...deal.parsed_data,
          [field]: field === 'language' ? standardizeLanguage(value) : value
        }
      };
    }));
  }

  const handleFunnelsChange = (index: number, value: string) => {
    const funnels = value.split('\n').filter(f => f.trim());
    handleFieldChange(index, 'funnels', funnels);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleEdit = (index: number) => {
    setEditingDeal(index)
  }

  const handleSave = (index: number) => {
    setEditingDeal(null)
    toast.success('Changes saved')
  }

  const handleApprove = (index: number) => {
    setParsedDeals(deals => deals.filter((_, i) => i !== index))
    toast.success('Deal approved')
  }

  const handleDismiss = (index: number) => {
    setParsedDeals(deals => deals.filter((_, i) => i !== index))
    toast.success('Deal dismissed')
  }

  const EditableField = ({ 
    label, 
    field,
    value, 
    dealIndex,
    isEditing,
    type = "text"
  }: { 
    label: string
    field: keyof ParsedDealData
    value: any
    dealIndex: number
    isEditing: boolean
    type?: "text" | "number"
  }) => {
    const displayValue = value ?? 'N/A'
    
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{label}</label>
        {isEditing ? (
          <Input 
            type={type}
            value={displayValue === 'N/A' ? '' : displayValue}
            onChange={(e) => {
              const newValue = type === 'number' 
                ? (e.target.value ? Number(e.target.value) : null)
                : e.target.value;
              handleFieldChange(dealIndex, field, newValue);
            }}
            className="h-8"
          />
        ) : (
          <div className="text-sm">{displayValue}</div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-[120px] w-full"
          size="lg"
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            <span>New Deal</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deal Parser</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {!parsedDeals.length && (
            <Textarea
              placeholder="Paste deal text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px]"
            />
          )}
          <Button 
            onClick={handleSubmit}
            disabled={loading || !inputText.trim()}
            className={loading ? "animate-pulse" : ""}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing Deal Text...</span>
              </div>
            ) : (
              <span>Parse Deals</span>
            )}
          </Button>
          {loading && (
            <div className="grid gap-4 py-8">
              <div className="space-y-3">
                <Skeleton className="h-[125px] w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          )}
          {parsedDeals.length > 0 && (
            <ScrollArea className="h-[600px] -mx-6">
              <div className="px-6 grid gap-4">
                {parsedDeals.map((deal, index) => {
                  const isEditing = editingDeal === index
                  const data = deal.parsed_data
                  
                  return (
                    <Card key={index} className={cn("overflow-hidden", isEditing && "ring-2 ring-primary")}>
                      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-medium">
                            {data.partner}
                          </CardTitle>
                          <Badge variant="outline" className="font-normal">
                            {data.geo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <Button
                              onClick={() => handleSave(index)}
                              variant="ghost"
                              size="icon"
                              className="text-green-500 hover:text-green-500 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleEdit(index)}
                              variant="ghost"
                              size="icon"
                              className="text-blue-500 hover:text-blue-500 hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleApprove(index)}
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-500 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDismiss(index)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 grid gap-4">
                        {!isEditing ? (
                          <>
                            {/* First Row: Region, Geo, Source, Language */}
                            <div className="grid grid-cols-4 gap-3 text-sm">
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  !data.region ? "text-red-500" : "text-muted-foreground"
                                )}>Region</span>
                                <span className="font-medium">{data.region || '—'}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  !data.geo ? "text-red-500" : "text-muted-foreground"
                                )}>GEO</span>
                                <span className="font-medium">{data.geo || '—'}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  !data.source ? "text-red-500" : "text-muted-foreground"
                                )}>Source</span>
                                <span className="font-medium">{data.source || '—'}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  !data.language ? "text-red-500" : "text-muted-foreground"
                                )}>Language</span>
                                <span className="font-medium">{data.language || '—'}</span>
                              </div>
                            </div>

                            {/* Second Row: Model, CPA, CRG, CR, Deduction */}
                            <div className={cn(
                              "grid gap-3 text-sm",
                              data.cr !== null && data.deduction_limit !== null ? "grid-cols-5" :
                              data.cr !== null || data.deduction_limit !== null ? "grid-cols-4" :
                              "grid-cols-3"
                            )}>
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  !data.pricing_model ? "text-red-500" : "text-muted-foreground"
                                )}>Model</span>
                                <span className="font-medium">{data.pricing_model || '—'}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  data.cpa === null ? "text-red-500" : "text-muted-foreground"
                                )}>CPA</span>
                                <span className="font-medium">{data.cpa ? `$${data.cpa}` : '—'}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                <span className={cn(
                                  "text-xs",
                                  data.crg === null ? "text-red-500" : "text-muted-foreground"
                                )}>CRG</span>
                                <span className="font-medium">{data.crg ? `${data.crg}%` : '—'}</span>
                              </div>
                              {data.cr !== null && (
                                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                  <span className="text-muted-foreground text-xs">CR</span>
                                  <span className="font-medium">{data.cr}%</span>
                                </div>
                              )}
                              {data.deduction_limit !== null && (
                                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
                                  <span className="text-muted-foreground text-xs">Deduction</span>
                                  <span className="font-medium">{data.deduction_limit}%</span>
                                </div>
                              )}
                            </div>

                            {/* Funnels */}
                            {data.funnels && data.funnels.length > 0 && (
                              <div className="flex flex-col p-2 rounded-md bg-muted text-sm">
                                <span className="text-muted-foreground text-xs mb-1">Funnels</span>
                                <span className="font-medium">{data.funnels.join(", ")}</span>
                              </div>
                            )}

                            {/* Raw Text */}
                            <div className="relative rounded-md bg-muted p-3 text-sm">
                              <pre className="whitespace-pre-wrap pr-8">{deal.raw_text}</pre>
                              <Button
                                onClick={() => copyToClipboard(deal.raw_text)}
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="grid gap-4">
                            {/* Keep raw text visible in edit mode */}
                            <div className="relative rounded-md bg-muted p-3 text-sm opacity-50">
                              <pre className="whitespace-pre-wrap pr-8">{deal.raw_text}</pre>
                            </div>

                            {/* Edit Fields */}
                            <div className="grid grid-cols-4 gap-3">
                              <EditableField 
                                label="Region" 
                                field="region" 
                                value={data.region} 
                                dealIndex={index} 
                                isEditing={true}
                                className={cn(!data.region && "text-red-500")}
                              />
                              <EditableField 
                                label="GEO" 
                                field="geo" 
                                value={data.geo} 
                                dealIndex={index} 
                                isEditing={true}
                                className={cn(!data.geo && "text-red-500")}
                              />
                              <EditableField 
                                label="Source" 
                                field="source" 
                                value={data.source} 
                                dealIndex={index} 
                                isEditing={true}
                                className={cn(!data.source && "text-red-500")}
                              />
                              <div className="space-y-2">
                                <label className={cn(
                                  "text-sm font-medium",
                                  !data.language && "text-red-500"
                                )}>Language</label>
                                <Input 
                                  value={data.language || ""}
                                  onChange={(e) => handleFieldChange(index, "language", e.target.value)}
                                  className="w-full"
                                />
                              </div>
                            </div>

                            <div className={cn(
                              "grid gap-3",
                              data.cr !== null && data.deduction_limit !== null ? "grid-cols-5" :
                              data.cr !== null || data.deduction_limit !== null ? "grid-cols-4" :
                              "grid-cols-3"
                            )}>
                              <div className="space-y-2">
                                <label className={cn(
                                  "text-sm font-medium",
                                  !data.pricing_model && "text-red-500"
                                )}>Pricing Model</label>
                                <select 
                                  value={data.pricing_model || ""}
                                  onChange={(e) => handleFieldChange(index, "pricing_model", e.target.value)}
                                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                  <option value="">Select Model</option>
                                  <option value="cpa+crg">CPA + CRG</option>
                                  <option value="cpa">CPA Only</option>
                                  <option value="cpl">CPL</option>
                                </select>
                              </div>
                              <EditableField 
                                label="CPA" 
                                field="cpa" 
                                value={data.cpa} 
                                dealIndex={index} 
                                isEditing={true} 
                                type="number"
                                className={cn(data.cpa === null && "text-red-500")}
                              />
                              <EditableField 
                                label="CRG" 
                                field="crg" 
                                value={data.crg} 
                                dealIndex={index} 
                                isEditing={true} 
                                type="number"
                                className={cn(data.crg === null && "text-red-500")}
                              />
                              <EditableField 
                                label="CR" 
                                field="cr" 
                                value={data.cr} 
                                dealIndex={index} 
                                isEditing={true} 
                                type="number"
                              />
                              <EditableField 
                                label="Deduction Limit" 
                                field="deduction_limit" 
                                value={data.deduction_limit} 
                                dealIndex={index} 
                                isEditing={true} 
                                type="number"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">Funnels</label>
                              <Textarea 
                                value={(data.funnels || []).join("\n")}
                                onChange={(e) => handleFunnelsChange(index, e.target.value)}
                                className="min-h-[80px] mt-1.5"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
