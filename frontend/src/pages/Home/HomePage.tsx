import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import CursorAnimation from '../../components/CursorAnimation';
// import { AnimatePresence, motion } from 'framer-motion';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const neuralNetworkRef = useRef<HTMLDivElement>(null);

  // Neural Network Animation
  useEffect(() => {
    if (neuralNetworkRef.current) {
      neuralNetworkRef.current.innerHTML = '';
      const nodes: Array<{ x: number, y: number, connections: number[] }> = [];
      const nodeCount = 20;
      const width = neuralNetworkRef.current.offsetWidth;
      const height = neuralNetworkRef.current.offsetHeight;

      for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        const size = 4 + Math.random() * 2;
        const x = Math.random() * width;
        const y = Math.random() * height;

        node.className = 'absolute rounded-full bg-logoBlue';
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.opacity = '0.4';
        node.style.animation = `pulse 2s ease-in-out ${Math.random() * 2}s infinite`;

        neuralNetworkRef.current.appendChild(node);
        nodes.push({ x, y, connections: [] });
      }

      nodes.forEach((node, i) => {
        const connectionCount = 1 + Math.floor(Math.random() * 3);
        const connectedIndices = new Set<number>();

        while (connectedIndices.size < Math.min(connectionCount, nodes.length - 1)) {
          const randomIndex = Math.floor(Math.random() * nodes.length);
          if (randomIndex !== i) connectedIndices.add(randomIndex);
        }

        connectedIndices.forEach(targetIndex => {
          const targetNode = nodes[targetIndex];
          const connection = document.createElement('div');
          const length = Math.sqrt(Math.pow(targetNode.x - node.x, 2) + Math.pow(targetNode.y - node.y, 2));
          const angle = Math.atan2(targetNode.y - node.y, targetNode.x - node.x) * 180 / Math.PI;

          connection.className = 'absolute bg-gradient-to-r from-logoBlue to-logoSky';
          connection.style.width = `${length}px`;
          connection.style.height = '1px';
          connection.style.left = `${node.x}px`;
          connection.style.top = `${node.y}px`;
          connection.style.transformOrigin = '0 50%';
          connection.style.transform = `rotate(${angle}deg)`;
          connection.style.opacity = '0.2';

          neuralNetworkRef.current?.appendChild(connection);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/landing");
    }
  }, [navigate, isAuthenticated]);

  return (
    <SimpleLayout>
      <div className="relative min-h-screen text-slate-900 font-sans overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue dark:from-background dark:via-background dark:to-logoBlue">

        <CursorAnimation />

        {/* HERO SECTION */}
        <div className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden pt-24 pb-16 md:pt-40 md:pb-32 px-4 md:px-6">

          <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left Column: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 md:px-4 md:py-1.5 mb-6 md:mb-8 rounded-full border border-logoBlue bg-white text-logoBlue text-xs md:text-xs font-bold tracking-wide uppercase shadow-sm backdrop-blur-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-logoBlue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-logoBlue"></span>
                </span>
                The Future of Education is Personal
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-[1.2] md:leading-[1.1] text-slate-900 drop-shadow-sm">
                Your Personal <br />
                <span className="bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">Teaching Assistant</span>
              </h1>

              <p className="text-base md:text-xl text-slate-600 mb-8 md:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Now teacher's expertise will be available to all the students, all the time. Your 24/7 personal teaching assistant.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-full font-bold text-base md:text-lg transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-logoBlue shadow-md flex items-center justify-center gap-2 group"
                >
                  Start Teaching
                  <i className="fi fi-rr-arrow-right flex items-center justify-center group-hover:translate-x-1 transition-transform"></i>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-white border border-slate-200 hover:border-logoBlue hover:text-logoBlue text-slate-600 rounded-full font-bold text-base md:text-lg transition-all backdrop-blur-sm hover:bg-white shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-play-circle flex items-center justify-center text-lg md:text-xl"></i>
                  Watch Demo
                </button>
              </div>

              <div className="mt-8 md:mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden`}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+2k</div>
                </div>
                <p>Trusted by 2,000+ educators</p>
              </div>
            </div>

            {/* Right Column: Interactive Mockup (Hidden on mobile) */}
            <div className="relative hidden lg:block perspective-1000">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-logoBlue to-logoViolet rounded-full pointer-events-none" style={{ filter: 'blur(100px)' }}></div>

              {/* Main Card */}
              <div className="relative bg-white backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-6 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500 ease-out">
                {/* Header Mockup */}
                <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-logoBlue to-logoViolet flex items-center justify-center text-white shadow-lg">
                      <i className="fi fi-rr-microchip-ai flex items-center justify-center"></i>
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-slate-800 rounded mb-1"></div>
                      <div className="h-3 w-20 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                  </div>
                </div>

                {/* Content Mockup - Chat */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-logoPink flex-shrink-0 flex items-center justify-center text-white text-xs">S</div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 shadow-sm border border-slate-100 max-w-[80%]">
                      Help! I don't understand Quantum Numbers. Can you explain with an example?
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-logoBlue flex-shrink-0 flex items-center justify-center text-white text-xs">AI</div>
                    <div className="bg-gradient-to-br from-logoSky to-logoPurple p-4 rounded-2xl rounded-tr-none text-sm text-white shadow-md max-w-[90%]">
                      <p className="mb-2">Sure! Think of an electron's address in an atom like your home address:</p>
                      <ul className="list-disc pl-4 space-y-1 text-white text-xs">
                        <li><b>Principal (n)</b>: The City (Shell)</li>
                        <li><b>Azimuthal (l)</b>: The Street (Subshell)</li>
                        <li><b>Magnetic (m)</b>: The House Number (Orbital)</li>
                        <li><b>Spin (s)</b>: You (Rotation)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                      <i className="fi fi-rr-check flex items-center justify-center"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Accuracy</p>
                      <p className="text-lg font-bold text-slate-800">99.8%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-logoBlue">
                      <i className="fi fi-rr-clock-five flex items-center justify-center"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Avg Response</p>
                      <p className="text-lg font-bold text-slate-800">0.2s</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* LOGO MARQUEE */}
        <div className="border-y border-slate-200 bg-white backdrop-blur-sm overflow-hidden py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 md:mb-8">Trusted by the experienced</p>

            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
              <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scroll">
                {[...Array(2)].map((_, setIndex) => (
                  ['Viraaz Academy', 'Physics Masters', 'Quantum classess', 'Maths Equations', 'Focus Coaching', 'Chemistry Classes'].map((name, i) => (
                    <li key={`${setIndex}-${i}`} className="flex items-center gap-2 text-lg md:text-xl font-bold text-slate-800/50 whitespace-nowrap mx-8">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-logoPink to-logoPurple rounded-full"></div>
                      {name}
                    </li>
                  ))
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* STATS STRIP */}
        <div className="py-12 md:py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-logoBlue to-logoViolet"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {[
                { label: 'Active Students', value: '10,000+' },
                { label: 'Doubts Solved', value: '5 Million+' },
                { label: 'Teacher Hours Saved', value: '500k+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <div key={i} className="p-2 md:p-4">
                  <div className="text-2xl lg:text-5xl font-bold mb-1 md:mb-2 bg-white bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs lg:text-base text-whiteuppercase tracking-wide font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROBLEM SECTION - The 1:1 Crisis */}
        <div className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6">The 1:1 Attention Crisis</h2>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Teachers are overwhelmed. Students are isolated. The gap is growing.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
              {/* Teacher's Dilemma */}
              <div className="bg-white rounded-3xl p-6 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden group hover:border-logoBlue hover:shadow-2xl hover:shadow-logoBlue transition-all duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <i className="fi fi-rr-clock flex items-center justify-center text-sm md:text-base text-logoBlue"></i>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <span className="p-3 md:p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 shadow-sm">
                      <i className="fi fi-sr-workshop text-2xl md:text-3xl flex items-center justify-center"></i>
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900">The Teacher's Dilemma</h3>
                  </div>
                  <blockquote className="text-base md:text-lg text-slate-600 italic mb-6 md:mb-8 border-l-4 border-red-200 pl-4 md:pl-6 py-2">
                    "I have 150 students. I wish I could spend more time with each one, but there aren't enough hours in the day."
                  </blockquote>
                  <ul className="space-y-3 md:space-y-4">
                    {[
                      "60+ hours/week preparing & grading",
                      "No personal time evenings/weekends",
                      "Guilt of leaving doubts unanswered",
                      "Lost context on individual student gaps"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm md:text-base">
                        <i className="fi fi-rr-cross-circle text-red-500 mt-1 flex items-center justify-center"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Student's Struggle */}
              <div className="bg-white rounded-3xl p-6 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden group hover:border-logoViolet hover:shadow-2xl hover:shadow-logoViolet transition-all duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <i className="fi fi-rr-backpack text-sm md:text-base text-logoViolet flex items-center justify-center"></i>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <span className="p-3 md:p-4 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100 shadow-sm">
                      <i className="fi fi-rr-student text-2xl md:text-3xl flex items-center justify-center"></i>
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900">The Student's Struggle</h3>
                  </div>
                  <blockquote className="text-base md:text-lg text-slate-600 italic mb-6 md:mb-8 border-l-4 border-orange-200 pl-4 md:pl-6 py-2">
                    "I'm stuck on this problem at 9 PM before my exam. My teacher is offline. I feel alone."
                  </blockquote>
                  <ul className="space-y-3 md:space-y-4">
                    {[
                      "Limited 1:1 access (45 mins/week shared)",
                      "Fear of asking 'dumb' questions",
                      "Late night doubts go unresolved",
                      "Generic help doesn't match teacher's style"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm md:text-base">
                        <i className="fi fi-rr-cross-circle text-orange-500 mt-1 flex items-center justify-center"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOLUTION SECTION - How it Works */}
        <div id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-20">
              <span className="text-logoBlue font-bold tracking-wider uppercase text-xs md:text-sm bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-logoBlue">How It Works</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-6 md:mt-8 mb-4 md:mb-6 text-slate-900">Meet Your AI Twin</h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Scale your personality, teaching style, and expertise infinitely in 3 simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-40 left-4 right-4 h-0.5 bg-gradient-to-r from-logoBlue via-logoViolet to-logoBlue border-t-2 border-dashed border-slate-200"></div>

              {[
                {
                  icon: "fi-rr-cloud-upload-alt",
                  title: "1. Upload Content",
                  desc: "Upload notes, videos, & past lectures. It absorbs your tone, methods, and examples."
                },
                {
                  icon: "fi-rr-brain-circuit",
                  title: "2. AI Trains",
                  desc: "Our engine creates a digital twin that thinks and explains exactly like you."
                },
                {
                  icon: "fi-rr-rocket-lunch",
                  title: "3. Students Learn",
                  desc: "Whether you're strict or Socratic, your Twin mirrors it 24/7 for every student."
                }
              ].map((feature, i) => (
                <div key={i} className="relative bg-white p-6 md:p-8 rounded-3xl border border-slate-100 hover:border-logoBlue shadow-lg hover:shadow-xl transition-all group hover:-translate-y-2 text-center z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4 md:mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-logoBlue to-logoViolet opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
                    <i className={`fi ${feature.icon} flex items-center justify-center text-3xl md:text-4xl text-logoBlue group-hover:scale-110 transition-transform`}></i>
                    <div className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-slate-900 group-hover:text-logoBlue transition-colors">{feature.title}</h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight">Multiply Yourself.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-logoBlue to-logoViolet">Reclaim Your Time.</span></h2>
                <p className="text-base md:text-lg text-slate-600 mb-8 md:mb-10 leading-relaxed">
                  Stop repeating yourself. Your AI Twin handles the repetitive 80% so you can focus on the impactful 20%—mentorship and motivation.
                </p>

                <div className="space-y-4 md:space-y-6">
                  {[
                    {
                      title: "Instant Doubt Resolution",
                      desc: "Students can chat with their teacher 24/7. Your Twin answers instantly in your style.",
                      icon: "fi-rr-comment-alt"
                    },
                    {
                      title: "Deep Student Insights",
                      desc: "Know exactly who is falling behind. Track weak areas and engagement.",
                      icon: "fi-rr-chart-histogram"
                    },
                    {
                      title: "Quick Content Creation",
                      desc: "Generate quizzes & notes from your material in seconds.",
                      icon: "fi-rr-magic-wand"
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-logoBlue transition-all cursor-default relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-logoBlue to-logoViolet flex items-center justify-center text-white text-xl md:text-2xl shadow-lg relative z-10">
                        <i className={`fi ${item.icon} flex items-center justify-center`}></i>
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">{item.title}</h4>
                        <p className="text-sm md:text-base text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side Visual */}
              <div className="relative order-1 lg:order-2 mb-10 lg:mb-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-logoBlue to-logoViolet rounded-xl transform rotate-6 scale-95 opacity-20 blur-xl"></div>
                <div className="relative bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 text-white p-4 md:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-400"></div>
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs md:text-xs font-mono text-slate-400">maiind-analytics.exe</div>
                  </div>
                  <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                    {/* Chart Mockup */}
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-xs md:text-sm text-slate-400 uppercase font-bold">Student Engagement</p>
                          <h3 className="text-2xl md:text-3xl font-bold text-slate-800">Top 5%</h3>
                        </div>
                        <div className="text-green-500 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg text-xs md:text-sm">
                          <i className="fi fi-rr-arrow-trend-up flex items-center justify-center"></i> +12.5%
                        </div>
                      </div>
                      <div className="h-32 md:h-40 flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-logoBlue rounded-t-lg relative group overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-full bg-logoBlue transition-all duration-1000 ease-out" style={{ height: `${h}%` }}></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* List Mockup */}
                    <div className="space-y-3 md:space-y-4">
                      <p className="text-xs md:text-sm text-slate-400 uppercase font-bold">Recent Activities</p>
                      {[
                        { text: 'Rahul solved 15 Physics problems', time: '2m ago', icon: 'fi-rr-pencil' },
                        { text: 'Priya watched Lecture 4 (Thermodynamics)', time: '15m ago', icon: 'fi-rr-play-alt' },
                        { text: 'AI Twin explained "Doppler Effect" to Amit', time: '1h ago', icon: 'fi-rr-comment-alt' },
                      ].map((to, i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <i className={`fi ${to.icon} text-sm md:text-base flex items-center justify-center`}></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs md:text-sm font-medium text-slate-700">{to.text}</p>
                            <p className="text-xs md:text-xs text-slate-400">{to.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* PRICING SECTION */}
        <div id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-logoBlue font-bold tracking-wider uppercase text-xs md:text-sm bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-logoBlue">Pricing</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-6 md:mt-8 mb-4 md:mb-6 text-slate-900">Simple, Transparent Pricing</h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Start for free and scale as you grow. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* Free Tier */}
              <div className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
                <div className="mb-6">
                  <div className="text-xl font-bold text-slate-900 mb-2">Starter</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">Free</span>
                    <span className="text-slate-500">/ forever</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Perfect for individual teachers just starting out.</p>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    "Up to 10 Students",
                    "Basic AI Assistance Twin",
                    "Limited Q&A Per Day",
                    "Web Access"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <i className="fi fi-rr-check-circle text-logoBlue"></i>
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 px-6 rounded-xl border border-slate-200 text-slate-700 font-bold hover:border-logoBlue hover:text-logoBlue hover:bg-white transition-all bg-slate-50"
                >
                  Get Started
                </button>
              </div>

              {/* Pro Tier */}
              <div className="relative bg-white text-slate-800 p-8 rounded-3xl shadow-2xl transform md:-translate-y-4 border border-logoBlue">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-gradient-to-r from-logoBlue to-logoViolet text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</span>
                </div>
                <div className="mb-6">
                  <div className="text-xl font-bold mb-2">Growth</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">₹10k</span>
                    <span className="">/ month</span>
                  </div>
                  <p className="text-sm mt-2">For serious educators scaling their impact.</p>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    "Up to 100 Students",
                    "Advanced AI Assistance Personality",
                    "Priority Support",
                    "WhatsApp Integration",
                    "Analytics Dashboard",
                    "Custom Branding"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <i className="fi fi-rr-check-circle text-logoBlue flex items-center justify-center"></i>
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-logoBlue to-logoViolet hover:shadow-lg hover:shadow-logoBlue/25 text-white font-bold transition-all transform hover:scale-105"
                >
                  Start Free Trial
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
                <div className="mb-6">
                  <div className="text-xl font-bold text-slate-900 mb-2">Enterprise</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">Custom</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">For institutes and large coaching centers.</p>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    "Unlimited Students",
                    "Multiple Teacher Accounts",
                    "API Access",
                    "White-label Solution",
                    "Dedicated Success Manager",
                    "SLA Support"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <i className="fi fi-rr-check-circle text-logoBlue"></i>
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => window.open('mailto:sales@maiind.ai')}
                  className="w-full py-3 px-6 rounded-xl border border-slate-200 text-slate-700 font-bold hover:border-logoBlue hover:text-logoBlue hover:bg-white transition-all bg-slate-50"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="py-16 md:py-24 px-4 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-base md:text-lg text-slate-600">Everything you need to know about cloning yourself.</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              {[
                { q: "How does the AI learn my teaching style?", a: "You simply upload your existing notes, PDFS, and video lectures. Our advanced engine analyzes not just the content, but your tone, common analogies, and problem-solving methods." },
                { q: "Is my content secure?", a: "Absolutely. Your data is encrypted and isolated. Your AI Twin is trained exclusively on your material and does not share knowledge with other teachers' twins." },
                { q: "Can I monitor the answers?", a: "Yes! You have a full dashboard where you can see every interaction. You can flag or correct any answer, and the AI learns from your feedback instantly." },
                { q: "What if the AI doesn't know the answer?", a: "If the AI determines a question is outside its knowledge base or too ambiguous, it will seamlessly flag it for your manual review, ensuring students never get wrong information." },
              ].map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </div>

        {/* SOCIAL PROOF - Testimonials */}
        <div className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 md:mb-16">Trusted by Innovative Educators</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-8">
              {[
                {
                  quote: "I finally have time to actually mentor my struggling students instead of answering 'What is the formula?' for the 50th time.",
                  author: "Priya M.",
                  role: "NEET Faculty, Mumbai"
                },
                {
                  quote: "My students love that they can ask me questions at midnight. Well, not me—my AI Twin. I'm sleeping peacefully!",
                  author: "Rajesh K.",
                  role: "IIT-JEE Math, Kota"
                },
                {
                  quote: "For the first time in 10 years, I took a weekend off without guilt. My AI Twin handled all the doubts.",
                  author: "Anjali S.",
                  role: "CBSE Physics, Bengaluru"
                }
              ].map((testimonial, i) => (
                <div key={i} className="flex flex-col justify-between bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 text-left hover:-translate-y-2 transition-transform duration-300 relative">
                  <div className="absolute -top-4 md:-top-6 left-6 md:left-8 bg-logoBlue text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-3xl md:text-4xl font-serif shadow-lg">"</div>
                  <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 italic leading-relaxed pt-4 md:pt-6">{testimonial.quote}</p>
                  <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-logoBlue to-logoViolet text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md">
                      {testimonial.author[0]}
                    </div>
                    <div className="">
                      <div className="font-bold text-slate-900 text-sm md:text-base">{testimonial.author}</div>
                      <div className="text-xs md:text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="py-20 md:py-32 px-4 md:px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white rounded-full transform scale-150" style={{ filter: 'blur(100px)' }}></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">Ready to Clone Yourself?</h2>
            <p className="text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto">
              Join 500+ teachers who've reclaimed their time without compromising student success.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 md:px-12 md:py-6 bg-gradient-to-r from-logoBlue to-logoViolet hover:from-white hover:to-white hover:text-slate-900 text-white rounded-full font-bold text-lg md:text-xl transition-all shadow-2xl hover:scale-105 hover:shadow-white"
            >
              Start Teaching Smarter
            </button>
            <p className="mt-6 md:mt-8 text-xs md:text-sm font-medium">No credit card required • Cancel anytime • 14-day free trial</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-1">
          <p className="text-xs">All Rights Reserved © {new Date().getFullYear()} MAIIND</p>
        </div>

      </div>
    </SimpleLayout>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="text-lg font-bold text-slate-800">{question}</span>
        <i className={`fi fi-rr-angle-down flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
          {answer}
        </div>
      </div>
    </div>
  );
}