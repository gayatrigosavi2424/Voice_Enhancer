'use client';

import { 
  Volume2, 
  Filter, 
  Scissors, 
  BarChart3, 
  Zap, 
  Shield 
} from 'lucide-react';

const features = [
  {
    icon: Filter,
    title: 'Background Noise Removal',
    description: 'Advanced AI-powered noise reduction to eliminate unwanted background sounds'
  },
  {
    icon: Volume2,
    title: 'Voice Enhancement',
    description: 'Boost clarity and richness of your voice with professional EQ and compression'
  },
  {
    icon: Scissors,
    title: 'Smart Silence Removal',
    description: 'Automatically detect and remove long pauses while preserving natural speech rhythm'
  },
  {
    icon: BarChart3,
    title: 'Volume Normalization',
    description: 'Ensure consistent audio levels throughout your entire recording'
  },
  {
    icon: Zap,
    title: 'Real-time Processing',
    description: 'Fast, client-side processing with instant preview and adjustments'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All processing happens in your browser - your audio never leaves your device'
  }
];

export default function Features() {
  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Professional Features
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to create studio-quality recordings from anywhere
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}