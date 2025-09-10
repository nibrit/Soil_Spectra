import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSoilContext } from '../context/SoilContext';
import { ArrowLeft, Download, RefreshCw, X } from 'lucide-react';
import { PDFReport } from '../components/PDFReport';
import {
  computeFullDesignSummary,
  DesignBundle,
} from '../utils/soilCalculations';

export const ResultsPage: React.FC = () => {
  const { soilData, suitability, resetData } = useSoilContext();
  const navigate = useNavigate();
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  useEffect(() => {
    if (!suitability) {
      // No analysis yet → back to analyze page
      navigate('/analyze');
    }
  }, [suitability, navigate]);

  // Build the design bundle once per soilData change
  const { bundle, messages } = useMemo<{ bundle: DesignBundle; messages: string[] }>(() => {
    return computeFullDesignSummary(soilData);
  }, [soilData]);

  if (!suitability) return null;

  const handleNewAnalysis = () => {
    resetData();
    navigate('/analyze');
  };

  return (
    <div className="py-12 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <button
              onClick={() => navigate('/analyze')}
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
                Export Bore Log PDF
              </button>
            </div>
          </div>

          {/* Building / Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Building Type</p>
              <p className="font-bold text-lg">{soilData.buildingType || '-'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Planned Floors</p>
              <p className="font-bold text-lg">{soilData.plannedFloors ?? '-'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Site Area (ft²)</p>
              <p className="font-bold text-lg">{soilData.squareFeet ?? '-'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Exposure Class</p>
              <p className="font-bold text-lg capitalize">
                {bundle.exposure.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Structural Recommendations */}
          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-2">Structural Recommendations (Preliminary)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Safe Bearing Capacity</div>
                <div className="text-2xl font-bold">{bundle.qsafe} kPa</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Recommended Foundation</div>
                <div className="font-semibold">{bundle.foundationType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Suggested Max Floors</div>
                <div className="font-semibold">{bundle.maxFloors}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Governing Layer @Depth</div>
                <div className="font-semibold">
                  {bundle.governingLayer?.soilType || '-'} @ {bundle.governingAtDepth} m
                </div>
              </div>
            </div>

            {/* Practical messages */}
            {messages?.length > 0 && (
              <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 list-disc list-inside text-gray-700">
                {messages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Bore Log Table */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bore Log (Depth-wise Soil Characteristics)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">From (m)</th>
                    <th className="py-2 pr-4">To (m)</th>
                    <th className="py-2 pr-4">Soil Type</th>
                    <th className="py-2 pr-4">γ (kN/m³)</th>
                    <th className="py-2 pr-4">c (kPa)</th>
                    <th className="py-2 pr-4">φ (°)</th>
                    <th className="py-2 pr-4">Moisture (%)</th>
                    <th className="py-2 pr-4">SPT N</th>
                    <th className="py-2 pr-4">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.boreLog.map((r, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{r.depthFrom}</td>
                      <td className="py-2 pr-4">{r.depthTo}</td>
                      <td className="py-2 pr-4 capitalize">{r.soilType}</td>
                      <td className="py-2 pr-4">{r.gamma}</td>
                      <td className="py-2 pr-4">{r.cohesion}</td>
                      <td className="py-2 pr-4">{r.phi}</td>
                      <td className="py-2 pr-4">{r.moisture ?? '-'}</td>
                      <td className="py-2 pr-4">{r.SPT_N ?? '-'}</td>
                      <td className="py-2 pr-4">{r.remarks ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Concrete & Steel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Concrete Recommendation (IS 456)</h3>
              <div className="text-gray-700">
                <div><b>Grade:</b> {bundle.concrete.grade}</div>
                <div><b>Cement:</b> {bundle.concrete.cementType}</div>
                <div><b>Max w/c:</b> ≤ {bundle.concrete.maxWCRatio}</div>
                <div><b>Min Cement:</b> {bundle.concrete.minCementContent} kg/m³</div>
                <div className="mt-2">
                  <b>Nominal Cover (mm):</b>{' '}
                  Slab {bundle.concrete.nominalCover.slab}, Beam {bundle.concrete.nominalCover.beam},
                  Column {bundle.concrete.nominalCover.column}, Footing {bundle.concrete.nominalCover.footing}
                </div>
                {bundle.concrete.admixtures.length > 0 && (
                  <div className="mt-2">
                    <b>Admixtures:</b> {bundle.concrete.admixtures.join(', ')}
                  </div>
                )}
                {bundle.concrete.notes.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {bundle.concrete.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Steel / Structural System</h3>
              <div className="text-gray-700">
                <div><b>System:</b> {bundle.steel.system}</div>
                <div><b>Steel Grade:</b> {bundle.steel.steelGrade}</div>
                <div><b>Lateral System:</b> {bundle.steel.lateralSystem}</div>
                {bundle.steel.corrosionProtection.length > 0 && (
                  <div className="mt-2">
                    <b>Corrosion Protection:</b> {bundle.steel.corrosionProtection.join('; ')}
                  </div>
                )}
                {bundle.steel.notes.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {bundle.steel.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Remediation (if needed) & Practical Notes */}
          {(bundle.remediation || bundle.notes.length > 0) && (
            <div className="bg-yellow-50 rounded-xl shadow p-6 mb-10">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Remedial Measures & Notes</h3>

              {bundle.remediation && (
                <div className="mb-4">
                  <div className="text-sm text-gray-700">
                    <b>Target SBC:</b> {bundle.remediation.targetQsafe} kPa &nbsp;|&nbsp;
                    <b>Estimated Gain:</b> {bundle.remediation.estimatedGain} kPa
                  </div>
                  <div className="mt-2">
                    <b>Recommended Methods:</b>
                    <ul className="list-disc list-inside">
                      {bundle.remediation.methods.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                  {bundle.remediation.notes.length > 0 && (
                    <ul className="mt-2 list-disc list-inside">
                      {bundle.remediation.notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {bundle.notes.length > 0 && (
                <ul className="list-disc list-inside text-gray-700">
                  {bundle.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal */}
      {showPDFViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] relative">
            <button
              onClick={() => setShowPDFViewer(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <PDFReport soilData={soilData} suitability={suitability} design={bundle} />
          </div>
        </div>
      )}
    </div>
  );
};
