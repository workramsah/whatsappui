"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface BusinessType {
  id: string
  name: string
}

interface BusinessTypeModalProps {
  onSuccess: (businessType: string) => void
  onClose: () => void
}

export function BusinessTypeModal({ onSuccess, onClose }: BusinessTypeModalProps) {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [businessType, setBusinessType] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBusinessTypes()
  }, [])

  const loadBusinessTypes = async () => {
    try {
      const response = await fetch("/api/super-admin/business-types")
      if (response.ok) {
        const data = await response.json()
        setBusinessTypes(data)
      }
    } catch (err) {
      console.error("Failed to load business types:", err)
    } finally {
      setLoadingTypes(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!businessType.trim()) {
        throw new Error("Please select a business type")
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/settings/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessType: businessType.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save business type")
      }

      onSuccess(businessType.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">What&apos;s your business type?</h2>
            <p className="text-sm text-slate-600 mt-1">This is required to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-sm font-medium text-slate-700">
              Business Type
            </Label>
            <select
              id="businessType"
              required
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={loadingTypes}
              className="w-full h-11 text-base border border-slate-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">{loadingTypes ? "Loading..." : "Select your business type"}</option>
              {businessTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 rounded-full font-semibold"
          >
            {loading ? "Saving..." : "Save Business Type"}
          </Button>
        </form>
      </div>
    </div>
  )
}
