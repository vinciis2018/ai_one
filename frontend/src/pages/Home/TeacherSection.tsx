export const TeacherSection = () => {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-violet to-black overflow-hidden">
        {/* Twinkling Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 'px',
                height: Math.random() * 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 sm:px-10 py-24 text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight text-white">
                Answering the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-green">
                  Same Questions
                </span>{' '}
                again & again???
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mb-10 max-w-lg leading-relaxed mx-auto lg:mx-0">
                Your expertise deserves to scale. Clone your teaching style with AI and serve more students without
                sacrificing your evenings, weekends, or sanity.
              </p>

              <a
                href="#teacher-waitlist"
                className="inline-block bg-green text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                Clone My Teaching Style →
              </a>
            </div>

            <div className="hidden lg:block">
              <div className="grid gap-6">
                <div className="bg-[#F8F6F0]/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-green">Your Style</h3>
                  <p className="text-gray-300 text-sm my-3">
                    Captured and replicated perfectly by AI, so every student gets your best teaching.
                  </p>
                  <p className="text-gray-200 font-semibold">10X more students to teach</p>
                </div>
                <div className="bg-[#F8F6F0]/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-green">Your Time</h3>
                  <p className="text-gray-300 text-sm my-3">
                    Students get instant help, even at 2 AM before an exam.
                  </p>
                  <p className="text-gray-200 font-semibold">50% less time on doubt sessions</p>
                </div>
                <div className="bg-[#F8F6F0]/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-green">Your Brand</h3>
                  <p className="text-gray-300 text-sm my-3">
                    Your name, your reputation, your teaching philosophy – amplified.
                  </p>
                  <p className="text-gray-200 font-semibold">24/7 live assistant for your students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Twinkling animation */}
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}</style>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gradient-to-bl from-black via-black to-violet text-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-white">
            The Impossible Math of Teaching
          </h2>
          <p className="text-lg md:text-xl text-center text-white max-w-3xl mx-auto mb-16">
            Great teaching doesn't scale. Until now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '⏰',
                title: 'Limited Time',
                description:
                  "You can only be in one place at a time. Office hours end, but student questions don't.",
              },
              {
                emoji: '😩',
                title: 'Emotional Labor',
                description: "Explaining the same concept over and over. It's exhausting.",
              },
              {
                emoji: '📉',
                title: "Can't Scale",
                description:
                  'You could teach more students, but quality would suffer. Premium personalization doesn’t work in 200-student batches.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-t-4 border-green"
              >
                <span className="text-5xl block mb-5">{item.emoji}</span>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-white">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-bl from-black via-violet to-black text-[#F8F6F0]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-white">
            Your AI Teaching Twin
          </h2>
          <p className="text-xl text-center text-gray-300 max-w-3xl mx-auto mb-16">
            We clone your teaching DNA. Not a generic chatbot—your actual style, personality, and expertise.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🧬',
                title: 'Trained on YOU',
                description:
                  'Upload your notes, lesson plans, and teaching materials. The AI learns your exact explanations, examples, and approach.',
              },
              {
                icon: '♾️',
                title: 'Infinite Patience',
                description:
                  'Your AI twin answers the same question 100 times without getting tired. Students never feel guilty for asking.',
              },
              {
                icon: '📊',
                title: 'Smart Insights',
                description:
                  'See which concepts confuse students most. Identify weak areas before exam day. Data-driven teaching.',
              },
              {
                icon: '⚡',
                title: 'WhatsApp Native',
                description:
                  'Students ask doubts where they already are. No new app to learn. Just natural conversation.',
              },
              {
                icon: '🎯',
                title: 'You Stay In Control',
                description:
                  'Review AI responses. Correct mistakes. Keep improving the model. Your expertise, amplified.',
              },
              {
                icon: '💰',
                title: 'Grow Your Brand',
                description:
                  'Serve 500 students personally. Build reputation. Charge premium. Become the coach everyone wants.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="backdrop-blur-md p-8 rounded-3xl border border-white hover:border-white transition-all duration-300"
              >
                <span className="text-5xl block mb-5">{item.icon}</span>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section
        id="teacher-waitlist"
        className="py-20 bg-gradient-to-r from-black to-violet text-center"
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
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Ready to Transform Your Teaching?</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our waitlist to be the first to know when we launch.
          </p>
          <a
            href="/login"
            className="inline-block bg-green hover:bg-[#4a8252] text-white font-bold py-4 px-10 md:px-12 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30"
          >
            Join the Waitlist →
          </a>
        </div>
      </section>
    </div>
  );
};
