import React, { useState } from 'react';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon?: string; // Optional icon class or emoji
}

const liveFeatures: Feature[] = [
  {
    id: 1,
    title: "Doubt Assistant",
    description: "Students ask doubts on WhatsApp; the teacher’s AI twin answers instantly in their teaching style.",
    icon: "fi-brands-whatsapp"
  },
  {
    id: 2,
    title: "Quiz Assistant",
    description: "Upload notes → AI generates MCQs, numericals, exercises and explanations in seconds.",
    icon: "fi-rr-puzzle-piece"
  },
  {
    id: 3,
    title: "Insights Assistant",
    description: "Doubts on Ray Optics increased 32% this week.” “15 students haven’t asked anything in 7 days.",
    icon: "fi-rr-briefcase"
  },
  {
    id: 4,
    title: "Notes Assistant",
    description: "“Generate 5 quick evaluation questions on ‘Organic Chemistry – Alcohols’.” Done instantly.",
    icon: "fi-rr-notebook"
  },
  {
    id: 5,
    title: "Style Assistant",
    description: "Let teachers choose tone: friendly, strict, exam-focused, coaching-style, CBSE-formal, Hinglish, etc.",
    icon: "fi-rr-palette"
  }
];

const comingSoonFeatures: Feature[] = [
  {
    id: 6,
    title: "Lesson Assistant",
    description: "Long videos or PDFs → concise teacher-style notes, key points, formulas, and examples.",
    icon: "fi-rr-presentation"
  },
  {
    id: 7,
    title: "Lecture Assistant",
    description: "Analyze lecture and give feedback for improvement.",
    icon: "fi-rr-presentation"
  },
  {
    id: 9,
    title: "Regional Language Converter",
    description: "Automatically translate lessons into Hindi, Tamil, Bengali, Marathi, Telugu — or bilingual versions."
  },
  {
    id: 11,
    title: "Voice-to-Lesson Converter",
    description: "Teacher speaks for 3–5 minutes → AI generates structured notes, objectives, examples."
  },
  {
    id: 14,
    title: "Digital Classroom / Mini-Website",
    description: "Public profile + AI chat link + top notes + student testimonials."
  }
];

export const FeaturesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'coming-soon'>('live');

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 relative z-1">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Powerful Features for Modern Teaching
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to supercharge your classroom with AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-gray-200 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'live'
              ? 'bg-green2 text-white shadow-md'
              : 'text-gray-600 hover:text-green2 hover:bg-white/50'
              }`}
          >
            Live Now 🚀
          </button>
          <button
            onClick={() => setActiveTab('coming-soon')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'coming-soon'
              ? 'bg-green2 text-white shadow-md'
              : 'text-gray-600 hover:text-green2 hover:bg-white/50'
              }`}
          >
            Coming Soon 🔮
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'live' ? liveFeatures : comingSoonFeatures).map((feature) => (
          <div
            key={feature.id}
            className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${activeTab === 'live' ? 'bg-green/10 text-green' : 'bg-violet/10 text-violet'
                }`}>
                {feature.icon ? (
                  <i className={`fi ${feature.icon}`}></i>
                ) : (
                  <span className="text-xl">✨</span>
                )}
              </div>
              {activeTab === 'coming-soon' && (
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                  Soon
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
