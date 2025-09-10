// src/utils/soilCalculations.ts
// -----------------------------------------------------------------------------
// Construction Decision Support – Indian Standards–aligned utilities
// Safe to paste over your existing soilCalculations.ts
// Keeps existing functions: getMaxFloors, getFoundationType, getSoilSuitability
// and adds many more helpers you can consume in Results/PDF.
// -----------------------------------------------------------------------------
// Notes (high level):
// - Units: density in g/cm³ (input) -> converted to γ (kN/m³) internally
// - Depths in meters
// - qsafe in kPa (kN/m²)
// - Reasonable, conservative mappings to IS 456:2000, IS 10262:2019,
//   IS 6403, IS 2911, IS 8009, IS 2720 parts (void ratio/CBR links)
// - This is a preliminary tool: NOT a substitute for a geotech report.
// -----------------------------------------------------------------------------

import { SoilData, SoilSuitability } from "../types";

// ----------------------------- Local helper types ----------------------------

export type SoilType =
  | "clay"
  | "silty clay"
  | "silt"
  | "sandy silt"
  | "sand"
  | "silty sand"
  | "gravel"
  | "peat"
  | "fill"
  | "weathered rock"
  | "rock";

export interface SoilLayer {
  id?: string;
  fromDepth: number;     // m
  toDepth: number;       // m
  soilType: SoilType;
  gamma?: number;        // kN/m³ (bulk unit weight)
  moisture?: number;     // %
  SPT_N?: number;        // (blows)
  cohesion?: number;     // c (kPa)
  phi?: number;          // φ (degrees)
  plasticityIndex?: number;
  description?: string;
}

export type EnvironmentTag =
  | "seaside"
  | "hot"
  | "cold"
  | "tropical"
  | "rainforest"
  | "arid"
  | "industrial"
  | "hill"
  | "urban"
  | "volcanic";

export interface EnvironmentInputs {
  tags?: EnvironmentTag[];        // user selection
  seismicZone?: 2 | 3 | 4 | 5;    // IS 1893 zone (2–5)
  basicWindSpeed?: number;        // m/s (IS 875 Part 3)
  sulfateExposure?: "low" | "moderate" | "high" | "very_high";
  chlorideRisk?: "low" | "moderate" | "high"; // marine splash/industrial
}

// All-in-one output bundle you can show on Results/PDF
export interface DesignBundle {
  qsafe: number;                         // kPa
  governingLayer?: SoilLayer;
  governingAtDepth?: number;             // m
  voidRatio: number;                     // (approx)
  cbr: number;                           // %
  inferredSoilType?: SoilType;           // from composition if no layers
  foundationType: string;
  maxFloors: number;
  exposure: ExposureClass;
  concrete: ConcreteRecommendation;
  steel: SteelRecommendation;
  superstructure: SuperstructureSuggestion;
  remediation: RemediationPlan | null;
  boreLog: BoreLogRow[];
  notes: string[];
}

// ----------------------------- Constants & utils -----------------------------

const GAMMA_W = 9.81;        // kN/m³ (unit weight of water)
const Gs = 2.65;             // specific gravity of solids (typical)
const FOS = 3;               // factor of safety for bearing capacity
const round = (x: number, d = 2) => Number(x.toFixed(d));
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const deg = (rad: number) => (rad * 180) / Math.PI;
const rad = (deg: number) => (deg * Math.PI) / 180;

// Convert density (g/cm³) -> γ (kN/m³)
function densityToGamma(density: number | undefined): number {
  if (!density || density <= 0.5 || density > 2.8) return 18; // fallback typical
  return round(density * 9.81, 2);
}

// Basic soil type inference from composition
export function inferSoilFromComposition(
  sand: number | undefined,
  silt: number | undefined,
  clay: number | undefined
): SoilType | undefined {
  if (
    sand === undefined ||
    silt === undefined ||
    clay === undefined ||
    sand + silt + clay < 95 || sand + silt + clay > 105
  )
    return undefined;

  if (clay >= 40) return "clay";
  if (clay >= 25 && silt >= 25) return "silty clay";
  if (sand >= 60 && silt <= 20 && clay <= 20) return "sand";
  if (sand >= 40 && silt >= 20 && clay <= 20) return "silty sand";
  if (silt >= 60 && clay <= 20 && sand <= 20) return "silt";
  if (silt >= 40 && sand >= 20 && clay <= 20) return "sandy silt";
  if (sand >= 30 && silt >= 30 && clay >= 20) return "silty clay";
  return "silt";
}

