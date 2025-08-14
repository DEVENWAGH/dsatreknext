// Core Configuration
export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000,
};

// AI Configuration
export const AI_CONFIG = {
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY,
};

export const THEME_CONFIG = {
  LIGHT_LOGO: '/dsaD.svg',
  DARK_LOGO: '/D.svg',
};

// UI Constants
export const DIFFICULTY_COLORS = {
  easy: 'text-green-500',
  medium: 'text-amber-500',
  hard: 'text-red-500',
};

export const STATUS_COLORS = {
  accepted: 'text-green-500',
  'wrong-answer': 'text-red-500',
  pending: 'text-gray-500',
};

// Language Configuration
export const LANGUAGE_CONFIG = {
  javascript: { id: 63, name: 'JavaScript' },
  python: { id: 71, name: 'Python' },
  java: { id: 62, name: 'Java' },
  cpp: { id: 54, name: 'C++' },
};

export const ROUTES = {
  HOME: '/',
  PROBLEMS: '/problems',
  PROFILE: '/profile',
  WORKSPACE: '/workspace',
};

export const EDITORIAL_TEMPLATE = [
  {
    type: 'h2',
    children: [{ text: 'Problem Recap' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Intuition' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Approaches' }],
  },
  {
    type: 'h3',
    children: [{ text: '1. Brute Force (Nested Loops)' }],
  },
  {
    type: 'p',
    children: [{ text: 'Steps:' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Recommended Solution' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Complexity Analysis' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Edge Cases' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Implementation Notes' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Visual Explanation' }],
  },
];

// Template helper functions
export const getTemplateByType = type => {
  switch (type) {
    case 'description':
      return PROBLEM_DESCRIPTION_TEMPLATE;
    case 'editorial':
      return EDITORIAL_TEMPLATE;
    default:
      return [{ type: 'p', children: [{ text: '' }] }];
  }
};

// Problem Templates
export const PROBLEM_DESCRIPTION_TEMPLATE = [
  {
    type: 'h2',
    children: [{ text: 'Title' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Problem Statement' }],
  },

  {
    type: 'h2',
    children: [{ text: 'Example' }],
  },
  {
    type: 'p',
    children: [{ text: 'Input: height = ' }],
  },
  {
    type: 'p',
    children: [{ text: 'Output: ' }],
  },
  {
    type: 'p',
    children: [{ text: 'Explanation:' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Constraints' }],
  },
];
