import React from "react";

const ItineraryCard = ({ day }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-2xl rounded-2xl transition-all duration-300 hover:border-[#fcd34d]/30">
      <h3 className="font-serif text-xl text-[#fcd34d] mb-4 border-b border-white/5 pb-2">Day {day.dayNumber}</h3>

      <ul className="space-y-4">
        {day.items?.map((item, idx) => (
          <li key={idx} className="flex items-start justify-between group">
            <div className="flex items-start space-x-4">
              {item.thumbnail && item.type === "visit" && (
                <div className="relative overflow-hidden rounded-lg w-16 h-16 border border-white/10">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
              <div>
                <div className="mb-1 flex items-center flex-wrap gap-2">
                  <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full bg-white/10 text-slate-300 border border-white/5">
                    {item.type}
                  </span>
                  <span className="font-medium text-slate-200 group-hover:text-[#fcd34d] transition-colors">{item.name}</span>
                </div>
                {item.description && item.type === "visit" && (
                  <p className="text-xs text-slate-400 max-w-prose line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500 whitespace-nowrap ml-3 font-mono">
              {item.startTime} - {item.endTime} <span className="text-slate-600">({item.durationMin} min)</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-right text-xs text-slate-500 mt-4 pt-3 border-t border-white/5 font-mono">
        Total: <span className="text-[#fcd34d]">{day.totalMinutes}</span> min
      </div>
    </div>
  );
};

export default ItineraryCard;


