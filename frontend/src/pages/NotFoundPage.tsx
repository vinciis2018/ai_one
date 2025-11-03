import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FullLayout } from '../layouts/AppLayout';

export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add any page-specific effects here
    document.title = 'Page Not Found | Your App Name';
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
  } as const;

  return (
    <FullLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-2xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-[var(--primary)] text-9xl font-bold mb-4"
            variants={itemVariants}
          >
            404
          </motion.div>
          
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-6"
            variants={itemVariants}
          >
            Oops! Page not found
          </motion.h1>
          
          <motion.p
            className="text-xl text-[var(--text-muted)] mb-8"
            variants={itemVariants}
          >
            The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
          </motion.p>
          
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Return Home
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:bg-opacity-10 transition-colors font-medium"
            >
              Go Back
            </button>
          </motion.div>
          
          <motion.div
            className="mt-12 text-sm text-[var(--text-muted)]"
            variants={itemVariants}
          >
            <p>If you think this is a mistake, please contact support.</p>
          </motion.div>
        </motion.div>
      </div>
    </FullLayout>
  );
}
