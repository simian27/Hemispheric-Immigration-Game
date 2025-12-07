import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GameStats } from '../types';

interface LevelStatsProps {
  stats: GameStats[];
}

export const LevelStats: React.FC<LevelStatsProps> = ({ stats }) => {
  const data = stats.map(s => ({
    name: `Lvl ${s.levelId}`,
    resources: s.resourcesCollected,
    events: s.eventsTriggered,
    time: Math.round(s.timeTaken / 1000)
  }));

  return (
    <div className="w-full h-64 bg-white p-4 rounded-lg shadow-inner mt-4">
      <h3 className="text-gray-700 font-bold mb-2">Journey Analytics</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="resources" name="Resources" fill="#3B82F6">
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.resources >= 3 ? "#10B981" : "#F59E0B"} />
              ))}
          </Bar>
          <Bar dataKey="events" name="Events" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-center text-gray-500 mt-2">Resources Collected per Level</p>
    </div>
  );
};