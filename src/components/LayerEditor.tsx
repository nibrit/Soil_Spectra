// ---------- src/components/LayerEditor.tsx ----------
import React from "react";
import { Trash2, Plus, Copy, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SoilLayer } from "../types";
import { useSoilContext } from "../context/SoilContext";

const SOIL_TYPES = ["Clay", "Silt", "Sand", "Gravel", "Loam", "Peat", "Fill", "Rock"];

export const LayerEditor: React.FC = () => {
  const { soilData, updateSoilData } = useSoilContext();
  const layers = soilData.layers ?? [];

  const setLayers = (next: SoilLayer[]) => updateSoilData({ layers: next });

  const addLayer = () => {
    const last = layers[layers.length - 1];
    const start = last ? last.depthTo : 0;
    const newLayer: SoilLayer = {
      depthFrom: start,
      depthTo: start + 1,
      soilType: "Loam",
      gamma: +(soilData.density * 9.81).toFixed(1), // a reasonable default
      cohesion: 25,
      phi: 30,
      moisture: soilData.moisture,
      SPT_N: 10,
      remarks: "",
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (idx: number) => {
    const next = [...layers];
    next.splice(idx, 1);
    setLayers(next);
  };

  const duplicateLayer = (idx: number) => {
    const next = [...layers];
    const dup = { ...next[idx] };
    next.splice(idx + 1, 0, dup);
    setLayers(next);
  };

  const moveLayer = (idx: number, dir: "up" | "down") => {
    const next = [...layers];
    const newIndex = dir === "up" ? idx - 1 : idx + 1;
    if (newIndex < 0 || newIndex >= next.length) return;
    const tmp = next[idx];
    next[idx] = next[newIndex];
    next[newIndex] = tmp;
    // auto-fix depth continuity (optional)
    fixContinuity(next);
    setLayers(next);
  };

  const fixContinuity = (arr: SoilLayer[]) => {
    // Ensure each layer starts where previous ends (simple helper)
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].depthFrom !== arr[i - 1].depthTo) {
        const thickness = arr[i].depthTo - arr[i].depthFrom;
        arr[i].depthFrom = arr[i - 1].depthTo;
        arr[i].depthTo = arr[i].depthFrom + Math.max(0.5, thickness);
      }
    }
  };

  const update = (idx: number, key: keyof SoilLayer, value: any) => {
    const next = [...layers];
    const layer = { ...next[idx], [key]: value };
    // Guard depth relationship
    if (key === "depthFrom" && value >= layer.depthTo) {
      layer.depthTo = value + 0.5;
    }
    if (key === "depthTo" && value <= layer.depthFrom) {
      layer.depthFrom = Math.max(0, value - 0.5);
    }
    next[idx] = layer;
    setLayers(next);
  };

  const totalDepth = layers.reduce((s, l) => s + Math.max(0, l.depthTo - l.depthFrom), 0);

  const issues = validateLayers(layers);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Bore Log (Layers)</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Total Depth: <b>{totalDepth.toFixed(2)} m</b></span>
          <button
            onClick={addLayer}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Layer
          </button>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <b>Layer warnings:</b>
          <ul className="list-disc pl-5 mt-1">
            {issues.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Depth From (m)</th>
              <th className="py-2 pr-4">Depth To (m)</th>
              <th className="py-2 pr-4">Soil Type</th>
              <th className="py-2 pr-4">γ (kN/m³)</th>
              <th className="py-2 pr-4">c (kPa)</th>
              <th className="py-2 pr-4">ϕ (°)</th>
              <th className="py-2 pr-4">Moisture (%)</th>
              <th className="py-2 pr-4">SPT N</th>
              <th className="py-2 pr-4">Remarks</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {layers.length === 0 && (
              <tr>
                <td colSpan={11} className="py-6 text-center text-gray-500">
                  No layers yet. Click <b>Add Layer</b> to start your bore log.
                </td>
              </tr>
            )}
            {layers.map((l, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4 align-top">{idx + 1}</td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="0.1"
                    value={l.depthFrom}
                    onChange={(e) => update(idx, "depthFrom", parseFloat(e.target.value))}
                    className="w-28 rounded border-gray-300"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="0.1"
                    value={l.depthTo}
                    onChange={(e) => update(idx, "depthTo", parseFloat(e.target.value))}
                    className="w-28 rounded border-gray-300"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <div className="flex gap-2">
                    <select
                      value={SOIL_TYPES.includes(l.soilType) ? l.soilType : "Custom"}
                      onChange={(e) => {
                        const v = e.target.value;
                        update(idx, "soilType", v === "Custom" ? (l.soilType || "") : v);
                      }}
                      className="rounded border-gray-300"
                    >
                      {SOIL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="Custom">Custom…</option>
                    </select>
                    {!SOIL_TYPES.includes(l.soilType) && (
                      <input
                        type="text"
                        value={l.soilType}
                        onChange={(e) => update(idx, "soilType", e.target.value)}
                        placeholder="Enter soil type"
                        className="w-36 rounded border-gray-300"
                      />
                    )}
                  </div>
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="0.1"
                    value={l.gamma}
                    onChange={(e) => update(idx, "gamma", parseFloat(e.target.value))}
                    className="w-28 rounded border-gray-300"
                  />
                  <div className="text-[11px] text-gray-500 mt-1">
                    tip: γ ≈ density(g/cc) × 9.81
                  </div>
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="1"
                    value={l.cohesion}
                    onChange={(e) => update(idx, "cohesion", parseFloat(e.target.value))}
                    className="w-24 rounded border-gray-300"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="0.5"
                    value={l.phi}
                    onChange={(e) => update(idx, "phi", parseFloat(e.target.value))}
                    className="w-20 rounded border-gray-300"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="1"
                    value={l.moisture ?? ""}
                    onChange={(e) => update(idx, "moisture", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                    className="w-24 rounded border-gray-300"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="number"
                    step="1"
                    value={l.SPT_N ?? ""}
                    onChange={(e) => update(idx, "SPT_N", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                    className="w-20 rounded border-gray-300"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <input
                    type="text"
                    value={l.remarks ?? ""}
                    onChange={(e) => update(idx, "remarks", e.target.value)}
                    className="w-56 rounded border-gray-300"
                    placeholder="e.g., soft, stiff, wet"
                  />
                </td>

                <td className="py-2 pr-4 align-top">
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveLayer(idx, "up")}
                      className="p-2 rounded border hover:bg-gray-100"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveLayer(idx, "down")}
                      className="p-2 rounded border hover:bg-gray-100"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => duplicateLayer(idx)}
                      className="p-2 rounded border hover:bg-gray-100"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeLayer(idx)}
                      className="p-2 rounded border hover:bg-red-50 text-red-700 border-red-200"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {layers.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <ArrowUpDown className="h-3 w-3" />
          Ensure no overlaps and continuous depths for clean calculations and PDF bore-log export.
        </div>
      )}
    </div>
  );
};

function validateLayers(layers: SoilLayer[]): string[] {
  const messages: string[] = [];
  // sort check + overlap check
  const copy = [...layers].sort((a, b) => a.depthFrom - b.depthFrom);
  for (let i = 0; i < copy.length; i++) {
    const L = copy[i];
    if (L.depthTo <= L.depthFrom) messages.push(`Layer ${i + 1}: "Depth To" must be greater than "Depth From".`);
    if (L.gamma <= 0) messages.push(`Layer ${i + 1}: γ must be positive.`);
    if (L.cohesion < 0) messages.push(`Layer ${i + 1}: cohesion cannot be negative.`);
    if (L.phi < 0 || L.phi > 60) messages.push(`Layer ${i + 1}: φ should be in 0–60°. Current: ${L.phi}`);
    if (i > 0) {
      const P = copy[i - 1];
      if (L.depthFrom < P.depthTo) messages.push(`Layer ${i}: overlaps previous layer. Check depths.`);
    }
  }
  return messages;
}
