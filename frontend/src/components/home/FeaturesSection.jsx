import React from "react";
import { MapPin, Calendar, Utensils, Map, Share2 } from "lucide-react";

const features = [
  {
    icon: <MapPin className="w-10 h-10 text-blue-500" />,
    title: "Attraction Discovery",
    desc: "Explore top-rated attractions with images, descriptions, and average visiting times.",
  },
  {
    icon: <Calendar className="w-10 h-10 text-blue-500" />,
    title: "Optimized Itineraries",
    desc: "Generate day-wise plans with shortest travel paths, maximizing sightseeing.",
  },
  {
    icon: <Utensils className="w-10 h-10 text-blue-500" />,
    title: "Food Culture Integration",
    desc: "Discover famous local dishes and nearby restaurants for an authentic taste.",
  },
  {
    icon: <Map className="w-10 h-10 text-blue-500" />,
    title: "Interactive Map Visualization",
    desc: "Visualize routes, attractions, and food stops clearly with Google Maps.",
  },
  {
    icon: <Share2 className="w-10 h-10 text-blue-500" />,
    title: "Save & Share",
    desc: "Save your personalized itineraries and share them with friends.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Key Features of <span className="text-blue-600">Quester</span>
        </h2>
        <p className="text-gray-600 mb-12 text-lg">
          Everything you need to plan, organize, and share your perfect trip.
        </p>

        <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-start text-left border border-blue-100"
            >
              <div className="p-3 bg-blue-100 rounded-xl mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md">
            Start Planning
          </button>
        </div>
      </div>
    </section>
  );
}
