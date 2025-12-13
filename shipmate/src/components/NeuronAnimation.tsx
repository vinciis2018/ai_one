import React, { useEffect, useRef } from 'react';

const NeuronAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Configuration
    const nodeCount = 60;
    const connectionDistance = 150;
    const signalSpeed = 2;
    const nodeColor = '#a9ffb380'; // Reddish from user edit
    const lineColor = '#8f79a840'; // Blueish from user edit
    const signalColor = '#53905A80';

    interface Node {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      phase: number; // For floating animation
    }

    interface Signal {
      startNode: Node;
      endNode: Node;
      progress: number; // 0 to 1
    }

    const nodes: Node[] = [];
    const signals: Signal[] = [];
    const mouse = { x: -1000, y: -1000 };

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      nodes.forEach(node => {
        // Floating motion
        const floatSpeed = 0.001;
        const floatAmplitude = 20;
        const floatX = Math.sin(time * floatSpeed + node.phase) * floatAmplitude;
        const floatY = Math.cos(time * floatSpeed + node.phase) * floatAmplitude;

        // Spring force to base position + float offset
        const springStrength = 0.05;
        const targetX = node.baseX + floatX;
        const targetY = node.baseY + floatY;

        const dxBase = targetX - node.x;
        const dyBase = targetY - node.y;

        node.vx += dxBase * springStrength;
        node.vy += dyBase * springStrength;

        // Mouse attraction
        const dxMouse = mouse.x - node.x;
        const dyMouse = mouse.y - node.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        // Interaction radius
        if (distMouse < 300) {
          const force = (300 - distMouse) / 300;
          const angle = Math.atan2(dyMouse, dxMouse);
          const attraction = 2 * force; // Stronger attraction to overcome spring

          node.vx += Math.cos(angle) * attraction;
          node.vy += Math.sin(angle) * attraction;
        }

        // Friction (Damping)
        node.vx *= 0.90;
        node.vy *= 0.90;

        node.x += node.vx;
        node.y += node.vy;

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      });

      // Draw connections and manage signals
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / connectionDistance;
            ctx.stroke();

            // Randomly fire signal
            if (Math.random() < 0.002) {
              signals.push({
                startNode: nodes[i],
                endNode: nodes[j],
                progress: 0,
              });
            }
          }
        }
      }

      // Update and draw signals
      for (let i = signals.length - 1; i >= 0; i--) {
        const signal = signals[i];
        signal.progress += signalSpeed / 100;

        if (signal.progress >= 1) {
          signals.splice(i, 1);
          continue;
        }

        const x = signal.startNode.x + (signal.endNode.x - signal.startNode.x) * signal.progress;
        const y = signal.startNode.y + (signal.endNode.y - signal.startNode.y) * signal.progress;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = signalColor;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Re-initialize nodes on resize to fit new screen
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none "
      style={{ opacity: 0.5 }}
    />
  );
};

export default NeuronAnimation;
