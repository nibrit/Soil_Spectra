import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSoilContext } from '../context/SoilContext';
import { BarChart3, Building, Wheat, ArrowLeft, Download, RefreshCw, X } from 'lucide-react';
import { PDFReport } from '../components/PDFReport';

export const ResultsPage: React.FC = () => {
  const { soilData, suitability, resetData } = useSoilContext();
  const navigate = useNavigate();
  const [showChart, setShowChart] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  useEffect(() => {
    // If no suitability data, redirect to analysis page
    if (!suitability) {
      navigate('/analyze');
      return;
    }

    // Show chart with animation after a delay
    const timer = setTimeout(() => {
      setShowChart(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [suitability, navigate]);

  if (!suitability) {
    return null;
  }

  const handleNewAnalysis = () => {
    resetData();
    navigate('/analyze');
  };

  const buildingScore = suitability.building.score;
  const agricultureScore = suitability.agriculture.score;

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
                Export Results
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Soil Analysis Results</h1>
            
            {/* Overall Recommendation */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-blue-50 py-2 px-4 rounded-full mb-4">
                <span className="text-sm font-medium text-blue-800">Overall Recommendation</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                This land is {' '}
                <span className={`${suitability.overallRecommendation === 'building' ? 'text-blue-700' : 'text-green-700'}`}>
                  best suited for {suitability.overallRecommendation}
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Based on your soil's properties, we've determined its optimal usage. 
                Review the detailed breakdown below.
              </p>
            </div>
            
            {/* Score Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <ScoreCard 
                title="Building Suitability" 
                score={buildingScore} 
                recommendation={suitability.building.recommendation}
                limitingFactors={suitability.building.limitingFactors}
                icon={<Building className="h-8 w-8 text-blue-600" />}
                color="blue"
                details={suitability.building.details}
                showChart={showChart}
              />
              
              <ScoreCard 
                title="Agricultural Suitability" 
                score={agricultureScore} 
                recommendation={suitability.agriculture.recommendation}
                limitingFactors={suitability.agriculture.limitingFactors}
                icon={<Wheat className="h-8 w-8 text-green-600" />}
                color="green"
                details={suitability.agriculture.details}
                showChart={showChart}
              />
            </div>
            
            {/* Soil Properties Summary */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Soil Properties Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PropertyCard label="pH Level" value={soilData.pH.toFixed(1)} />
                <PropertyCard label="Moisture" value={`${soilData.moisture}%`} />
                <PropertyCard label="Temperature" value={`${soilData.temperature}°C`} />
                <PropertyCard label="Organic Matter" value={`${soilData.organicMatter}%`} />
                <PropertyCard label="Clay Content" value={`${soilData.clayContent}%`} />
                <PropertyCard label="Sand Content" value={`${soilData.sandContent}%`} />
                <PropertyCard label="Silt Content" value={`${soilData.siltContent}%`} />
                <PropertyCard label="Soil Density" value={`${soilData.density} g/cm³`} />
                <PropertyCard 
                  label="Barring Ratio" 
                  value={soilData.barringRatio.toFixed(2)} 
                  description="Higher values indicate better load-bearing capacity"
                />
                <PropertyCard 
                  label="Void Ratio" 
                  value={soilData.voidRatio.toFixed(2)} 
                  description="Lower values indicate better stability for construction"
                />
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Improvement Suggestions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  For Building Purposes
                </h3>
                <ul className="space-y-3">
                  {buildingScore < 80 && (
                    <>
                      {suitability.building.limitingFactors.includes('pH level') && (
                        <SuggestionItem text="Adjust soil pH closer to neutral (6-8) with appropriate additives." />
                      )}
                      {suitability.building.limitingFactors.includes('moisture content') && (
                        <SuggestionItem text="Implement proper drainage solutions to reduce soil moisture content." />
                      )}
                      {suitability.building.limitingFactors.includes('barring ratio') && (
                        <SuggestionItem text="Improve soil composition with proper aggregate mixture to increase barring ratio." />
                      )}
                      {suitability.building.limitingFactors.includes('void ratio') && (
                        <SuggestionItem text="Consider soil compaction to reduce void ratio and increase stability." />
                      )}
                    </>
                  )}
                  {buildingScore >= 80 && (
                    <SuggestionItem text="Your soil is excellent for building. Consider standard foundation practices appropriate for your region." />
                  )}
                  <SuggestionItem text="Consult with a geotechnical engineer for specific building recommendations based on your location and structure type." />
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <Wheat className="h-5 w-5 mr-2" />
                  For Agricultural Purposes
                </h3>
                <ul className="space-y-3">
                  {agricultureScore < 80 && (
                    <>
                      {suitability.agriculture.limitingFactors.includes('pH level') && (
                        <SuggestionItem text="Adjust soil pH to optimal range (5.5-7.5) using lime to raise pH or sulfur to lower it." />
                      )}
                      {suitability.agriculture.limitingFactors.includes('moisture content') && (
                        <SuggestionItem text="Consider irrigation systems or drainage solutions to optimize moisture levels." />
                      )}
                      {suitability.agriculture.limitingFactors.includes('organic matter content') && (
                        <SuggestionItem text="Add compost, manure, or other organic amendments to increase organic matter content." />
                      )}
                      {suitability.agriculture.limitingFactors.includes('soil temperature') && (
                        <SuggestionItem text="Consider mulching to help regulate soil temperature for optimal growing conditions." />
                      )}
                    </>
                  )}
                  {agricultureScore >= 80 && (
                    <SuggestionItem text="Your soil is excellent for agriculture. Choose crops well-suited to your soil's characteristics." />
                  )}
                  <SuggestionItem text="Consult with a local agricultural extension office for crop-specific recommendations for your region." />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export Modal */}
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

interface ScoreCardProps {
  title: string;
  score: number;
  recommendation: string;
  limitingFactors: string[];
  icon: React.ReactNode;
  color: 'blue' | 'green';
  details: Record<string, number>;
  showChart: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ 
  title, 
  score, 
  recommendation, 
  limitingFactors, 
  icon, 
  color,
  details,
  showChart
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      light: 'text-blue-500',
      dark: 'text-blue-700',
      border: 'border-blue-200',
      chart: 'bg-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      light: 'text-green-500',
      dark: 'text-green-700',
      border: 'border-green-200',
      chart: 'bg-green-600'
    }
  };
  
  const classes = colorClasses[color];
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
  
  return (
    <div className={`${classes.bg} rounded-xl p-6 border ${classes.border}`}>
      <div className="flex items-center mb-4">
        {icon}
        <h3 className={`text-xl font-semibold ${classes.text} ml-2`}>{title}</h3>
      </div>
      
      <div className="flex items-center mb-6">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle 
                cx="48" 
                cy="48" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="6"
                className="absolute"
              />
              {showChart && (
                <circle 
                  cx="48" 
                  cy="48" 
                  r="45" 
                  fill="none" 
                  stroke={color === 'blue' ? '#2563eb' : '#16a34a'} 
                  strokeWidth="6"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              )}
            </svg>
            <span className={`absolute text-2xl font-bold ${classes.dark}`}>{score}</span>
          </div>
        </div>
        
        <div className="ml-4 flex-grow">
          <p className={`text-lg font-medium ${classes.dark} mb-1`}>{recommendation}</p>
          {limitingFactors.length > 0 && (
            <p className="text-sm text-gray-600">
              Limiting factors: {limitingFactors.join(', ')}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="relative pt-1">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-gray-700 uppercase">
                {key === 'pH' ? 'pH' : key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-xs font-semibold text-gray-700">{value}/100</div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full ${classes.chart}`}
                style={{ width: `${value}%`, transition: 'width 1s ease-out' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PropertyCardProps {
  label: string;
  value: string;
  description?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ label, value, description }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
    {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
  </div>
);

interface SuggestionItemProps {
  text: string;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ text }) => (
  <li className="flex items-start">
    <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
      <span className="h-2 w-2 rounded-full bg-green-600"></span>
    </span>
    <span className="text-gray-700">{text}</span>
  </li>
);