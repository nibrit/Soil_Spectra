import React, { createContext, useContext, useState, ReactNode } from "react";
import { SoilData, SoilSuitability } from "../types";
import { getSoilSuitability } from "../utils/soilCalculations";

interface SoilContextType {
  soilData: SoilData;
  suitability: SoilSuitability | null;
  updateSoilData: (data: Partial<SoilData>) => void;
  calculateSuitability: () => SoilSuitability;
  resetData: () => void;
}

const defaultSoilData: SoilData = {
  name: "",
  pH: 7.0,
  moisture: 20,
  temperature: 25,
  clayContent: 25,
  sandContent: 45,
  siltContent: 30,
  organicMatter: 2.5,
  density: 1.7,
  voidRatio: 0,
  cohesion: 25,
  phi: 30,
  foundationDepth: 1.5,
  foundationWidth: 1.0,
  buildingType: "residential",
  plannedFloors: 2,
  squareFeet: 2000,
  boreLayers: [
    { fromDepth: 0.0, toDepth: 1.0, soil: "Fill",   gamma: 16.0, cohesion: 10, phi: 18, moisture: 25, sptN: 10, remarks: "-" },
    { fromDepth: 1.0, toDepth: 2.0, soil: "Clay",   gamma: 17.0, cohesion: 25, phi: 18, moisture: 30, sptN: 10, remarks: "Compressible" },
    { fromDepth: 2.0, toDepth: 3.0, soil: "Clay",   gamma: 18.0, cohesion: 45, phi: 22, moisture: 24, sptN: 10, remarks: "-" },
    { fromDepth: 3.0, toDepth: 4.0, soil: "Sand",   gamma: 19.0, cohesion: 0,  phi: 36, moisture: 18, sptN: 10, remarks: "Good for pile termination" }
  ]
};

const SoilContext = createContext<SoilContextType | undefined>(undefined);

export const SoilProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soilData, setSoilData] = useState<SoilData>(defaultSoilData);
  const [suitability, setSuitability] = useState<SoilSuitability | null>(null);

  const updateSoilData = (data: Partial<SoilData>) => {
    setSoilData(prev => ({ ...prev, ...data }));
  };

  const calculateSuitability = () => {
    const result = getSoilSuitability(soilData);
    setSuitability(result);
    return result;
  };

  const resetData = () => {
    setSoilData(defaultSoilData);
    setSuitability(null);
  };

  return (
    <SoilContext.Provider value={{ soilData, suitability, updateSoilData, calculateSuitability, resetData }}>
      {children}
    </SoilContext.Provider>
  );
};

export const useSoilContext = () => {
  const ctx = useContext(SoilContext);
  if (!ctx) throw new Error("useSoilContext must be used within SoilProvider");
  return ctx;
};
