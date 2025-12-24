'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Brain,
  Bell,
  Shield,
  Zap,
  Target
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

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const stats = [
    { label: 'Companies Visited', value: 150, suffix: '+', icon: Building2, color: 'text-blue-500' },
    { label: 'Students Placed', value: 500, suffix: '+', icon: Users, color: 'text-green-500' },
    { label: 'Highest Package', value: 42, suffix: ' LPA', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Average Package', value: 8.5, suffix: ' LPA', icon: GraduationCap, color: 'text-orange-500' },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <GraduationCap className="h-8 w-8 text-primary relative" />
            </div>
            <div>
              <h1 className="font-bold text-lg">IIPS Placement Portal</h1>
              <p className="text-xs text-muted-foreground">DAVV, Indore</p>
            </div>
          </motion.div>
          <motion.nav 
            className="hidden md:flex items-center gap-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/drives" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Drives
            </Link>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Stats
            </a>
          </motion.nav>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-primary/5">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

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
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Institute Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Secure Login</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

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
              <Card className="text-center group hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-white">
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
              <Card className="group h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
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

      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Placement Tiers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fair Placement Policy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our tier system ensures every student gets the best opportunity based on their placement status
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={scaleIn}>
            <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-gradient-to-b from-white to-gray-50">
              <CardHeader className="pb-2">
                <Badge variant="regular" className="mx-auto mb-4 px-4 py-1">Regular</Badge>
                <CardTitle className="text-3xl font-bold">&lt; 5 LPA</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-4">Entry-level positions</p>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    All unplaced students eligible
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    No prior offer required
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 bg-gradient-to-b from-blue-50 to-white scale-105 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 hover:bg-blue-500">Popular</Badge>
              </div>
              <CardHeader className="pb-2 pt-8">
                <Badge variant="dream" className="mx-auto mb-4 px-4 py-1">Dream</Badge>
                <CardTitle className="text-3xl font-bold">5 - 10 LPA</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-4">Mid-level roles</p>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Upgrade from Regular tier
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Better opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 bg-gradient-to-b from-purple-50 to-white">
              <CardHeader className="pb-2">
                <Badge variant="superDream" className="mx-auto mb-4 px-4 py-1">Super Dream</Badge>
                <CardTitle className="text-3xl font-bold">&gt; 10 LPA</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-4">Premium positions</p>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Top-tier companies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Dream holders can apply
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white border-0 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <CardContent className="py-16 text-center relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
                  Join hundreds of IIPS students who have successfully landed their dream jobs 
                  through our placement portal.
                </p>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="gap-2 px-8 shadow-lg hover:scale-105 transition-all duration-300">
                    Login with Institute Email <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <footer className="border-t bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold">IIPS Placement Portal</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Institute of Information Processing & Science,
                Devi Ahilya Vishwavidyalaya, Indore
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/drives" className="hover:text-primary transition-colors">Open Drives</Link></li>
                <li><a href="https://iips.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About IIPS</a></li>
                <li><a href="mailto:tpo@iips.edu.in" className="hover:text-primary transition-colors">Contact TPO</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>MCA (Integrated)</li>
                <li>MBA (Management Science)</li>
                <li>M.Tech (IT)</li>
                <li>MBA (Advertising & PR)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>tpo@iips.edu.in</li>
                <li>+91-731-XXXXXXX</li>
                <li>IIPS, Takshashila Campus</li>
                <li>DAVV, Indore - 452001</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} IIPS Smart Placement Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
