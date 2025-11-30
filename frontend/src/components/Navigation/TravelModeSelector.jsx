import { Car, Footprints, Bike, Bus, CheckCircle, Navigation } from 'lucide-react';

const TravelModeSelector = ({ currentMode, onModeChange, eta, distance, onArrived, isNavigationActive, onToggleNavigation }) => {
  const modes = [
    { id: 'drive', icon: Car, label: 'Drive' },
    { id: 'walk', icon: Footprints, label: 'Walk' },
    { id: 'bike', icon: Bike, label: 'Bike' },
    { id: 'transit', icon: Bus, label: 'Transit' },
  ];

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.round(seconds / 60);
    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins} min`;
  };

  const formatDistance = (meters) => {
    if (!meters) return '--';
    if (meters > 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 pb-safe-bottom">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
        {/* Info Row */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-baseline gap-2">
            <div className="text-lg font-bold text-white leading-none">
              {formatTime(eta)}
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {formatDistance(distance)} • ETA {new Date(Date.now() + (eta * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleNavigation}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all transform active:scale-95 shadow-lg
                ${isNavigationActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}
              `}
            >
              <Navigation size={14} fill={isNavigationActive ? "currentColor" : "none"} />
              {isNavigationActive ? 'Exit' : 'Start'}
            </button>

            <button
              onClick={onArrived}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all transform active:scale-95 shadow-lg shadow-green-900/20"
            >
              <CheckCircle size={14} />
              Arrived
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-between gap-1 bg-white/5 p-0.5 rounded-lg">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`
                  flex-1 flex flex-col items-center justify-center py-1.5 rounded-md transition-all duration-200
                  ${isSelected ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                `}
              >
                <Icon size={16} className="mb-0.5" />
                <span className="text-[9px] font-medium uppercase tracking-wide leading-none">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TravelModeSelector;
