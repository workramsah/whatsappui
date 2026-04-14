"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Loader2, Clock } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface Slot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  staffId: string | null
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function ServiceAvailabilityManager({ productId }: { productId: string }) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  const [day, setDay] = useState("1")
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("17:00")

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const res = await apiRequest<{ data: Slot[] }>(`/products/${productId}/availability`)
      setSlots(res.data || [])
    } catch (err) {
      toast.error("Failed to load availability")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) fetchSlots()
  }, [productId])

  const handleAddSlot = async () => {
    try {
      setAdding(true)
      await apiRequest(`/products/${productId}/availability`, {
        method: "POST",
        body: JSON.stringify({
          dayOfWeek: day,
          startTime: start,
          endTime: end,
        }),
      })
      toast.success("Slot added")
      fetchSlots()
    } catch (err) {
      toast.error("Failed to add slot")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/products/${productId}/availability?id=${id}`, {
        method: "DELETE",
      })
      toast.success("Slot removed")
      fetchSlots()
    } catch (err) {
      toast.error("Delete failed")
    }
  }

  if (loading) return <div className="p-4 text-sm text-gray-500 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading availability...</div>

  return (
    <div className="mt-8 border-t border-[#efefef] pt-6">
      <h3 className="text-[14px] font-bold text-[#1d1b1c] tracking-wide mb-1 uppercase flex items-center">
        <Clock className="w-4 h-4 mr-2 text-[#1b8a59]" /> Weekly Availability Slots
      </h3>
      <p className="text-[12px] text-[#716f70] mb-4">
        Define the days and times this service is available for booking.
      </p>

      <div className="bg-[#fafafa] rounded-xl border border-[#ececec] overflow-hidden mb-6">
        {slots.length > 0 ? (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f0f0f0] text-[#1d1b1c]">
              <tr>
                <th className="px-4 py-2 font-semibold">Day</th>
                <th className="px-4 py-2 font-semibold">Hours</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {slots.map(s => (
                <tr key={s.id} className="bg-white">
                  <td className="px-4 py-3 font-medium">{DAYS[s.dayOfWeek]}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.startTime} - {s.endTime}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-[13px] text-center text-[#8d8d8d]">No availability slots defined.</div>
        )}

        <div className="p-4 border-t border-[#ececec] bg-white flex flex-wrap gap-4 items-end">
          <div className="min-w-[120px]">
            <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase mb-1.5">Day</label>
            <select value={day} onChange={e => setDay(e.target.value)} className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1b8a59]">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase mb-1.5">Starts</label>
            <input type="time" value={start} onChange={e => setStart(e.target.value)} className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1b8a59]" />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase mb-1.5">Ends</label>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)} className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1b8a59]" />
          </div>
          <Button onClick={handleAddSlot} disabled={adding} className="bg-[#1b8a59] hover:bg-[#157048] text-white">
            {adding ? "Adding..." : <Plus className="w-4 h-4 mr-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
