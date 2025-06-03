import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export const EducationPage: React.FC = () => {
  return (
    <div className="py-12 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Soil Education Center</h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Learn about soil properties and how they affect land usage for building and agricultural purposes.
          </p>
          
          <div className="space-y-8">
            <EducationSection 
              id="basics"
              title="Soil Basics" 
              content={<SoilBasicsContent />} 
            />
            
            <EducationSection 
              id="ph"
              title="Understanding Soil pH" 
              content={<SoilPHContent />} 
            />
            
            <EducationSection 
              id="composition"
              title="Soil Composition" 
              content={<SoilCompositionContent />} 
            />
            
            <EducationSection 
              id="moisture"
              title="Moisture and Temperature" 
              content={<MoistureTemperatureContent />} 
            />
            
            <EducationSection 
              id="building"
              title="Soil for Building Purposes" 
              content={<BuildingPurposesContent />} 
            />
            
            <EducationSection 
              id="agriculture"
              title="Soil for Agricultural Purposes" 
              content={<AgriculturalPurposesContent />} 
            />
          </div>
          
          <div className="mt-12 bg-green-50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Ready to Analyze Your Soil?</h2>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              Apply what you've learned by analyzing your soil's properties to determine its suitability for building or agriculture.
            </p>
            <Link 
              to="/analyze" 
              className="inline-flex items-center bg-green-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-all"
            >
              Start Soil Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EducationSectionProps {
  id: string;
  title: string;
  content: React.ReactNode;
}

const EducationSection: React.FC<EducationSectionProps> = ({ id, title, content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div id={id} className="bg-white rounded-xl shadow-md overflow-hidden">
      <button 
        className="w-full text-left px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      <div 
        className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

const SoilBasicsContent: React.FC = () => (
  <div className="prose max-w-none">
    <p>
      Soil is more than just dirt – it's a complex mixture of minerals, organic matter, water, and air. 
      Understanding soil properties is crucial for determining whether land is suitable for building construction or agricultural use.
    </p>
    
    <p>
      The five key factors that determine soil usability are:
    </p>
    
    <ul>
      <li><strong>Composition</strong> - The proportion of sand, silt, clay, and organic materials</li>
      <li><strong>pH Level</strong> - The acidity or alkalinity of the soil</li>
      <li><strong>Moisture Content</strong> - The amount of water present in the soil</li>
      <li><strong>Temperature</strong> - The ambient temperature of the soil</li>
      <li><strong>Structure</strong> - How soil particles aggregate together</li>
    </ul>
    
    <p>
      These properties interact to determine how stable the soil is for building foundations and how fertile it is for growing crops.
    </p>
    
    <div className="my-6 bg-blue-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Why Soil Analysis Matters</h3>
      <p className="text-gray-700">
        For construction, poor soil analysis can lead to structural failures, foundation cracks, and building collapse.
        For agriculture, it can result in crop failures, reduced yields, and wasted resources.
        Proper soil analysis helps you make informed decisions about land usage.
      </p>
    </div>
  </div>
);

const SoilPHContent: React.FC = () => (
  <div className="prose max-w-none">
    <p>
      Soil pH is a measure of how acidic or alkaline your soil is, on a scale from 0 to 14, with 7 being neutral.
      Values below 7 indicate acidic soil, while values above 7 indicate alkaline soil.
    </p>
    
    <div className="my-6 overflow-hidden rounded-lg">
      <div className="h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-t-lg"></div>
      <div className="bg-gray-100 p-3">
        <div className="flex justify-between text-xs">
          <span>Acidic (3-6)</span>
          <span>Neutral (6-8)</span>
          <span>Alkaline (8-10)</span>
        </div>
      </div>
    </div>
    
    <h3>Impact on Building</h3>
    <p>
      Highly acidic soils (pH &lt; 5) can corrode concrete and metal components in foundations.
      Neutral to slightly alkaline soils (pH 6-8) are generally ideal for construction as they provide
      stable conditions for concrete and minimize corrosion of metal reinforcements.
    </p>
    
    <h3>Impact on Agriculture</h3>
    <p>
      Different plants thrive in different pH ranges:
    </p>
    <ul>
      <li>pH 4.5-5.5: Blueberries, potatoes, rhododendrons</li>
      <li>pH 5.5-6.5: Tomatoes, carrots, beans, many vegetables</li>
      <li>pH 6.0-7.0: Most vegetables and grasses</li>
      <li>pH 7.0-8.0: Asparagus, cabbage family, many herbs</li>
    </ul>
    
    <p>
      Soil pH affects nutrient availability to plants. In very acidic or very alkaline soils,
      many nutrients become less available, even if they are present in the soil.
    </p>
  </div>
);

const SoilCompositionContent: React.FC = () => (
  <div className="prose max-w-none">
    <p>
      Soil is composed of three main mineral particles — sand, silt, and clay — plus organic matter.
      The proportion of these components determines soil texture and many of its properties.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Sand (0.05-2.0 mm)</h3>
        <p className="text-sm">
          Large particles that create good drainage but poor nutrient retention.
          Provides stability for building but doesn't hold water well for plants.
        </p>
      </div>
      
      <div className="bg-stone-50 p-4 rounded-lg">
        <h3 className="font-medium text-stone-800 mb-2">Silt (0.002-0.05 mm)</h3>
        <p className="text-sm">
          Medium-sized particles with moderate drainage and nutrient retention.
          Provides a balance of properties beneficial for both uses.
        </p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg">
        <h3 className="font-medium text-amber-800 mb-2">Clay (&lt;0.002 mm)</h3>
        <p className="text-sm">
          Tiny particles that retain water and nutrients but drain poorly.
          Problematic for building due to expansion and contraction.
        </p>
      </div>
    </div>
    
    <h3>Soil Texture Triangle</h3>
    <p>
      Soil types are classified based on the percentage of sand, silt, and clay.
      The ideal soil type depends on the intended use:
    </p>
    
    <ul>
      <li><strong>For building:</strong> Sandy loam or loamy sand (higher sand content) provides better drainage and stability.</li>
      <li><strong>For agriculture:</strong> Loam soil (balanced mixture) is generally ideal as it provides good drainage while retaining nutrients and moisture.</li>
    </ul>
    
    <h3>Barring Ratio and Void Ratio</h3>
    <p>
      These are critical metrics for determining soil stability for construction:
    </p>
    
    <ul>
      <li><strong>Barring Ratio:</strong> Measures the soil's ability to bear weight. Higher values indicate better load-bearing capacity.</li>
      <li><strong>Void Ratio:</strong> Represents the volume of voids (air and water space) relative to solids in soil. Lower values generally indicate better stability for construction.</li>
    </ul>
  </div>
);

const MoistureTemperatureContent: React.FC = () => (
  <div className="prose max-w-none">
    <h3>Soil Moisture</h3>
    <p>
      Soil moisture content significantly impacts both building stability and plant growth. It is typically expressed as a percentage of water in the soil by volume or weight.
    </p>
    
    <div className="my-6 bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-2">Impact on Building</h4>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Low moisture (0-20%): Generally good for construction; minimal expansion/contraction</li>
        <li>Moderate moisture (20-40%): Acceptable for construction with proper drainage</li>
        <li>High moisture (40%+): Problematic for building; may cause settlement, expansion, or foundation instability</li>
      </ul>
    </div>
    
    <div className="my-6 bg-green-50 p-4 rounded-lg">
      <h4 className="font-medium text-green-800 mb-2">Impact on Agriculture</h4>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Low moisture (0-30%): Insufficient for most crops; irrigation needed</li>
        <li>Moderate moisture (30-60%): Ideal for most plants; good balance of water and air</li>
        <li>High moisture (60%+): May cause root rot and fungal diseases; drainage needed</li>
      </ul>
    </div>
    
    <h3>Soil Temperature</h3>
    <p>
      Soil temperature affects chemical reactions, microbial activity, and plant growth rates.
    </p>
    
    <p>
      For building purposes, extreme temperature fluctuations can cause soil expansion and contraction, potentially damaging foundations. Frozen soil (below 0°C) may heave and cause structural damage.
    </p>
    
    <p>
      For agriculture, soil temperature is critical for seed germination and plant growth:
    </p>
    <ul>
      <li>Cold soil (&lt;10°C): Slows germination and growth; suitable for cold-season crops</li>
      <li>Moderate soil (15-25°C): Optimal for most plant growth and microbial activity</li>
      <li>Warm soil (&gt;25°C): May stress cool-season plants but benefit warm-season crops</li>
    </ul>
  </div>
);

const BuildingPurposesContent: React.FC = () => (
  <div className="prose max-w-none">
    <p>
      When evaluating soil for construction, engineers focus on its load-bearing capacity, stability, and how it interacts with building materials over time.
    </p>
    
    <h3>Ideal Soil Characteristics for Building</h3>
    <ul>
      <li><strong>Composition:</strong> Higher sand content (40-80%) with some silt and minimal clay</li>
      <li><strong>pH:</strong> Neutral to slightly alkaline (6-8) to prevent concrete and metal corrosion</li>
      <li><strong>Moisture:</strong> Low to moderate (0-30%) to prevent settlement issues</li>
      <li><strong>Barring Ratio:</strong> Higher values (1.5+) indicate better load-bearing capacity</li>
      <li><strong>Void Ratio:</strong> Lower values (0.5 or less) for better stability</li>
    </ul>
    
    <h3>Problem Soils for Construction</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-red-800 mb-2">Expansive Clay Soils</h4>
        <p className="text-sm">
          High clay content soils that swell when wet and shrink when dry.
          Can cause severe foundation damage if not properly addressed.
        </p>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-red-800 mb-2">Organic Soils</h4>
        <p className="text-sm">
          Soils with high organic content (peat, muck) decompose over time,
          causing settlement issues and instability.
        </p>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-red-800 mb-2">Highly Acidic Soils</h4>
        <p className="text-sm">
          pH below 5.5 can corrode concrete foundations and metal reinforcements,
          reducing structural integrity over time.
        </p>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-red-800 mb-2">Poorly Drained Soils</h4>
        <p className="text-sm">
          Soils that retain excessive moisture can cause hydrostatic pressure against
          foundations, leading to cracks and water intrusion.
        </p>
      </div>
    </div>
    
    <h3>Engineering Solutions</h3>
    <p>
      Even problematic soils can often be made suitable for building through various engineering solutions:
    </p>
    <ul>
      <li>Soil replacement or mixing with more suitable materials</li>
      <li>Chemical stabilization (adding lime, cement, or other stabilizers)</li>
      <li>Proper drainage systems to manage moisture</li>
      <li>Deep foundations that bypass problematic soil layers</li>
      <li>Soil compaction to increase density and reduce settlement</li>
    </ul>
    
    <div className="bg-yellow-50 p-4 rounded-lg my-6">
      <h4 className="font-medium text-yellow-800 mb-2">Important Note</h4>
      <p className="text-sm">
        While our analysis provides a general indication of soil suitability for construction,
        a professional geotechnical investigation is essential before any significant building project.
        Local building codes and regulations should always be consulted.
      </p>
    </div>
  </div>
);

const AgriculturalPurposesContent: React.FC = () => (
  <div className="prose max-w-none">
    <p>
      Agricultural soil quality is primarily determined by its ability to support plant growth by providing nutrients, water, and a suitable environment for root development.
    </p>
    
    <h3>Ideal Soil Characteristics for Agriculture</h3>
    <ul>
      <li><strong>Composition:</strong> Loam soil (approximately 40% sand, 40% silt, 20% clay) provides an ideal balance</li>
      <li><strong>pH:</strong> Most crops prefer 5.5-7.5, though specific plants have different preferences</li>
      <li><strong>Organic Matter:</strong> Higher content (3%+) improves soil structure, nutrient retention, and microbial activity</li>
      <li><strong>Moisture:</strong> Moderate levels (40-60%) with good drainage capacity</li>
      <li><strong>Depth:</strong> Deeper topsoil (8+ inches) allows for better root development</li>
    </ul>
    
    <h3>Soil Fertility Components</h3>
    <p>
      Fertile agricultural soil contains adequate levels of essential nutrients:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">Primary Nutrients</h4>
        <ul className="text-sm list-disc pl-5">
          <li>Nitrogen (N)</li>
          <li>Phosphorus (P)</li>
          <li>Potassium (K)</li>
        </ul>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">Secondary Nutrients</h4>
        <ul className="text-sm list-disc pl-5">
          <li>Calcium (Ca)</li>
          <li>Magnesium (Mg)</li>
          <li>Sulfur (S)</li>
        </ul>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">Micronutrients</h4>
        <ul className="text-sm list-disc pl-5">
          <li>Iron (Fe)</li>
          <li>Zinc (Zn)</li>
          <li>Copper (Cu)</li>
          <li>And others</li>
        </ul>
      </div>
    </div>
    
    <h3>Soil Health Indicators</h3>
    <p>
      Beyond basic chemical properties, healthy agricultural soil shows these characteristics:
    </p>
    <ul>
      <li>Good structure with aggregates that resist erosion</li>
      <li>High biological activity (earthworms, beneficial microbes)</li>
      <li>Carbon sequestration capability</li>
      <li>Water infiltration and retention balance</li>
      <li>Resistance to compaction</li>
    </ul>
    
    <h3>Improving Agricultural Soil</h3>
    <p>
      Even less-than-ideal soils can be improved for agricultural use:
    </p>
    <ul>
      <li>Adding organic matter (compost, manure, cover crops)</li>
      <li>Adjusting pH with lime (to raise) or sulfur (to lower)</li>
      <li>Implementing crop rotation and no-till practices</li>
      <li>Adding appropriate fertilizers based on soil tests</li>
      <li>Installing drainage systems for waterlogged soils</li>
      <li>Using irrigation for overly dry soils</li>
    </ul>
    
    <div className="bg-blue-50 p-4 rounded-lg my-6">
      <h4 className="font-medium text-blue-800 mb-2">Matching Crops to Soil</h4>
      <p className="text-sm">
        Different crops have different soil preferences. When soil isn't ideal for one crop,
        it may be perfect for another. Consider selecting crops that naturally thrive in your
        soil conditions rather than extensively modifying the soil.
      </p>
    </div>
  </div>
);