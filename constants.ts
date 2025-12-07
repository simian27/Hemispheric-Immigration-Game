import { LevelConfig } from './types';

// Using percentage coordinates (0-100) for responsiveness
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "South America → North America",
    description: "Navigate the dense terrain to reach the embassy.",
    start: { x: 10, y: 85 },
    destination: { x: 85, y: 15 },
    obstacleCount: 6,
    resourceCount: 8,
    minResourcesToWin: 3
  },
  {
    id: 2,
    name: "Africa → Europe",
    description: "Cross the Mediterranean route. Avoid maritime patrols.",
    start: { x: 20, y: 80 },
    destination: { x: 70, y: 20 },
    obstacleCount: 9,
    resourceCount: 6,
    minResourcesToWin: 3
  },
  {
    id: 3,
    name: "Asia → North America",
    description: "The long Pacific journey. High difficulty.",
    start: { x: 15, y: 50 },
    destination: { x: 85, y: 30 },
    obstacleCount: 12,
    resourceCount: 5,
    minResourcesToWin: 2
  }
];

export const PLAYER_SIZE = 4; // percentage
export const OBSTACLE_SIZE = 5; // percentage
export const RESOURCE_SIZE = 3; // percentage
export const DESTINATION_SIZE = 8; // percentage

export const PLAYER_SPEED = 0.4; // movement per frame in percentage