// ----------------------------- Void ratio (IS 2720 idea) ---------------------

// γd = γ / (1 + w)  (w = moisture ratio)
// e = (Gs * γw) / γd - 1
export function calculateVoidRatio(density_gcc: number, moisture_pct: number): number {
  const gamma = densityToGamma(density_gcc);
  const w = clamp(moisture_pct, 0, 200) / 100;
  const gamma_d = gamma / (1 + w);
  const e = (Gs * GAMMA_W) / gamma_d - 1;
  return round(Math.max(0, e), 2);
}

// ----------------------------- CBR (very rough) ------------------------------

export function estimateCBR(
  density_gcc: number,
  moisture_pct: number,
  soilType?: SoilType
): number {
  // Styled after IS 2720 Pt.16 idea (trend only). Lab CBR governs in real life.
  let base =
    soilType === "sand" || soilType === "silty sand"
      ? 8
      : soilType === "silt" || soilType === "sandy silt"
      ? 5
      : soilType === "clay" || soilType === "silty clay"
      ? 3
      : 6;

  // Density effect
  if (density_gcc >= 2.0) base += 6;
  else if (density_gcc >= 1.8) base += 4;
  else if (density_gcc >= 1.6) base += 2;

  // Moisture penalty above OMC-ish
  if (moisture_pct > 25) base -= (moisture_pct - 25) * 0.15;

  return round(clamp(base, 1, 30), 1);
}

// -------------------- Terzaghi bearing capacity (IS 6403 aligned) ------------

function bearingFactors(phiDeg: number) {
  const phi = rad(clamp(phiDeg, 0, 45));
  const Nq = Math.exp(Math.PI * Math.tan(phi)) * Math.tan(Math.PI / 4 + phi / 2) ** 2;
  const Nc = (Nq - 1) / Math.tan(phi || 1e-6); // avoid div-by-zero at φ≈0
  const Nγ = 1.5 * (Nq - 1) * Math.tan(phi);
  return { Nc, Nq, Nγ };
}

/**
 * Terzaghi ultimate capacity for strip-ish footing:
 * qult = c*Nc + q*Nq + 0.5*γ*B*Nγ
 * q = γ*Df
 *
 * @returns qsafe (qult/FOS) in kPa
 */
export function calculateSafeBearingCapacity(
  c_kPa: number,       // cohesion
  phiDeg: number,      // angle of shearing resistance
  gamma: number,       // kN/m³
  Df: number,          // embedment depth (m)
  B: number            // footing width (m)
): number {
  const { Nc, Nq, Nγ } = bearingFactors(phiDeg);
  const q = gamma * Df;
  const qult = c_kPa * Nc + q * Nq + 0.5 * gamma * B * Nγ;
  const qsafe = qult / FOS;
  return round(Math.max(0, qsafe), 1);
}

// ------------------------ Layer selector (governing layer) -------------------

export function layerAtDepth(layers: SoilLayer[], z: number): SoilLayer | undefined {
  return layers.find((L) => z >= L.fromDepth && z < L.toDepth);
}

// If user doesn’t give layers, synthesize from composition
export function synthesizeLayersFromComposition(sd: SoilData): SoilLayer[] {
  const inferred = inferSoilFromComposition(sd.sandContent, sd.siltContent, sd.clayContent) || "silt";

  const gamma = densityToGamma(sd.density);
  const base: SoilLayer = {
    fromDepth: 0,
    toDepth: 2,
    soilType: inferred,
    gamma,
    moisture: sd.moisture,
    cohesion: inferred.includes("clay") ? 25 : inferred.includes("silt") ? 10 : 0,
    phi: inferred.includes("clay") ? 18 : inferred.includes("silt") ? 28 : 33,
    description: "Synthesized layer from composition",
  };
  const second: SoilLayer = {
    fromDepth: 2,
    toDepth: 6,
    soilType: inferred === "sand" ? "silty sand" : inferred === "clay" ? "silty clay" : inferred,
    gamma: Math.max(18, gamma + 0.5),
    moisture: Math.max(10, (sd.moisture || 15) - 5),
    cohesion: base.cohesion ? Math.max(0, base.cohesion - 5) : 0,
    phi: base.phi ? Math.min(36, base.phi + 2) : 30,
    description: "Synthesized deeper layer",
  };
  return [base, second];
}

