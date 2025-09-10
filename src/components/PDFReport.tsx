// src/components/PDFReport.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { SoilData, SoilSuitability } from "../types";
import { getFoundationType, getMaxFloors } from "../utils/soilCalculations";

// ---- Local helpers ---------------------------------------------------------
type Layer = {
  fromDepth?: number;
  toDepth?: number;
  soilType?: string;
  gamma?: number; // kN/m³ (unit weight) – if you store density in g/cm³, don’t set this
  cohesion?: number; // kPa
  phi?: number; // °
  moisture?: number; // %
  sptN?: number;
  remarks?: string;
};

const fmt = (v: any, dashes = "—") =>
  v === null || v === undefined || Number.isNaN(v) ? dashes : String(v);

// If your model stores only density (g/cm³), convert to unit weight (kN/m³).
const densityToGamma = (densityGc: number | undefined) =>
  typeof densityGc === "number" ? densityGc * 9.81 : undefined;

// ---- Styles ---------------------------------------------------------------
const styles = StyleSheet.create({
  viewer: { width: "100%", height: "100%" },
  page: {
    padding: 28,
    backgroundColor: "#ffffff",
    fontSize: 10,
    lineHeight: 1.35,
  },
  header: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
    color: "#1b5e20",
  },
  section: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 6,
    color: "#2e7d32",
    fontWeight: 700 as any,
  },
  kvRow: { flexDirection: "row", marginBottom: 2 },
  kvLabel: { width: "42%", color: "#1b5e20" },
  kvValue: { width: "58%" },

  // Table
  table: {
    width: "100%",
    borderWidth: 0.8,
    borderColor: "#c8e6c9",
    borderRadius: 4,
  },
  tr: {
    flexDirection: "row",
  },
  th: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 9,
    backgroundColor: "#e8f5e9",
    borderRightWidth: 0.6,
    borderRightColor: "#c8e6c9",
    borderBottomWidth: 0.8,
    borderBottomColor: "#c8e6c9",
    fontWeight: 700 as any,
  },
  td: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 0.6,
    borderRightColor: "#e0e0e0",
    borderBottomWidth: 0.6,
    borderBottomColor: "#e0e0e0",
    fontSize: 9.5,
  },

  greenNote: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f1f8e9",
  },
});

// ---- Props ----------------------------------------------------------------
interface PDFReportProps {
  soilData: SoilData;
  suitability: SoilSuitability;
}

