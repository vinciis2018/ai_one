export const StudentSection = () => {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center bg-gradient-to-br from-black via-violet to-black overflow-hidden">
        {/* Twinkling stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 'px',
                height: Math.random() * 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 4 + 3}s infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950"></div>
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight text-white">
              Have Your Teacher<br />
              Available <span className="text-green">24/7</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Never wait for doubt resolution again. Get instant help in your teacher’s exact style—at 3 AM, on
              Sundays, anytime you need it.
            </p>
            <a
              href="#student-waitlist"
              className="inline-block bg-green text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Early Access →
            </a>
          </div>
        </div>

        {/* Twinkle animation */}
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}</style>
      </section>

      {/* Pain Points Section */}
      <section className="py-24 text-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-green">
            We Know How Frustrating It Is
          </h2>
          <p className="text-lg text-center text-gray-600 mb-16">
            You’re not alone in this struggle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '😤',
                title: 'Stuck on a Problem',
                description:
                  'It’s 11 PM. You’re stuck on a concept. Next class is in 3 days. That “aha moment”? Gone forever. Your momentum dies.',
              },
              {
                emoji: '🤐',
                title: 'Too Scared to Ask',
                description:
                  '150 students in class. You don’t want to look stupid. Sir already explained it twice. You stay confused and fall behind.',
              },
              {
                emoji: '⏰',
                title: 'Timing is Everything',
                description:
                  'Doubt sessions are twice a week. By the time you get your turn, you’ve forgotten what you wanted to ask.',
              },
              {
                emoji: '🎲',
                title: 'Generic AI Sucks',
                description:
                  'ChatGPT explains differently than your teacher. YouTube tutorials don’t match your syllabus. You need YOUR teacher’s method.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-t-4 border-green"
              >
                <span className="text-5xl block mb-5">{item.emoji}</span>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-white via-violet to-black text-[#F8F6F0]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-[#F8F6F0]">
            What If Your Favorite Teacher Never Slept?
          </h2>
          <p className="text-xl text-center text-white max-w-3xl mx-auto mb-16">
            Introducing your teacher’s AI twin. Same style. Same examples. Same patience. Always available.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: '🎯 Your Teacher’s Voice',
                items: [
                  'Explains exactly like Sir/Ma’am does in class',
                  'Uses the same examples and shortcuts',
                  'Matches your syllabus and exam pattern',
                  'Feels like talking to your actual teacher',
                ],
              },
              {
                title: '⚡ Instant Answers',
                items: [
                  'Ask doubts at 3 AM, get answers immediately',
                  'No waiting in line or feeling guilty',
                  'Study when YOU’RE most productive',
                  'Never lose momentum again',
                ],
              },
              {
                title: '♾️ Unlimited Patience',
                items: [
                  'Ask the same question 100 times if needed',
                  'Get step-by-step explanations at your pace',
                  'No judgment, no frustration, just learning',
                  'Break down complex problems into simple steps',
                ],
              },
              {
                title: '📱 WhatsApp Simple',
                items: [
                  'No new app to learn—just WhatsApp',
                  'Send text, voice notes, or photos of problems',
                  'Get detailed explanations instantly',
                  'Your entire doubt history saved automatically',
                ],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-6 text-white">{item.title}</h3>
                <ul className="space-y-3">
                  {item.items.map((listItem, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green mr-3 mt-1">✓</span>
                      <span className="text-white">{listItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section
        id="student-waitlist"
        className="relative py-24 bg-gradient-to-tl from-black to-black text-[#F8F6F0]"
      >
        {/* Twinkling stars */}
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

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Ready to Get 24/7 Help?</h2>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto">
            Join our waitlist to be the first to know when we launch.
          </p>
          <a
            href="#"
            className="inline-block bg-green hover:bg-[#4a8252] text-white font-bold py-4 px-10 md:px-12 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30"
          >
            Join the Waitlist →
          </a>
        </div>
      </section>
    </div>
  );
};
