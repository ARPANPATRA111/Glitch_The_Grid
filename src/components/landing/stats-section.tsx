'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  Building2, 
  Users,
  TrendingUp, 
  GraduationCap 
} from 'lucide-react';

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

const stats = [
  { label: 'Companies Visited', value: 150, suffix: '+', icon: Building2, color: 'text-blue-500' },
  { label: 'Students Placed', value: 500, suffix: '+', icon: Users, color: 'text-green-500' },
  { label: 'Highest Package', value: 42, suffix: ' LPA', icon: TrendingUp, color: 'text-purple-500' },
  { label: 'Average Package', value: 8.5, suffix: ' LPA', icon: GraduationCap, color: 'text-orange-500' },
];

export function StatsSection() {
  return (
    <section id="stats" className="container mx-auto px-4 py-20">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={scaleIn}>
            <Card className="text-center group hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardContent className="pt-8 pb-6">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${
                  i === 0 ? 'from-blue-500/10 to-blue-600/10' :
                  i === 1 ? 'from-green-500/10 to-green-600/10' :
                  i === 2 ? 'from-purple-500/10 to-purple-600/10' :
                  'from-orange-500/10 to-orange-600/10'
                } mb-4`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold mb-1">
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix}
                    duration={2}
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
