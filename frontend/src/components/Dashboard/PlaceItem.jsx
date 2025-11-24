import React, { useEffect } from 'react';
import { Trash2, CheckCircle, Circle, Sparkles, Clock, XCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { enrichPlaceWithAI } from '../../store/tripSlice';

const PlaceItem = ({ place, tripId, onToggleStatus, onDelete, onSkip }) => {
  const dispatch = useDispatch();
  const isVisited = place.status === 'visited';
  const isSkipped = place.status === 'skipped';

  // Helper: Format minutes to "x hr y min"
  const formatTime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} hr ${mins} min`;
    } else if (hours > 0) {
      return `${hours} hr`;
    } else {
      return `${mins} min`;
    }
  };

  // Self-Healing: Trigger AI if pending
  useEffect(() => {
    if (place.aiTimeStatus === 'pending') {
      dispatch(enrichPlaceWithAI({ 
        tripId, 
        placeId: place._id, 
        placeName: place.name,
        city: 'Destination' 
      }));
    }
  }, [place.aiTimeStatus, dispatch, tripId, place._id, place.name]);

  // AI Status Badge Logic
  const renderAIBadge = () => {
    if (place.aiTimeStatus === 'pending') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full animate-pulse">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-medium text-blue-300">AI Thinking...</span>
        </div>
      );
    }
    if (place.aiTimeStatus === 'verified') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#fcd34d]/10 border border-[#fcd34d]/20 rounded-full">
          <Sparkles className="w-3 h-3 text-[#fcd34d]" />
          <span className="text-[10px] font-medium text-[#fcd34d]">{formatTime(place.estimatedTime)}</span>
        </div>
      );
    }
    if (place.estimatedTime) {
       return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-medium text-slate-400">{formatTime(place.estimatedTime)}</span>
        </div>
      );
    }
    return null;
  };

  // Dynamic Styles based on status
  const getContainerStyles = () => {
    if (isVisited) return 'bg-green-500/10 border-green-500/20 opacity-75';
    if (isSkipped) return 'bg-red-500/10 border-red-500/20 opacity-75';
    return 'bg-white/5 border-white/10 hover:border-[#fcd34d]/30 hover:bg-white/10';
  };

  const getTextStyle = () => {
    if (isVisited || isSkipped) return 'text-slate-400 line-through decoration-slate-500/50';
    return 'text-slate-200';
  };

  return (
    <div className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${getContainerStyles()}`}>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
            <h3 className={`font-medium text-base truncate ${getTextStyle()}`}>
            {place.name}
            </h3>
            {renderAIBadge()}
        </div>
        
        {place.description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{place.description}</p>
        )}
      </div>

      {/* Actions Control Bar - Always Visible */}
      <div className="flex items-center gap-2 relative z-10">
        {/* Mark Visited */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStatus(place._id, isVisited ? 'pending' : 'visited'); }}
          className={`p-1.5 rounded-lg transition-colors ${isVisited ? 'text-green-400 bg-green-400/10' : 'text-slate-500 hover:text-green-400 hover:bg-green-400/10'}`}
          title={isVisited ? "Mark Pending" : "Mark Visited"}
        >
          <CheckCircle size={18} />
        </button>

        {/* Skip Place */}
        <button 
          onClick={(e) => { e.stopPropagation(); onSkip(place._id, isSkipped ? 'pending' : 'skipped'); }}
          className={`p-1.5 rounded-lg transition-colors ${isSkipped ? 'text-red-400 bg-red-400/10' : 'text-slate-500 hover:text-red-400 hover:bg-red-400/10'}`}
          title={isSkipped ? "Restore" : "Skip Place"}
        >
          <XCircle size={18} />
        </button>

        {/* Delete Place */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(place._id); }}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Delete Place"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default PlaceItem;
