import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import CursorAnimation from '../../components/CursorAnimation';

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

        // Changed to logoBlue for new theme
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

          // Changed to logoBlue gradient for new theme
          connection.className = 'absolute bg-gradient-to-r from-logoBlue/30 to-logoBlue/10';
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
      <div className="relative min-h-screen text-slate-900 font-sans overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-logoBlue/10 dark:from-background dark:via-background dark:to-logoBlue/5">

        <CursorAnimation />

        {/* HERO SECTION */}
        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-24 md:py-32">
          <div ref={neuralNetworkRef} className="absolute inset-0 z-0 opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block bg-white px-4 py-1.5 mb-6 rounded-full border border-logoBlue/30 bg-logoBlue/10 text-logoBlue text-sm font-bold tracking-wide uppercase shadow-sm backdrop-blur-sm">
              The Future of Education is Personal
            </div>
            <h1 className="text-5xl md:text-5xl font-bold tracking-tight mb-8 leading-tight text-slate-900 drop-shadow-sm">
              Your Personal <br /> <span className="text-7xl md:text-8xl bg-gradient-to-r from-logoBlue to-logoViolet bg-clip-text text-transparent">Teaching Assistant</span>
            </h1>
            <p className="text-md md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Provide teaching assistance to all your students, all the time, anytime. Get your personal teaching assistant let your student have your teachings 24x7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-logoBlue/25 shadow-md"
              >
                Create Your AI Twin
              </button>
              <button className="px-8 py-4 bg-white border border-slate-300 hover:border-logoBlue hover:text-logoBlue text-slate-600 rounded-full font-bold text-lg transition-all backdrop-blur-sm hover:bg-white/80">
                See How It Works
              </button>
            </div>
          </div>
        </div>

        {/* PROBLEM SECTION - The 1:1 Crisis */}
        <div className="py-12 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-4 md:mb-16">
              <h2 className="text-2xl md:text-5xl font-bold text-slate-900 mb-4">The 1:1 Attention Crisis</h2>
              <p className="text-md md:text-lg text-slate-600 max-w-2xl mx-auto">Teachers are overwhelmed. Students are isolated. The gap is growing.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-stretch">
              {/* Teacher's Dilemma */}
              <div className="bg-white backdrop-blur-xl rounded-3xl p-4 md:p-10 border border-white relative overflow-hidden group hover:border-logoBlue shadow-lg hover:shadow-xl hover:shadow-logoBlue transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <i className="fi fi-rr-clock text-9xl text-logoBlue"></i>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 shadow-sm">
                      <i className="fi fi-sr-workshop text-2xl"></i>
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900">The Teacher's Dilemma</h3>
                  </div>
                  <blockquote className="text-sm md:text-lg text-slate-600 italic mb-8 border-l-4 border-red-200 pl-4 bg-red-50/30 py-2 rounded-r-lg">
                    "I have 150 students. I wish I could spend more time with each one, but there aren't enough hours in the day."
                  </blockquote>
                  <ul className="space-y-4">
                    {[
                      "60+ hours/week preparing & grading",
                      "No personal time evenings/weekends",
                      "Guilt of leaving doubts unanswered",
                      "Lost context on individual student gaps"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm md:text-md">
                        <i className="fi fi-rr-cross-circle text-red-400 mt-1"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Student's Struggle */}
              <div className="bg-white backdrop-blur-xl rounded-3xl p-4 md:p-10 border border-white relative overflow-hidden group hover:border-logoViolet shadow-lg hover:shadow-xl hover:shadow-logoViolet transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <i className="fi fi-rr-backpack text-9xl text-logoViolet"></i>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-3 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100 shadow-sm">
                      <i className="fi fi-rr-student text-2xl"></i>
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900">The Student's Struggle</h3>
                  </div>
                  <blockquote className="text-sm md:text-lg text-slate-600 italic mb-8 border-l-4 border-orange-200 pl-4 bg-orange-50/30 py-2 rounded-r-lg">
                    "I'm stuck on this problem at 9 PM before my exam. My teacher is offline. I feel alone."
                  </blockquote>
                  <ul className="space-y-4">
                    {[
                      "Limited 1:1 access (45 mins/week shared)",
                      "Fear of asking 'dumb' questions",
                      "Late night doubts go unresolved",
                      "Generic help doesn't match teacher's style"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm md:text-md">
                        <i className="fi fi-rr-cross-circle text-orange-400 mt-1"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOLUTION SECTION */}
        <div className="py-12 md:py-32 px-6 relative overflow-hidden">
          {/* <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-[50%] -left-[20%] w-[1000px] h-[1000px] rounded-full bg-logoBlue/10 blur-[120px]"></div>
          </div> */}

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-4 md:mb-20">
              <span className="text-white font-bold tracking-wider uppercase text-sm bg-logoBlue px-3 py-1 rounded-full border border-logoBlue">The Solution</span>
              <h2 className="text-2xl md:text-5xl font-bold mt-6 mb-6 text-slate-900">Meet Your AI Twin</h2>
              <p className="text-md md:text-lg text-slate-600 max-w-2xl mx-auto">
                Scale your personality, teaching style, and expertise infinitely.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "fi-rr-brain-circuit",
                  title: "Learns Your Style",
                  desc: "Upload notes & videos. It absorbs your tone, methods, and examples."
                },
                {
                  icon: "fi-rr-infinity",
                  title: "Maintains Continuity",
                  desc: "Students get answers that feel like YOU. No conflicting methods."
                },
                {
                  icon: "fi-rr-rocket-lunch",
                  title: "Scales Impact",
                  desc: "Whether you're strict or Socratic, your Twin mirrors it 24/7."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white backdrop-blur-xl border border-white p-8 rounded-3xl hover:border-logoBlue hover:shadow-xl hover:shadow-logoBlue transition-all group duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-logoBlue to-logoViolet rounded-2xl flex items-center justify-center text-white text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white">
                    <i className={`fi ${feature.icon}`}></i>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-slate-900 group-hover:text-logoBlue transition-colors">{feature.title}</h3>
                  <p className="text-sm md:text-md text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="py-12 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-2xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">Multiply Yourself.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-logoBlue to-logoViolet">Reclaim Your Time.</span></h2>
                <p className="text-md md:text-lg text-slate-600 mb-8 leading-relaxed">
                  Stop repeating yourself. Your AI Twin handles the repetitive 80% so you can focus on the impactful 20%—mentorship and motivation.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      title: "Instant Doubt Resolution",
                      desc: "Students ask via WhatsApp/Chat. Your Twin answers instantly in your style.",
                      icon: "fi-rr-comment-alt flex items-center justify-center"
                    },
                    {
                      title: "Deep Student Insights",
                      desc: "Know exactly who is falling behind. Track weak areas and engagement.",
                      icon: "fi-rr-chart-histogram flex items-center justify-center"
                    },
                    {
                      title: "Instant Content Creation",
                      desc: "Generate quizzes & notes from your material in seconds.",
                      icon: "fi-rr-magic-wand flex items-center justify-center"
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 bg-white p-4 rounded-2xl border border-transparent hover:border-logoBlue hover:bg-white transition-all">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-logoBlue to-logoViolet flex items-center justify-center text-white text-xl shadow-md">
                        <i className={`fi ${item.icon}`}></i>
                      </div>
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-slate-600 text-sm md:text-md">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-logoBlue to-logoViolet rounded-3xl transform rotate-3 blur-2xl opacity-70"></div>
                <div className="relative bg-white backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-8">
                  {/* Mock UI for Trust */}
                  <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                    <div>
                      <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-slate-50 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex-shrink-0"></div>
                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-600 max-w-[80%] border border-slate-100 shadow-sm">
                        Sir, I'm stuck on the projectile motion problem from today's class.
                      </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-logoBlue flex-shrink-0 border-2 border-logoBlue overflow-hidden">
                        <i className="fi fi-rr-microchip-ai text-white w-full h-full flex items-center justify-center text-sm"></i>
                      </div>
                      <div className="bg-gradient-to-br from-logoBlue to-logoViolet p-3 rounded-2xl rounded-tr-none text-xs text-slate-800 max-w-[80%] shadow-sm border border-logoBlue opacity-80">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white text-xs uppercase tracking-wide">Physics sir Twin</p>
                        </div>
                        Remember the "H-R-T" shortcut I taught? Height, Range, Time. Apply the vertical component first...
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                    <span>Replied in 0.2s</span>
                    <span className="flex items-center justify-center gap-2 font-medium text-logoBlue"><i className="fi fi-rr-check-double flex items-center justify-center"></i> Verified by Physics sir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL PROOF */}
        <div className="py-12 md:py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Trusted by Educators</h2>
            <div className="grid md:grid-cols-3 gap-8">
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
                <div key={i} className="bg-white backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-xl border border-white text-left transition-all hover:-translate-y-1">
                  <div className="text-logoBlue text-4xl mb-4 opacity-50 font-serif">"</div>
                  <p className="text-sm md:text-md text-slate-600 mb-6 italic leading-relaxed">{testimonial.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-logoBlue to-logoViolet text-white flex items-center justify-center font-bold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="text-sm md:text-md font-bold text-slate-900">{testimonial.author}</div>
                      <div className="text-xs md:text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-12 md:py-32 px-6 text-center relative overflow-hidden">
          {/* <div className="absolute inset-0 bg-logoBlue/5 pointer-events-none"></div> */}
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-2xl md:text-5xl font-bold mb-6 text-slate-900">Ready to Clone Yourself?</h2>
            <p className="text-sm md:text-lg text-slate-600 mb-10">
              Join 500+ teachers who've reclaimed their time without compromising student success.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-5 bg-gradient-to-r from-logoBlue to-logoViolet hover:shadow-logoBlue text-white rounded-full font-bold text-xl transition-all shadow-lg hover:scale-105"
            >
              Start Teaching Smarter
            </button>
            <p className="mt-6 text-sm text-slate-500 font-medium">No credit card required • Cancel anytime</p>
          </div>
        </div>

      </div>
    </SimpleLayout>
  );
}