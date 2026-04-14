import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface ServiceZone {
  id: string;
  label: string;
  extraFee: number | null;
  isActive: boolean;
}

export function ServiceZonesPanel({ productId }: { productId: string }) {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newLabel, setNewLabel] = useState("");
  const [newFee, setNewFee] = useState("");

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ data: ServiceZone[] }>(`/products/${productId}/zones`);
      setZones(res.data || []);
    } catch (err) {
      toast.error("Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [productId]);

  const handleAddZone = async () => {
    if (!newLabel.trim()) {
      return toast.warning("Label is required");
    }
    
    try {
      setAdding(true);
      await apiRequest(`/products/${productId}/zones`, {
        method: "POST",
        body: JSON.stringify({
          label: newLabel.trim(),
          extraFee: newFee ? Number(newFee) : null,
        }),
      });
      toast.success("Zone added!");
      setNewLabel("");
      setNewFee("");
      await fetchZones();
    } catch (err) {
      toast.error("Failed to add zone");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    
    try {
      await apiRequest(`/products/${productId}/zones/${zoneId}`, {
        method: "DELETE",
      });
      toast.success("Zone deleted");
      await fetchZones();
    } catch (err) {
      toast.error("Failed to delete zone");
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading zones...</div>;
  }

  return (
    <div className="mt-8 border-t border-[#efefef] pt-6">
      <h3 className="text-[14px] font-bold text-[#1d1b1c] tracking-wide mb-1 uppercase">Event Booths / Zones</h3>
      <p className="text-[12px] text-[#716f70] mb-4">
        Add individual physical spaces (like stalls or seats) that customers can book. Once booked, they become unavailable automatically.
      </p>

      <div className="bg-[#fafafa] rounded-xl border border-[#ececec] overflow-hidden">
        {zones.length > 0 ? (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f0f0f0] text-[#1d1b1c]">
              <tr>
                <th className="px-4 py-2 font-semibold">Label (Booth/Seat Name)</th>
                <th className="px-4 py-2 font-semibold">Price / Extra Fee</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {zones.map(z => (
                <tr key={z.id}>
                  <td className="px-4 py-3">{z.label}</td>
                  <td className="px-4 py-3">{z.extraFee != null ? `NPR ${z.extraFee.toLocaleString()}` : "Included"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteZone(z.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-[13px] text-center text-[#8d8d8d]">No zones added yet. Add one below.</div>
        )}

        <div className="p-4 border-t border-[#ececec] bg-white flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase tracking-wider mb-1.5">New Zone Label *</label>
            <input 
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. Block A - Stall 1"
              className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] focus:border-[#1b8a59] focus:outline-none"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label className="block text-[11px] font-bold text-[#4b4a4b] uppercase tracking-wider mb-1.5">Base Price (NPR)</label>
            <input 
              value={newFee}
              onChange={e => setNewFee(e.target.value)}
              placeholder="e.g. 498750"
              className="w-full rounded-lg border border-[#d2d2d2] px-3 py-2 text-[13px] focus:border-[#1b8a59] focus:outline-none"
            />
          </div>
          <Button onClick={handleAddZone} disabled={adding || !newLabel.trim()} className="bg-[#1b8a59] hover:bg-[#157048] text-white whitespace-nowrap">
            {adding ? "Adding..." : <><Plus className="w-4 h-4 mr-1" /> Add Zone</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
