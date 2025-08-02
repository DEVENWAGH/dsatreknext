/**
 * Utility functions for premium access control
 */

export const checkProblemAccess = (problem, subscription) => {
  if (!problem) return false;

  const isPremiumProblem =
    problem.is_premium === true || problem.isPremium === true;
  const userPlan = subscription?.planId;

  // Free problems are accessible to everyone
  if (!isPremiumProblem) return true;

  // Premium problems require premium subscription only
  if (isPremiumProblem && userPlan === 'premium') return true;

  return false;
};

export const getRequiredPlan = problem => {
  if (!problem) return null;

  if (problem.is_premium === true || problem.isPremium === true)
    return 'premium';

  return null;
};

export const canUserAccessProblem = (problem, userSubscription) => {
  return checkProblemAccess(problem, userSubscription);
};
