// API Client for DSATrek - matches backend controllers
const API_BASE_URL = '/api';

// Utility function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    credentials: 'include', // Include cookies for authentication
  };

  // Only set Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Skip session check for performance - handled by NextAuth middleware
  // Session validation is done at the middleware level

  const mergedOptions = { ...defaultOptions, ...options };

  // Merge headers properly
  if (options.headers && defaultOptions.headers) {
    mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }

  try {
    const response = await fetch(url, mergedOptions);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Auth API - matches user.controller.js
export const authAPI = {
  register: async userData => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  signup: async userData => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async credentials => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  getProfile: async () => {
    return apiCall('/auth/profile');
  },

  updateProfile: async profileData => {
    return apiCall('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  deleteAccount: async () => {
    return apiCall('/auth/delete', {
      method: 'DELETE',
    });
  },

  forgotPassword: async email => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, password) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Add missing getUserDetails method
  getUserDetails: async userId => {
    return apiCall(`/users/${userId}`);
  },

  // Get user by username
  getUserByUsername: async username => {
    return apiCall(`/users/username/${username}`);
  },

  // Add missing getUserStatistics method
  getUserStatistics: async userId => {
    return apiCall(`/users/${userId}/statistics`);
  },

  // Add getUserStats method for backward compatibility
  getUserStats: async userId => {
    return apiCall(`/users/${userId}/statistics`);
  },

  // Add missing checkAuth method
  checkAuth: async () => {
    return apiCall('/auth/check');
  },

  // OTP-based signup
  sendSignupOTP: async userData => {
    return apiCall('/auth/signup-otp', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  verifySignupOTP: async ({ email, otp }) => {
    return apiCall('/auth/verify-signup', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  // Add missing total method for admin stats
  total: async () => {
    return apiCall('/admin/total');
  },
};

// Problem API - matches problem.controller.js
export const problemAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Handle pagination parameters
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.fields) queryParams.append('fields', filters.fields);

    // Handle other filters
    Object.keys(filters).forEach(key => {
      if (!['page', 'limit', 'fields'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    return apiCall(`/problems?${queryParams}`);
  },

  getById: async id => {
    return apiCall(`/problems/${id}`);
  },

  create: async problemData => {
    return apiCall('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  },

  update: async (id, problemData) => {
    return apiCall(`/problems/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(problemData),
    });
  },

  delete: async id => {
    return apiCall(`/problems/${id}`, {
      method: 'DELETE',
    });
  },

  getByTag: async tag => {
    return apiCall(`/problems/tag/${tag}`);
  },

  getByDifficulty: async difficulty => {
    return apiCall(`/problems/difficulty/${difficulty}`);
  },

  search: async searchTerm => {
    return apiCall(`/problems/search?q=${encodeURIComponent(searchTerm)}`);
  },

  getSubmissions: async problemId => {
    return apiCall(`/problems/${problemId}/submissions`);
  },

  submit: async ({ problemId, code, language }) => {
    return apiCall(`/submissions/${problemId}`, {
      method: 'POST',
      body: JSON.stringify({
        source_code: code,
        language_id: parseInt(language),
      }),
    });
  },

  test: async ({ problemId, code, language, testCases }) => {
    return apiCall(`/submissions/${problemId}`, {
      method: 'POST',
      body: JSON.stringify({
        source_code: code,
        language_id: parseInt(language),
        stdin: testCases,
      }),
    });
  },
};

// Submission API - matches submission.controller.js
export const submissionAPI = {
  create: async submissionData => {
    return apiCall('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  getByUserId: async (userId, page = 1, limit = 20) => {
    return apiCall(`/submissions?userId=${userId}&page=${page}&limit=${limit}`);
  },

  getByProblemId: async (problemId, page = 1, limit = 20) => {
    return apiCall(
      `/submissions?problemId=${problemId}&page=${page}&limit=${limit}`
    );
  },

  getById: async id => {
    return apiCall(`/submissions/${id}`);
  },

  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiCall(`/submissions?${queryParams}`);
  },

  update: async (id, submissionData) => {
    return apiCall(`/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(submissionData),
    });
  },

  getSolvedByProblemId: async (problemId, userId) => {
    return apiCall(
      `/submissions?problemId=${problemId}&userId=${userId}&status=accepted`
    );
  },

  // Add the missing getSolvedProblemById function for backward compatibility
  getSolvedProblemById: async (problemId, userId) => {
    return apiCall(`/submissions/solved/${problemId}?userId=${userId}`);
  },

  getAllSolvedProblemByUserId: async (userId, page = 1, limit = 20) => {
    return apiCall(`/users/${userId}/solved?page=${page}&limit=${limit}`);
  },

  getAllSubmissions: async (userId, page = 1, limit = 20) => {
    return apiCall(`/users/${userId}/submissions?page=${page}&limit=${limit}`);
  },

  getRecentSubmissionsByUserId: async (userId, page = 1, limit = 20) => {
    return apiCall(`/users/${userId}/submissions?page=${page}&limit=${limit}`);
  },

  getActivityStreakByUserId: async (userId, year = null) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    const query = params.toString() ? `?${params}` : '';
    return apiCall(`/users/${userId}/streak${query}`);
  },

  // Remove the incomplete method and add the complete one
  getSolvedProblem: async () => {
    return apiCall('/submissions/solved');
  },
};

// Company API - matches company.controller.js
export const companyAPI = {
  getAllCompanies: async () => {
    return apiCall('/companies');
  },

  getAll: async () => {
    return apiCall('/companies');
  },

  getById: async id => {
    return apiCall(`/companies/${id}`);
  },

  // Backward compatibility
  getCompanyById: async id => {
    return apiCall(`/companies/${id}`);
  },

  create: async companyData => {
    return apiCall('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  },

  update: async (id, companyData) => {
    return apiCall(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(companyData),
    });
  },

  delete: async id => {
    return apiCall(`/companies/${id}`, {
      method: 'DELETE',
    });
  },

  getProblems: async id => {
    return apiCall(`/companies/${id}/problems`);
  },
};

// Discussion API - matches discussion.controller.js
export const discussionAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiCall(`/discussions?${queryParams}`);
  },

  getById: async id => {
    return apiCall(`/discussions/${id}`);
  },

  create: async discussionData => {
    return apiCall('/discussions', {
      method: 'POST',
      body: JSON.stringify(discussionData),
    });
  },

  update: async (id, discussionData) => {
    return apiCall(`/discussions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(discussionData),
    });
  },

  delete: async id => {
    return apiCall(`/discussions/${id}`, {
      method: 'DELETE',
    });
  },

  getByProblemId: async problemId => {
    return apiCall(`/discussions/problem/${problemId}`);
  },

  addComment: async (discussionId, commentData) => {
    return apiCall(`/discussions/${discussionId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  updateComment: async (discussionId, commentId, commentData) => {
    return apiCall(`/discussions/${discussionId}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify(commentData),
    });
  },

  deleteComment: async (discussionId, commentId) => {
    return apiCall(`/discussions/${discussionId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// Code Execution API - matches executeCode.controller.js
export const executeAPI = {
  executeCode: async codeData => {
    return apiCall('/execute', {
      method: 'POST',
      body: JSON.stringify(codeData),
    });
  },

  createSubmission: async (problemId, submissionData) => {
    return apiCall(`/submissions/${problemId}`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  getTestResults: async submissionId => {
    return apiCall(`/execute/results/${submissionId}`);
  },

  // Batch operations
  executeBatch: async operations => {
    return apiCall('/execute/batch', {
      method: 'POST',
      body: JSON.stringify({ operations }),
    });
  },

  submitBatch: async submissions => {
    return apiCall('/submissions/batch', {
      method: 'POST',
      body: JSON.stringify({ submissions }),
    });
  },
};

// Playlist API - matches playlist.controller.js
export const playlistAPI = {
  getAll: async () => {
    return apiCall('/playlists');
  },

  getById: async id => {
    return apiCall(`/playlists/${id}`);
  },

  create: async playlistData => {
    return apiCall('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    });
  },

  update: async (id, playlistData) => {
    return apiCall(`/playlists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(playlistData),
    });
  },

  delete: async id => {
    return apiCall(`/playlists/${id}`, {
      method: 'DELETE',
    });
  },

  addProblem: async (playlistId, problemId) => {
    return apiCall(`/playlists/${playlistId}/problems`, {
      method: 'POST',
      body: JSON.stringify({ problemId }),
    });
  },

  removeProblem: async (playlistId, problemId) => {
    return apiCall(`/playlists/${playlistId}/problems/${problemId}`, {
      method: 'DELETE',
    });
  },

  getProblems: async playlistId => {
    return apiCall(`/playlists/${playlistId}/problems`);
  },
};

// Interview API - matches interview.controller.js
export const interviewAPI = {
  getAll: async () => {
    return apiCall('/interviews');
  },

  getById: async id => {
    return apiCall(`/interviews/${id}`);
  },

  create: async interviewData => {
    return apiCall('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  update: async (id, interviewData) => {
    return apiCall(`/interviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(interviewData),
    });
  },

  delete: async id => {
    return apiCall(`/interviews/${id}`, {
      method: 'DELETE',
    });
  },

  getByUserId: async userId => {
    return apiCall(`/interviews/user/${userId}`);
  },

  updateStatus: async (id, status) => {
    return apiCall(`/interviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Interview API with naming convention used by store
export const InterviewAPI = {
  createInterview: async interviewData => {
    return apiCall('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  getuserInterviews: async (userId = null) => {
    const url = userId ? `/interviews?userId=${userId}` : '/interviews';
    return apiCall(url);
  },

  getInterviewById: async interviewId => {
    return apiCall(`/interviews/${interviewId}`);
  },

  updateInterviewStatus: async (interviewId, statusData) => {
    return apiCall(`/interviews/${interviewId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },
};

// Payment API - matches payment.controller.js
export const paymentAPI = {
  createOrder: async planData => {
    return apiCall('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  verifyPayment: async paymentData => {
    return apiCall('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getHistory: async () => {
    return apiCall('/payments/history');
  },

  createSubscription: async planData => {
    return apiCall('/payments/subscription', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  getSubscription: async () => {
    return apiCall('/payments/subscription');
  },

  getUserSubscription: async () => {
    try {
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        if (session?.user?.id) {
          const response = await apiCall(
            `/payments/subscription?userId=${session.user.id}`
          );
          return response;
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }

    // Return default freemium subscription if no session
    return {
      success: true,
      data: {
        planId: 'freemium',
        planName: 'Freemium',
        status: 'active',
        expiresAt: null,
        isSubscribed: false,
      },
    };
  },

  cancelSubscription: async () => {
    return apiCall('/payments/subscription/cancel', {
      method: 'POST',
    });
  },

  updatePaymentMethod: async paymentMethodData => {
    return apiCall('/payments/method', {
      method: 'PATCH',
      body: JSON.stringify(paymentMethodData),
    });
  },

  getInvoices: async () => {
    return apiCall('/payments/invoices');
  },
};

// Admin API - matches admin.controller.js
export const adminAPI = {
  getAllUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiCall(`/admin/users?${queryParams}`);
  },

  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiCall(`/admin/users?${queryParams}`);
  },

  getUserById: async id => {
    return apiCall(`/admin/users/${id}`);
  },

  updateUser: async (id, userData) => {
    return apiCall(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  changeRole: async id => {
    return apiCall(`/admin/users/${id}/role`, {
      method: 'PATCH',
    });
  },

  deleteUser: async id => {
    return apiCall(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  getDashboardStats: async () => {
    return apiCall('/admin/stats');
  },

  getTotalStats: async () => {
    return apiCall('/admin/total');
  },

  getSystemHealth: async () => {
    return apiCall('/admin/health');
  },

  moderateContent: async (contentId, action) => {
    return apiCall(`/admin/moderate/${contentId}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },
};

// Editorial API - matches editorial.controller.js
export const editorialAPI = {
  getAll: async () => {
    return apiCall('/editorials');
  },

  getById: async id => {
    return apiCall(`/editorials/${id}`);
  },

  getByProblemId: async problemId => {
    return apiCall(`/editorials/problem/${problemId}`);
  },

  create: async editorialData => {
    return apiCall('/editorials', {
      method: 'POST',
      body: JSON.stringify(editorialData),
    });
  },

  update: async (id, editorialData) => {
    return apiCall(`/editorials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(editorialData),
    });
  },

  delete: async id => {
    return apiCall(`/editorials/${id}`, {
      method: 'DELETE',
    });
  },
};

// User API for additional user-related endpoints
export const userAPI = {
  getStats: async userId => {
    return apiCall(`/users/${userId}/stats`);
  },

  getStatistics: async userId => {
    return apiCall(`/users/${userId}/statistics`);
  },

  getProgress: async userId => {
    return apiCall(`/users/${userId}/progress`);
  },

  updatePreferences: async (userId, preferences) => {
    return apiCall(`/users/${userId}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  },

  getAchievements: async userId => {
    return apiCall(`/users/${userId}/achievements`);
  },

  getUserStats: async userId => {
    return apiCall(`/users/${userId}/stats`);
  },

  uploadAvatar: async file => {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiCall('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for FormData
      },
    });
  },
};

// Backward compatibility exports
export const DiscussionAPI = discussionAPI;

// Export default object with all APIs for convenience
const apiClient = {
  auth: authAPI,
  problems: problemAPI,
  submissions: submissionAPI,
  companies: companyAPI,
  discussions: discussionAPI,
  execute: executeAPI,
  playlists: playlistAPI,
  interviews: interviewAPI,
  payments: paymentAPI,
  admin: adminAPI,
  editorials: editorialAPI,
  users: userAPI,
};

export default apiClient;
