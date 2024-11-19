import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { LeadsTable } from "@/components/leads/LeadsTable"

export function LeadsTab() {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/leads/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setProgress(100)
      
      toast({
        title: "Upload Successful",
        description: result.message,
      })

      setTimeout(() => {
        setProgress(0)
        setUploading(false)
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      })
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-end">
        <Button asChild variant="outline" disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </>
            )}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </Button>
      </div>
      
      {uploading && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-1">
            {progress === 100 ? 'Processing complete!' : 'Processing...'}
          </p>
        </div>
      )}

      <LeadsTable />
    </div>
  )
}
