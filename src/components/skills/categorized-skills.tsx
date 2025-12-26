'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Code, Database, Wrench, Users, Globe, Brain } from 'lucide-react';

// Skill categories with their keywords for automatic categorization
const SKILL_CATEGORIES = {
  languages: {
    name: 'Programming Languages',
    icon: Code,
    keywords: [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang',
      'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
      'powershell', 'sql', 'html', 'css', 'sass', 'scss', 'less', 'c', 'objective-c',
      'assembly', 'fortran', 'cobol', 'lua', 'dart', 'elixir', 'erlang', 'haskell',
      'clojure', 'f#', 'ocaml', 'groovy', 'vb.net', 'visual basic', 'delphi', 'pascal'
    ],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  frameworks: {
    name: 'Frameworks & Libraries',
    icon: Globe,
    keywords: [
      'react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
      'express', 'nestjs', 'fastify', 'koa', 'django', 'flask', 'fastapi', 'spring',
      'spring boot', 'springboot', 'laravel', 'symfony', 'rails', 'ruby on rails',
      'asp.net', '.net', 'dotnet', 'node', 'nodejs', 'node.js', 'deno', 'bun',
      'jquery', 'bootstrap', 'tailwind', 'material-ui', 'mui', 'chakra', 'antd',
      'redux', 'mobx', 'zustand', 'recoil', 'rxjs', 'graphql', 'apollo',
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
      'matplotlib', 'seaborn', 'opencv', 'flutter', 'react native', 'ionic', 'electron',
      'qt', 'wxwidgets', 'gtk', 'hibernate', 'mybatis', 'prisma', 'sequelize',
      'typeorm', 'mongoose', 'drizzle', 'strapi', 'wordpress', 'drupal'
    ],
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  databases: {
    name: 'Databases',
    icon: Database,
    keywords: [
      'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
      'dynamodb', 'firebase', 'firestore', 'supabase', 'sqlite', 'oracle', 'sql server',
      'mssql', 'mariadb', 'couchdb', 'neo4j', 'arangodb', 'influxdb', 'timescaledb',
      'cockroachdb', 'planetscale', 'neon', 'fauna', 'rethinkdb', 'memcached',
      'bigquery', 'snowflake', 'redshift', 'athena', 'hive', 'spark', 'presto',
      'clickhouse', 'druid', 'pinecone', 'weaviate', 'milvus', 'qdrant'
    ],
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  tools: {
    name: 'Tools & DevOps',
    icon: Wrench,
    keywords: [
      'git', 'github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 'k8s',
      'jenkins', 'travis', 'circleci', 'github actions', 'azure devops',
      'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
      'netlify', 'digitalocean', 'linode', 'vultr', 'cloudflare', 'terraform',
      'ansible', 'puppet', 'chef', 'vagrant', 'packer', 'consul', 'vault',
      'prometheus', 'grafana', 'datadog', 'new relic', 'splunk', 'elk', 'kibana',
      'logstash', 'nginx', 'apache', 'caddy', 'haproxy', 'vscode', 'vim', 'neovim',
      'intellij', 'pycharm', 'webstorm', 'eclipse', 'xcode', 'android studio',
      'postman', 'insomnia', 'swagger', 'openapi', 'figma', 'sketch', 'adobe xd',
      'jira', 'confluence', 'notion', 'trello', 'asana', 'slack', 'teams',
      'linux', 'ubuntu', 'debian', 'centos', 'rhel', 'windows server'
    ],
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  aiml: {
    name: 'AI & Machine Learning',
    icon: Brain,
    keywords: [
      'machine learning', 'deep learning', 'neural network', 'nlp', 'natural language',
      'computer vision', 'image processing', 'object detection', 'image classification',
      'reinforcement learning', 'supervised learning', 'unsupervised learning',
      'data science', 'data analysis', 'data mining', 'statistics', 'probability',
      'linear algebra', 'calculus', 'optimization', 'regression', 'classification',
      'clustering', 'dimensionality reduction', 'feature engineering', 'model deployment',
      'mlops', 'llm', 'large language model', 'gpt', 'bert', 'transformer', 'rag',
      'langchain', 'openai', 'huggingface', 'stable diffusion', 'generative ai',
      'chatbot', 'recommendation system', 'sentiment analysis', 'time series',
      'forecasting', 'anomaly detection', 'a/b testing', 'experimentation'
    ],
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  },
  soft: {
    name: 'Soft Skills',
    icon: Users,
    keywords: [
      'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
      'creativity', 'adaptability', 'time management', 'project management', 'agile',
      'scrum', 'kanban', 'public speaking', 'presentation', 'negotiation', 'conflict resolution',
      'mentoring', 'coaching', 'collaboration', 'decision making', 'strategic thinking',
      'emotional intelligence', 'empathy', 'active listening', 'written communication',
      'technical writing', 'documentation', 'customer service', 'stakeholder management',
      'cross-functional', 'remote work', 'async communication'
    ],
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }
} as const;

type SkillCategory = keyof typeof SKILL_CATEGORIES;

// Define the order of categories to check (ensures consistent categorization)
const CATEGORY_ORDER: SkillCategory[] = ['aiml', 'frameworks', 'databases', 'tools', 'soft', 'languages'];

/**
 * Categorizes a skill based on keyword matching
 * Priority: exact match > partial match (skill contains keyword) > reverse partial (keyword contains skill)
 */
export function categorizeSkill(skill: string): SkillCategory {
  const normalizedSkill = skill.toLowerCase().trim();
  
  // First pass: Check for exact matches across all categories
  for (const category of CATEGORY_ORDER) {
    const config = SKILL_CATEGORIES[category];
    if (config.keywords.some(keyword => normalizedSkill === keyword)) {
      return category;
    }
  }
  
  // Second pass: Check if skill contains a keyword (e.g., "react native" contains "react")
  for (const category of CATEGORY_ORDER) {
    const config = SKILL_CATEGORIES[category];
    if (config.keywords.some(keyword => normalizedSkill.includes(keyword))) {
      return category;
    }
  }
  
  // Third pass: Check if any keyword contains the skill (e.g., "spring boot" contains "spring")
  for (const category of CATEGORY_ORDER) {
    const config = SKILL_CATEGORIES[category];
    if (config.keywords.some(keyword => keyword.includes(normalizedSkill) && normalizedSkill.length >= 3)) {
      return category;
    }
  }
  
  return 'tools'; // Default category for uncategorized skills
}

/**
 * Categorizes an array of skills
 */
export function categorizeSkills(skills: string[]): Record<SkillCategory, string[]> {
  const categorized: Record<SkillCategory, string[]> = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    aiml: [],
    soft: []
  };
  
  skills.forEach(skill => {
    const category = categorizeSkill(skill);
    categorized[category].push(skill);
  });
  
  return categorized;
}

interface CategorizedSkillsProps {
  skills: string[];
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Displays skills grouped by category
 */
export function CategorizedSkills({ 
  skills, 
  className = '',
  collapsible = true,
  defaultExpanded = true
}: CategorizedSkillsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<SkillCategory>>(
    defaultExpanded ? new Set(Object.keys(SKILL_CATEGORIES) as SkillCategory[]) : new Set()
  );
  
  const categorizedSkills = useMemo(() => categorizeSkills(skills), [skills]);
  
  const toggleCategory = (category: SkillCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };
  
  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(SKILL_CATEGORIES) as SkillCategory[]));
  };
  
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };
  
  // Filter out empty categories
  const nonEmptyCategories = Object.entries(categorizedSkills)
    .filter(([_, skills]) => skills.length > 0) as [SkillCategory, string[]][];
  
  if (skills.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No skills added yet. Upload your resume to extract skills automatically.
      </div>
    );
  }
  
  return (
    <div className={className}>
      {collapsible && nonEmptyCategories.length > 1 && (
        <div className="flex gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      )}
      
      <div className="space-y-3">
        {nonEmptyCategories.map(([category, categorySkills]) => {
          const config = SKILL_CATEGORIES[category];
          const Icon = config.icon;
          const isExpanded = expandedCategories.has(category);
          
          if (collapsible) {
            return (
              <Collapsible 
                key={category} 
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <CardTitle className="text-sm font-medium">
                            {config.name}
                          </CardTitle>
                          <Badge variant="secondary" className="ml-2">
                            {categorySkills.length}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className={config.color}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          }
          
          return (
            <Card key={category}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">
                    {config.name}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {categorySkills.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className={config.color}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Simple inline display of categorized skills
 */
export function CategorizedSkillsBadges({ skills }: { skills: string[] }) {
  const categorizedSkills = useMemo(() => categorizeSkills(skills), [skills]);
  
  return (
    <div className="space-y-2">
      {Object.entries(categorizedSkills)
        .filter(([_, skills]) => skills.length > 0)
        .map(([category, categorySkills]) => {
          const config = SKILL_CATEGORIES[category as SkillCategory];
          return (
            <div key={category} className="flex flex-wrap gap-1">
              {categorySkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className={`text-xs ${config.color}`}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          );
        })}
    </div>
  );
}

export { SKILL_CATEGORIES };
export type { SkillCategory };
