"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignupModalProps {
  onSuccess: (token: string) => void
  onClose: () => void
  showPreviewMessage?: boolean
}

export function SignupModal({ onSuccess, onClose, showPreviewMessage = false }: SignupModalProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    tenantName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"

      // For signup, auto-generate tenant name from email if not provided
      const submitData = { ...formData }
      if (!isLogin && !submitData.tenantName) {
        const emailPrefix = submitData.email.split("@")[0]
        submitData.tenantName = `${emailPrefix}-${Date.now()}`
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      onSuccess(data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-background border-t border-border rounded-t-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isLogin ? "Login" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Toggle Login/Signup */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email</Label>
              <Input
                id="modal-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="text-base h-12"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="modal-password">Password</Label>
              <Input
                id="modal-password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="text-base h-12"
                placeholder={isLogin ? "Enter password" : "At least 8 characters"}
              />
            </div>

            {/* Name (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="modal-name">Name (optional)</Label>
                <Input
                  id="modal-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-base h-12"
                  placeholder="Your name"
                />
              </div>
            )}

            {/* Tenant Name (login only, for now we'll auto-generate on signup) */}
            {isLogin && (
              <div className="space-y-2">
                <Label htmlFor="modal-tenant">Tenant Name</Label>
                <Input
                  id="modal-tenant"
                  type="text"
                  required
                  value={formData.tenantName}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantName: e.target.value })
                  }
                  className="text-base h-12"
                  placeholder="Enter your tenant name"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login & Continue"
                : "Create Account & Continue"}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            {showPreviewMessage
              ? "Create a free account to store orders, download PDFs, and send invoices anytime."
              : isLogin
              ? "Don't have an account? Click 'Sign Up' above."
              : "By creating an account, you agree to save this invoice to your account."}
          </p>
        </div>
      </div>
    </div>
  )
}



