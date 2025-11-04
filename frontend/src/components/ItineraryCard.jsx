import React from "react";

const ItineraryCard = ({ day }) => {
  return (
    <div className="bg-white p-4 shadow rounded-2xl">
      <h3 className="font-semibold text-lg text-blue-600 mb-3">Day {day.dayNumber}</h3>

      <ul className="space-y-3">
        {day.items?.map((item, idx) => (
          <li key={idx} className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {item.thumbnail && item.type === "visit" && (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-14 h-14 rounded-md object-cover border"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div>
                <div className="mb-0.5">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full mr-2 bg-gray-100 text-gray-700 border">
                    {item.type}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  {item.id && (
                    <span className="text-xs text-gray-500 ml-2">({item.id})</span>
                  )}
                </div>
                {item.description && item.type === "visit" && (
                  <p className="text-sm text-gray-600 max-w-prose">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap ml-3">
              {item.startTime} - {item.endTime} ({item.durationMin} min)
            </div>
          </li>
        ))}
      </ul>

      <div className="text-right text-sm text-gray-600 mt-3">
        Total: {day.totalMinutes} min
      </div>
    </div>
  );
};

export default ItineraryCard;


