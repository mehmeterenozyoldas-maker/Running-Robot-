import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { Mode, ToolType, SceneObject, CameraView, WeatherType } from './types';

const STORAGE_KEY = 'invisible-runner-scene-v1';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('SIM');
  const [cameraView, setCameraView] = useState<CameraView>('DEFAULT');
  const [activeTool, setActiveTool] = useState<ToolType>('TREE');
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // New Features State
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherType>('CLEAR');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            setObjects(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load scene", e);
        }
    }
    setHasLoaded(true);
  }, []);

  // Save to LocalStorage whenever objects change
  useEffect(() => {
    if (hasLoaded) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
    }
  }, [objects, hasLoaded]);

  // Add Object
  const handleAddObject = (obj: SceneObject) => {
    setObjects((prev) => [...prev, obj]);
  };

  // Undo (Remove last)
  const handleUndo = () => {
    setObjects((prev) => {
      const newArr = [...prev];
      const removed = newArr.pop();
      if (removed && removed.id === selectedId) {
        setSelectedId(null);
      }
      return newArr;
    });
  };
  
  // Clear All
  const handleClearAll = () => {
      if (window.confirm('Are you sure you want to clear the entire scene? This cannot be undone.')) {
          setObjects([]);
          setSelectedId(null);
      }
  }

  // Remove specific object (Delete key)
  const handleRemoveObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'DESIGN') {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
          handleRemoveObject(selectedId);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, selectedId, handleRemoveObject]);

  // Clear selection when switching modes
  useEffect(() => {
    if (mode === 'SIM') setSelectedId(null);
  }, [mode]);

  return (
    <div className="relative w-full h-screen bg-neutral-900 font-sans select-none overflow-hidden">
      
      {/* Top Bar: Title & Mode Switcher */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-none">
         <div className="mb-4 md:mb-0 transition-opacity duration-500" style={{ opacity: mode === 'SIM' ? 0.8 : 1 }}>
             <div className="text-white/30 font-light text-xs tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                React Three Fiber
             </div>
             <h1 className="text-white text-3xl font-bold tracking-tighter drop-shadow-lg">INVISIBLE RUNNER</h1>
         </div>
         
         {/* Mode Switcher */}
         <div className="pointer-events-auto bg-black/40 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/10 shadow-2xl">
            <button 
                onClick={() => setMode('SIM')}
                className={`px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${mode === 'SIM' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
                SIMULATION
            </button>
            <button 
                onClick={() => setMode('DESIGN')}
                className={`px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${mode === 'DESIGN' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
                PLAN & DESIGN
            </button>
         </div>
      </div>

      {/* Camera View Switcher (Right Side) */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
          <div className="text-right text-white/30 text-[9px] uppercase tracking-widest mb-1 mr-1">Camera</div>
          {['DEFAULT', 'TOP_DOWN', 'SIDE', 'POV'].map((view) => (
              <button
                key={view}
                onClick={() => setCameraView(view as CameraView)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${cameraView === view ? 'bg-white text-black border-white shadow-[0_0_15px_white]' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/10'}`}
                title={view.replace('_', ' ')}
              >
                  {view === 'DEFAULT' && <span className="text-xs">Auto</span>}
                  {view === 'TOP_DOWN' && <div className="w-4 h-4 border-2 border-current rounded-sm" />}
                  {view === 'SIDE' && <div className="w-4 h-2 border-2 border-current rounded-sm" />}
                  {view === 'POV' && <div className="w-3 h-3 bg-current rounded-full" />}
              </button>
          ))}
          
          <div className="w-full h-px bg-white/10 my-1"></div>
          
           {/* Weather Toggle */}
           <button
                onClick={() => setWeather(prev => prev === 'CLEAR' ? 'RAIN' : 'CLEAR')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${weather === 'RAIN' ? 'bg-blue-900/50 text-blue-200 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/10'}`}
                title="Toggle Weather"
              >
                  <div className="flex flex-col gap-0.5 items-center">
                      <div className="w-4 h-0.5 bg-current -rotate-12"></div>
                      <div className="w-4 h-0.5 bg-current -rotate-12"></div>
                      <div className="w-4 h-0.5 bg-current -rotate-12"></div>
                  </div>
            </button>
      </div>

      {/* Design Toolbar (Only visible in DESIGN mode) */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) transform w-full max-w-5xl px-4 flex flex-col items-center gap-4 ${mode === 'DESIGN' ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-40 opacity-0 scale-95 pointer-events-none'}`}>
          
          {/* Action Bar */}
          <div className="flex gap-3 items-center">
             <button 
                onClick={handleUndo}
                className="bg-black/60 backdrop-blur border border-white/10 text-white/70 hover:text-white px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
             >
                Undo Last
             </button>
              <button 
                onClick={handleClearAll}
                className="bg-black/60 backdrop-blur border border-white/10 text-white/70 hover:text-red-400 px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
             >
                Clear Scene
             </button>
             
             <div className="w-px h-6 bg-white/20 mx-1"></div>

             <button 
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border backdrop-blur transition-all ${snapToGrid ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-black/60 border-white/10 text-white/70 hover:text-white'}`}
             >
                Snap: {snapToGrid ? 'ON' : 'OFF'}
             </button>

             {selectedId && (
                <button 
                    onClick={() => handleRemoveObject(selectedId)}
                    className="ml-2 bg-red-500/20 backdrop-blur border border-red-500/30 text-red-200 hover:text-white px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-red-500/40 transition-colors animate-pulse"
                >
                    Delete Selected
                </button>
             )}
          </div>

          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-x-auto max-w-full">
              <ToolButton 
                  label="Tree" 
                  isActive={activeTool === 'TREE'} 
                  onClick={() => setActiveTool('TREE')} 
                  icon={<div className="w-3 h-6 bg-green-500 rounded-full mx-auto shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
              />
              <ToolButton 
                  label="Rock" 
                  isActive={activeTool === 'ROCK'} 
                  onClick={() => setActiveTool('ROCK')} 
                  icon={<div className="w-4 h-4 bg-gray-400 rounded mx-auto mt-1" />}
              />
              <ToolButton 
                  label="Crystal" 
                  isActive={activeTool === 'CRYSTAL'} 
                  onClick={() => setActiveTool('CRYSTAL')} 
                  icon={<div className="w-4 h-4 bg-cyan-400 rotate-45 mx-auto mt-1 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
              />
               <ToolButton 
                  label="Mushroom" 
                  isActive={activeTool === 'MUSHROOM'} 
                  onClick={() => setActiveTool('MUSHROOM')} 
                  icon={<div className="w-4 h-4 bg-red-500 rounded-full mx-auto mt-1 border-2 border-white/50" />}
              />
               <ToolButton 
                  label="Lamp" 
                  isActive={activeTool === 'LAMP'} 
                  onClick={() => setActiveTool('LAMP')} 
                  icon={<div className="w-1 h-5 bg-yellow-400 mx-auto mt-1 shadow-[0_0_15px_rgba(250,204,21,0.8)]" />}
              />
               <ToolButton 
                  label="Bush" 
                  isActive={activeTool === 'BUSH'} 
                  onClick={() => setActiveTool('BUSH')} 
                  icon={<div className="w-5 h-3 bg-green-700 rounded-full mx-auto mt-2" />}
              />
               <ToolButton 
                  label="Fence" 
                  isActive={activeTool === 'FENCE'} 
                  onClick={() => setActiveTool('FENCE')} 
                  icon={<div className="w-5 h-3 border-2 border-amber-700 mx-auto mt-2 border-t-0" />}
              />
          </div>
          
           <div className="text-white/30 text-[9px] tracking-[0.2em] uppercase bg-black/40 backdrop-blur px-4 py-2 rounded-full flex gap-6">
              <span className="flex items-center gap-2"><span className="w-1 h-1 bg-white rounded-full"/> Click to place</span>
              <span className="flex items-center gap-2"><span className="w-1 h-1 bg-white rounded-full"/> Wheel to Rotate</span>
              <span className="flex items-center gap-2"><span className="w-1 h-1 bg-white rounded-full"/> Shift + Wheel Scale</span>
          </div>
      </div>
      

      {/* Bottom Right Stats */}
      <div className="absolute bottom-8 right-8 z-10 text-right text-white/20 text-[10px] pointer-events-none font-mono">
           <p>MODE: {mode}</p>
           <p>VIEW: {cameraView}</p>
           <p>WEATHER: {weather}</p>
           <p>ENTITIES: {objects.length}</p>
      </div>

      {/* 3D Canvas */}
      <Scene 
        mode={mode} 
        cameraView={cameraView}
        activeTool={activeTool} 
        objects={objects} 
        onAddObject={handleAddObject}
        selectedId={selectedId}
        onSelect={setSelectedId}
        weather={weather}
        snapToGrid={snapToGrid}
      />
    </div>
  );
};

const ToolButton = ({ label, isActive, onClick, icon }: { label: string, isActive: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button 
        onClick={onClick}
        className={`group relative min-w-[4.5rem] h-20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 border border-white/5 ${isActive ? 'bg-white/10 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-transparent hover:bg-white/5'}`}
    >
        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</div>
        <span className={`text-[9px] font-bold tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>{label}</span>
        
        {/* Active Indicator Dot */}
        {isActive && <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />}
    </button>
);

export default App;