'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

// Lazy load heavy sections with framer-motion animations
const HeroSection = dynamic(
  () => import('@/components/landing/hero-section').then(mod => ({ default: mod.HeroSection })),
  { 
    loading: () => <HeroSkeleton />,
    ssr: true 
  }
);

const StatsSection = dynamic(
  () => import('@/components/landing/stats-section').then(mod => ({ default: mod.StatsSection })),
  { 
    loading: () => <StatsSkeleton />,
    ssr: true 
  }
);

const FeaturesSection = dynamic(
  () => import('@/components/landing/features-section').then(mod => ({ default: mod.FeaturesSection })),
  { 
    loading: () => <FeaturesSkeleton />,
    ssr: true 
  }
);

const TiersSection = dynamic(
  () => import('@/components/landing/tiers-section').then(mod => ({ default: mod.TiersSection })),
  { 
    loading: () => <TiersSkeleton />,
    ssr: true 
  }
);

const CTASection = dynamic(
  () => import('@/components/landing/footer-section').then(mod => ({ default: mod.CTASection })),
  { ssr: true }
);

const Footer = dynamic(
  () => import('@/components/landing/footer-section').then(mod => ({ default: mod.Footer })),
  { ssr: true }
);

// Skeleton components for loading states
function HeroSkeleton() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 animate-pulse" />
        <div className="h-16 md:h-20 w-full max-w-2xl bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-16 md:h-20 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-6 animate-pulse" />
        <div className="h-6 w-full max-w-xl bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-10 animate-pulse" />
        <div className="flex gap-4 justify-center">
          <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSkeleton() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-10 w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-96 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4 animate-pulse" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

function TiersSkeleton() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border-2 p-6 text-center">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
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

      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TiersSection />
      <CTASection />
      <Footer />
    </div>
  );
}
