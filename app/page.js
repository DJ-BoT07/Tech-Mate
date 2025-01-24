'use client';

import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../lib/animations';
import { Code2, Users, Rocket, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <motion.div 
      className="min-h-screen bg-white text-black relative overflow-hidden"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <div className="relative h-screen flex items-center">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={fadeIn}
          >
            <motion.h1 
              className="hero-text text-6xl md:text-8xl mb-6 text-[#ffc629]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              FIND YOUR PERFECT TECHMATE
            </motion.h1>
            <motion.p 
              className="text-2xl md:text-3xl mb-8 text-black"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Connect with brilliant minds in tech
            </motion.p>
            <motion.button
              onClick={() => handleNavigation('/auth')}
              className="btn-primary text-xl md:text-2xl px-12 py-4 rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Matching
            </motion.button>
          </motion.div>
        </div>

        {/* Yellow accent shapes */}
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-[#ffc629] rounded-full -translate-y-1/2 translate-x-1/2 opacity-10"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffc629] rounded-full translate-y-1/2 -translate-x-1/2 opacity-10"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        />
      </div>

      {/* Features Section */}
      <div className="min-h-screen bg-[#fff8e6] py-24 flex items-center">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl text-center mb-16 text-black"
            variants={fadeIn}
          >
            HOW IT WORKS
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[
              {
                icon: Code2,
                title: "CREATE PROFILE",
                description: "Share your tech interests and expertise"
              },
              {
                icon: Users,
                title: "GET MATCHED",
                description: "Find developers who complement your skills"
              },
              {
                icon: Rocket,
                title: "COLLABORATE",
                description: "Build amazing projects together"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white p-8 rounded-3xl shadow-lg text-center"
                variants={fadeIn}
                whileHover={{ y: -8 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[#ffc629] rounded-full">
                  <feature.icon size={32} className="text-black" />
                </div>
                <h3 className="text-2xl mb-4 text-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="min-h-screen bg-[#ffc629] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl mb-8 text-black"
            variants={fadeIn}
          >
            READY TO MEET YOUR MATCH?
          </motion.h2>
          <motion.button
            onClick={() => handleNavigation('/auth')}
            className="bg-black text-white text-xl px-12 py-4 rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
            <ChevronRight className="inline-block ml-2" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