// --------------------- Exposure class (IS 456 durability) --------------------

export type ExposureClass =
  | "mild"
  | "moderate"
  | "severe"
  | "very_severe"
  | "extreme";

export function computeExposure(env?: EnvironmentInputs): ExposureClass {
  const tags = env?.tags || [];

  if (tags.includes("seaside") || env?.chlorideRisk === "high") return "very_severe";
  if (tags.includes("rainforest") || tags.includes("tropical")) return "severe";
  if (env?.sulfateExposure === "very_high") return "extreme";
  if (env?.sulfateExposure === "high" || tags.includes("industrial")) return "very_severe";
  if (tags.includes("hot") || tags.includes("urban") || env?.sulfateExposure === "moderate") return "moderate";
  return "mild";
}

// --------------- Concrete recommendation (IS 456 + IS 10262) -----------------

export interface ConcreteRecommendation {
  grade: "M20" | "M25" | "M30" | "M35" | "M40" | "M50" | "M60";
  cementType: "OPC" | "PPC" | "PSC" | "SRC";
  maxWCRatio: number;        // by mass
  minCementContent: number;  // kg/m³ (indicative)
  nominalCover: { slab: number; beam: number; column: number; footing: number }; // mm
  admixtures: string[];
  notes: string[];
}

export function recommendConcrete(envClass: ExposureClass, env?: EnvironmentInputs): ConcreteRecommendation {
  // Table approximated from IS 456 durability requirements
  const map: Record<ExposureClass, { grade: ConcreteRecommendation["grade"]; wcr: number; cem: number; cover: [number, number, number, number] }> = {
    mild:        { grade: "M20", wcr: 0.55, cem: 300, cover: [20, 25, 25, 40] },
    moderate:    { grade: "M25", wcr: 0.50, cem: 320, cover: [25, 30, 35, 45] },
    severe:      { grade: "M30", wcr: 0.45, cem: 340, cover: [35, 40, 45, 50] },
    very_severe: { grade: "M35", wcr: 0.45, cem: 360, cover: [40, 50, 50, 55] },
    extreme:     { grade: "M40", wcr: 0.40, cem: 380, cover: [50, 55, 60, 60] },
  };

  const base = map[envClass];
  // Cement type hints
  let cement: ConcreteRecommendation["cementType"] = "OPC";
  const tags = env?.tags || [];
  if (tags.includes("seaside") || env?.chlorideRisk === "high") cement = "PSC"; // good chloride resistance
  else if (env?.sulfateExposure === "high" || env?.sulfateExposure === "very_high") cement = "SRC";
  else cement = "PPC"; // good general durability/low heat

  const admixtures: string[] = [];
  if (tags.includes("hot")) admixtures.push("Retarder / Low-heat blend");
  if (tags.includes("cold")) admixtures.push("Air-entraining agent / Accelerator");
  if (tags.includes("seaside") || env?.chlorideRisk === "high") admixtures.push("Corrosion inhibitor");
  if (tags.includes("tropical") || tags.includes("rainforest")) admixtures.push("Water-reducer (HRWR)");

  const notes: string[] = [];
  if (tags.includes("seaside")) notes.push("Provide robust cover blocks (same durability grade) and good curing; consider micro-silica for chloride ingress resistance.");
  if (env?.seismicZone && env.seismicZone >= 4) notes.push("Detail per IS 13920 (ductile detailing) – confinement, hook anchorage, lap at low strain zones.");
  if ((env?.basicWindSpeed || 0) >= 44) notes.push("Wind uplift & serviceability checks per IS 875 Part 3.");

  return {
    grade: base.grade,
    cementType: cement,
    maxWCRatio: base.wcr,
    minCementContent: base.cem,
    nominalCover: {
      slab: base.cover[0],
      beam: base.cover[1],
      column: base.cover[2],
      footing: base.cover[3],
    },
    admixtures,
    notes,
  };
}

