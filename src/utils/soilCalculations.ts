import { SoilData, SoilSuitability } from '../types';

export const calculateBarringRatio = (
  clayContent: number, 
  sandContent: number, 
  siltContent: number,
  density: number
): number => {
  // CBR = (LT / LS) * 100
  // LT = Load Test (approximated using soil composition and density)
  // LS = Load Standard (using a reference value)
  const loadTest = (sandContent * 0.6 + siltContent * 0.3) * density;
  const loadStandard = 100; // Reference standard load
  const ratio = (loadTest / loadStandard) * 100;
  return parseFloat(Math.max(0, ratio).toFixed(2));
};

export const calculateVoidRatio = (clayContent: number, density: number): number => {
  // e = Vv / Vs
  // Vv = Volume of voids (approximated using clay content)
  // Vs = Volume of solids (calculated using density)
  const volumeVoids = clayContent * 0.01; // Convert percentage to decimal
  const volumeSolids = 1 / density; // Approximate volume of solids using density
  const ratio = volumeVoids / volumeSolids;
  return parseFloat(Math.max(0, ratio).toFixed(2));
};

export const getSoilSuitability = (soilData: SoilData): SoilSuitability => {
  // Calculate scores for different purposes (0-100 scale)
  
  // Building suitability factors
  const buildingpHScore = calculateBuildingpHScore(soilData.pH);
  const buildingMoistureScore = calculateBuildingMoistureScore(soilData.moisture);
  const buildingBarringScore = calculateBuildingBarringScore(soilData.barringRatio);
  const buildingVoidScore = calculateBuildingVoidScore(soilData.voidRatio);
  
  // Agriculture suitability factors
  const agriculturepHScore = calculateAgriculturepHScore(soilData.pH);
  const agricultureMoistureScore = calculateAgricultureMoistureScore(soilData.moisture);
  const agricultureOrganicScore = calculateAgricultureOrganicScore(soilData.organicMatter);
  const agricultureTemperatureScore = calculateAgricultureTemperatureScore(soilData.temperature);
  
  // Calculate overall scores (weighted averages)
  const buildingScore = (
    buildingpHScore * 0.15 + 
    buildingMoistureScore * 0.25 + 
    buildingBarringScore * 0.35 + 
    buildingVoidScore * 0.25
  );
  
  const agricultureScore = (
    agriculturepHScore * 0.3 + 
    agricultureMoistureScore * 0.3 + 
    agricultureOrganicScore * 0.25 + 
    agricultureTemperatureScore * 0.15
  );

  // Determine recommendations and factors
  const buildingRecommendation = getBuildingRecommendation(buildingScore);
  const agricultureRecommendation = getAgricultureRecommendation(agricultureScore);
  
  // Determine limiting factors for building
  const buildingLimitingFactors = [];
  if (buildingpHScore < 60) buildingLimitingFactors.push('pH level');
  if (buildingMoistureScore < 60) buildingLimitingFactors.push('moisture content');
  if (buildingBarringScore < 60) buildingLimitingFactors.push('barring ratio');
  if (buildingVoidScore < 60) buildingLimitingFactors.push('void ratio');
  
  // Determine limiting factors for agriculture
  const agricultureLimitingFactors = [];
  if (agriculturepHScore < 60) agricultureLimitingFactors.push('pH level');
  if (agricultureMoistureScore < 60) agricultureLimitingFactors.push('moisture content');
  if (agricultureOrganicScore < 60) agricultureLimitingFactors.push('organic matter content');
  if (agricultureTemperatureScore < 60) agricultureLimitingFactors.push('soil temperature');

  return {
    building: {
      score: parseFloat(buildingScore.toFixed(1)),
      recommendation: buildingRecommendation,
      limitingFactors: buildingLimitingFactors,
      details: {
        pH: buildingpHScore,
        moisture: buildingMoistureScore,
        barringRatio: buildingBarringScore,
        voidRatio: buildingVoidScore
      }
    },
    agriculture: {
      score: parseFloat(agricultureScore.toFixed(1)),
      recommendation: agricultureRecommendation,
      limitingFactors: agricultureLimitingFactors,
      details: {
        pH: agriculturepHScore,
        moisture: agricultureMoistureScore,
        organicMatter: agricultureOrganicScore,
        temperature: agricultureTemperatureScore
      }
    },
    overallRecommendation: buildingScore > agricultureScore ? 'building' : 'agriculture'
  };
};

function calculateBuildingpHScore(pH: number): number {
  // Ideal pH for building is around 6-8 (more neutral)
  if (pH >= 6 && pH <= 8) return 100;
  if (pH > 8) return 100 - (pH - 8) * 20;
  return 100 - (6 - pH) * 20;
}

function calculateBuildingMoistureScore(moisture: number): number {
  // Lower moisture is better for building (0-40% optimal)
  if (moisture <= 20) return 100;
  if (moisture <= 40) return 100 - (moisture - 20) * 2.5;
  return Math.max(0, 50 - (moisture - 40) * 2);
}

function calculateBuildingBarringScore(barringRatio: number): number {
  // Higher barring ratio is better for building (>= 1.5 optimal)
  if (barringRatio >= 1.5) return 100;
  return Math.min(100, barringRatio * 66.7);
}

function calculateBuildingVoidScore(voidRatio: number): number {
  // Lower void ratio is better for building (<= 0.5 optimal)
  if (voidRatio <= 0.5) return 100;
  return Math.max(0, 100 - (voidRatio - 0.5) * 100);
}

function calculateAgriculturepHScore(pH: number): number {
  // Most crops prefer pH 5.5-7.5
  if (pH >= 5.5 && pH <= 7.5) return 100;
  if (pH > 7.5) return 100 - (pH - 7.5) * 20;
  return 100 - (5.5 - pH) * 20;
}

function calculateAgricultureMoistureScore(moisture: number): number {
  // Moderate moisture is ideal for agriculture (40-70% optimal)
  if (moisture >= 40 && moisture <= 70) return 100;
  if (moisture < 40) return 100 - (40 - moisture) * 2.5;
  return 100 - (moisture - 70) * 3.3;
}

function calculateAgricultureOrganicScore(organicMatter: number): number {
  // Higher organic matter is better for agriculture (>= 5% optimal)
  if (organicMatter >= 5) return 100;
  return organicMatter * 20;
}

function calculateAgricultureTemperatureScore(temperature: number): number {
  // Moderate temperatures are ideal (15-25°C optimal)
  if (temperature >= 15 && temperature <= 25) return 100;
  if (temperature < 15) return 100 - (15 - temperature) * 6.7;
  return 100 - (temperature - 25) * 5;
}

function getBuildingRecommendation(score: number): string {
  if (score >= 80) return 'Excellent for building purposes';
  if (score >= 60) return 'Suitable for building with some precautions';
  if (score >= 40) return 'Marginally suitable, requires significant soil treatment';
  return 'Not recommended for building without major intervention';
}

function getAgricultureRecommendation(score: number): string {
  if (score >= 80) return 'Excellent for agricultural use';
  if (score >= 60) return 'Good for agriculture with proper management';
  if (score >= 40) return 'Moderate agricultural potential, may require amendments';
  return 'Poor agricultural potential without significant improvements';
}