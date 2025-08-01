// Central store exports for better organization
// Note: problemStore is deprecated - use TanStack Query hooks instead
export { useAuthStore } from './authStore';
export { useAdminStore } from './adminStore';
export { useCompanyStore } from './companyStore';
export { useLanguageStore } from './languageStore';
export { useSubscriptionStore } from './subscriptionStore';
export { useUIStore } from './uiStore';
export { useUserStore } from './userStore';
export { useCodeExecutionStore } from './codeExecutionStore';
export { useDiscussionStore } from './discussionStore';
export { useInterviewStore } from './interviewStore';
export { useWorkspaceStore } from './workspaceStore';
export { default as useSubmissionStore } from './submissionStore.js';

// Deprecated - use TanStack Query hooks instead
export { useProblemStore } from './problemStore';