// -------------------------- Steel recommendations ----------------------------

export interface SteelRecommendation {
  system: "RCC" | "Steel" | "Composite" | "PEB" | "Modular";
  corrosionProtection: string[];
  steelGrade: string; // e.g., E250/E350 + Fe500/Fe550D for rebar
  lateralSystem: string; // shear walls/braced frames/moment frames
  notes: string[];
}

export function recommendSteelSystem(
  sd: SoilData,
  env?: EnvironmentInputs
): SteelRecommendation {
  const tags = env?.tags || [];
  const floors = sd.plannedFloors || 1;
  const area = sd.squareFeet || 1000;

  // Base choice
  let system: SteelRecommendation["system"] = "RCC";
  if (floors >= 10 || area > 15000) system = "Composite"; // efficiency at scale
  if (tags.includes("industrial")) system = "PEB";
  if (tags.includes("seaside") && floors <= 4) system = "Composite"; // lighter superstructure
  if (tags.includes("volcanic") || tags.includes("hill")) system = "RCC"; // robustness & mass damping

  // Lateral system
  let lateral = "RC shear walls (IS 13920) + MRF";
  if ((env?.basicWindSpeed || 0) >= 44) lateral = "Braced steel frames / RC shear walls (wind critical)";
  if ((env?.seismicZone || 2) >= 4) lateral = "Dual system: RC shear walls + SMRF (ductile)";

  // Corrosion
  const corrosionProtection: string[] = [];
  if (tags.includes("seaside") || env?.chlorideRisk === "high") {
    corrosionProtection.push("Hot-dip galvanizing (≥85 µm) or duplex coating");
    corrosionProtection.push("Epoxy-coated rebars / CRR (corrosion-resistant) in splash zones");
  } else {
    corrosionProtection.push("High-build epoxy system (DFT ≥ 240 µm) / regular maintenance");
  }

  // Grades
  const steelGrade = "Rolled steel: E250/E350; Rebar: Fe500D/Fe550D";

  const notes: string[] = [];
  if (system === "PEB") notes.push("Check IS 800 limit states design; use Z-purlins, tapered rafters; fast-track erection.");
  if (system === "Composite") notes.push("Composite decks + shear studs for rapid floors; coordinate fire protection.");
  if ((env?.seismicZone || 2) >= 4) notes.push("Ductile detailing per IS 13920 & IS 800 (for steel/CFST).");

  return { system, corrosionProtection, steelGrade, lateralSystem: lateral, notes };
}

// -------------------------- Superstructure suggestions -----------------------

export interface SuperstructureSuggestion {
  slabSystem: "One-way" | "Two-way" | "Flat slab" | "Waffle" | "PT slab";
  remarks: string[];
}

export function suggestSuperstructure(sd: SoilData): SuperstructureSuggestion {
  const floors = sd.plannedFloors || 1;
  const area = sd.squareFeet || 1000;

  // Heuristics: PT beyond ~8–9 m spans, large plates use flat/waffle
  const remarks: string[] = [];
  let slab: SuperstructureSuggestion["slabSystem"] = "Two-way";

  if (area > 12000) {
    slab = "Flat slab";
    remarks.push("Consider drop panels/column heads; check punching shear.");
  }
  if (floors >= 8) {
    slab = "PT slab";
    remarks.push("PT recommended for longer spans & reduced thickness; coordinate tendon profiles.");
  }
  if (area > 20000) {
    slab = "Waffle";
    remarks.push("Waffle/voided slab for vibration control & serviceability.");
  }
  if (floors <= 3 && area <= 6000) {
    slab = "Two-way";
    remarks.push("Conventional two-way slab economical for small spans.");
  }
  return { slabSystem: slab, remarks };
}

// ------------------------------ Bore log export ------------------------------

export interface BoreLogRow {
  depthFrom: number;
  depthTo: number;
  soilType: SoilType;
  gamma: number;
  cohesion: number;
  phi: number;
  moisture?: number;
  SPT_N?: number;
  remarks?: string;
}

