import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building, Wheat, Activity, ThermometerSun, Droplets, Waves } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-800 to-green-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-20 -left-20 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Analyze Your Soil for Optimal Land Usage
            </h1>
            <p className="text-xl mb-8 text-green-100">
              Determine if your land is suitable for construction or ideal for agriculture
              with our comprehensive soil analysis.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/analyze" 
                className="bg-white text-green-800 hover:bg-green-100 px-6 py-3 rounded-lg font-medium flex items-center transition-all transform hover:translate-y-[-2px] shadow-md"
              >
                Analyze Your Soil
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/education" 
                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-green-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Use Soil Spectra?</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Our advanced soil analysis helps you make informed decisions about your land usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="h-12 w-12 text-green-600" />}
              title="Accurate Analysis"
              description="Our algorithms provide precise soil characteristic analysis based on scientific standards."
            />
            <FeatureCard 
              icon={<Building className="h-12 w-12 text-blue-600" />}
              title="Building Suitability"
              description="Determine if your soil can safely support building foundations and construction."
            />
            <FeatureCard 
              icon={<Wheat className="h-12 w-12 text-amber-600" />}
              title="Agricultural Potential"
              description="Assess your soil's agricultural value and crop suitability based on its properties."
            />
          </div>
        </div>
      </section>

      {/* Parameters Section */}
      <section className="py-16 bg-stone-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Key Soil Parameters We Analyze</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              We examine multiple soil properties to provide comprehensive suitability analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ParameterCard 
              icon={<Waves className="h-10 w-10 text-indigo-500" />}
              title="pH Level"
              description="Soil acidity affects nutrient availability and structural stability."
              range="We analyze pH from 3.0 to 10.0"
            />
            <ParameterCard 
              icon={<Droplets className="h-10 w-10 text-blue-500" />}
              title="Moisture Content"
              description="Optimal moisture levels are crucial for both construction and agriculture."
              range="Measured as percentage from 0% to 100%"
            />
            <ParameterCard 
              icon={<ThermometerSun className="h-10 w-10 text-orange-500" />}
              title="Temperature & Composition"
              description="Soil temperature and composition affect stability and growing conditions."
              range="Analyzed across multiple parameters"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Analyze Your Soil?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-green-100">
            Get started with our comprehensive soil analysis and make informed decisions about your land usage.
          </p>
          <Link 
            to="/analyze" 
            className="inline-block bg-white text-green-700 hover:bg-green-100 px-8 py-4 rounded-lg font-medium text-lg transition-all transform hover:translate-y-[-2px] shadow-lg"
          >
            Start Your Analysis
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg transition-transform hover:transform hover:scale-105">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface ParameterCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  range: string;
}

const ParameterCard: React.FC<ParameterCardProps> = ({ icon, title, description, range }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-600">
    <div className="flex items-center mb-4">
      <div className="mr-4 p-2 bg-stone-100 rounded-lg">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 mb-3">{description}</p>
    <p className="text-sm text-gray-500 italic">{range}</p>
  </div>
);