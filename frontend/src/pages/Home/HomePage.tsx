import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NoLayout } from '../../layouts/AppLayout';
import { TeacherSection } from './TeacherSection';
import { StudentSection } from './StudentSection';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const navigate = useNavigate();
  const {isAuthenticated} = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const neuralNetworkRef = useRef<HTMLDivElement>(null);

  // Neural Network Animation
  useEffect(() => {
      // Clear any existing nodes
      if (neuralNetworkRef.current) {
        neuralNetworkRef.current.innerHTML = '';
        
        // Create nodes
        const nodes: Array<{x: number, y: number, connections: number[]}> = [];
        const nodeCount = 20; // Reduced number for better performance
        const width = neuralNetworkRef.current.offsetWidth;
        const height = neuralNetworkRef.current.offsetHeight;
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
          const node = document.createElement('div');
          const size = 4 + Math.random() * 2; // Random size between 4-6px
          const x = Math.random() * width;
          const y = Math.random() * height;
          
          node.className = 'absolute rounded-full bg-white';
          node.style.width = `${size}px`;
          node.style.height = `${size}px`;
          node.style.left = `${x}px`;
          node.style.top = `${y}px`;
          node.style.opacity = '0.3';
          node.style.animation = `pulse 2s ease-in-out ${Math.random() * 2}s infinite`;
          
          neuralNetworkRef.current.appendChild(node);
          nodes.push({x, y, connections: []});
        }
        
        // Create connections between nodes
        nodes.forEach((node, i) => {
          // Connect to 1-3 other nodes
          const connectionCount = 1 + Math.floor(Math.random() * 3);
          const connectedIndices = new Set<number>();
          
          while (connectedIndices.size < Math.min(connectionCount, nodes.length - 1)) {
            const randomIndex = Math.floor(Math.random() * nodes.length);
            if (randomIndex !== i) {
              connectedIndices.add(randomIndex);
            }
          }
          
          connectedIndices.forEach(targetIndex => {
            const targetNode = nodes[targetIndex];
            const connection = document.createElement('div');
            const length = Math.sqrt(
              Math.pow(targetNode.x - node.x, 2) + 
              Math.pow(targetNode.y - node.y, 2)
            );
            const angle = Math.atan2(
              targetNode.y - node.y,
              targetNode.x - node.x
            ) * 180 / Math.PI;
            
            connection.className = 'absolute bg-gradient-to-r from-white/20 to-white/10';
            connection.style.width = `${length}px`;
            connection.style.height = '1px';
            connection.style.left = `${node.x}px`;
            connection.style.top = `${node.y}px`;
            connection.style.transformOrigin = '0 50%';
            connection.style.transform = `rotate(${angle}deg)`;
            connection.style.opacity = '0.1';
            
            neuralNetworkRef.current?.appendChild(connection);
          });
        });
      }
    }, []);

    useEffect(() => {
      if (isAuthenticated) {
        navigate("/landing")
      }
    },[navigate, isAuthenticated])
  return (
    <NoLayout>
      {/* Page Switcher */}
      <div className="fixed top-2 right-2 z-20 flex gap-2 bg-white blur-sm backdrop-blur p-1.5 rounded-full border border-green shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('teacher')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'teacher'
              ? 'bg-gradient-to-r from-green to-green text-white shadow-md'
              : 'text-green hover:text-violet border border-green'
          }`}
        >
          👨‍🏫 <span className="hidden sm:inline">Teacher?</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('student')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'student'
              ? 'bg-gradient-to-r from-green to-green text-white shadow-md'
              : 'text-green hover:text-violet border border-green'
          }`}
        >
          🎓 <span className="hidden sm:inline">Student?</span>
        </button>
      </div>

      {/* Page Content */}
      <div className="relative">
        {activeTab === 'teacher' ? <TeacherSection /> : <StudentSection />}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .twinkle {
          animation: twinkle 3s infinite;
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.5);
            opacity: 0.8;
          }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        /* For Webkit browsers like Chrome, Safari */
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.5em;
          padding-right: 2.5rem;
        }
      `}</style>
    </NoLayout>
  );
}