// Build bore log rows (normalize layers; fill missing with conservative defaults)
export function buildBoreLog(layers: SoilLayer[]): BoreLogRow[] {
  const rows: BoreLogRow[] = [];
  layers.forEach((L) => {
    const gamma = L.gamma ?? ({
      clay: 18, "silty clay": 18, silt: 18.5, "sandy silt": 19, sand: 19.5, "silty sand": 19.2,
      gravel: 20, peat: 12, fill: 17, "weathered rock": 21, rock: 23
    } as Record<SoilType, number>)[L.soilType];

    const phi = L.phi ?? ({
      clay: 18, "silty clay": 20, silt: 28, "sandy silt": 30, sand: 33, "silty sand": 31,
      gravel: 38, peat: 10, fill: 25, "weathered rock": 35, rock: 40
    } as Record<SoilType, number>)[L.soilType];

    const cohesion = L.cohesion ?? ({
      clay: 25, "silty clay": 15, silt: 5, "sandy silt": 3, sand: 0, "silty sand": 0,
      gravel: 0, peat: 0, fill: 5, "weathered rock": 0, rock: 0
    } as Record<SoilType, number>)[L.soilType];

    rows.push({
      depthFrom: L.fromDepth,
      depthTo: L.toDepth,
      soilType: L.soilType,
      gamma,
      cohesion,
      phi,
      moisture: L.moisture,
      SPT_N: L.SPT_N,
      remarks: L.description,
    });
  });
  return rows;
}

// --------------------------- Remediation suggestions -------------------------

export interface RemediationPlan {
  targetQsafe: number;   // desired SBC (kPa)
  estimatedGain: number; // kPa
  methods: string[];
  notes: string[];
}

export function proposeRemediation(
  soilType: SoilType,
  currentQsafe: number,
  targetQsafe: number
): RemediationPlan | null {
  if (currentQsafe >= targetQsafe) return null;

  const delta = targetQsafe - currentQsafe;
  const methods: string[] = [];
  const notes: string[] = [];

  // Typical effectiveness bands (very rough)
  if (soilType.includes("clay")) {
    methods.push("Lime stabilization (+20–40%)");
    methods.push("Under-reamed piles (IS 2911)");
    methods.push("Preloading with vertical drains");
  } else if (soilType.includes("sand") || soilType === "gravel") {
    methods.push("Dynamic compaction / vibroflotation (+15–30%)");
    methods.push("Stone columns (+20–35%)");
  } else if (soilType.includes("silt")) {
    methods.push("Cement stabilization (+15–30%)");
    methods.push("Geogrid-reinforced mattress with granular blanket");
  } else if (soilType === "peat") {
    methods.push("Full replacement / floating raft");
    methods.push("Piles to firm stratum");
  } else {
    methods.push("Engineer review and site-specific ground improvement");
  }

  notes.push("Post-treatment plate load test / CPT to verify achieved SBC.");
  notes.push("Adjust foundation option once verified (raft → isolated/piles).");

  return {
    targetQsafe,
    estimatedGain: round(delta, 1),
    methods,
    notes,
  };
}

// ---------------------- Foundation type & floor capacity ---------------------

export function foundationFromQsafe(
  qsafe: number,
  soilType: SoilType,
  layers: SoilLayer[] | undefined
): string {
  // Thresholds (kPa) – conservative bands
  if (soilType.includes("clay")) {
    // expansive clay hint
    const hasExpansive = layers?.some((L) => (L.plasticityIndex || 0) >= 20) ?? false;
    if (hasExpansive && qsafe < 200) return "Under-reamed Piles (IS 2911)";
  }

  if (qsafe >= 250) return "Isolated/Strip Footing (IS 8009)";
  if (qsafe >= 150) return "Raft/Mat Foundation (IS 8009)";
  if (qsafe >= 80)  return "Pile Foundation (IS 2911)";
  return "Deep Pile / Caisson Foundation (IS 2911)";
}

export function getMaxFloors(soilData: SoilData, qsafeOverride?: number): number {
  // Per-floor design pressure (kN/m²) – indicative
  const type = soilData.buildingType || "residential";
  let loadPerFloor = 10; // baseline (residential)
  if (type === "commercial") loadPerFloor = 12;
  if (type === "industrial") loadPerFloor = 15;
  if (type === "skyscraper") loadPerFloor = 18;

  const siteArea_m2 = (soilData.squareFeet || 1000) * 0.092903;
  const qsafe = qsafeOverride ?? 150; // if not computed yet

  // allowable floors = qsafe / loadPerFloor (area cancels out in uniform load model)
  let floors = Math.floor(qsafe / loadPerFloor);

  // small penalties for moisture/pH extremes
  if ((soilData.moisture || 0) > 45) floors -= 1;
  if (soilData.pH < 5.5 || soilData.pH > 9) floors -= 1;

  return Math.max(1, floors);
}

