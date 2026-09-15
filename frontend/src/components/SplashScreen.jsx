import React from "react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
    
      <div className="relative flex items-center justify-center animate-bounce">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-lg shadow-cyan-500/30 animate-pulse">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            {/* Logo Icon / SVG */}
            <img 
              src="/logo.svg" 
              alt="Fap Chat Logo" 
              className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>
      </div>

    
      <h1 className="mt-6 text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-wide">
        Fap Chat
      </h1>

     
      <div className="mt-8 flex items-center gap-2 animate-fade-in">
        <span className="loading loading-spinner loading-md text-cyan-400"></span>
        <span className="text-xs text-slate-400 font-medium tracking-wider">
          Connecting securely...
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;