import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from './components/Analytics';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SoilAnalysisPage } from './pages/SoilAnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { EducationPage } from './pages/EducationPage';
import { SoilProvider } from './context/SoilContext';

function App() {
  return (
    <Router>
      <SoilProvider>
        <div className="flex flex-col min-h-screen bg-stone-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analyze" element={<SoilAnalysisPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/education" element={<EducationPage />} />
            </Routes>
          </main>
          <Footer />
          <Analytics />
        </div>
      </SoilProvider>
    </Router>
  );
}

export default App;