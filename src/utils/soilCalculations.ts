import { SoilData, SoilSuitability } from "../types";

// IS Constants
const GAMMA_W = 9.81; // kN/m³, unit weight of water
const Gs = 2.65; // specific gravity of soil solids
const FOS = 3; // factor of safety for SBC

// 🔹 Void Ratio (IS 2720 Part 4, 5, 10)
export function calculateVoidRatio(density: number, moisture: number): number {
  const gamma = density * 9.81; // g/cm³ → kN/m³
  const gamma_d = gamma / (1 + moisture / 100);
  const e = (Gs * GAMMA_W) / gamma_d - 1;
  return parseFloat(e.toFixed(2));
}

// 🔹 California Bearing Ratio (IS 2720 Part 16 approx.)
export function calculateCBR(
  density: number,
  moisture: number,
  soilType: string
): number {
  let cbr = 5; // default

  if (soilType === "sand") cbr = 8 + (density - 1.6) * 5;
  if (soilType === "clay") cbr = 3 + (1.5 - density) * -4;
  if (soilType === "silt") cbr = 4 + (density - 1.4) * 3;

  // moisture penalty
  if (moisture > 25) cbr -= (moisture - 25) * 0.1;

  return Math.max(1, parseFloat(cbr.toFixed(1)));
}

// 🔹 Safe Bearing Capacity (Terzaghi – IS 6403)
export function calculateSafeBearingCapacity(
  cohesion: number,
  phi: number,
  gamma: number,
  depth: number,
  width: number
): number {
  const phiRad = (phi * Math.PI) / 180;

  // Bearing capacity factors
  const Nc = 5.7 + 1.8 * phi;
  const Nq =
    Math.exp(Math.PI * Math.tan(phiRad)) *
    Math.pow(Math.tan(Math.PI / 4 + phiRad / 2), 2);
  const Nγ = 1.5 * (Nq - 1) * Math.tan(phiRad);

  const qult = cohesion * Nc + gamma * depth * Nq + 0.5 * gamma * width * Nγ;
  const qsafe = qult / FOS;

  return parseFloat(qsafe.toFixed(1));
}

// 🔹 Foundation Type (IS 8009 / IS 2911)
export function getFoundationType(qsafe: number): string {
  if (qsafe > 300) return "Isolated/Strip Footing (IS 8009)";
  if (qsafe > 150) return "Raft/Mat Foundation (IS 8009)";
  if (qsafe > 75) return "Pile Foundation (IS 2911)";
  return "Deep Pile / Caisson Foundation (IS 2911)";
}

// 🔹 Max Floors based on SBC & site area
export function getMaxFloors(soilData: SoilData, qsafe: number): number {
  const loadPerFloor = 12; // kN/m² per floor (approx IS 875 Part 2 RCC)
  const siteArea = soilData.squareFeet || 1000; // sqft
  const siteArea_m2 = siteArea * 0.0929; // to m²

  const totalLoadCapacity = qsafe * siteArea_m2;
  const maxFloors = totalLoadCapacity / (loadPerFloor * siteArea_m2);

  return Math.max(1, Math.floor(maxFloors));
}

// 🔹 Suitability + Dynamic Remedial Measures
export function getSoilSuitability(soilData: SoilData): SoilSuitability {
  const voidRatio = calculateVoidRatio(soilData.density, soilData.moisture);
  const cbr = calculateCBR(soilData.density, soilData.moisture, "mixed");
  const qsafe = calculateSafeBearingCapacity(
    soilData.cohesion || 20,
    soilData.phi || 30,
    soilData.density * 9.81,
    1.5,
    1.0
  );

  // Scores
  const buildingScore = Math.min(100, (qsafe / 300) * 100);
  const agricultureScore = Math.min(
    100,
    soilData.organicMatter * 15 +
      (100 - Math.abs(7 - soilData.pH) * 10)
  );

  // Remedial measures
  const remedialMeasures: string[] = [];
  if (soilData.moisture > 25)
    remedialMeasures.push("Provide proper drainage to reduce high moisture.");
  if (voidRatio > 1.0)
    remedialMeasures.push("Improve compaction to reduce high void ratio.");
  if (cbr < 5)
    remedialMeasures.push(
      "Stabilize soil using lime/cement to improve CBR and strength."
    );
  if (qsafe < 75)
    remedialMeasures.push(
      "Use deep foundations (piles/caissons) where SBC is low."
    );

  return {
    building: {
      score: parseFloat(buildingScore.toFixed(1)),
      recommendation:
        buildingScore > 70 ? "Excellent for building" : "Needs soil treatment",
      limitingFactors: [],
      details: { pH: soilData.pH, moisture: soilData.moisture, voidRatio, CBR: cbr, qsafe },
    },
    agriculture: {
      score: parseFloat(agricultureScore.toFixed(1)),
      recommendation:
        agricultureScore > 70 ? "Excellent for farming" : "Soil amendments needed",
      limitingFactors: [],
      details: {
        pH: soilData.pH,
        moisture: soilData.moisture,
        organicMatter: soilData.organicMatter,
        temperature: soilData.temperature,
      },
    },
    overallRecommendation:
      buildingScore > agricultureScore ? "building" : "agriculture",
    remedialMeasures,
  };
}
