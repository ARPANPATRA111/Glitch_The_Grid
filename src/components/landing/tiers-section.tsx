'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function TiersSection() {
  return (
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
          <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
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
          <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 scale-105 shadow-xl relative">
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
          <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900">
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
  );
}
