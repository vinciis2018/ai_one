import { angryGif, sadGif1, sadGif, greenBoard, teacher, alarm, worried, expand, surprised, happy, inlove } from "../../assets";

export const TeacherSection = () => {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-bgDarkGreen overflow-hidden">
        {/* Twinkling Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 4 + 'px',
                height: Math.random() * 4 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.4,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 sm:px-10 py-24 text-center lg:text-left">
          <div className="flex flex-col items-center justify-center p-20">
            <div className="flex items-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight text-greenLight text-center">
                still answering the
                <br/>
                <span className="text-transparent bg-clip-text text-green text-8xl">
                  SAME QUESTIONS
                </span>
                <br />
                <span className="flex items-center justify-center gap-4">
                  again & again?
                  <span className="border rounded-full flex items-center justify-center w-40">
                    <img src={sadGif} alt="angry-gif" className="inline-block h-12 w-12 align-middle animate-pulse" />
                    <img src={sadGif1} alt="angry-gif" className="inline-block h-12 w-12 align-middle animate-pulse1" />
                    <img src={angryGif} alt="angry-gif" className="inline-block h-12 w-12 align-middle animate-pulse2" />
                  </span>
                </span>
                
              </h1>
            </div>
            <div className="flex justify-center items-center py-4">
              <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 text-center">
                Your expertise deserves to scale. Clone your teaching style with AI and serve more students without
                sacrificing your evenings, weekends, or sanity.
              </p>
            </div>
            
            <div className="py-4 flex flex-col items-center">
              <a
                href="#teacher-waitlist"
                className="inline-block bg-green text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                Clone My Teaching Style →
              </a>

              <div className="p-8 flex items-center gap-16">
                <div className="relative">
                  <div className="relative flex items-center">
                    <img className="rounded-full h-10 w-10" src="https://imgs.search.brave.com/DQqCYuRL1gf04_1jUhXgsCDMpaXJ_hTDSnRhtr9Yh3A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzEzLzM3LzMx/LzM2MF9GXzMxMzM3/MzEzMl9iOUF6N1hh/R0xSdlNMSFhsSU5Y/QklHUE1JT0xvazha/Qi5qcGc" alt="sample profile pic" />
                    <img className="absolute left-6 rounded-full h-10 w-10" src="https://imgs.search.brave.com/vbX2XjZ54yjaoteH9G0mFfWK7LHEf_4n5DnBJwJcZGE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTMx/NTk3NjU1My9waG90/by9wb3J0cmFpdC1v/Zi1hLXNtaWxpbmct/bWFuLW9mLWluZGlh/bi1vcmlnaW4uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPTBO/OTNFbC1ReGd1Vm45/d2hzQWlWdnNTTllp/c2NxYnN1Y1dsUUU5/aTg0Y289" alt="sample profile pic" />
                    <img className="absolute left-12 rounded-full h-10 w-10" src="https://st3.depositphotos.com/1177973/14750/i/450/depositphotos_147505411-stock-photo-indian-female-teacher.jpg" alt="sample profile pic" />
                  </div>
                </div>
                
                <h3 className="relative text-sm text-white">
                  <span className="font-bold">600+</span> Teachers already joined the waitlist
                </h3>
              </div>
            </div>
            <div className="relative">
              <div className="relative px-4 pt-40 flex flex-col items-center justify-center">
                <div className="relative flex w-full">
                  <div className="w-1/2 overflow-hidden">
                    <img 
                      src={greenBoard} 
                      alt="greenboard" 
                      className="w-[120%] h-full object-cover"
                      style={{ marginLeft: "30%", clipPath: "polygon(0 0, 83.33% 0, 83.33% 100%, 0 100%)" }}
                    />
                  </div>
                  <div className="w-1/2 overflow-hidden">
                    <img 
                      src={greenBoard} 
                      alt="greenboard" 
                      className="w-[120%] h-full object-cover"
                      style={{ marginLeft: "-30%", clipPath: "polygon(16.67% 0, 100% 0, 100% 100%, 16.67% 100%)" }}
                    />
                  </div>
                </div>
                <img src={teacher} alt="teacher" className="absolute bottom-0 w-72 z-10" />
              </div>

              <div className="absolute top-52 left-8 animate-float">
                <div className="w-60 bg-baigeLight backdrop-blur-md p-10 rounded-8xl border border-white/10">
                  <h3 className="text-lg font-bold">One teacher, too many students</h3>
                  <p className="text-xs mt-3">
                    Our Ai scales your teaching – giving every student personal attention, just like you would
                  </p>
                </div>
              </div>
              <div className="absolute right-20 top-44 animate-float2">
                <div className="w-80 bg-baigeLight backdrop-blur-md p-10 rounded-8xl border border-white/10">
                  <h3 className="text-lg font-bold">Generic AI tools don't understant my teaching style</h3>
                  <p className="text-xs mt-3">
                    Our AI adapts to your teaching style – delivering answers the way you would, not just generic responses
                  </p>
                </div>
              </div>
              <div className="absolute left-80 -bottom-32 z-20 animate-float3">
                <div className="w-92 bg-baigeLight backdrop-blur-md p-10 rounded-8xl border border-white/10">
                  <h3 className="text-lg font-bold">I keep answering the same questions again and again</h3>
                  <p className="text-xs mt-3">
                    Our AI handles repetitice doubts instantly, freeing your time to focus on your real teaching and personal life
                  </p>
                </div>
              </div>
            </div>
            
          </div>
         
        </div>

        {/* Twinkling animation */}
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gradient-to-b from-bgDarkGreen to-black text-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-white">
            The <span className="text-green">Impossible</span><br/> Math of Teaching
          </h2>
          <p className="text-lg md:text-xl text-center text-white max-w-3xl mx-auto mb-16">
            Great teaching doesn't scale. Until now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-20">
            {[
              {
                bg: "bg-bgDarkGreen",
                text: "text-white",
                emoji: alarm,
                title: 'Limited Time',
                description:
                  "You can only be in one place at a time. Office hours end, but student questions don't.",
              },
              {
                bg: "bg-white",
                text: "text-black",
                emoji: worried,
                title: 'Emotional Labor',
                description: "Explaining the same concept over and over. It's exhausting.",
              },
              {
                bg: "bg-bgDarkGreen",
                text: "text-white",
                emoji: expand,
                title: "Can't Scale",
                description:
                  `Premium personalization doesn't work in 50 - student batches.`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`col-span-1  ${item.bg} ${item.text} text-center flex flex-col items-center p-10 rounded-8xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-t-0 border-b-8 border-green`}
              >
                <img className="w-20 block mb-5" src={item.emoji} alt="" />
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-black via-bgDarkGreen to-black text-[#F8F6F0]">
        <div className="grid grid-cols-9 gap-4 container mx-auto px-6">
          <div className="col-span-4">

            <h2 className="text-4xl md:text-5xl font-black text-start mb-6 text-greenLight">
              <span className="">
                <span>
                  Your AI
                </span>
                <i className="fi fi-ss-sparkles text-4xl px-2" />
              </span> <br/>
              <span className="text-green">Teaching</span><br/>
              <span className="flex items-center justify-start gap-4">
                Twin
                <span className="border rounded-full flex items-center justify-center w-40 mt-2">
                  <img src={surprised} alt="angry-gif" className="inline-block h-12 w-12 align-middle animate-pulse" />
                  <img src={happy} alt="angry-gif" className="inline-block h-12 w-12 align-middle animate-pulse1" />
                  <img src={inlove} alt="angry-gif" className="inline-block h-12 w-12 align-middle animate-pulse2" />
                </span>
              </span>
            </h2>
            <div className="flex flex-col justify-start space-y-8">
              <p className="text-xl text-gray-300 w-60 ">
                We help you provide your 24/7 attention, to your students.
              </p>
              <a
                href="/login"
                className="w-44 cursor-pointer inline-block bg-green hover:bg-[#4a8252] text-white font-bold py-4 px-10 md:px-12 rounded-full text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 z-10 relative"
              >
                Start →
              </a>
            </div>
          </div>
          <div className="col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[
              {
                icon: 'fi fi-sr-dna',
                title: 'Trained on YOU',
                description:
                  'Upload your notes, lesson plans, and teaching materials. The AI learns your exact explanations, examples, and approach.',
              },
              {
                icon: 'fi fi-bs-infinity',
                title: 'Infinite Patience',
                description:
                  'Your AI twin answers the same question 100 times without getting tired. Students never feel guilty for asking.',
              },
              {
                icon: 'fi fi-sr-kpi-evaluation',
                title: 'Smart Insights',
                description:
                  'See which concepts confuse students most. Identify weak areas before exam day. Data-driven teaching.',
              },
              {
                icon: 'fi fi-rr-overview',
                title: 'You Stay In Control',
                description:
                  'Review AI responses. Correct mistakes. Keep improving the model. Your expertise, amplified.',
              },
              {
                icon: 'fi fi-rr-career-growth',
                title: 'Grow Your Brand',
                description:
                  'Serve hundreds of students personally. Build reputation. Charge premium. Become the teacher everyone wants.',
              },
              {
                icon: 'fi fi-rr-meeting-alt',
                title: 'Multilingual Support',
                description:
                  'No language barrier, interact with students in the language they want to interact in. Just natural conversation.',
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

      {/* How it works? */}
      <section
        id="how-it-works"
        className="py-24 bg-gradient-to-b from-black via-bgDarkGreen to-black text-[#F8F6F0]"
      >
        <div className="container mx-auto px-10">
          <div className="flex flex-col items-center ">
            <h2 className="text-4xl md:text-5xl font-black text-start mb-6 text-greenLight">
              How it <span className="text-green">works?</span>
            </h2>
            <p className="text-lg md:text-xl text-center text-white max-w-3xl mx-auto mb-16">
              As easy as using a chatting app
            </p>
          </div>
          <div className="bg-baigeLight p-20 flex items-center gap-4 rounded-8xl">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <div className="flex flex-col items-center ">
                  <div className="bg-white border border-gray-400 px-8 py-7 rounded-full">
                    <i className="fi fi-br-cloud-upload text-4xl text-green2" />
                  </div>
                  <h1 className="text-gray-400 text-lg font-semibold -mt-4 bg-baigeLight  px-1 rounded-full text-center">01</h1>
                </div>
                <h3 className="text-sm text-center">Upload notes, images and/or lecture videos</h3>
              </div>
              <div className="col-span-1">
                <div className="flex flex-col items-center ">
                  <div className="bg-white border border-gray-400 px-8 py-7 rounded-full">
                    <i className="fi  fi-br-microchip-ai text-4xl text-green2" />
                  </div>
                  <h1 className="text-gray-400 text-lg font-semibold -mt-4 bg-baigeLight  px-1 rounded-full text-center">02</h1>
                </div>
                <h3 className="text-sm text-center">Let MAIIND train a personalized AI assistant for you</h3>
              </div>
              <div className="col-span-1">
                <div className="flex flex-col items-center ">
                  <div className="bg-white border border-gray-400 px-8 py-7 rounded-full">
                    <i className="fi fi-rr-person-circle-question text-4xl text-green2" />
                  </div>
                  <h1 className="text-gray-400 text-lg font-semibold -mt-4 bg-baigeLight  px-1 rounded-full text-center">03</h1>
                </div>
                <h3 className="text-sm text-center">Let your assistant clear students doubts for you</h3>
              </div>
              <div className="col-span-1">
                <div className="flex flex-col items-center ">
                  <div className="bg-white border border-gray-400 px-8 py-7 rounded-full">
                    <i className="fi fi-br-dashboard-panel text-4xl text-green2" />
                  </div>
                  <h1 className="text-gray-400 text-lg font-semibold -mt-4 bg-baigeLight  px-1 rounded-full text-center">04</h1>
                </div>
                <h3 className="text-sm text-center">Review students chat and insights for data driven teaching</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section
        id="teacher-waitlist"
        className="py-20 bg-gradient-to-b from-black to-green text-center"
      >
        <div className="grid grid-cols-2 gap-4 container mx-auto px-6">
          <div className="col-span-1">
            
          </div>
          <div className="col-span-1">
            
          </div>
        </div>
        
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
