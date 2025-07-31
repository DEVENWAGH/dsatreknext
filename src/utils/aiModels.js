export const DISCUSSION_MODELS = [
  {
    id: 'gemini-direct',
    name: 'Gemini 2.5 Flash (Direct)',
    provider: 'Google Direct',
  },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
  },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder (Free)', provider: 'Qwen' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    provider: 'Meta',
  },
];

export const DEFAULT_DISCUSSION_MODEL = 'gemini-direct';

export const INTERVIEW_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Direct)',
    provider: 'Google Direct',
  },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder (Free)', provider: 'Qwen' },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
  },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    provider: 'Meta',
  },
];

export const DEFAULT_INTERVIEW_MODEL = 'gemini-2.5-flash';
