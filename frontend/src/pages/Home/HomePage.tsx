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
      <div className="fixed top-2 right-2 z-20 flex gap-2 p-1.5 rounded-full">
        <button
          type="button"
          onClick={() => {
            setActiveTab('teacher');
            navigate('/login');
          }}
          className={`shadow-lg backdrop-blur cursor-pointer px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'teacher'
              ? 'bg-gradient-to-r from-green to-green text-white'
              : 'text-green hover:text-violet border border-green'
          }`}
        >
          Login
        </button>
        {/* <button
          type="button"
          onClick={() => setActiveTab('student')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === 'student'
              ? 'bg-gradient-to-r from-green to-green text-white shadow-md'
              : 'text-green hover:text-violet border border-green'
          }`}
        >
          🎓 <span className="hidden sm:inline">Student?</span>
        </button> */}
      </div>

      {/* Page Content */}
      <div className="relative">
        {activeTab === 'teacher' ? <TeacherSection /> : <StudentSection />}
      </div>

    </NoLayout>
  );
}