export function getFoundationType(soilData: SoilData): string {
  // Compute quick qsafe at Df=1.5m, B=1.0m using either layer or inferred soil.
  const layers: SoilLayer[] =
    (soilData as any).layers && Array.isArray((soilData as any).layers)
      ? (soilData as any).layers
      : synthesizeLayersFromComposition(soilData);

  const z = 1.5;
  const L = layerAtDepth(layers, z) || layers[0];
  const gamma = L?.gamma ?? densityToGamma(soilData.density);
  const c = L?.cohesion ?? (inferSoilFromComposition(soilData.sandContent, soilData.siltContent, soilData.clayContent)?.includes("clay") ? 20 : 0);
  const phi = L?.phi ?? (L?.soilType?.includes("sand") ? 33 : 28);

  const qsafe = calculateSafeBearingCapacity(c, phi, gamma, 1.5, 1.0);
  return foundationFromQsafe(qsafe, L?.soilType || "silt", layers);
}

// ---------------------------- All-in-one evaluator ---------------------------

export function evaluateDesignBundle(
  sd: SoilData,
  env?: EnvironmentInputs
): DesignBundle {
  // 1) Layers
  const layers: SoilLayer[] =
    (sd as any).layers && Array.isArray((sd as any).layers)
      ? (sd as any).layers
      : synthesizeLayersFromComposition(sd);

  // 2) Governing depth (typical shallow footing Df)
  const Df = 1.5;
  const B = 1.0;
  const L = layerAtDepth(layers, Df) || layers[0];

  // 3) Material props
  const gamma = L?.gamma ?? densityToGamma(sd.density);
  const phi = L?.phi ?? (L?.soilType?.includes("sand") ? 33 : 28);
  const c = L?.cohesion ?? (L?.soilType?.includes("clay") ? 20 : 0);

  // 4) Core soil metrics
  const e = calculateVoidRatio(sd.density, sd.moisture);
  const cbr = estimateCBR(sd.density, sd.moisture, L?.soilType);

  // 5) Bearing capacity
  const qsafe = calculateSafeBearingCapacity(c, phi, gamma, Df, B);

  // 6) Foundation & floors
  const foundation = foundationFromQsafe(qsafe, L?.soilType || "silt", layers);
  const maxFloors = getMaxFloors(sd, qsafe);

  // 7) Exposure, concrete & steel
  const exposure = computeExposure(env);
  const concrete = recommendConcrete(exposure, env);
  const steel = recommendSteelSystem(sd, env);
  const superstructure = suggestSuperstructure(sd);

  // 8) Bore log export
  const boreLog = buildBoreLog(layers);

  // 9) Remediation (if demanded by planned floors)
  const planned = sd.plannedFloors || 1;
  const type = sd.buildingType || "residential";
  let targetPerFloor = 10;
  if (type === "commercial") targetPerFloor = 12;
  if (type === "industrial") targetPerFloor = 15;
  if (type === "skyscraper") targetPerFloor = 18;
  const targetQsafe = planned * targetPerFloor;
  const remediation = proposeRemediation(L?.soilType || "silt", qsafe, targetQsafe);

  const notes: string[] = [];
  if (sd.pH < 5.5) notes.push("Acidic soil: protect concrete (PPC/PSC/SRC) & rebars; consider pH correction/backfill.");
  if ((sd.moisture || 0) > 50) notes.push("High moisture: provide sub-soil drainage & dewatering during foundation works.");
  if ((sd.temperature || 0) > 35) notes.push("Hot weather concreting precautions per IS 7861.");

  return {
    qsafe,
    governingLayer: L,
    governingAtDepth: Df,
    voidRatio: e,
    cbr,
    inferredSoilType: inferSoilFromComposition(sd.sandContent, sd.siltContent, sd.clayContent),
    foundationType: foundation,
    maxFloors,
    exposure,
    concrete,
    steel,
    superstructure,
    remediation,
    boreLog,
    notes,
  };
}

