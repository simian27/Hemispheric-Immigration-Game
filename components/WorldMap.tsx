import React from 'react';

export const WorldMap: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <svg
        viewBox="0 0 1008 550"
        preserveAspectRatio="none"
        className="w-full h-full fill-emerald-50/60 stroke-emerald-200/50 stroke-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified World Map Paths */}
        <g transform="scale(1, 1)">
          {/* North America */}
          <path d="M152,47 C130,50 90,55 70,80 C60,95 50,120 65,150 C80,180 120,200 140,230 C150,245 155,270 160,285 L180,290 C190,280 220,200 240,150 C260,100 300,50 250,30 C200,10 170,45 152,47 Z" />
          
          {/* South America */}
          <path d="M210,310 C200,340 190,400 210,480 C230,500 260,450 290,400 C310,360 330,320 290,300 C260,290 230,300 210,310 Z" />
          
          {/* Europe */}
          <path d="M440,60 C420,80 410,120 450,130 C470,135 500,120 520,110 C530,90 510,50 480,40 C460,35 450,50 440,60 Z" />
          
          {/* Africa */}
          <path d="M430,160 C410,180 400,220 430,280 C450,320 480,380 520,360 C550,340 580,250 550,180 C530,140 480,140 430,160 Z" />
          
          {/* Asia */}
          <path d="M560,40 C580,80 570,140 600,180 C630,220 680,240 720,200 C750,160 850,180 900,100 C920,60 850,20 750,30 C650,40 600,20 560,40 Z" />
          
          {/* Australia */}
          <path d="M780,350 C760,380 770,420 820,430 C860,440 890,400 880,360 C870,330 800,330 780,350 Z" />
          
          {/* Greenland/Islands simplified */}
          <path d="M300,30 C280,50 320,80 340,50 C350,30 320,10 300,30 Z" />
        </g>
      </svg>
    </div>
  );
};