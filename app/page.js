'use client';

import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, containerVariants } from '../lib/animations';
import { Code2, Users, Rocket, ChevronRight, Terminal, Cpu, Database, Cloud } from 'lucide-react';

export default function Home() {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-slate-900 relative overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Tech pattern background */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            {i % 4 === 0 && <Terminal className="w-8 h-8" />}
            {i % 4 === 1 && <Cpu className="w-6 h-6" />}
            {i % 4 === 2 && <Database className="w-4 h-4" />}
            {i % 4 === 3 && <Cloud className="w-5 h-5" />}
          </motion.div>
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-[800px] h-[800px] -top-[400px] -left-[400px] bg-gradient-to-br from-amber-200/50 to-yellow-300/50 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] -bottom-[300px] -right-[300px] bg-gradient-to-tr from-yellow-200/50 to-amber-300/50 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4 
          }}
        />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16 md:mb-24"
          variants={staggerContainer}
        >
          <motion.div 
            className="inline-block"
            variants={fadeIn}
          >
            <h1 className="hero-text text-7xl md:text-[10rem] mb-6 md:mb-8">
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ 
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 100%" }}
              >
                TECHMATE
              </motion.span>
            </h1>
          </motion.div>
          <motion.p 
            className="hero-text text-3xl md:text-5xl text-amber-700 mb-6 md:mb-8"
            variants={fadeIn}
          >
            CONNECT WITH BRILLIANT MINDS IN TECH
          </motion.p>
          <motion.p 
            className="text-xl md:text-2xl text-amber-600 leading-relaxed"
            variants={fadeIn}
          >
            Where innovation meets collaboration
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-16 md:mt-32"
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-semibold text-center mb-12 md:mb-16"
            variants={fadeIn}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">
              How It Works
            </span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {[
              {
                icon: Code2,
                title: "Build Profile",
                description: "Showcase your tech stack, projects, and coding interests",
                color: "amber"
              },
              {
                icon: Users,
                title: "Find Matches",
                description: "Connect with developers who share your technical aspirations",
                color: "amber"
              },
              {
                icon: Rocket,
                title: "Collaborate",
                description: "Build amazing projects and grow together in tech",
                color: "amber"
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                className="group p-8 md:p-10 bg-white/90 backdrop-blur-lg rounded-3xl shadow-lg border border-amber-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300"
                variants={fadeIn}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="text-amber-500 mb-6 group-hover:scale-110 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <step.icon size={48} />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-amber-600">{step.title}</h3>
                <p className="text-base md:text-lg text-amber-700/80 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="mt-20 md:mt-32 text-center px-4 relative"
          variants={fadeIn}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200/50 via-yellow-100/50 to-amber-200/50 blur-3xl -z-10"></div>
          <motion.h2 
            className="text-3xl md:text-4xl font-semibold mb-6 md:mb-8 text-amber-700"
            variants={fadeIn}
          >
            Ready to Meet Your Tech Match?
          </motion.h2>
          <motion.p 
            className="text-lg md:text-2xl text-amber-600 max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
          >
            Join thousands of developers ready to collaborate and innovate.
            <motion.div 
              className="inline-flex items-center justify-center gap-2 mt-6 text-amber-500 font-medium hover:text-amber-600 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get started now</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
