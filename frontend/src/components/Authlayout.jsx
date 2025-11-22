export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-orange-50">
      {/* Route Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,200 C300,100 600,300 900,150 S1500,300 1800,200"
          stroke="#0ea5e9"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 6"
        />
        <path
          d="M0,400 C400,300 800,500 1200,350 S1600,500 2000,400"
          stroke="#f97316"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 8"
        />
      </svg>

      {/* Map Pins (accent circles) */}
      <div className="absolute top-10 left-10 w-6 h-6 bg-orange-400 rounded-full shadow-lg"></div>
      <div className="absolute bottom-20 right-16 w-8 h-8 bg-teal-400 rounded-full shadow-xl"></div>
      <div className="absolute top-1/3 right-1/4 w-5 h-5 bg-blue-400 rounded-full shadow-md"></div>

      {/* Plane Icon (flying effect) */}
      <div className="absolute top-1/4 left-1/3 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="teal"
          viewBox="0 0 24 24"
          className="w-10 h-10 opacity-70"
        >
          <path d="M2.5 19.5l19-7.5-19-7.5v5l14 2.5-14 2.5v5z" />
        </svg>
      </div>

      {/* Famous Landmarks (minimal silhouettes) */}
      <div className="absolute bottom-0 left-4 w-28 opacity-30">
        {/* Taj Mahal (simple SVG style) */}
        <img src="https://img.icons8.com/ios-filled/100/taj-mahal.png" alt="Taj Mahal" />
      </div>

      <div className="absolute bottom-0 right-6 w-28 opacity-30">
        {/* Eiffel Tower */}
        <img src="https://img.icons8.com/ios-filled/100/eiffel-tower.png" alt="Eiffel Tower" />
      </div>

      <div className="absolute top-0 right-10 w-20 opacity-20">
        {/* Statue of Liberty */}
        <img src="https://img.icons8.com/ios-filled/100/statue-of-liberty.png" alt="Statue of Liberty" />
      </div>

      {/* Signup/Login Card */}
      <div className=" m-1 relative z-10 md:w-8/10 w-full  bg-white/0 backdrop-blur-xs shadow-sm p-8 rounded-2xl ">
        {children}
      </div>
    </div>
  );
}
