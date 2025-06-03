import React, { createContext, useContext, useState, ReactNode } from 'react';
import { calculateBarringRatio, calculateVoidRatio, getSoilSuitability } from '../utils/soilCalculations';
import { SoilData, SoilSuitability } from '../types';

interface SoilContextType {
  soilData: SoilData;
  suitability: SoilSuitability | null;
  updateSoilData: (data: Partial<SoilData>) => void;
  calculateSuitability: () => SoilSuitability;
  resetData: () => void;
  savedAnalyses: SoilData[];
  saveCurrentAnalysis: (name: string) => void;
  loadSavedAnalysis: (index: number) => void;
  deleteSavedAnalysis: (index: number) => void;
}

const defaultSoilData: SoilData = {
  name: '',
  pH: 7.0,
  moisture: 30,
  temperature: 20,
  clayContent: 30,
  sandContent: 40,
  siltContent: 30,
  organicMatter: 5,
  density: 1.5,
  barringRatio: 0,
  voidRatio: 0,
};

const SoilContext = createContext<SoilContextType | undefined>(undefined);

export const SoilProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soilData, setSoilData] = useState<SoilData>(defaultSoilData);
  const [suitability, setSuitability] = useState<SoilSuitability | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SoilData[]>([]);

  const updateSoilData = (data: Partial<SoilData>) => {
    setSoilData(prev => {
      const newData = { ...prev, ...data };
      // Recalculate derived values
      if ('clayContent' in data || 'sandContent' in data || 'siltContent' in data || 'density' in data) {
        newData.barringRatio = calculateBarringRatio(
          newData.clayContent, 
          newData.sandContent, 
          newData.siltContent,
          newData.density
        );
        newData.voidRatio = calculateVoidRatio(newData.clayContent, newData.density);
      }
      return newData;
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

  const saveCurrentAnalysis = (name: string) => {
    const analysisToSave = {
      ...soilData,
      name: name || `Analysis ${savedAnalyses.length + 1}`
    };
    setSavedAnalyses([...savedAnalyses, analysisToSave]);
  };

  const loadSavedAnalysis = (index: number) => {
    if (index >= 0 && index < savedAnalyses.length) {
      setSoilData(savedAnalyses[index]);
      setSuitability(null);
    }
  };

  const deleteSavedAnalysis = (index: number) => {
    if (index >= 0 && index < savedAnalyses.length) {
      const updatedAnalyses = [...savedAnalyses];
      updatedAnalyses.splice(index, 1);
      setSavedAnalyses(updatedAnalyses);
    }
  };

  return (
    <SoilContext.Provider value={{
      soilData,
      suitability,
      updateSoilData,
      calculateSuitability,
      resetData,
      savedAnalyses,
      saveCurrentAnalysis,
      loadSavedAnalysis,
      deleteSavedAnalysis
    }}>
      {children}
    </SoilContext.Provider>
  );
};

export const useSoilContext = () => {
  const context = useContext(SoilContext);
  if (context === undefined) {
    throw new Error('useSoilContext must be used within a SoilProvider');
  }
  return context;
};