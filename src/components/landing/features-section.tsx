'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Bell,
  Shield,
  Zap,
  Target,
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

const features = [
  {
    icon: Brain,
    title: 'AI Resume Parser',
    description: 'Upload your resume once. Our AI extracts skills, projects, and experience automatically using advanced NLP.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Shield,
    title: 'Smart Eligibility Engine',
    description: 'Dream Offer Policy automatically manages Regular, Dream, and Super Dream tier eligibility.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Instant updates on new drives, shortlists, and interview schedules. Never miss an opportunity.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Zap,
    title: 'One-Click Applications',
    description: 'Apply to multiple drives instantly with your pre-filled profile and uploaded resume.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Target,
    title: 'Application Tracking',
    description: 'Track all your applications in one place. See status updates from applied to selected.',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    icon: Sparkles,
    title: 'Skill Matching',
    description: 'AI-powered skill matching shows you the best-fit opportunities based on your profile.',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-20">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="secondary" className="mb-4">Features</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why IIPS Smart Placement Portal?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Built with cutting-edge technology to streamline your placement journey
        </p>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {features.map((feature, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className="group h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
              <CardHeader className="pb-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
