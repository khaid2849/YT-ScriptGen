import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Accurate Transcription',
      description: 'AI-powered speech recognition for precise video-to-text conversion'
    },
    {
      icon: '⏱️',
      title: 'Timestamp Generation',
      description: 'Automatic timestamps for easy navigation and reference'
    },
    {
      icon: '📄',
      title: 'Multiple Formats',
      description: 'Export your transcripts as TXT or JSON files'
    },
    {
      icon: '⚡',
      title: 'Fast Processing',
      description: 'Quick turnaround time for all video lengths'
    },
    {
      icon: '🌐',
      title: 'YouTube Support',
      description: 'Works with any public YouTube video URL'
    },
    {
      icon: '💰',
      title: '100% Free',
      description: 'No hidden costs, no subscriptions, completely free to use'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Paste YouTube URL',
      description: 'Copy and paste any YouTube video URL into our tool'
    },
    {
      number: '2',
      title: 'Process Video',
      description: 'Our AI extracts audio and transcribes it automatically'
    },
    {
      number: '3',
      title: 'Download Script',
      description: 'Get your formatted transcript with timestamps'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            YouTube Script Generator
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Convert any YouTube video into a perfectly formatted transcript with timestamps. 
            Free, fast, and powered by advanced AI.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl"
          >
            Start Generating Scripts
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Our Script Generator?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Generate Your First Script?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of content creators, students, and researchers who use our tool daily.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg"
          >
            Generate Script Now - It's Free!
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;