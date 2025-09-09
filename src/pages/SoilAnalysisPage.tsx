import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSoilContext } from "../context/SoilContext";
import { Slider } from "../components/Slider";
import { AlertCircle, Plus, Trash } from "lucide-react";

export const SoilAnalysisPage: React.FC = () => {
  const {
    soilData,
    updateSoilData,
    addLayer,
    updateLayer,
    deleteLayer,
    calculateSuitability,
  } = useSoilContext();
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (
      soilData.clayContent !== undefined &&
      soilData.sandContent !== undefined &&
      soilData.siltContent !== undefined &&
      Math.abs(
        soilData.clayContent + soilData.sandContent + soilData.siltContent - 100
      ) > 0.1
    ) {
      setValidationError("Clay, sand, and silt content must sum to 100%");
      return;
    }

    setValidationError("");
    calculateSuitability();
    navigate("/results");
  };

  return (
    <div className="py-12 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Soil Analysis
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {/* Building Info Inputs */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Building Type
                </label>
                <select
                  value={soilData.buildingType || ""}
                  onChange={(e) =>
                    updateSoilData({ buildingType: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="skyscraper">Skyscraper</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Planned Floors
                </label>
                <input
                  type="number"
                  value={soilData.plannedFloors || ""}
                  onChange={(e) =>
                    updateSoilData({ plannedFloors: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Square Feet Area
                </label>
                <input
                  type="number"
                  value={soilData.squareFeet || ""}
                  onChange={(e) =>
                    updateSoilData({ squareFeet: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="e.g., 1200"
                />
              </div>
            </div>

            {/* Basic Parameters */}
            <div className="space-y-6 mb-8">
              <Slider
                label="Soil pH"
                value={soilData.pH}
                min={3}
                max={10}
                step={0.1}
                onChange={(value) => updateSoilData({ pH: value })}
                displayValue={soilData.pH.toFixed(1)}
              />

              <Slider
                label="Moisture Content (%)"
                value={soilData.moisture}
                min={0}
                max={100}
                step={1}
                onChange={(value) => updateSoilData({ moisture: value })}
                displayValue={`${soilData.moisture}%`}
              />

              <Slider
                label="Soil Temperature (°C)"
                value={soilData.temperature}
                min={0}
                max={40}
                step={1}
                onChange={(value) => updateSoilData({ temperature: value })}
                displayValue={`${soilData.temperature}°C`}
              />
            </div>

            {/* Bore Log Input */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Bore Log Data
              </h2>
              <table className="w-full border border-gray-200 text-sm mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Depth (m)</th>
                    <th className="p-2 border">Soil Type</th>
                    <th className="p-2 border">Density (g/cm³)</th>
                    <th className="p-2 border">Moisture (%)</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {soilData.layers?.map((layer, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={layer.depth}
                          onChange={(e) =>
                            updateLayer(idx, { depth: Number(e.target.value) })
                          }
                          className="w-20 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2 border">
                        <select
                          value={layer.soilType}
                          onChange={(e) =>
                            updateLayer(idx, { soilType: e.target.value })
                          }
                          className="w-32 border rounded px-2 py-1"
                        >
                          <option value="clay">Clay</option>
                          <option value="sand">Sand</option>
                          <option value="silt">Silt</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          step="0.01"
                          value={layer.density}
                          onChange={(e) =>
                            updateLayer(idx, {
                              density: Number(e.target.value),
                            })
                          }
                          className="w-24 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          step="0.1"
                          value={layer.moisture}
                          onChange={(e) =>
                            updateLayer(idx, {
                              moisture: Number(e.target.value),
                            })
                          }
                          className="w-24 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => deleteLayer(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() =>
                  addLayer({
                    depth: 1,
                    soilType: "clay",
                    density: 1.6,
                    moisture: 20,
                  })
                }
                className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Layer
              </button>
            </div>

            {/* Validation Errors */}
            {validationError && (
              <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
                <p>{validationError}</p>
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAnalyze}
                className="bg-green-700 text-white py-3 px-8 rounded-lg font-medium text-lg hover:bg-green-600"
              >
                Analyze Soil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
