import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
    },
    {
      type: 'category',
      label: 'Fundamentals',
      items: [
        'fundamentals/scalability',
        'fundamentals/reliability',
        'fundamentals/performance',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/load-balancing',
        'components/caching',
        'components/database-design',
      ],
    },
    {
      type: 'category',
      label: 'Implementation',
      items: [
        'implementation/message-queue-examples',
        'implementation/caching-examples',
        'implementation/database-examples',
        'implementation/load-balancing-examples',
      ],
    },
    {
      type: 'category',
      label: 'Case Studies',
      items: [
        'case-studies/twitter',
        'case-studies/netflix',
        'case-studies/uber',
      ],
    },
    {
      type: 'category',
      label: 'References',
      items: [
        'references/books',
        'references/blogs',
        'references/courses',
        'references/tools',
        'references/online-resources',
        'references/case-studies',
      ],
    },
  ],
};

export default sidebars;
