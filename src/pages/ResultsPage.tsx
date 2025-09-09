import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSoilContext } from "../context/SoilContext";
import { ArrowLeft, Download, RefreshCw, X } from "lucide-react";
import { PDFReport } from "../components/PDFReport";
import { getFoundationType, getMaxFloors } from "../utils/soilCalculations";

export const ResultsPage: React.FC = () => {
  const { soilData, suitability, resetData } = useSoilContext();
  const navigate = useNavigate();
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  useEffect(() => {
    if (!suitability) navigate("/analyze");
  }, [suitability, navigate]);

  if (!suitability) return null;

  const handleNewAnalysis = () => {
    resetData();
    navigate("/analyze");
  };

  const foundation = getFoundationType(suitability.building.details.qsafe || 0);
  const maxFloors = getMaxFloors(soilData, suitability.building.details.qsafe || 0);

  return (
    <div className="py-12 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <button
              onClick={() => navigate("/analyze")}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Analysis
            </button>

            <div className="flex space-x-3">
              <button
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center text-sm"
                onClick={handleNewAnalysis}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Analysis
              </button>

              <button
                className="bg-green-700 text-white hover:bg-green-600 px-4 py-2 rounded-lg flex items-center text-sm"
                onClick={() => setShowPDFViewer(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded text-center">
              <p className="text-sm text-gray-600">Building Type</p>
              <p className="font-bold text-lg">{soilData.buildingType}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded text-center">
              <p className="text-sm text-gray-600">Planned Floors</p>
              <p className="font-bold text-lg">{soilData.plannedFloors}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded text-center">
              <p className="text-sm text-gray-600">Square Feet</p>
              <p className="font-bold text-lg">{soilData.squareFeet}</p>
            </div>
          </div>

          {/* Soil Parameters */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Soil Parameters</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Param label="pH" value={soilData.pH} />
              <Param label="Moisture (%)" value={soilData.moisture} />
              <Param label="Temperature (°C)" value={soilData.temperature} />
              <Param label="Density (g/cm³)" value={soilData.density} />
              <Param label="Clay Content (%)" value={soilData.clayContent} />
              <Param label="Sand Content (%)" value={soilData.sandContent} />
              <Param label="Silt Content (%)" value={soilData.siltContent} />
              <Param label="Organic Matter (%)" value={soilData.organicMatter} />
              <Param
                label="Void Ratio (IS 2720)"
                value={suitability.building.details.voidRatio ?? "—"}
              />
              <Param
                label="CBR % (IS 2720 Pt-16)"
                value={suitability.building.details.CBR ?? "—"}
              />
              <Param
                label="Safe Bearing Capacity (kN/m²)"
                value={suitability.building.details.qsafe ?? "—"}
              />
            </div>
          </div>

          {/* Structural Recommendations */}
          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-2">Structural Recommendations</h2>
            <p>
              Recommended Foundation: <b>{foundation}</b>
            </p>
            <p>
              Suggested Maximum Floors: <b>{maxFloors}</b>
            </p>
          </div>

          {/* Suitability Summary */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Soil Suitability
            </h1>
            <div className="text-center">
              <p className="font-semibold">Building Score: {suitability.building.score}/100</p>
              <p className="font-semibold">Agriculture Score: {suitability.agriculture.score}/100</p>
            </div>
          </div>

          {/* Remedial Measures */}
          {suitability.remedialMeasures && suitability.remedialMeasures.length > 0 && (
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Remedial Measures</h2>
              <ul className="list-disc pl-5 text-gray-700">
                {suitability.remedialMeasures.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] relative">
            <button
              onClick={() => setShowPDFViewer(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <PDFReport soilData={soilData} suitability={suitability} />
          </div>
        </div>
      )}
    </div>
  );
};

const Param: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded text-center">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);
