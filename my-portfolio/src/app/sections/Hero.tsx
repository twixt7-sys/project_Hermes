'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const Scene = dynamic(() => import('@/app/canvas/Scene'), { ssr: false });

export default function Hero() {
  return (
    <section className="w-full h-screen flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold">WELCOME</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">--</p>
      </motion.div>
        <motion.div
        initial={{ opacity: 0}}
        animate={{ opacity: 1}}
        transition={{ duration: 1 }}
      >
        <section className="absolute inset-0 z-0">
        <Scene />
        </section>
      </motion.div>
    </section>
  );
}
