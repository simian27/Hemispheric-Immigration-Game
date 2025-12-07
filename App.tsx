import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Point, Entity, GameStats } from './types';
import { LEVELS, PLAYER_SPEED, PLAYER_SIZE, OBSTACLE_SIZE, RESOURCE_SIZE, DESTINATION_SIZE } from './constants';
import { FlowBackground } from './components/FlowBackground';
import { LevelStats } from './components/LevelStats';
import { WorldMap } from './components/WorldMap';
import { 
  User, ShieldAlert, FileText, Building2, RotateCcw, Play, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Share2 
} from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<'neutral' | 'good' | 'bad'>('neutral');
  
  // Stats tracking
  const [allStats, setAllStats] = useState<GameStats[]>([]);
  const startTimeRef = useRef<number>(0);
  const eventsTriggeredRef = useRef<number>(0);

  // Entities state (using refs for loop performance where possible, but state for rendering)
  const [playerPos, setPlayerPos] = useState<Point>(LEVELS[0].start);
  const [obstacles, setObstacles] = useState<Entity[]>([]);
  const [resources, setResources] = useState<Entity[]>([]);
  
  // Refs for loop logic
  const playerPosRef = useRef<Point>(LEVELS[0].start);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();

  const currentLevel = LEVELS[currentLevelIndex];

  // Initialize Level
  const initLevel = useCallback((levelIndex: number) => {
    const level = LEVELS[levelIndex];
    
    // Set Start
    const startPos = { ...level.start };
    playerPosRef.current = startPos;
    setPlayerPos(startPos);
    
    // Generate Obstacles
    const newObstacles: Entity[] = [];
    for (let i = 0; i < level.obstacleCount; i++) {
      newObstacles.push({
        id: `obs-${i}`,
        type: 'obstacle',
        x: Math.random() * 80 + 10, // Keep away from extreme edges
        y: Math.random() * 80 + 10
      });
    }
    setObstacles(newObstacles);

    // Generate Resources
    const newResources: Entity[] = [];
    for (let i = 0; i < level.resourceCount; i++) {
      newResources.push({
        id: `res-${i}`,
        type: 'resource',
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    }
    setResources(newResources);

    setScore(0);
    setMessage("");
    startTimeRef.current = Date.now();
    eventsTriggeredRef.current = 0;

  }, []);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helpers
  const checkCollision = (p1: Point, size1: number, p2: Point, size2: number) => {
    // Simple box collision in percentage terms
    // Adjust hitboxes slightly smaller than visual size for better feel
    const tolerance = 0.5; 
    return (
      p1.x < p2.x + size2 - tolerance &&
      p1.x + size1 - tolerance > p2.x &&
      p1.y < p2.y + size2 - tolerance &&
      p1.y + size1 - tolerance > p2.y
    );
  };

  const triggerRandomEvent = () => {
    eventsTriggeredRef.current += 1;
    const r = Math.random();
    if (r < 0.25) {
      setScore(s => Math.max(0, s - 1));
      setMessage("Storm at sea! Lost 1 resource.");
      setMessageType('bad');
    } else if (r < 0.5) {
      setScore(s => s + 1);
      setMessage("Visa Lottery Won! Gained 1 resource.");
      setMessageType('good');
    } else if (r < 0.75) {
      setScore(s => s + 2);
      setMessage("NGO Assistance! Gained 2 resources.");
      setMessageType('good');
    } else {
      // Border delay - Reset Position
      playerPosRef.current = { ...currentLevel.start };
      setPlayerPos({ ...currentLevel.start });
      setMessage("Border Delay! Sent back to start.");
      setMessageType('bad');
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  // Game Loop
  // specialized effect for the loop to handle collisions with fresh state
  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = () => {
      const player = playerPosRef.current;
      let nextX = player.x;
      let nextY = player.y;
      let moved = false;

      // Movement Logic
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) { nextX -= PLAYER_SPEED; moved = true; }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) { nextX += PLAYER_SPEED; moved = true; }
      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) { nextY -= PLAYER_SPEED; moved = true; }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) { nextY += PLAYER_SPEED; moved = true; }

      // Boundaries
      nextX = Math.max(0, Math.min(100 - PLAYER_SIZE, nextX));
      nextY = Math.max(0, Math.min(100 - PLAYER_SIZE, nextY));

      if (moved) {
        playerPosRef.current = { x: nextX, y: nextY };
        setPlayerPos({ x: nextX, y: nextY });
      }

      // Check Destination
      if (checkCollision({x: nextX, y: nextY}, PLAYER_SIZE, currentLevel.destination, DESTINATION_SIZE)) {
        if (score >= currentLevel.minResourcesToWin) {
          // Record stats
          const stats: GameStats = {
            levelId: currentLevel.id,
            resourcesCollected: score,
            timeTaken: Date.now() - startTimeRef.current,
            eventsTriggered: eventsTriggeredRef.current
          };
          setAllStats(prev => [...prev, stats]);

          if (currentLevelIndex < LEVELS.length - 1) {
            setGameState(GameState.LEVEL_COMPLETE);
          } else {
            setGameState(GameState.VICTORY);
          }
          return; // Stop loop
        } else {
           // Provide feedback if at destination but not enough resources
           if (!message) {
             setMessage(`Need ${currentLevel.minResourcesToWin} resources!`);
             setMessageType('neutral');
             setTimeout(() => setMessage(""), 2000);
           }
        }
      }

      // Check Obstacles
      obstacles.forEach(obs => {
        if (checkCollision({x: nextX, y: nextY}, PLAYER_SIZE, obs, OBSTACLE_SIZE)) {
          setScore(s => Math.max(0, s - 1));
          playerPosRef.current = { ...currentLevel.start };
          setPlayerPos({ ...currentLevel.start });
          setMessage("Caught by guard! Resetting.");
          setMessageType('bad');
          setTimeout(() => setMessage(""), 2000);
        }
      });

      // Check Resources
      const collectedIndex = resources.findIndex(res => 
        checkCollision({x: nextX, y: nextY}, PLAYER_SIZE, res, RESOURCE_SIZE)
      );

      if (collectedIndex !== -1) {
        const newResources = [...resources];
        newResources.splice(collectedIndex, 1);
        setResources(newResources);
        setScore(s => s + 1);
        
        // Random Event Chance (30%)
        if (Math.random() < 0.3) {
          triggerRandomEvent();
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, obstacles, resources, currentLevel, score, message]);

  // Touch Control Helpers
  const handleControl = (key: string, active: boolean) => {
    if (active) {
      keysPressed.current.add(key);
    } else {
      keysPressed.current.delete(key);
    }
  };

  const startGame = () => {
    setCurrentLevelIndex(0);
    setAllStats([]);
    initLevel(0);
    setGameState(GameState.PLAYING);
  };

  const nextLevel = () => {
    const nextIdx = currentLevelIndex + 1;
    setCurrentLevelIndex(nextIdx);
    initLevel(nextIdx);
    setGameState(GameState.PLAYING);
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hemispheric Immigration Journey',
          text: 'Can you survive the journey? Play this migration strategy game!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied to clipboard!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Render Functions
  const renderStartScreen = () => (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-8 bg-white/80 backdrop-blur-sm shadow-2xl rounded-xl max-w-2xl mx-auto my-10 animate-fade-in">
      <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 tracking-tight">
        Hemispheric <br/><span className="text-blue-600">Immigration Journey</span>
      </h1>
      <p className="text-lg text-gray-700 mb-8 max-w-md leading-relaxed">
        Embark on a perilous journey across borders. Manage your resources, evade patrols, and navigate changing political climates to reach safety.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
          <User className="w-8 h-8 text-blue-600 mb-2" />
          <span className="font-semibold text-gray-800">Navigate</span>
          <span className="text-xs text-gray-500 mt-1">Arrow Keys / Touch</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
          <FileText className="w-8 h-8 text-green-600 mb-2" />
          <span className="font-semibold text-gray-800">Collect</span>
          <span className="text-xs text-gray-500 mt-1">Gather Documents</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
          <ShieldAlert className="w-8 h-8 text-red-600 mb-2" />
          <span className="font-semibold text-gray-800">Avoid</span>
          <span className="text-xs text-gray-500 mt-1">Evade Guards</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={startGame}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 shadow-lg active:scale-95"
        >
          Start Journey
          <Play className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={shareApp}
          className="inline-flex items-center justify-center p-4 text-blue-600 bg-white border border-blue-200 rounded-full hover:bg-blue-50 shadow-md transition-all active:scale-95"
          title="Share Game"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {message && (
        <div className="absolute bottom-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm animate-bounce-in">
          {message}
        </div>
      )}
    </div>
  );

  const ControlButton = ({ dir, icon: Icon, className }: any) => (
    <button
      className={`w-14 h-14 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/60 shadow-lg active:bg-blue-500/50 active:scale-95 transition-all touch-none select-none ${className}`}
      onPointerDown={(e) => { e.preventDefault(); handleControl(dir, true); }}
      onPointerUp={(e) => { e.preventDefault(); handleControl(dir, false); }}
      onPointerLeave={(e) => { e.preventDefault(); handleControl(dir, false); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Icon className="w-8 h-8 text-blue-900" />
    </button>
  );

  const renderMobileControls = () => (
    <div className="absolute bottom-6 right-6 z-50 grid grid-cols-3 gap-1 md:hidden select-none">
      <div />
      <ControlButton dir="ArrowUp" icon={ChevronUp} />
      <div />
      <ControlButton dir="ArrowLeft" icon={ChevronLeft} />
      <ControlButton dir="ArrowDown" icon={ChevronDown} />
      <ControlButton dir="ArrowRight" icon={ChevronRight} />
    </div>
  );

  const renderGameOverlay = () => (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start z-20">
      <div className="bg-white/90 backdrop-blur border border-gray-200 p-4 rounded-xl shadow-lg flex flex-col gap-1 min-w-[200px]">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{currentLevel.name}</h2>
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
           <FileText className="text-blue-600" />
           <span>{score} / {currentLevel.minResourcesToWin}</span>
        </div>
        <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${Math.min(100, (score / currentLevel.minResourcesToWin) * 100)}%` }}
          />
        </div>
      </div>

      {message && (
        <div className={`
          animate-bounce-in px-6 py-3 rounded-lg shadow-xl font-semibold text-white max-w-sm text-center transition-all duration-300
          ${messageType === 'good' ? 'bg-green-500' : messageType === 'bad' ? 'bg-red-500' : 'bg-gray-800'}
        `}>
          {message}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur border border-gray-200 p-2 rounded-lg shadow-sm hidden sm:block">
        <span className="text-xs font-mono text-gray-400">LEVEL {currentLevelIndex + 1}/{LEVELS.length}</span>
      </div>
    </div>
  );

  const renderLevelComplete = () => (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-scale-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Safe Arrival!</h2>
        <p className="text-gray-600 mb-6">You successfully navigated {currentLevel.name}.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-gray-500 mb-1">Documents Secured: <span className="text-gray-900 font-bold">{score}</span></p>
          <p className="text-sm text-gray-500">Route Difficulty: <span className="text-gray-900 font-bold">{currentLevel.obstacleCount} Patrols</span></p>
        </div>

        <button 
          onClick={nextLevel}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
        >
          Continue Journey
        </button>
      </div>
    </div>
  );

  const renderVictory = () => (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center animate-scale-up">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Journey Complete!</h2>
        <p className="text-gray-600 mb-6">You have successfully navigated all migration routes.</p>
        
        <LevelStats stats={allStats} />

        <div className="flex gap-4 mt-8">
            <button 
            onClick={startGame}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg active:scale-95"
            >
            <RotateCcw className="w-5 h-5" />
            Play Again
            </button>
            <button
            onClick={shareApp} 
            className="px-4 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-md active:scale-95"
            >
            <Share2 className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-blue-50 overflow-hidden font-sans select-none">
      {gameState === GameState.START && <FlowBackground />}
      
      {gameState === GameState.START ? renderStartScreen() : (
        <>
          {/* Game Board */}
          <div className="absolute inset-0 bg-sky-200">
            {/* World Map Background */}
            <WorldMap />

            {/* Grid/Texture Overlay - adjusted for water visibility */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
              backgroundImage: 'radial-gradient(#0369a1 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}></div>
            
            {/* Destination */}
            <div 
              className="absolute bg-green-100 border-2 border-green-500 rounded-lg flex items-center justify-center shadow-lg transition-all"
              style={{
                left: `${currentLevel.destination.x}%`,
                top: `${currentLevel.destination.y}%`,
                width: `${DESTINATION_SIZE}%`,
                height: `${DESTINATION_SIZE}%`
              }}
            >
              <Building2 className="text-green-600 w-1/2 h-1/2" />
              {score < currentLevel.minResourcesToWin && (
                <div className="absolute -top-6 bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                   Need {currentLevel.minResourcesToWin} Docs
                </div>
              )}
            </div>

            {/* Resources */}
            {resources.map(res => (
              <div
                key={res.id}
                className="absolute bg-yellow-100 border border-yellow-400 rounded-full flex items-center justify-center shadow-md animate-pulse"
                style={{
                  left: `${res.x}%`,
                  top: `${res.y}%`,
                  width: `${RESOURCE_SIZE}%`,
                  height: `${RESOURCE_SIZE}%`
                }}
              >
                <FileText className="text-yellow-600 w-2/3 h-2/3" />
              </div>
            ))}

            {/* Obstacles */}
            {obstacles.map(obs => (
              <div
                key={obs.id}
                className="absolute bg-red-100 border border-red-500 rounded-md flex items-center justify-center shadow-md"
                style={{
                  left: `${obs.x}%`,
                  top: `${obs.y}%`,
                  width: `${OBSTACLE_SIZE}%`,
                  height: `${OBSTACLE_SIZE}%`
                }}
              >
                <ShieldAlert className="text-red-600 w-2/3 h-2/3" />
              </div>
            ))}

            {/* Player */}
            <div
              className="absolute bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl transition-transform duration-75 z-10"
              style={{
                left: `${playerPos.x}%`,
                top: `${playerPos.y}%`,
                width: `${PLAYER_SIZE}%`,
                height: `${PLAYER_SIZE}%`
              }}
            >
              <User className="w-2/3 h-2/3" />
            </div>
          </div>

          {renderGameOverlay()}
          {renderMobileControls()}
          {gameState === GameState.LEVEL_COMPLETE && renderLevelComplete()}
          {gameState === GameState.VICTORY && renderVictory()}
        </>
      )}
    </div>
  );
};

export default App;