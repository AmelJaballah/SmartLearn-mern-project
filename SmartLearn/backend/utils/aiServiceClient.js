

const axios = require("axios");

// Service URLs from environment
const AI_SERVICES = {
  exercise: process.env.EXERCISE_GEN_URL || "http://localhost:5001",
  chat: process.env.RAG_CHAT_URL || "http://localhost:5002",
  sentiment: process.env.SENTIMENT_URL || "http://localhost:5003",
};

// Default timeouts (in ms)
const TIMEOUTS = {
  health: 5000,
  chat: parseInt(process.env.AI_CHAT_TIMEOUT_MS || "300000", 10), 
  exercise: parseInt(process.env.AI_EXERCISE_TIMEOUT_MS || "120000", 10), 
  sentiment: 30000,
  default: 60000,
};

/**
 * Call an AI service with retry logic
 * @param {string} service - Service name: 'exercise' | 'chat' | 'sentiment'
 * @param {string} endpoint - Endpoint path (e.g., '/chat', '/generate-exercise')
 * @param {object} options - Request options
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {object} options.data - Request body
 * @param {number} options.timeout - Custom timeout
 * @param {number} options.retries - Number of retries (default: 1)
 * @returns {Promise<object>} Response data
 */
async function callAIService(service, endpoint, options = {}) {
  const {
    method = "POST",
    data = {},
    timeout = TIMEOUTS[service] || TIMEOUTS.default,
    retries = 1,
  } = options;

  const baseUrl = AI_SERVICES[service];
  if (!baseUrl) {
    throw new AIServiceError(`Unknown AI service: ${service}`, "INVALID_SERVICE");
  }

  const url = `${baseUrl}${endpoint}`;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry ${attempt}/${retries} for ${service}${endpoint}`);
        // Exponential backoff: 1s, 2s, 4s...
        await sleep(1000 * Math.pow(2, attempt - 1));
      }

      const response = await axios({
        method,
        url,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined,
        timeout,
        validateStatus: (status) => status < 500, // Don't throw on 4xx
      });

      // Handle non-2xx responses
      if (response.status >= 400) {
        throw new AIServiceError(
          response.data?.error || response.data?.message || `HTTP ${response.status}`,
          "SERVICE_ERROR",
          response.status
        );
      }

      return response.data;
    } catch (error) {
      lastError = normalizeError(error, service);

      // Don't retry on client errors (4xx)
      if (lastError.statusCode >= 400 && lastError.statusCode < 500) {
        throw lastError;
      }

      // Don't retry on final attempt
      if (attempt === retries) {
        throw lastError;
      }
    }
  }

  throw lastError;
}

/**
 * Check health of all AI services
 * @returns {Promise<object>} Health status of all services
 */
async function checkAllServicesHealth() {
  const results = await Promise.allSettled([
    callAIService("exercise", "/health", { method: "GET", timeout: TIMEOUTS.health, retries: 0 }),
    callAIService("chat", "/health", { method: "GET", timeout: TIMEOUTS.health, retries: 0 }),
    callAIService("sentiment", "/health", { method: "GET", timeout: TIMEOUTS.health, retries: 0 }),
  ]);

  const [exercise, chat, sentiment] = results;

  const formatResult = (result, serviceName) => {
    if (result.status === "fulfilled") {
      return { status: "healthy", ...result.value };
    }
    return {
      status: "down",
      error: result.reason?.message || "Service unavailable",
    };
  };

  const services = {
    exerciseGenerator: { url: AI_SERVICES.exercise, ...formatResult(exercise, "exercise") },
    chatbot: { url: AI_SERVICES.chat, ...formatResult(chat, "chat") },
    sentimentAnalysis: { url: AI_SERVICES.sentiment, ...formatResult(sentiment, "sentiment") },
  };

  const allHealthy = Object.values(services).every((s) => s.status === "healthy");

  return {
    overall: allHealthy ? "healthy" : "degraded",
    services,
  };
}

// =====================================================
// Helper Functions
// =====================================================

class AIServiceError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function normalizeError(error, service) {
  if (error instanceof AIServiceError) {
    return error;
  }

  // Connection refused
  if (error.code === "ECONNREFUSED") {
    return new AIServiceError(
      `${service} service is not available. Please ensure the Python API is running.`,
      "SERVICE_UNAVAILABLE",
      503
    );
  }

  // Timeout
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new AIServiceError(
      `${service} request timed out. The AI model may be loading. Please try again.`,
      "TIMEOUT",
      504
    );
  }

  // Network error
  if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
    return new AIServiceError(
      `Cannot connect to ${service} service. Network error.`,
      "NETWORK_ERROR",
      503
    );
  }

  // Axios error with response
  if (error.response) {
    return new AIServiceError(
      error.response.data?.error || error.response.data?.message || error.message,
      "SERVICE_ERROR",
      error.response.status
    );
  }

  // Generic error
  return new AIServiceError(error.message || "Unknown error", "UNKNOWN", 500);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =====================================================
// Convenience Methods
// =====================================================

const aiClient = {
  // Generic request method for custom endpoints
  request: (service, endpoint, method = 'POST', data = {}) =>
    callAIService(service, endpoint, { method, data }),

  // Chat with RAG
  chat: (message, sessionId, history = []) =>
    callAIService("chat", "/chat", {
      data: { message, sessionId, history },
      timeout: TIMEOUTS.chat,
    }),

  // Search knowledge base
  search: (query, k = 5) =>
    callAIService("chat", "/search", {
      data: { query, k },
      timeout: 15000,
    }),

  // Generate exercise
  generateExercise: (subject, difficulty, exerciseType, additionalContext = "") =>
    callAIService("exercise", "/generate-exercise", {
      data: { subject, difficulty, exerciseType, additionalContext },
      timeout: TIMEOUTS.exercise,
    }),

  // Get available subjects
  getSubjects: () =>
    callAIService("exercise", "/subjects", {
      method: "GET",
      timeout: 30000, // Increased timeout for model loading
    }),

  // Analyze sentiment
  analyzeSentiment: (text) =>
    callAIService("sentiment", "/analyze", {
      data: { text },
      timeout: TIMEOUTS.sentiment,
    }),

  // Batch analyze sentiments
  batchAnalyzeSentiment: (reviews) =>
    callAIService("sentiment", "/batch-analyze", {
      data: { reviews },
      timeout: 60000,
    }),

  // Health check
  checkHealth: checkAllServicesHealth,
};

module.exports = {
  aiClient,
  callAIService,
  checkAllServicesHealth,
  AIServiceError,
  AI_SERVICES,
  TIMEOUTS,
};
