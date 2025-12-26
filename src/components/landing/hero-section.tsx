'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        className="max-w-4xl mx-auto text-center relative"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            Placement Season 2024-25 is Live
          </Badge>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          variants={fadeInUp}
        >
          Your Gateway to
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600 block">
              Dream Career
            </span>
            <motion.span 
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          variants={fadeInUp}
        >
          Connect with top companies, track applications, and land your dream job 
          through IIPS&apos;s smart placement management system powered by AI.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={fadeInUp}
        >
          <Link href="/login">
            <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
              Student Login <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/drives">
            <Button size="lg" variant="outline" className="group hover:bg-primary/5 hover:scale-105 transition-all duration-300">
              View Open Drives
              <GraduationCap className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
