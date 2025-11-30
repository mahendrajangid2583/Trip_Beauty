import React, { useEffect, useRef } from 'react';
import { Check, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetroTimeline = ({ places, currentPlaceId }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to active element
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentPlaceId]);

  return (
    <div className="w-full flex justify-center pt-4 pb-2 pointer-events-none">
      <div 
        ref={scrollRef}
        className="
          pointer-events-auto
          max-w-[95%] sm:max-w-lg 
          bg-gray-900/90 backdrop-blur-xl 
          border border-white/10 
          shadow-2xl shadow-black/50
          rounded-full 
          flex items-center 
          overflow-x-auto 
          scrollbar-hide 
          px-2 py-2
          h-16
        "
      >
        <div className="flex items-center gap-2 min-w-max mx-auto px-2">
          {places.map((place, index) => {
            const isVisited = place.status === 'visited' || place.status === 'skipped';
            const isActive = place._id === currentPlaceId;
            const isLast = index === places.length - 1;

            return (
              <div key={place._id} className="flex items-center" data-active={isActive}>
                {/* Expandable Node */}
                <motion.div 
                  layout
                  className={`
                    relative flex items-center justify-center rounded-full transition-colors duration-300
                    ${isActive ? 'bg-blue-600 pr-4 pl-1 py-1 gap-2' : 'w-8 h-8'}
                    ${isVisited ? 'bg-gray-800' : ''}
                    ${!isActive && !isVisited ? 'bg-gray-800/50 border border-white/10' : ''}
                  `}
                >
                  {/* Icon */}
                  <motion.div layout className="flex items-center justify-center w-6 h-6">
                    {isVisited && <Check size={14} className="text-gray-400" />}
                    {isActive && <Navigation size={14} className="text-white fill-current" />}
                    {!isActive && !isVisited && <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                  </motion.div>

                  {/* Text (Only visible when active) */}
                  <AnimatePresence mode="popLayout">
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex flex-col overflow-hidden whitespace-nowrap"
                      >
                        <span className="text-[10px] text-blue-200 font-medium leading-none uppercase tracking-wider">Heading to</span>
                        <span className="text-sm text-white font-bold leading-none">{place.name.split(',')[0]}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={`
                    w-4 h-[2px] rounded-full mx-1 transition-colors duration-500
                    ${isVisited ? 'bg-blue-500/30' : 'bg-white/5'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetroTimeline;
