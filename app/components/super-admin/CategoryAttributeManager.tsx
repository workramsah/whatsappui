"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Loader2, X } from "lucide-react"
import { toast } from "react-toastify"

interface AttributeTemplate {
  id: string
  key: string
  label: string
  placeholder: string | null
  sortOrder: number
}

interface Props {
  categoryId: string
  categoryName: string
}

export function CategoryAttributeManager({ categoryId, categoryName }: Props) {
  const [attributes, setAttributes] = useState<AttributeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  const [drafts, setDrafts] = useState([{ key: "", label: "", placeholder: "" }])

  const fetchAttributes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/product-attribute-templates?categoryId=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAttributes(data.data || [])
      }
    } catch (err) {
      toast.error("Failed to load attributes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId) fetchAttributes()
  }, [categoryId])

  const addDraftRow = () => {
    setDrafts(prev => [...prev, { key: "", label: "", placeholder: "" }])
  }
  
  const removeDraftRow = (index: number) => {
    if (drafts.length <= 1) {
      setDrafts([{ key: "", label: "", placeholder: "" }])
      return
    }
    setDrafts(prev => prev.filter((_, i) => i !== index))
  }

  const updateDraft = (index: number, field: string, value: string) => {
    setDrafts(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleBatchAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out rows that are entirely empty
    const validDrafts = drafts.filter(d => d.key.trim() || d.label.trim())
    
    if (validDrafts.length === 0) {
      return toast.warning("Provide at least one attribute key and label")
    }

    // Individual validation for keys/labels in valid drafts
    for (const d of validDrafts) {
      if (!d.key.trim() || !d.label.trim()) {
        return toast.warning(`Key and Label are required for all non-empty rows.`)
      }
    }

    try {
      setAdding(true)
      const token = localStorage.getItem("token")
      const res = await fetch("/api/super-admin/category-attributes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(validDrafts.map(d => ({
          categoryId,
          key: d.key.trim(),
          label: d.label.trim(),
          placeholder: d.placeholder.trim() || null
        }))),
      })

      if (res.ok) {
        toast.success(`${validDrafts.length} attribute keys defined!`)
        setDrafts([{ key: "", label: "", placeholder: "" }])
        fetchAttributes()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to add attributes")
      }
    } catch (err) {
      toast.error("Request failed")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this attribute definition?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/super-admin/category-attributes?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast.success("Attribute removed")
        fetchAttributes()
      }
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#e7e7e7] shadow-sm overflow-hidden">
      <div className="bg-[#fcfcfc] border-b border-[#e7e7e7] px-6 py-4">
        <h3 className="text-[16px] font-semibold text-[#1d1b1c]">
          Attributes for "{categoryName}"
        </h3>
        <p className="text-[13px] text-[#716f70] mt-1">
          Defined keys here will appear as inputs for tenants choosing this category.
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-[#716f70]">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading schema...
          </div>
        ) : (
          <div className="space-y-4">
            {attributes.length > 0 ? (
              <table className="w-full text-left text-[13px]">
                <thead className="text-[#9e9d9d] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="pb-2">Key (Internal)</th>
                    <th className="pb-2">Label (Visible)</th>
                    <th className="pb-2">Placeholder</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efefef]">
                  {attributes.map(attr => (
                    <tr key={attr.id} className="group">
                      <td className="py-3 font-mono text-[12px]">{attr.key}</td>
                      <td className="py-3">{attr.label}</td>
                      <td className="py-3 text-[#9e9d9d] italic">{attr.placeholder || "None"}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleDelete(attr.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 bg-[#fafafa] rounded-lg border border-dashed border-[#d9d9d9]">
                <p className="text-[13px] text-[#8d8d8d]">No custom attributes yet.</p>
              </div>
            )}

            <form onSubmit={handleBatchAdd} className="mt-6 pt-6 border-t border-[#efefef]">
              <div className="space-y-4 mb-6">
                {drafts.map((draft, idx) => (
                  <div key={idx} className="relative group/row bg-[#fafafa] p-4 rounded-xl border border-[#efefef]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase mb-1.5 px-1">Key *</label>
                        <input 
                          value={draft.key}
                          onChange={e => updateDraft(idx, "key", e.target.value)}
                          placeholder="e.g. material"
                          className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] bg-white focus:border-[#1b8a59] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase mb-1.5 px-1">Label *</label>
                        <input 
                          value={draft.label}
                          onChange={e => updateDraft(idx, "label", e.target.value)}
                          placeholder="e.g. Material used"
                          className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] bg-white focus:border-[#1b8a59] focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase mb-1.5 px-1">Placeholder</label>
                        <div className="flex items-center gap-2">
                          <input 
                            value={draft.placeholder}
                            onChange={e => updateDraft(idx, "placeholder", e.target.value)}
                            placeholder="e.g. Cotton, Silk..."
                            className="flex-1 rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] bg-white focus:border-[#1b8a59] focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => removeDraftRow(idx)}
                            className="bg-white border border-[#d2d2d2] p-2 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                            title="Remove row"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addDraftRow}
                  className="rounded-lg h-10 border-[#d2d2d2] text-[#4b4a4b]"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add Another Field
                </Button>
                <Button 
                  type="submit" 
                  disabled={adding} 
                  className="bg-[#1b8a59] hover:bg-[#157048] text-white rounded-lg h-10 px-6 font-semibold"
                >
                  {adding ? "Saving..." : "Save All Attributes"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