// ---- Component ------------------------------------------------------------
export const PDFReport: React.FC<PDFReportProps> = ({ soilData, suitability }) => {
  // Layers can live under soilData.layers or soilData.soilLayers depending on your types.
  const layers: Layer[] =
    // @ts-ignore
    soilData?.layers ||
    // @ts-ignore
    soilData?.soilLayers ||
    [];

  const plannedFloors = soilData?.plannedFloors ?? soilData?.floors ?? undefined;
  const foundation = getFoundationType(soilData);
  const maxFloors = getMaxFloors(soilData);

  // Compute void ratio if not given
  const voidRatio =
    typeof soilData.voidRatio === "number"
      ? soilData.voidRatio
      : undefined;

  const gamma_kNm3 =
    typeof (soilData as any).gamma === "number"
      ? (soilData as any).gamma
      : densityToGamma(soilData?.density);

  // Optional: show CBR if you added it in suitability.details
  const cbr =
    // @ts-ignore
    suitability?.building?.details?.CBR ?? undefined;

  // Optional: qsafe if you added it to building.details
  const qsafe =
    // @ts-ignore
    suitability?.building?.details?.qsafe ??
    undefined;

  // Simple remedial notes block (non-judgmental wording)
  const remedials: string[] = [];
  if (soilData.moisture > 35) remedials.push("Provide drainage & dewatering to control high moisture.");
  if (soilData.pH < 5.5) remedials.push("Raise pH with lime; use sulfate-resistant cement where required.");
  if (soilData.pH > 8.5) remedials.push("Use low-alkali cement; consider pozzolans to mitigate ASR risk.");
  if ((soilData.clayContent ?? 0) > 35)
    remedials.push("Expansive clay: adopt moisture control, chemical stabilisation or deep foundations.");
  if (typeof qsafe === "number" && qsafe < 100)
    remedials.push("Adopt raft/piles or ground improvement to meet bearing requirements.");

  return (
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>Soil Investigation & Analysis Report</Text>

          {/* Project details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Building Type:</Text>
              <Text style={styles.kvValue}>{fmt(soilData?.buildingType, "-")}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Planned Floors:</Text>
              <Text style={styles.kvValue}>{fmt(plannedFloors, "-")}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Site Area (sqft):</Text>
              <Text style={styles.kvValue}>{fmt(soilData?.squareFeet, "-")}</Text>
            </View>
          </View>

          {/* Soil parameters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Soil Parameters</Text>

            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>pH:</Text>
              <Text style={styles.kvValue}>{fmt(soilData.pH)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Moisture Content:</Text>
              <Text style={styles.kvValue}>{fmt(soilData.moisture)}%</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Temperature:</Text>
              <Text style={styles.kvValue}>{fmt(soilData.temperature)}°C</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Density:</Text>
              <Text style={styles.kvValue}>
                {fmt(soilData.density)} g/cm³
              </Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Clay / Sand / Silt:</Text>
              <Text style={styles.kvValue}>
                {fmt(soilData.clayContent)}% / {fmt(soilData.sandContent)}% / {fmt(soilData.siltContent)}%
              </Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Organic Matter:</Text>
              <Text style={styles.kvValue}>{fmt(soilData.organicMatter)}%</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Void Ratio (IS 2720):</Text>
              <Text style={styles.kvValue}>{fmt(voidRatio)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>CBR (IS 2720 Pt-16):</Text>
              <Text style={styles.kvValue}>{fmt(cbr)}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Safe Bearing Capacity q<sub>safe</sub>:</Text>
              <Text style={styles.kvValue}>
                {typeof qsafe === "number" ? `${qsafe} kN/m²` : "—"}
              </Text>
            </View>
          </View>

          {/* Bore log */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bore Log (Depth-wise Stratification)</Text>

            <View style={styles.table}>
              {/* Header row */}
              <View style={styles.tr}>
                <Text style={[styles.th, { width: "9%" }]}>From (m)</Text>
                <Text style={[styles.th, { width: "9%" }]}>To (m)</Text>
                <Text style={[styles.th, { width: "20%" }]}>Soil / Description</Text>
                {/* γ (kN/m³) and ϕ (°) via Unicode to avoid parser issues */}
                <Text style={[styles.th, { width: "12%" }]}>{'\u03B3'} (kN/m\u00B3)</Text>
                <Text style={[styles.th, { width: "12%" }]}>c (kPa)</Text>
                <Text style={[styles.th, { width: "10%" }]}>{'\u03C6'} (°)</Text>
                <Text style={[styles.th, { width: "10%" }]}>Moist. (%)</Text>
                <Text style={[styles.th, { width: "8%" }]}>SPT N</Text>
                <Text style={[styles.th, { width: "10%" }]}>Remarks</Text>
              </View>

              {/* Data rows */}
              {(layers || []).map((L, i) => {
                // Prefer layer.gamma (kN/m³); fallback to global density
                const gamma = typeof L.gamma === "number" ? L.gamma : gamma_kNm3;
                return (
                  <View style={styles.tr} key={i}>
                    <Text style={[styles.td, { width: "9%" }]}>
                      {typeof L.fromDepth === "number" ? L.fromDepth.toFixed(2) : "—"}
                    </Text>
                    <Text style={[styles.td, { width: "9%" }]}>
                      {typeof L.toDepth === "number" ? L.toDepth.toFixed(2) : "—"}
                    </Text>
                    <Text style={[styles.td, { width: "20%" }]}>{fmt(L.soilType, "-")}</Text>
                    <Text style={[styles.td, { width: "12%" }]}>
                      {typeof gamma === "number" ? gamma.toFixed(1) : "—"}
                    </Text>
                    <Text style={[styles.td, { width: "12%" }]}>
                      {fmt(L.cohesion, "—")}
                    </Text>
                    <Text style={[styles.td, { width: "10%" }]}>{fmt(L.phi, "—")}</Text>
                    <Text style={[styles.td, { width: "10%" }]}>{fmt(L.moisture, "—")}</Text>
                    <Text style={[styles.td, { width: "8%" }]}>{fmt(L.sptN, "—")}</Text>
                    <Text style={[styles.td, { width: "10%" }]}>{fmt(L.remarks, "—")}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Structural recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Structural Recommendations</Text>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Recommended Foundation:</Text>
              <Text style={styles.kvValue}>{foundation}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>Suggested Max Floors:</Text>
              <Text style={styles.kvValue}>{maxFloors}</Text>
            </View>
          </View>

          {/* Remedial measures */}
          {remedials.length > 0 && (
            <View style={styles.greenNote}>
              <Text style={{ fontSize: 11, marginBottom: 4, color: "#2e7d32" }}>
                Remedial Measures
              </Text>
              <Text>
                {remedials.map((r, i) => (i ? " • " + r : r))}
              </Text>
            </View>
          )}
        </Page>
      </Document>
    </PDFViewer>
  );
};
