import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FullLayout } from '../../layouts/AppLayout';
import { useTheme } from '../../hooks/useTheme';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const { toggleTheme } = useTheme();
  const featureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useEffect(() => {
    // Typing animation for hero text
    const heroText = 'DOOH Auditing & Monitoring Platform';
    const heroElement = document.querySelector('.hero-text');
    
    if (!heroElement) return;
    
    heroElement.textContent = ''; // Clear the text initially
    
    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'inline-block w-1 h-12 bg-[var(--primary)] ml-1 align-middle animate-blink';
    
    // Create a container for the text to avoid cursor jumping
    const textContainer = document.createElement('span');
    heroElement.appendChild(textContainer);
    heroElement.appendChild(cursor);
    
    let timeoutId: NodeJS.Timeout;
    const animationFrame = requestAnimationFrame(() => {
      timeoutId = setTimeout(typeWriter, 500);
    });
    let i = 0;
    
    const typeWriter = () => {
      if (i < heroText.length) {
        const char = document.createTextNode(heroText[i]);
        textContainer.appendChild(char);
        i++;
        timeoutId = setTimeout(typeWriter, 50); // Typing speed (ms)
      } else {
        // Remove cursor when done
        cursor.remove();
        // Animate other elements after typing is done
        gsap.fromTo(
          '.hero-subtitle, .hero-buttons',
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
          }
        );
      }
    };
    
    // Animation starts automatically due to requestAnimationFrame

    // Features animation
    featureRefs.current.forEach((feature, i) => {
      if (!feature) return;
      
      gsap.fromTo(
        feature,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: feature,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.2
        }
      );
    });

    // CTA animation
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
      // Remove cursor if it exists
      if (cursor.parentNode === heroElement) {
        heroElement.removeChild(cursor);
      }

      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);


  return (
    <FullLayout>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-[var(--background)] to-[var(--background-alt)]">
        <div className="max-w-5xl mx-auto hero-content">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[var(--text)] min-h-[84px] md:min-h-[112px] flex items-center justify-center">
            <span className="hero-text"></span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-[var(--text-muted)] mb-10 max-w-3xl mx-auto opacity-0">
            Advanced AI-powered verification, real-time monitoring, and actionable insights at a fraction of enterprise costs.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-8 py-3 bg-[var(--primary)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-8 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors font-medium"
            >
              Learn More
            </button>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--text)]">1–2 weeks to launch</div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--text)]">80% features at 30% cost</div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--text)]">AI-powered verification</div>
          </div>
        </div>
      </section>

      {/* Competitive Positioning & Executive Summary */}
      <section className="py-16 px-4 bg-[var(--background-alt)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--text)]">
              Competitive Positioning & Market Analysis
            </h2>
            <p className="text-center text-[var(--text-muted)] max-w-3xl mx-auto">
              Market Opportunity: ₹6.9 lakh crore DOOH market growing at 12% annually, with verification representing a ₹4,250+ crore addressable market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--background)] p-6 rounded-xl shadow" ref={(el) => { if (el) featureRefs.current[0] = el; return undefined; }}>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">The Challenge</h3>
              <p className="text-[var(--text-muted)]">
                DOOH campaigns lack reliable verification, leading to wasted ad spend, brand compliance issues, and client disputes.
              </p>
            </div>
            <div className="bg-[var(--background)] p-6 rounded-xl shadow" ref={(el) => { if (el) featureRefs.current[1] = el; return undefined; }}>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Our Solution</h3>
              <p className="text-[var(--text-muted)]">
                Advanced AI-powered auditing platform that provides real-time campaign monitoring, comprehensive reporting, and actionable insights at a fraction of enterprise costs.
              </p>
            </div>
            <div className="bg-[var(--background)] p-6 rounded-xl shadow" ref={(el) => { if (el) featureRefs.current[2] = el; return undefined; }}>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Market Opportunity</h3>
              <p className="text-[var(--text-muted)]">
                $8.2B market growing at 12% annually. Verification is a $500M+ opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Landscape Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--text)]">Competitive Landscape Overview</h3>
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <div className="grid grid-cols-3 bg-[var(--background)] text-[var(--text-secondary)] text-sm font-semibold">
              <div className="p-3">Category</div>
              <div className="p-3">Market Position</div>
              <div className="p-3">Key Focus</div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              <div className="grid grid-cols-3">
                <div className="p-3">Enterprise Platforms</div>
                <div className="p-3">Established, expensive</div>
                <div className="p-3">Full-stack programmatic + verification</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="p-3">CMS-Integrated Solutions</div>
                <div className="p-3">Content management focus</div>
                <div className="p-3">Basic monitoring as add-on feature</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="p-3">Specialized Auditing</div>
                <div className="p-3">Our Position</div>
                <div className="p-3">Pure-play verification & compliance</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="p-3">Regional/Niche Players</div>
                <div className="p-3">Limited scope</div>
                <div className="p-3">Specific geography or vertical</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Competitor Analysis removed to keep landing concise */}

      {/* Feature Comparison Matrix */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--text)]">Feature Comparison Matrix</h3>
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--bg-secondary)]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Feature</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Our Platform</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Veridooh</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Quividi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Vistar</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">CMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Real-time Monitoring</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Yes</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Yes</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Yes</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Limited</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ None</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Image Analysis</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5">✅ AI-Powered</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Standard</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ Limited</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Basic</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ None</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Log Report Auditing</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Yes</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Yes</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ No</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Basic</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Limited</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Custom Reporting</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5">✅ Unlimited</span></td>
                    <td className="px-4 py-3">Comprehensive</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Limited</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ Basic</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Template-based</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Compliance Checking</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Automated</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Manual</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ No</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ No</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ No</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Multi-Network Support</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Unlimited</span></td>
                    <td className="px-4 py-3">✅ Yes</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Limited</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ Vistar Only</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ Single Network</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">API Access</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5">✅ Full API</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5">⚠ Limited</span></td>
                    <td className="px-4 py-3">✅ Yes</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5">❌ No</span></td>
                    <td className="px-4 py-3">Restricted</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-3 font-medium">Setup Time</td>
                    <td className="px-4 py-3">1–2 weeks</td>
                    <td className="px-4 py-3">3–6 months</td>
                    <td className="px-4 py-3">2–4 months</td>
                    <td className="px-4 py-3">1–3 months</td>
                    <td className="px-4 py-3">2–6 weeks</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm">
              Note: ⚠ indicates limited or basic capability. ❌ indicates unavailable.
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & ROI */}
      <section className="py-16 px-4 bg-[var(--background-alt)]">
        <div className="max-w-7xl mx-auto space-y-8">
          <h3 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Pricing Model & ROI</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
              <h4 className="font-semibold text-[var(--text)] mb-2">Small Agency (50 screens)</h4>
              <p className="text-[var(--text-muted)]">Our Platform: ₹25,000/month</p>
              <p className="text-[var(--text-muted)]">CMS Solutions: ₹42,500–₹1,70,000</p>
            </div>
            <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
              <h4 className="font-semibold text-[var(--text)] mb-2">Mid-Market (500 screens)</h4>
              <p className="text-[var(--text-muted)]">Our Platform: ₹1,27,000/month</p>
              <p className="text-[var(--text-muted)]">Veridooh: ₹6,80,000–₹12,75,000</p>
              <p className="text-[var(--text-muted)]">Quividi: ₹4,25,000–₹10,20,000</p>
            </div>
            <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
              <h4 className="font-semibold text-[var(--text)] mb-2">Enterprise (5000+ screens)</h4>
              <p className="text-[var(--text-muted)]">Our Platform: ₹4,25,000/month</p>
              <p className="text-[var(--text-muted)]">Veridooh: ₹21,25,000+</p>
              <p className="text-[var(--text-muted)]">Quividi: ₹17,00,000+</p>
              <p className="text-[var(--text-muted)]">Vistar Media: Platform % Fee</p>
            </div>
          </div>
          <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
            <h4 className="font-semibold text-[var(--text)] mb-2">ROI Calculation</h4>
            <p className="text-[var(--text-muted)]">Our platform pays for itself by preventing just 1–2% campaign waste or compliance issues.</p>
          </div>
        </div>
      </section>

      {/* Unique Value Propositions */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-[var(--background-alt)] p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-[var(--text)] mb-2">For Advertising Agencies</h4>
            <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1">
              <li>Independent verification</li>
              <li>Client-ready reports</li>
              <li>Fast implementation (1–2 weeks)</li>
              <li>Scalable pricing</li>
            </ul>
          </div>
          <div className="bg-[var(--background-alt)] p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-[var(--text)] mb-2">For DOOH Media Owners</h4>
            <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1">
              <li>Proactive issue identification</li>
              <li>Operational intelligence</li>
              <li>Compliance automation</li>
              <li>Revenue protection</li>
            </ul>
          </div>
          <div className="bg-[var(--background-alt)] p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-[var(--text)] mb-2">For Brand Advertisers</h4>
            <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1">
              <li>Brand protection</li>
              <li>Competitive intelligence</li>
              <li>Performance analytics</li>
              <li>Cost optimization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technology Differentiators */}
      <section className="py-16 px-4 bg-[var(--background-alt)]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
            <h4 className="text-lg font-semibold text-[var(--text)] mb-2">Advanced AI Image Analysis</h4>
            <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1">
              <li>Real-time content verification</li>
              <li>Brand compliance checking</li>
              <li>Competitive ad detection</li>
              <li>Quality assessment scoring</li>
            </ul>
          </div>
          <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
            <h4 className="text-lg font-semibold text-[var(--text)] mb-2">Comprehensive Log Analysis</h4>
            <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1">
              <li>Play-time verification</li>
              <li>Technical issue detection</li>
              <li>Performance pattern analysis</li>
              <li>Automated anomaly alerts</li>
            </ul>
          </div>
          <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">
            <h4 className="text-lg font-semibold text-[var(--text)] mb-2">Integration Capabilities</h4>
            <ul className="list-disc list-inside text-[var(--text-muted)] space-y-1">
              <li>Works with any DOOH network</li>
              <li>API-first architecture</li>
              <li>White-label options available</li>
              <li>Custom webhook support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Market Entry Strategy removed to focus on value now */}

      {/* Competitive Response Strategy removed */}

      {/* Key Messaging removed to streamline narrative */}

      {/* Demo Flow removed */}

      {/* Closing Recommendations removed */}
      {/* CTA Section */}
      <section className="py-24 px-4">
        <div
          ref={ctaRef}
          className="max-w-5xl mx-auto text-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--accent)] p-12 rounded-2xl text-[var(--background)]"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to verify your DOOH campaigns?</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">Launch in 1–2 weeks. Independent. AI-powered. Mid-market friendly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-8 py-3 bg-[var(--background)] text-[var(--primary)] rounded-lg hover:bg-opacity-90 transition-opacity font-medium"
            >
              Start Pilot
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-8 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors font-medium"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </FullLayout>
  );
}
