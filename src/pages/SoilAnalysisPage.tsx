import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSoilContext } from '../context/SoilContext';
import { Slider } from '../components/Slider';
import { AlertCircle, ChevronDown, ChevronUp, Save } from 'lucide-react';

export const SoilAnalysisPage: React.FC = () => {
  const { soilData, updateSoilData, calculateSuitability, savedAnalyses, saveCurrentAnalysis, loadSavedAnalysis } = useSoilContext();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedAnalyses, setShowSavedAnalyses] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = () => {
    // Validate that the sum of soil components equals 100%
    if (Math.abs((soilData.clayContent + soilData.sandContent + soilData.siltContent) - 100) > 0.1) {
      setValidationError('Clay, sand, and silt content must sum to 100%');
      return;
    }
    
    setValidationError('');
    calculateSuitability();
    navigate('/results');
  };

  const handleSave = () => {
    saveCurrentAnalysis(saveName);
    setShowSaveDialog(false);
    setSaveName('');
  };

  const totalSoilComponents = soilData.clayContent + soilData.sandContent + soilData.siltContent;
  const isComponentsValid = Math.abs(totalSoilComponents - 100) <= 0.1;

  return (
    <div className="py-12 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Soil Analysis</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Soil Parameters</h2>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSavedAnalyses(!showSavedAnalyses)}
                  className="text-green-700 hover:text-green-500 text-sm flex items-center"
                >
                  {savedAnalyses.length > 0 ? `Saved Analyses (${savedAnalyses.length})` : 'No Saved Analyses'}
                </button>
                
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded flex items-center text-sm"
                  disabled={savedAnalyses.length >= 5}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </button>
              </div>
            </div>
            
            {/* Saved Analyses Dropdown */}
            {showSavedAnalyses && savedAnalyses.length > 0 && (
              <div className="mb-6 bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Analyses</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedAnalyses.map((analysis, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        loadSavedAnalysis(index);
                        setShowSavedAnalyses(false);
                      }}
                      className="w-full text-left block py-2 px-3 text-sm rounded hover:bg-green-100 transition-colors"
                    >
                      {analysis.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Save Analysis</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Enter a name for this analysis"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Basic Parameters */}
            <div className="space-y-6 mb-8">
              <Slider
                label="Soil pH"
                value={soilData.pH}
                min={3}
                max={10}
                step={0.1}
                onChange={(value) => updateSoilData({ pH: value })}
                helpText="pH measures acidity or alkalinity (3 = very acidic, 7 = neutral, 10 = very alkaline)"
                displayValue={soilData.pH.toFixed(1)}
                gradient="from-red-500 via-yellow-500 to-blue-500"
                markers={[
                  { value: 3, label: 'Acidic' },
                  { value: 7, label: 'Neutral' },
                  { value: 10, label: 'Alkaline' }
                ]}
              />
              
              <Slider
                label="Moisture Content (%)"
                value={soilData.moisture}
                min={0}
                max={100}
                step={1}
                onChange={(value) => updateSoilData({ moisture: value })}
                helpText="Percentage of water in the soil sample"
                displayValue={`${soilData.moisture}%`}
                gradient="from-yellow-500 to-blue-600"
                markers={[
                  { value: 0, label: 'Dry' },
                  { value: 50, label: 'Moist' },
                  { value: 100, label: 'Wet' }
                ]}
              />
              
              <Slider
                label="Soil Temperature (°C)"
                value={soilData.temperature}
                min={0}
                max={40}
                step={1}
                onChange={(value) => updateSoilData({ temperature: value })}
                helpText="Current soil temperature in degrees Celsius"
                displayValue={`${soilData.temperature}°C`}
                gradient="from-blue-500 to-red-500"
                markers={[
                  { value: 5, label: 'Cold' },
                  { value: 20, label: 'Moderate' },
                  { value: 35, label: 'Hot' }
                ]}
              />
            </div>
            
            {/* Toggle Advanced Parameters */}
            <button
              className="flex items-center justify-center w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm mb-6"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced Parameters' : 'Show Advanced Parameters'}
              {showAdvanced ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </button>
            
            {/* Advanced Parameters */}
            {showAdvanced && (
              <div className="space-y-6 mb-8">
                <div className="bg-amber-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="text-amber-500 h-5 w-5 mr-2 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      The sum of clay, sand, and silt content must equal 100%. Current total: {totalSoilComponents.toFixed(1)}%
                      {!isComponentsValid && <span className="font-bold text-red-500"> (Invalid)</span>}
                    </p>
                  </div>
                </div>
              
                <Slider
                  label="Clay Content (%)"
                  value={soilData.clayContent}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => updateSoilData({ clayContent: value })}
                  helpText="Percentage of clay particles in soil"
                  displayValue={`${soilData.clayContent}%`}
                  gradient="from-yellow-600 to-yellow-900"
                />
                
                <Slider
                  label="Sand Content (%)"
                  value={soilData.sandContent}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => updateSoilData({ sandContent: value })}
                  helpText="Percentage of sand particles in soil"
                  displayValue={`${soilData.sandContent}%`}
                  gradient="from-yellow-200 to-yellow-500"
                />
                
                <Slider
                  label="Silt Content (%)"
                  value={soilData.siltContent}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => updateSoilData({ siltContent: value })}
                  helpText="Percentage of silt particles in soil"
                  displayValue={`${soilData.siltContent}%`}
                  gradient="from-stone-300 to-stone-500"
                />
                
                <Slider
                  label="Organic Matter (%)"
                  value={soilData.organicMatter}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={(value) => updateSoilData({ organicMatter: value })}
                  helpText="Percentage of organic material in soil"
                  displayValue={`${soilData.organicMatter}%`}
                  gradient="from-green-200 to-green-800"
                />
                
                <Slider
                  label="Soil Density (g/cm³)"
                  value={soilData.density}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  onChange={(value) => updateSoilData({ density: value })}
                  helpText="Mass of soil per unit volume"
                  displayValue={`${soilData.density} g/cm³`}
                  gradient="from-blue-200 to-blue-800"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Calculated Barring Ratio</h3>
                    <p className="text-2xl font-bold text-blue-700">{soilData.barringRatio.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Higher values indicate better load-bearing capacity</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Calculated Void Ratio</h3>
                    <p className="text-2xl font-bold text-blue-700">{soilData.voidRatio.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Lower values indicate better stability for construction</p>
                  </div>
                </div>
              </div>
            )}
            
            {validationError && (
              <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
                <p>{validationError}</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAnalyze}
                className="bg-green-700 text-white py-3 px-8 rounded-lg font-medium text-lg hover:bg-green-600 transition-colors transform hover:scale-105 duration-200 shadow-md"
                disabled={!isComponentsValid}
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