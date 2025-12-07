export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity extends Point {
  id: string;
  type: 'obstacle' | 'resource';
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  start: Point;
  destination: Point;
  obstacleCount: number;
  resourceCount: number;
  minResourcesToWin: number;
}

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface GameStats {
  levelId: number;
  resourcesCollected: number;
  timeTaken: number;
  eventsTriggered: number;
}