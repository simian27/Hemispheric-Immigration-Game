import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const FlowBackground: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr('width', width).attr('height', height);
    svg.selectAll("*").remove(); // Clear previous

    // Generate random nodes
    const nodes = d3.range(20).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height
    }));

    // Create arcs
    const links = [];
    for (let i = 0; i < 15; i++) {
      links.push({
        source: nodes[Math.floor(Math.random() * nodes.length)],
        target: nodes[Math.floor(Math.random() * nodes.length)]
      });
    }

    // Draw lines with gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "flowGradient")
      .attr("gradientUnits", "userSpaceOnUse");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#60A5FA").attr("stop-opacity", 0.1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#2563EB").attr("stop-opacity", 0.6);

    svg.selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "url(#flowGradient)")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .duration(2000)
      .delay((_, i) => i * 200)
      .style("opacity", 1);

    // Add animating circles along paths
    const circle = svg.append("circle")
        .attr("r", 4)
        .attr("fill", "#3B82F6");

    function transition() {
      if (links.length === 0) return;
      const randomLinkIndex = Math.floor(Math.random() * links.length);
      const link = links[randomLinkIndex];
      
      // Calculate path roughly
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      const pathData = `M${link.source.x},${link.source.y}A${dr},${dr} 0 0,1 ${link.target.x},${link.target.y}`;
      
      // Create a temporary path element to get point at length
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", pathData);
      const len = pathEl.getTotalLength();

      circle.transition()
        .duration(2000)
        .attrTween("transform", function() {
          return function(t) {
            const p = pathEl.getPointAtLength(t * len);
            return `translate(${p.x},${p.y})`;
          };
        })
        .on("end", transition);
    }

    transition();

  }, []);

  return (
    <svg 
      ref={svgRef} 
      className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none" 
    />
  );
};