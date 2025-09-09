import React, { createContext, useContext, useState, ReactNode } from "react";
import { SoilData, SoilSuitability, BoreLayer } from "../types";
import { getSoilSuitability } from "../utils/soilCalculations";

interface SoilContextType {
  soilData: SoilData;
  suitability: SoilSuitability | null;
  updateSoilData: (data: Partial<SoilData>) => void;
  addLayer: (layer: BoreLayer) => void;
  updateLayer: (index: number, layer: Partial<BoreLayer>) => void;
  deleteLayer: (index: number) => void;
  calculateSuitability: () => SoilSuitability;
  resetData: () => void;
}

const defaultSoilData: SoilData = {
  name: "",
  pH: 7.0,
  moisture: 30,
  temperature: 20,
  clayContent: 30,
  sandContent: 40,
  siltContent: 30,
  organicMatter: 5,
  density: 1.5,
  voidRatio: 0,
  buildingType: "residential",
  plannedFloors: 1,
  squareFeet: 1000,
  layers: [], // 🔹 NEW bore log array
};

const SoilContext = createContext<SoilContextType | undefined>(undefined);

export const SoilProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soilData, setSoilData] = useState<SoilData>(defaultSoilData);
  const [suitability, setSuitability] = useState<SoilSuitability | null>(null);

  const updateSoilData = (data: Partial<SoilData>) => {
    setSoilData((prev) => ({ ...prev, ...data }));
  };

  const addLayer = (layer: BoreLayer) => {
    setSoilData((prev) => ({
      ...prev,
      layers: [...(prev.layers || []), layer],
    }));
  };

  const updateLayer = (index: number, layer: Partial<BoreLayer>) => {
    setSoilData((prev) => {
      const newLayers = [...(prev.layers || [])];
      newLayers[index] = { ...newLayers[index], ...layer };
      return { ...prev, layers: newLayers };
    });
  };

  const deleteLayer = (index: number) => {
    setSoilData((prev) => {
      const newLayers = [...(prev.layers || [])];
      newLayers.splice(index, 1);
      return { ...prev, layers: newLayers };
    });
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
    <SoilContext.Provider
      value={{
        soilData,
        suitability,
        updateSoilData,
        addLayer,
        updateLayer,
        deleteLayer,
        calculateSuitability,
        resetData,
      }}
    >
      {children}
    </SoilContext.Provider>
  );
};

export const useSoilContext = () => {
  const context = useContext(SoilContext);
  if (!context)
    throw new Error("useSoilContext must be used within SoilProvider");
  return context;
};
