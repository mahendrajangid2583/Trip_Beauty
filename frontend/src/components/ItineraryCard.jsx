import React from "react";
import { MapPin, Clock, Utensils, Car, CheckCircle, Circle } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateItineraryItemStatus } from "../store/tripSlice";

const ItineraryCard = ({ day, tripId }) => {
  const dispatch = useDispatch();

  const handleStatusToggle = (itemId, currentStatus) => {
    if (!tripId) return; // Can't update if no tripId (e.g. preview mode)
    const newStatus = currentStatus === 'visited' ? 'pending' : 'visited';
    dispatch(updateItineraryItemStatus({ tripId, itemId, status: newStatus }));
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-2xl rounded-2xl">
      <h3 className="font-serif text-2xl text-[#fcd34d] mb-8 border-b border-white/5 pb-4 flex items-center justify-between">
        <span>Day {day.dayNumber}</span>
        <span className="text-sm font-sans text-slate-500 font-normal">
          {day.totalMinutes} min total
        </span>
      </h3>

      <div className="relative space-y-0">
        {day.items?.map((item, idx) => {
          const isLast = idx === day.items.length - 1;
          const isVisited = item.status === 'visited';

          // Render Travel Connector (if strictly a travel item)
          if (item.type === "travel") {
            return (
              <div key={idx} className="relative pl-4 md:pl-24 py-2">
                {/* Vertical Line */}
                <div className="absolute left-[27px] md:left-[115px] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-slate-700/50 -ml-px"></div>

                <div className="ml-8 md:ml-12 flex items-center space-x-3 py-3">
                  <div className="p-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400">
                    <Car className="h-3 w-3" />
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center space-x-2">
                    <span>{item.durationMin} min drive</span>
                    {item.distance && (
                      <>
                        <span>•</span>
                        <span>{item.distance}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Render Visit or Break Node
          return (
            <div key={idx} className="relative pl-4 md:pl-24 group">
              {/* Vertical Line (connects to next item) */}
              {!isLast && (
                <div className="absolute left-[27px] md:left-[115px] top-6 bottom-0 w-0.5 bg-slate-800 -ml-px group-hover:bg-slate-700 transition-colors"></div>
              )}

              {/* Time (Left side on desktop) */}
              <div className="hidden md:flex absolute left-0 top-6 w-24 justify-end pr-8">
                <span className={`text-sm font-mono ${isVisited ? 'text-slate-600 line-through' : 'text-slate-400'}`}>{item.startTime}</span>
              </div>

              {/* Node Marker */}
              <div className={`absolute left-[15px] md:left-[103px] top-6 w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center shadow-lg transition-all duration-300 ${item.type === 'break'
                ? 'bg-slate-900 border-orange-400 text-orange-400 scale-110'
                : isVisited
                  ? 'bg-green-500/20 border-green-500 text-green-500'
                  : 'bg-slate-950 border-[#fcd34d] text-[#fcd34d] group-hover:scale-110 group-hover:shadow-[#fcd34d]/20'
                }`}>
                {item.type === 'break' ? (
                  <Utensils className="h-3 w-3" />
                ) : isVisited ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Content Card */}
              <div className="ml-8 md:ml-12 pb-8">
                {item.type === 'break' ? (
                  // Lunch/Break UI
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Utensils className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-slate-200">{item.name}</h4>
                      <p className="text-sm text-slate-500">{item.durationMin} min break</p>
                    </div>
                  </div>
                ) : (
                  // Visit UI
                  <div className={`bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300 group-hover:translate-x-1 ${isVisited ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Thumbnail */}
                      {item.thumbnail && (
                        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 relative">
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isVisited ? 'grayscale' : ''}`}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          {isVisited && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <CheckCircle className="text-green-400 w-8 h-8" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`text-lg font-bold truncate pr-4 transition-colors ${isVisited ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-[#fcd34d]'}`}>
                            {item.name}
                          </h4>

                          {/* Visited Toggle Button */}
                          {tripId && (
                            <button
                              onClick={() => handleStatusToggle(item._id, item.status)}
                              className={`p-1.5 rounded-full transition-colors ${isVisited ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-slate-500 hover:text-[#fcd34d] hover:bg-white/5'}`}
                              title={isVisited ? "Mark as unvisited" : "Mark as visited"}
                            >
                              {isVisited ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </button>
                          )}
                        </div>

                        <span className="md:hidden text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded inline-block mb-2">
                          {item.startTime}
                        </span>

                        {item.address && (
                          <div className="flex items-center space-x-1 text-xs text-slate-500 mb-3">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.address}</span>
                          </div>
                        )}

                        {item.description && (
                          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500 font-mono border-t border-white/5 pt-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.durationMin} min visit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItineraryCard;


