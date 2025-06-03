export interface SoilData {
  name: string;
  pH: number;
  moisture: number; // percentage
  temperature: number; // Celsius
  clayContent: number; // percentage
  sandContent: number; // percentage
  siltContent: number; // percentage
  organicMatter: number; // percentage
  density: number; // g/cm³
  barringRatio: number; // calculated
  voidRatio: number; // calculated
}

export interface SoilSuitability {
  building: {
    score: number; // 0-100
    recommendation: string;
    limitingFactors: string[];
    details: {
      pH: number;
      moisture: number;
      barringRatio: number;
      voidRatio: number;
    };
  };
  agriculture: {
    score: number; // 0-100
    recommendation: string;
    limitingFactors: string[];
    details: {
      pH: number;
      moisture: number;
      organicMatter: number;
      temperature: number;
    };
  };
  overallRecommendation: 'building' | 'agriculture';
}