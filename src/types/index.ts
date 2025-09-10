export interface BoreLayer {
  fromDepth: number;   // m
  toDepth: number;     // m
  soil: string;        // description (e.g., Clay, Sand, Fill)
  gamma?: number;      // kN/m3 (bulk unit weight). If omitted, will be derived from density.
  cohesion?: number;   // kPa (c)
  phi?: number;        // degrees (ϕ)
  moisture?: number;   // %
  sptN?: number;       // SPT N-value
  remarks?: string;    // free text
}

export interface SoilData {
  name: string;
  pH: number;
  moisture: number;        // %
  temperature: number;     // °C
  clayContent: number;     // %
  sandContent: number;     // %
  siltContent: number;     // %
  organicMatter: number;   // %
  density: number;         // g/cm3 (bulk)
  voidRatio: number;       // calculated (can be 0 initially)

  // Strength params (global defaults, used if a layer doesn't specify)
  cohesion?: number;       // kPa
  phi?: number;            // °
  foundationDepth?: number;// m (D)
  foundationWidth?: number;// m (B)

  // Project info
  buildingType: 'residential'|'commercial'|'industrial'|'skyscraper'|string;
  plannedFloors: number;
  squareFeet: number;

  // Bore log
  boreLayers?: BoreLayer[];
}

export interface SoilSuitability {
  building: {
    score: number;
    recommendation: string;
    limitingFactors: string[];
    details: {
      pH: number;
      moisture: number;
      voidRatio: number;
      CBR: number;
      qsafe: number;
    };
  };
  agriculture: {
    score: number;
    recommendation: string;
    limitingFactors: string[];
    details: {
      pH: number;
      moisture: number;
      organicMatter: number;
      temperature: number;
    };
  };
  overallRecommendation: 'building'|'agriculture';

  // Added: computed engineering outputs for UI/PDF
  derived: {
    voidRatio: number;
    cbr: number;
    qsafe: number;
    foundationType: string;
    maxFloors: number;
    governingLayerIndex: number|null; // index in boreLayers
  };
}
