import { SoilData, SoilSuitability } from "../types";

// -----------------------------
// CONSTANTS (as per IS codes)
// -----------------------------
const GAMMA_W = 9.81; // unit weight of water (kN/m³)
const Gs = 2.65;      // specific gravity of soil solids (avg)
const FOS = 3;        // factor of safety (IS 6403)

// -----------------------------
// SOIL LAYER INTERFACE
// -----------------------------
export interface SoilLayer {
  depthFrom: number;   // m
  depthTo: number;     // m
  description: string; // soil description (clay, sand, etc.)
  moisture: number;    // %
  density: number;     // g/cm³
  voidRatio: number;   // calculated
  cbr: number;         // %
  sbc: number;         // kN/m²
}

// -----------------------------
// VOID RATIO (IS 2720 Pt 4/5/10)
// -----------------------------
export function calculateVoidRatio(density: number, moisture: number): number {
  const gamma = density * 9.81; // convert g/cm³ → kN/m³
  const gamma_d = gamma / (1 + moisture / 100); // dry unit weight
  const e = (Gs * GAMMA_W) / gamma_d - 1;
  return parseFloat(e.toFixed(2));
}

// -----------------------------
// CBR (California Bearing Ratio) IS 2720 Pt 16
// -----------------------------
export function calculateCBR(density: number, moisture: number, soilType: string): number {
  let cbr = 5;
  if (soilType === "sand") cbr = 8 + (density - 1.6) * 5;
  if (soilType === "clay") cbr = 3 + (1.5 - density) * -4;
  if (soilType === "silt") cbr = 4 + (density - 1.4) * 3;

  if (moisture > 25) cbr -= (moisture - 25) * 0.1; // penalty
  return Math.max(1, parseFloat(cbr.toFixed(1)));
}

// -----------------------------
// SAFE BEARING CAPACITY (Terzaghi – IS 6403)
// -----------------------------
export function calculateSafeBearingCapacity(
  cohesion: number,
  phi: number,
  gamma: number,
  depth: number,
  width: number
): number {
  // bearing capacity factors (approx from IS tables)
  const Nc = 5.7 + 1.8 * phi;
  const Nq =
    1 +
    Math.tan(Math.PI / 4 + (phi * Math.PI) / 360) ** 2 *
      Math.exp(Math.PI * Math.tan((phi * Math.PI) / 180));
  const Nγ = 1.5 * (Nq - 1) * Math.tan((phi * Math.PI) / 180);

  const qult = cohesion * Nc + gamma * depth * Nq + 0.5 * gamma * width * Nγ;
  const qsafe = qult / FOS;
  return parseFloat(qsafe.toFixed(1));
}

// -----------------------------
// FOUNDATION TYPE (IS 8009 / IS 2911)
// -----------------------------
export function getFoundationType(qsafe: number): string {
  if (qsafe > 300) return "Isolated/Strip Footing (IS 8009)";
  if (qsafe > 150) return "Raft/Mat Foundation (IS 2950)";
  if (qsafe > 75) return "Pile Foundation (IS 2911)";
  return "Deep Pile / Caisson Foundation (IS 2911)";
}

// -----------------------------
// MAX FLOORS BASED ON SBC
// -----------------------------
export function getMaxFloors(soilData: SoilData, qsafe: number): number {
  const loadPerFloor = 12; // kN/m² (IS 875 Part 2 approx for RCC resi.)
  const siteArea = soilData.squareFeet || 1000; // ft²
  const siteArea_m2 = siteArea * 0.0929;

  const totalLoadCapacity = qsafe * siteArea_m2;
  const maxFloors = totalLoadCapacity / (loadPerFloor * siteArea_m2);

  return Math.max(1, Math.floor(maxFloors));
}

// -----------------------------
// FOUNDATION FROM MULTIPLE LAYERS (BORE LOG)
// -----------------------------
export function getFoundationFromLayers(layers: SoilLayer[], buildingType: string): string {
  const minSBC = Math.min(...layers.map((l) => l.sbc));

  if (buildingType === "skyscraper") {
    return minSBC >= 600 ? "Pile/Caisson Foundation (IS 2911)" : "Deep Pile Foundation (IS 2911)";
  }
  if (buildingType === "industrial" || buildingType === "commercial") {
    return minSBC >= 400 ? "Raft/Mat Foundation (IS 2950)" : "Pile Foundation (IS 2911)";
  }
  return minSBC >= 200 ? "Strip/Isolated Footing (IS 8009)" : "Raft Foundation (IS 2950)";
}

// -----------------------------
// REMEDIAL MEASURES
// -----------------------------
export function getRemedialMeasures(layers: SoilLayer[]): string[] {
  const measures: string[] = [];
  layers.forEach((layer) => {
    if (layer.moisture > 20) {
      measures.push(`Depth ${layer.depthFrom}-${layer.depthTo}m: Dewatering/Drainage required.`);
    }
    if (layer.sbc < 200) {
      measures.push(`Depth ${layer.depthFrom}-${layer.depthTo}m: Soil replacement or ground improvement (IS 1888).`);
    }
    if (layer.cbr < 5) {
      measures.push(`Depth ${layer.depthFrom}-${layer.depthTo}m: Stabilization with lime/cement (IS 2720 Pt-16).`);
    }
    if (layer.voidRatio > 1.0) {
      measures.push(`Depth ${layer.depthFrom}-${layer.depthTo}m: Compaction or vibroflotation (IS 2720 Pt-8).`);
    }
  });
  return measures.length ? measures : ["All layers adequate — normal foundation possible."];
}

// -----------------------------
// SUITABILITY ANALYSIS (building + remedials)
// -----------------------------
export function getSoilSuitability(soilData: SoilData): SoilSuitability {
  if (soilData.layers && soilData.layers.length > 0) {
    const foundation = getFoundationFromLayers(soilData.layers, soilData.buildingType);
    const remedials = getRemedialMeasures(soilData.layers);
    return {
      building: {
        score: 0,
        recommendation: foundation,
        limitingFactors: [],
        details: {},
      },
      agriculture: {
        score: 0,
        recommendation: "Soil amendments may be required for farming.",
        limitingFactors: [],
        details: {},
      },
      overallRecommendation: "building",
      remedials,
    };
  }

  // single-layer fallback
  const voidRatio = calculateVoidRatio(soilData.density, soilData.moisture);
  const cbr = calculateCBR(soilData.density, soilData.moisture, "mixed");
  const qsafe = calculateSafeBearingCapacity(
    soilData.cohesion || 20,
    soilData.phi || 30,
    soilData.density * 9.81,
    1.5,
    1.0
  );
  const foundation = getFoundationType(qsafe);

  return {
    building: {
      score: Math.min(100, (qsafe / 300) * 100),
      recommendation: foundation,
      limitingFactors: [],
      details: { pH: soilData.pH, moisture: soilData.moisture, voidRatio, CBR: cbr },
    },
    agriculture: {
      score: 0,
      recommendation: "Remedial measures required — see below.",
      limitingFactors: [],
      details: {},
    },
    overallRecommendation: "building",
    remedials: getRemedialMeasures([
      {
        depthFrom: 0,
        depthTo: 2,
        description: "Topsoil",
        moisture: soilData.moisture,
        density: soilData.density,
        voidRatio,
        cbr,
        sbc: qsafe,
      },
    ]),
  };
}
