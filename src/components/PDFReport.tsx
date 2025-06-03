import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { SoilData, SoilSuitability } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1b5e20'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: '#2e7d32'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#1b5e20'
  },
  value: {
    width: '60%',
    fontSize: 12
  },
  recommendation: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f1f8e9',
    borderRadius: 5
  }
});

interface PDFReportProps {
  soilData: SoilData;
  suitability: SoilSuitability;
}

export const PDFReport: React.FC<PDFReportProps> = ({ soilData, suitability }) => (
  <PDFViewer style={{ width: '100%', height: '600px' }}>
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Soil Analysis Report</Text>
        
        <View style={styles.section}>
          <Text style={styles.title}>Soil Properties</Text>
          <View style={styles.row}>
            <Text style={styles.label}>pH Level:</Text>
            <Text style={styles.value}>{soilData.pH.toFixed(1)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Moisture Content:</Text>
            <Text style={styles.value}>{soilData.moisture}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Temperature:</Text>
            <Text style={styles.value}>{soilData.temperature}°C</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Clay Content:</Text>
            <Text style={styles.value}>{soilData.clayContent}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sand Content:</Text>
            <Text style={styles.value}>{soilData.sandContent}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Silt Content:</Text>
            <Text style={styles.value}>{soilData.siltContent}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Organic Matter:</Text>
            <Text style={styles.value}>{soilData.organicMatter}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Soil Density:</Text>
            <Text style={styles.value}>{soilData.density} g/cm³</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Barring Ratio:</Text>
            <Text style={styles.value}>{soilData.barringRatio.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Void Ratio:</Text>
            <Text style={styles.value}>{soilData.voidRatio.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Suitability Analysis</Text>
          
          <Text style={styles.title}>Building Suitability</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Score:</Text>
            <Text style={styles.value}>{suitability.building.score}/100</Text>
          </View>
          <View style={styles.recommendation}>
            <Text>{suitability.building.recommendation}</Text>
          </View>

          <Text style={styles.title}>Agricultural Suitability</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Score:</Text>
            <Text style={styles.value}>{suitability.agriculture.score}/100</Text>
          </View>
          <View style={styles.recommendation}>
            <Text>{suitability.agriculture.recommendation}</Text>
          </View>
        </View>
      </Page>
    </Document>
  </PDFViewer>
);