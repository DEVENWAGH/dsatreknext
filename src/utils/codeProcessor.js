/**
 * Merges topCode, userCode, and bottomCode for Judge0 submission
 * @param {string} topCode - Code injected before user code (imports, input parsing)
 * @param {string} userCode - User's solution code
 * @param {string} bottomCode - Code injected after user code (test runner, output)
 * @returns {string} Final merged code ready for Judge0
 */
export function mergeFinalCode(topCode = '', userCode = '', bottomCode = '') {
  let finalCode = '';

  // Add top code if exists
  if (topCode && topCode.trim()) {
    finalCode += `${topCode.trim()}\n\n`;
  }

  // Add user code (always required)
  finalCode += `${userCode.trim()}\n\n`;

  // Add bottom code if exists
  if (bottomCode && bottomCode.trim()) {
    finalCode += `${bottomCode.trim()}`;
  }

  return finalCode.trim();
}

/**
 * Prepares code for Judge0 submission by merging template codes with user solution
 * @param {Object} problem - Problem object from database
 * @param {string} userCode - User's submitted code
 * @param {string} language - Programming language key (e.g., 'PYTHON', 'JAVASCRIPT')
 * @returns {string} Final code ready for Judge0
 */
export function prepareCodeForJudge(problem, userCode, language) {
  const topCode = problem.topCode?.[language] || '';
  const bottomCode = problem.bottomCode?.[language] || '';

  // If no top or bottom code, return user code as-is
  if (!topCode.trim() && !bottomCode.trim()) {
    return userCode;
  }

  return mergeFinalCode(topCode, userCode, bottomCode);
}