// ---------------------- Suitability (kept for your UI) -----------------------

export function getSoilSuitability(soilData: SoilData): SoilSuitability {
  // We’ll use improved building score based on SBC & serviceability proxies,
  // and keep an agriculture score (your UI may choose to ignore printing it).
  const bundle = evaluateDesignBundle(soilData);

  const buildingScore = clamp((bundle.qsafe / 300) * 100, 0, 100);
  // A simple agricultural proxy (kept for compatibility)
  const agri = clamp((soilData.organicMatter || 2) * 12 + (100 - Math.abs((soilData.pH || 7) - 7) * 12), 0, 100);

  return {
    building: {
      score: round(buildingScore, 1),
      recommendation:
        buildingScore >= 80
          ? "Excellent for building"
          : buildingScore >= 60
          ? "Suitable with checks"
          : "Needs soil improvement/deep foundation",
      limitingFactors: [
        ...(bundle.qsafe < 150 ? ["low SBC"] : []),
        ...(bundle.voidRatio > 0.8 ? ["high void ratio"] : []),
        ...((soilData.moisture || 0) > 50 ? ["high moisture"] : []),
      ],
      details: {
        pH: round(soilData.pH, 1),
        moisture: round(soilData.moisture, 1),
        // keep keys your UI previously expected:
        // we repurpose barringRatio->CBR-ish score; voidRatio stays
        barringRatio: clamp((bundle.cbr / 15) * 100, 0, 100), // scaled %
        voidRatio: clamp(100 - bundle.voidRatio * 100, 0, 100), // lower e → higher %
      } as any,
    },
    agriculture: {
      score: round(agri, 1),
      recommendation:
        agri >= 80 ? "Excellent for agriculture" : agri >= 60 ? "Good with amendments" : "Amendments required",
      limitingFactors: [
        ...((soilData.pH < 5.5 || soilData.pH > 8) ? ["pH"] : []),
        ...((soilData.moisture < 30 || soilData.moisture > 70) ? ["moisture"] : []),
        ...((soilData.organicMatter || 0) < 3 ? ["organic matter"] : []),
      ],
      details: {
        pH: round(soilData.pH, 1),
        moisture: round(soilData.moisture, 1),
        organicMatter: round(soilData.organicMatter || 0, 1),
        temperature: round(soilData.temperature, 1),
      },
    },
    // keep the field for compatibility (your UI can ignore)
    overallRecommendation: "building",
  };
}

// ------------------------ One-call summary (for Results/PDF) -----------------

export function computeFullDesignSummary(
  sd: SoilData,
  env?: EnvironmentInputs
): {
  bundle: DesignBundle;
  messages: string[]; // condensed bullet points
} {
  const bundle = evaluateDesignBundle(sd, env);

  const messages: string[] = [
    `Safe Bearing Capacity (Df=1.5m, B=1.0m): ${bundle.qsafe} kPa`,
    `Recommended foundation: ${bundle.foundationType}`,
    `Suggested maximum floors: ${bundle.maxFloors}`,
    `Exposure class: ${bundle.exposure}, Concrete grade: ${bundle.concrete.grade} (w/c ≤ ${bundle.concrete.maxWCRatio})`,
    `Steel: ${bundle.steel.system}, Lateral: ${bundle.steel.lateralSystem}`,
    `Slab system: ${bundle.superstructure.slabSystem}`,
  ];

  if (bundle.remediation) {
    messages.push(
      `Remediation advised to reach ${bundle.remediation.targetQsafe} kPa (gain ≈ ${bundle.remediation.estimatedGain} kPa): ${bundle.remediation.methods.join(
        "; "
      )}`
    );
  }

  return { bundle, messages };
}

// ----------------------------- Convenience exports ---------------------------

// Legacy-named helpers kept for compatibility in your pages
export const calculateVoidRatioCompat = calculateVoidRatio;
export const calculateCBRCompat = estimateCBR;

// (Optional) quick helpers your UI could show
export function foundationSummaryLine(sd: SoilData): string {
  const f = getFoundationType(sd);
  const floors = getMaxFloors(sd);
  return `${f} • ≤ ${floors} floors (preliminary)`;
}
