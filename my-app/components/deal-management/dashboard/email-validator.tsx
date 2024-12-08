"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/utils/supabase/client"
import { AlertCircle, Loader2 } from "lucide-react"

interface LeadInfo {
  email: string
  first_name: string
  last_name: string
  phone: string
  call_status: string
}

export function EmailValidator() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LeadInfo[]>([])

  const extractEmails = (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    return Array.from(new Set(text.match(emailRegex) || []))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const emails = extractEmails(inputText)
    
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("email, first_name, last_name, phone, call_status")
        .in("email", emails)

      if (error) throw error

      // Create a Map to store unique entries by email
      const uniqueLeads = new Map<string, LeadInfo>()
      data?.forEach((lead) => {
        // Only store the first occurrence of each email
        if (!uniqueLeads.has(lead.email)) {
          uniqueLeads.set(lead.email, lead)
        }
      })

      setResults(Array.from(uniqueLeads.values()))
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const formattedText = results
      .map(
        (lead) =>
          `${lead.email} || ${lead.first_name} ${lead.last_name} || ${
            lead.phone || "N/A"
          } || ${lead.call_status || "N/A"}`
      )
      .join("\n")
    navigator.clipboard.writeText(formattedText)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-4 bg-primary/10 rounded-lg flex flex-col items-center gap-2 hover:bg-primary/20 transition-colors">
          <AlertCircle className="h-6 w-6" />
          Check Invalids
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Check Invalid Leads</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Paste text containing emails here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Checking..." : "Check Emails"}
          </Button>
          {results.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Results</h3>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  Copy All
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-md space-y-2 max-h-[300px] overflow-y-auto">
                {results.map((lead, index) => (
                  <div key={index} className="text-sm">
                    {`${lead.email} || ${lead.first_name} ${lead.last_name} || ${
                      lead.phone || "N/A"
                    } || ${lead.call_status || "N/A"}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
