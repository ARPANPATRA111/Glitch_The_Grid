'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';

export function CTASection() {
  return (
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
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900 py-16">
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
  );
}
