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

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, backgroundColor: "#fff" },
  header: { fontSize: 16, textAlign: "center", marginBottom: 10 },
  section: { marginBottom: 12 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1 },
  row: { flexDirection: "row" },
  cellHeader: {
    width: "14%",
    padding: 4,
    backgroundColor: "#f0f0f0",
    fontSize: 9,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  cell: {
    width: "14%",
    padding: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  footer: { marginTop: 15, fontSize: 9 },
});

interface PDFReportProps {
  soilData: SoilData;
  suitability: SoilSuitability;
}

export const PDFReport: React.FC<PDFReportProps> = ({
  soilData,
  suitability,
}) => (
  <PDFViewer style={{ width: "100%", height: "600px" }}>
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.header}>BORE LOG REPORT</Text>

        {/* Project Details */}
        <View style={styles.section}>
          <Text>Project: Soil Investigation</Text>
          <Text>Building Type: {soilData.buildingType}</Text>
          <Text>Planned Floors: {soilData.plannedFloors}</Text>
          <Text>Site Area: {soilData.squareFeet} ft²</Text>
        </View>

        {/* Bore Log Table */}
        <View style={styles.section}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Depth (m)</Text>
              <Text style={styles.cellHeader}>Soil Type</Text>
              <Text style={styles.cellHeader}>Moisture %</Text>
              <Text style={styles.cellHeader}>Density g/cc</Text>
              <Text style={styles.cellHeader}>Void Ratio</Text>
              <Text style={styles.cellHeader}>CBR %</Text>
              <Text style={styles.cellHeader}>SBC (kN/m²)</Text>
            </View>

            {/* Example – 3 layers (replace with soilData.layers later) */}
            {[0, 1.5, 3].map((depth, i) => (
              <View style={styles.row} key={i}>
                <Text style={styles.cell}>
                  {depth} – {depth + 1.5}
                </Text>
                <Text style={styles.cell}>
                  {i === 0
                    ? "Clayey Sand"
                    : i === 1
                    ? "Silty Clay"
                    : "Dense Sand"}
                </Text>
                <Text style={styles.cell}>{soilData.moisture}%</Text>
                <Text style={styles.cell}>{soilData.density}</Text>
                <Text style={styles.cell}>
                  {suitability.building.details.voidRatio}
                </Text>
                <Text style={styles.cell}>
                  {suitability.building.details.CBR}
                </Text>
                <Text style={styles.cell}>
                  {suitability.building.details.qsafe}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text>Recommended Foundation: {suitability.foundationType}</Text>
          <Text>Suggested Max Floors: {suitability.maxFloors}</Text>
        </View>

        {/* Remedial Measures */}
        {suitability.remedialMeasures &&
          suitability.remedialMeasures.length > 0 && (
            <View style={styles.section}>
              <Text>Remedial Measures:</Text>
              {suitability.remedialMeasures.map((m, i) => (
                <Text key={i}>- {m}</Text>
              ))}
            </View>
          )}

        {/* Footer */}
        <Text style={styles.footer}>
          Report generated as per IS 2720 & IS 6403 (Bearing Capacity), IS 2911
          (Pile Foundation).
        </Text>
      </Page>
    </Document>
  </PDFViewer>
);
