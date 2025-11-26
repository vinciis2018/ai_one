import { alarm, worried, expand, surprised, happy, inlove } from "../../assets";
import CursorAnimation from "../../components/CursorAnimation";
import NeuronAnimation from "../../components/NeuronAnimation";

export const StudentSection = () => {
  return (
    <div className="" style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%234ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 19.5L4 4"/><path d="M4 4l4.5 0.5L19 15l-4 4L4.5 8.5L4 4z"/><path d="M4 4l3 3"/><path d="M14 10l4 4"/></svg>') 0 0, auto` }}>
      <CursorAnimation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-violet overflow-hidden">
        <NeuronAnimation />

        <div className="relative z-10 py-24 text-center lg:text-left">
          <div className="flex flex-col items-center justify-center md:p-12 lg:p-20">
            <div className="flex items-center">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-black mb-8 leading-tight text-white text-center">
                Be Everywhere
                <br />
                <span className="text-transparent bg-clip-text text-green text-3xl md:text-6xl lg:text-9xl">
                  AT ONCE
                </span>
                <br />
                <span className="flex lg:flex-row flex-col items-center justify-center gap-4">
                  Without Being There
                  <span className="border rounded-full flex items-center justify-center w-40">
                    <img src={surprised} alt="surprised-emoji" className="inline-block h-12 w-12 align-middle animate-pulse" />
                    <img src={happy} alt="happy-emoji" className="inline-block h-12 w-12 align-middle animate-pulse1" />
                    <img src={inlove} alt="inlove-emoji" className="inline-block h-12 w-12 align-middle animate-pulse2" />
                  </span>
                </span>
              </h1>
            </div>
            <div className="flex justify-center items-center p-4">
              <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 text-center">
                Give every single student the "Topper Treatment." Clone your teaching style, voice, and expertise into an AI Assistant that solves doubts 24/7—so you can focus on teaching.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <a
                href="#teacher-waitlist"
                className="inline-block bg-green text-white mt-16 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                Create My AI Twin →
              </a>

              <div className="pt-16 px-8 lg:px-0 flex items-center gap-12 sm:gap-16 lg:gap-16">
                <div className="relative">
                  <div className="relative flex items-center">
                    <img className="rounded-full h-12 w-12" src="https://imgs.search.brave.com/DQqCYuRL1gf04_1jUhXgsCDMpaXJ_hTDSnRhtr9Yh3A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzEzLzM3LzMx/LzM2MF9GXzMxMzM3/MzEzMl9iOUF6N1hh/R0xSdlNMSFhsSU5Y/QklHUE1JT0xvazha/Qi5qcGc" alt="teacher profile" />
                    <img className="absolute left-6 rounded-full h-12 w-12" src="https://imgs.search.brave.com/vbX2XjZ54yjaoteH9G0mFfWK7LHEf_4n5DnBJwJcZGE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTMx/NTk3NjU1My9waG90/by9wb3J0cmFpdC1v/Zi1hLXNtaWxpbmct/bWFuLW9mLWluZGlh/bi1vcmlnaW4uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPTBO/OTNFbC1ReGd1Vm45/d2hzQWlWdnNTTllp/c2NxYnN1Y1dsUUU5/aTg0Y289" alt="teacher profile" />
                    <img className="absolute left-12 rounded-full h-12 w-12" src="https://st3.depositphotos.com/1177973/14750/i/450/depositphotos_147505411-stock-photo-indian-female-teacher.jpg" alt="teacher profile" />
                  </div>
                </div>

                <h3 className="relative text-sm text-white">
                  <span className="font-bold">600+</span> Teachers already joined the waitlist
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Teacher's Dilemma - Pain Points */}
      <section className="py-20 bg-gradient-to-b from-violet to-black text-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl lg:text-8xl font-black text-center mb-6 text-white">
            You are only <span className="text-green">one person.</span><br /> But you have 100+ students.
          </h2>
          <p className="text-sm md:text-xl lg:text-2xl text-center text-white max-w-3xl mx-auto mb-16">
            You entered education to change lives, but the reality of scaling a coaching center is brutal.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:px-20">
            {[
              {
                bg: "bg-violet",
                text: "text-white",
                emoji: alarm,
                title: 'The "Doubt" Bottleneck',
                description:
                  "You spend hours after class answering the same basic questions over and over, leaving no time for advanced mentoring.",
              },
              {
                bg: "bg-white",
                text: "text-black",
                emoji: worried,
                title: 'The "Back-Bencher" Problem',
                description: "In a batch of 60, only the front row gets your attention. The shy student in the back is falling behind, hurting your institute's overall success rate.",
              },
              {
                bg: "bg-violet",
                text: "text-white",
                emoji: expand,
                title: "The 24/7 Demand",
                description:
                  "Students study late at night. You need sleep. When they get stuck at 11 PM, they lose momentum. You lose results.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`col-span-1 ${item.bg} ${item.text} text-center flex flex-col items-center p-10 rounded-8xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-t-0 border-b-8 border-green`}
              >
                <img className="w-20 block mb-5" src={item.emoji} alt="" />
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Introducing MINDE - Solution Section */}
      <section className="py-24 bg-gradient-to-b from-black via-violet to-black text-[#F8F6F0]">
        <div className="grid lg:grid-cols-9 gap-4 container mx-auto px-6">
          <div className="col-span-4">
            <h2 className="text-5xl lg:text-8xl font-black text-start mb-6 text-white">
              <span className="">
                <span>
                  Your Knowledge.
                </span>
                <i className="fi fi-ss-sparkles text-4xl px-2" />
              </span> <br />
              <span className="text-green">Your Voice.</span><br />
              <span className="flex items-center justify-start gap-4">
                Augmented.
              </span>
            </h2>
            <div className="flex flex-col justify-start">
              <p className="text-sm lg:text-2xl text-gray-300 lg:w-80 ">
                MINDE isn't just "another AI tutor." It is YOU, digitized.
              </p>
              <a
                href="/login"
                className="w-44 cursor-pointer inline-block bg-green hover:bg-[#4a8252] text-white font-bold my-8 py-4 px-10 md:px-12 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 z-10 relative"
              >
                Start →
              </a>
            </div>
          </div>
          <div className="col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[
              {
                icon: 'fi fi-sr-dna',
                title: 'Upload',
                description:
                  'You feed the system your PDF notes, DPPs (Daily Practice Problems), and previous lectures.',
              },
              {
                icon: 'fi fi-br-microchip-ai',
                title: 'Train',
                description:
                  'Our engine builds a custom model that understands your unique teaching shortcuts and terminology.',
              },
              {
                icon: 'fi fi-brands-whatsapp',
                title: 'Deploy',
                description:
                  'Students ask questions via WhatsApp or our App. The AI answers instantly, using your explanations.',
              },
              {
                icon: 'fi fi-rr-shield-check',
                title: 'You Control the Content',
                description:
                  'The AI never "hallucinates" answers from the internet. It stays strictly within the boundaries of the material you provide.',
              },
              {
                icon: 'fi fi-rr-overview',
                title: 'Human-in-the-Loop',
                description:
                  'You have a dashboard to review student queries. If the AI gets stuck, it flags you.',
              },
              {
                icon: 'fi fi-rr-lock',
                title: 'Data Privacy',
                description:
                  'Your proprietary notes and "secret sauce" teaching methods are encrypted. We never share your data with other coaching centers.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="backdrop-blur-md p-10 bg-white space-y-2 rounded-8xl border border-white hover:border-white transition-all duration-300"
              >
                <span className={`inline-block ${i == 0 && "transform rotate-45"} p-2`}>
                  <i className={`${item.icon} text-5xl`} />
                </span>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Coaching Centers Choose MINDE */}
      <section className="py-24 bg-gradient-to-b from-black via-violet to-black text-[#F8F6F0]">
        <div className="container mx-auto px-10">
          <div className="flex flex-col items-center ">
            <h2 className="text-3xl md:text-5xl lg:text-8xl font-black text-center mb-6 text-white">
              Why Coaching Centers <span className="text-green">Choose MINDE</span>
            </h2>
            <p className="text-sm md:text-xl lg:text-2xl text-center text-white max-w-3xl mx-auto mb-16">
              NOT A REPLACEMENT. A SUPERPOWER.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden">
              <thead className="bg-green/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Feature</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">The Old Way</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-green">The MINDE Way</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {[
                  {
                    feature: 'Doubt Resolution',
                    oldWay: 'Students wait days for a 5-min slot.',
                    mindeWay: 'Instant answers at 2 AM, 100% accurate to your notes.',
                  },
                  {
                    feature: 'Personalization',
                    oldWay: 'One teaching pace for all 100 students.',
                    mindeWay: 'Every student gets a personalized pace.',
                  },
                  {
                    feature: 'Scaling',
                    oldWay: 'Hiring more junior teachers who dilute quality.',
                    mindeWay: 'Scale your "Star Teacher" to infinite batches.',
                  },
                  {
                    feature: 'Efficiency',
                    oldWay: 'Teachers are burnt out by repetitive tasks.',
                    mindeWay: 'Teachers focus on strategy and high-level concepts.',
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{row.oldWay}</td>
                    <td className="px-6 py-4 text-sm text-green font-medium">{row.mindeWay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section
        id="teacher-waitlist"
        className="py-20 bg-gradient-to-b from-black to-green text-center"
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3,
                animation: 'twinkle 3s infinite',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Ready to Solve the "2 Sigma Problem"?</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the exclusive beta for India's top coaching institutes.
          </p>
          <a
            href="/login"
            className="inline-block bg-green hover:bg-[#4a8252] text-white font-bold py-4 px-10 md:px-12 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30"
          >
            Schedule a 15-Min Strategy Call →
          </a>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • Compatible with your existing study material
          </p>
        </div>
      </section>
    </div>
  );
};
