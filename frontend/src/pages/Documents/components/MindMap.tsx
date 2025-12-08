import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
  details?: string;
  _children?: MindMapNode[]; // Internal state for collapsed children
  x0?: number; // Internal D3 state
  y0?: number; // Internal D3 state
  x?: number; // Internal D3 state
  y?: number; // Internal D3 state
  id?: number | string; // Internal D3 state
  depth?: number; // Internal D3 state
}

interface MindMapProps {
  data: MindMapNode;
}

export const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || dimensions.width === 0 || dimensions.height === 0 || !svgRef.current) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font-family", "Inter, sans-serif")
      .style("user-select", "none");

    // Add Zoom Behavior
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Center view initially
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 6, height / 2).scale(1));

    // Initial Tree Layout
    const root = d3.hierarchy<MindMapNode>(data);

    // Collapse after depth 2 initially to avoid clutter if tree is huge
    root.descendants().forEach((d, i) => {
      // @ts-ignore
      d.id = i + 1; // Start from 1 to avoid falsy 0 check later
      if (d.depth > 2 && d.children) {
        (d as any)._children = d.children;
        d.children = undefined;
      }
    });

    let i = 0;
    const duration = 750;
    const nodeWidth = 180;
    const nodeHeight = 60;

    // Defines the tree layout
    // Switch x and y for horizontal layout calculation vs render
    const tree = d3.tree<MindMapNode>().nodeSize([nodeHeight, nodeWidth]);

    // Define diagonal generator
    const diagonal = d3.linkHorizontal<any, any>()
      .x(d => d.y)
      .y(d => d.x);

    // Center the root
    const x0 = height / 2;
    const y0 = width / 6;

    // @ts-ignore
    root.x0 = x0;
    // @ts-ignore
    root.y0 = y0;

    // Initial update
    update(root);

    // Center view initially
    // svg.call(zoom.transform, d3.zoomIdentity.translate(width/6, height/2).scale(1));

    function update(source: any) {
      // Compute the new tree layout.
      tree(root);

      const nodes = root.descendants();
      const links = root.links();

      // Normalize for fixed-depth if needed, but tree().nodeSize() usually handles spacing
      nodes.forEach((d: any) => { d.y = d.depth * 250; }); // Increase horizontal spacing

      // ****************** Nodes section ***************************

      // Update the nodes...
      const node = g.selectAll<SVGGElement, d3.HierarchyNode<MindMapNode>>('g.node')
        // @ts-ignore
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", () => `translate(${source.y0},${source.x0})`)
        .on('click', click)
        .style("cursor", "pointer");

      // Add Circle for the nodes
      nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", (d: any) => d._children ? "#6366f1" : "#fff")
        .style("stroke", "#6366f1")
        .style("stroke-width", "2px");

      // Add labels for the nodes
      nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", (d: any) => d.children || d._children ? -13 : 13)
        .attr("text-anchor", (d: any) => d.children || d._children ? "end" : "start")
        .text((d: any) => d.data.name)
        .style("fill-opacity", 1e-6)
        .style("font-size", (d: any) => d.depth === 0 ? "16px" : "12px")
        .style("font-weight", (d: any) => d.depth === 0 ? "bold" : "500")
        .style("fill", "#1f2937")
        .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff")
        .each(function () {
          // Wrap text logic would go here
        });


      // Adding a tooltip title
      nodeEnter.append("title")
        .text((d: any) => d.data.details || d.data.name);

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition().duration(duration)
        .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
        .attr('r', 6)
        .style("fill", (d: any) => d._children ? "#6366f1" : "#fff")
        .attr('cursor', 'pointer');

      nodeUpdate.select('text')
        .style("fill-opacity", 1);

      // Remove any exiting nodes
      const nodeExit = node.exit().transition().duration(duration)
        .attr("transform", () => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select('circle')
        .attr('r', 1e-6);

      nodeExit.select('text')
        .style("fill-opacity", 1e-6);

      // ****************** Links section ***************************

      // Update the links...
      const link = g.selectAll<SVGPathElement, d3.HierarchyLink<MindMapNode>>('path.link')
        // @ts-ignore
        .data(links, (d: any) => d.target.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', () => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        })
        .style("fill", "none")
        .style("stroke", "#cbd5e1")
        .style("stroke-width", "1.5px");

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition().duration(duration)
        .attr('d', diagonal);

      // Remove any exiting links
      link.exit().transition().duration(duration)
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Toggle children on click.
    function click(event: any, d: any) {
      event.stopPropagation();
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }

  }, [data, dimensions]);




  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      const width = dimensions.width;
      const height = dimensions.height;
      const svg = d3.select(svgRef.current);
      // Reset to initial view (slightly translated to fit root)
      svg.transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(width / 6, height / 2).scale(1));
    }
  };

  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-50 relative overflow-hidden rounded-xl border border-slate-200 shadow-inner">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={handleReset}
          className="bg-white/90 backdrop-blur p-2 rounded-lg shadow border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <i className="fi fi-rr-refresh"></i> Reset View
        </button>
        <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow border border-slate-200 text-xs text-slate-500">
          Scroll to zoom • Drag to pan • Click nodes to expand
        </div>
      </div>
    </div>
  );
};
