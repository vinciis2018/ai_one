import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { FullLayout } from '../layouts/AppLayout';

export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page Not Found | Maiind';
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const
      },
    },
  };

  return (
    <FullLayout>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-logoBlue rounded-full blur-lg animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-logoViolet rounded-full blur-40 animate-pulse delay-1000" />

        <motion.div
          className="text-center max-w-lg w-full relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 404 Visual */}
          <motion.div variants={itemVariants} className="mb-8 relative inline-block">
            <h1 className="text-[10rem] leading-none font-black bg-gradient-to-br from-logoBlue to-logoViolet bg-clip-text text-transparent opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white dark:bg-black rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center rotate-12 transform hover:rotate-0 transition-all duration-300">
                <i className="fi fi-rr-search-alt text-6xl text-logoBlue" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
            variants={itemVariants}
          >
            Page not found
          </motion.h2>

          <motion.p
            className="text-lg text-slate-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-logoBlue to-logoViolet text-white rounded-xl font-bold shadow-lg shadow-logoBlue hover:shadow-logoBlue hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <i className="fi fi-rr-home text-sm group-hover:scale-110 transition-transform" />
              Back Home
            </button>

            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-gray-300 rounded-xl font-bold hover:border-logoBlue hover:text-logoBlue dark:hover:border-logoBlue dark:hover:text-logoBlue transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <i className="fi fi-rr-arrow-small-left text-lg group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </motion.div>
        </motion.div>
      </div>
    </FullLayout>
  );
}
