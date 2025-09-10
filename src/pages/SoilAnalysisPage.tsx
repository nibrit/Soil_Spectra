// ---------- src/pages/SoilAnalysisPage.tsx ----------
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSoilContext } from '../context/SoilContext';
import { Slider } from '../components/Slider';
import { AlertCircle } from 'lucide-react';
import { LayerEditor } from '../components/LayerEditor';

export const SoilAnalysisPage: React.FC = () => {
  const { soilData, updateSoilData, calculateSuitability } = useSoilContext();
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = () => {
    // If composition sliders are used (optional), validate sum
    if (
      soilData.clayContent !== undefined &&
      soilData.sandContent !== undefined &&
      soilData.siltContent !== undefined &&
      Math.abs((soilData.clayContent + soilData.sandContent + soilData.siltContent) - 100) > 0.1
    ) {
      setValidationError('Clay, sand, and silt content must sum to 100%');
      return;
    }

    setValidationError('');
    calculateSuitability();
    navigate('/results');
  };

  return (
    <div className="py-12 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Soil Analysis</h1>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">

            {/* Building Info Inputs */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700">Building Type</label>
                <select
                  value={soilData.buildingType || ""}
                  onChange={(e) => updateSoilData({ buildingType: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700">Planned Floors</label>
                <input
                  type="number"
                  value={soilData.plannedFloors || ""}
                  onChange={(e) => updateSoilData({ plannedFloors: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Square Feet Area</label>
                <input
                  type="number"
                  value={soilData.squareFeet || ""}
                  onChange={(e) => updateSoilData({ squareFeet: Number(e.target.value) })}
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

            {/* Bore Log (Layers) */}
            <div className="mb-8">
              <LayerEditor />
            </div>

            {validationError && (
              <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
                <p>{validationError}</p>
              </div>
            )}

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
