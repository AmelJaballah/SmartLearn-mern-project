import { useContext, useEffect, useReducer, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const initialState = {
  sessions: [],
  currentSession: null,
  messages: [],
  inputMessage: "",
  sending: false,
  loading: true,
  feedbackSubmitting: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SESSIONS":
      return { ...state, sessions: action.sessions, loading: false };
    case "SET_CURRENT_SESSION":
      return { ...state, currentSession: action.session, messages: action.session?.messages || [] };
    case "SET_INPUT":
      return { ...state, inputMessage: action.value };
    case "START_SENDING":
      return { ...state, sending: true };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message], sending: false };
    case "UPDATE_SESSION_MESSAGES":
      return { ...state, messages: action.messages, sending: false };
    case "START_FEEDBACK":
      return { ...state, feedbackSubmitting: true };
    case "UPDATE_MESSAGE_FEEDBACK":
      return {
        ...state,
        messages: state.messages.map((msg, idx) =>
          idx === action.messageIndex ? { ...msg, feedback: action.feedback } : msg
        ),
        feedbackSubmitting: false,
      };
    default:
      return state;
  }
}

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  async function loadSessions() {
    try {
      const res = await api.get("/chat-sessions", { params: { user: user?._id } });
      dispatch({ type: "SET_SESSIONS", sessions: res.data });
      if (res.data.length > 0) {
        dispatch({ type: "SET_CURRENT_SESSION", session: res.data[0] });
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      dispatch({ type: "SET_SESSIONS", sessions: [] });
    }
  }

  async function createNewSession() {
    try {
      const res = await api.post("/chat-sessions", {
        user: user._id,
        title: "New Chat",
        messages: [],
      });
      await loadSessions();
      dispatch({ type: "SET_CURRENT_SESSION", session: res.data });
    } catch (err) {
      alert("Failed to create session");
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!state.inputMessage.trim() || state.sending) return;

    const userMessage = {
      role: "user",
      content: state.inputMessage,
      createdAt: new Date(),
    };

    dispatch({ type: "ADD_MESSAGE", message: userMessage });
    const userQuestion = state.inputMessage;
    dispatch({ type: "SET_INPUT", value: "" });
    dispatch({ type: "START_SENDING" });

    try {
      // Call real backend API (which calls Python RAG service)
      const response = await api.post("/ai/chat", {
        message: userQuestion,
        sessionId: state.currentSession?._id,
        history: state.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      });

      const aiMessage = {
        role: "assistant",
        content: response.data.response,
        createdAt: new Date(),
        sources: response.data.sources || [],
      };

      const updatedMessages = [...state.messages, userMessage, aiMessage];

      // Save updated messages to backend
      if (state.currentSession) {
        await api.patch(`/chat-sessions/${state.currentSession._id}`, {
          messages: updatedMessages,
        });
      }

      dispatch({ type: "UPDATE_SESSION_MESSAGES", messages: updatedMessages });
    } catch (err) {
      console.error("Failed to send message:", err);
      
      // Show error message to user
      const errorMsg = err.response?.data?.message || "Failed to get response. Please try again.";
      const errorMessage = {
        role: "assistant",
        content: `❌ Error: ${errorMsg}`,
        createdAt: new Date(),
      };
      
      dispatch({ type: "UPDATE_SESSION_MESSAGES", messages: [...state.messages, userMessage, errorMessage] });
    }
  }

  function selectSession(session) {
    dispatch({ type: "SET_CURRENT_SESSION", session });
  }

  async function handleFeedback(messageIndex, feedbackText, rating) {
    dispatch({ type: "START_FEEDBACK" });

    try {
      // Analyze sentiment of the feedback
      const sentimentResponse = await api.post("/ai/analyze-sentiment", {
        text: feedbackText,
      });

      const feedback = {
        text: feedbackText,
        rating: rating,
        sentiment: sentimentResponse.data.sentiment,
        sentimentLabel: sentimentResponse.data.label,
        timestamp: new Date(),
      };

      dispatch({ type: "UPDATE_MESSAGE_FEEDBACK", messageIndex, feedback });

      // Save to backend
      if (state.currentSession) {
        const updatedMessages = state.messages.map((msg, idx) =>
          idx === messageIndex ? { ...msg, feedback } : msg
        );
        await api.patch(`/chat-sessions/${state.currentSession._id}`, {
          messages: updatedMessages,
        });
      }

      alert("✅ Thank you for your feedback!");
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("❌ Failed to submit feedback. Please try again.");
      dispatch({ type: "UPDATE_MESSAGE_FEEDBACK", messageIndex, feedback: null });
    }
  }

  if (state.loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>💬 Chat Sessions</h2>
        <button onClick={createNewSession} style={styles.newChatBtn}>
          + New Chat
        </button>
        <div style={styles.sessionList}>
          {state.sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => selectSession(session)}
              style={{
                ...styles.sessionItem,
                ...(state.currentSession?._id === session._id ? styles.sessionItemActive : {}),
              }}
            >
              <div style={styles.sessionTitle}>{session.title}</div>
              <div style={styles.sessionDate}>
                {new Date(session.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chatArea}>
        {!state.currentSession ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🤖</div>
            <h2>Welcome to AI Math Tutor</h2>
            <p>Create a new chat to get started</p>
          </div>
        ) : (
          <>
            <div style={styles.messagesContainer}>
              {state.messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>👋</div>
                  <p>Ask me anything about math!</p>
                </div>
              ) : (
                state.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.message,
                      ...(msg.role === "user" ? styles.userMessage : styles.aiMessage),
                    }}
                  >
                    <div style={styles.messageRole}>
                      {msg.role === "user" ? "You" : "🤖 AI Tutor"}
                    </div>
                    <div style={styles.messageContent}>{msg.content}</div>
                    {msg.role === "assistant" && !msg.feedback && (
                      <div style={styles.feedbackSection}>
                        <button
                          onClick={() => {
                            const feedback = prompt("How was this response? (Optional comment)");
                            if (feedback !== null) {
                              const rating = prompt("Rate from 1-5 (1=poor, 5=excellent)");
                              if (rating && rating >= 1 && rating <= 5) {
                                handleFeedback(idx, feedback, parseInt(rating));
                              }
                            }
                          }}
                          style={styles.feedbackBtn}
                          disabled={state.feedbackSubmitting}
                        >
                          👍 Feedback
                        </button>
                      </div>
                    )}
                    {msg.feedback && (
                      <div style={styles.feedbackDisplay}>
                        ✅ Feedback submitted ({msg.feedback.sentiment})
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.inputForm}>
              <input
                type="text"
                value={state.inputMessage}
                onChange={(e) => dispatch({ type: "SET_INPUT", value: e.target.value })}
                placeholder="Ask a question about math..."
                style={styles.input}
                disabled={state.sending}
              />
              <button type="submit" disabled={state.sending || !state.inputMessage.trim()} style={styles.sendBtn}>
                {state.sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Mock function removed - now using real RAG-powered AI responses via API

const styles = {
  container: { display: "flex", height: "calc(100vh - 100px)", maxHeight: 850, background: "#ffffff", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", margin: "24px auto", maxWidth: 1200, boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
  loading: { padding: 24, color: "#64748b" },
  sidebar: {
    width: 300,
    borderRight: "1px solid #e2e8f0",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "#f8fafc",
  },
  sidebarTitle: { fontSize: 18, fontWeight: 600, margin: 0, color: "#1e293b" },
  newChatBtn: {
    padding: "12px 20px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
  },
  sessionList: { display: "flex", flexDirection: "column", gap: 8, overflow: "auto", flex: 1 },
  sessionItem: {
    padding: 14,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sessionItemActive: { background: "#eef2ff", borderColor: "#4f46e5", boxShadow: "0 2px 8px rgba(79, 70, 229, 0.1)" },
  sessionTitle: { fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#1e293b" },
  sessionDate: { fontSize: 12, color: "#94a3b8" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", background: "#ffffff" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#64748b" },
  emptyIcon: { fontSize: 72 },
  messagesContainer: { flex: 1, overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20, background: "#fafafa" },
  message: { maxWidth: "75%", padding: 16, borderRadius: 16 },
  userMessage: { alignSelf: "flex-end", background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", color: "white", borderBottomRightRadius: 4 },
  aiMessage: { alignSelf: "flex-start", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderBottomLeftRadius: 4 },
  messageRole: { fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.85 },
  messageContent: { whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 15 },
  inputForm: { padding: 20, borderTop: "1px solid #e2e8f0", display: "flex", gap: 12, background: "#ffffff" },
  input: {
    flex: 1,
    padding: "14px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 15,
    background: "#f8fafc",
    color: "#1e293b",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  sendBtn: {
    padding: "14px 28px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
  },
  feedbackSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #e2e8f0",
  },
  feedbackBtn: {
    padding: "8px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: 13,
    color: "#475569",
    fontWeight: 500,
  },
  feedbackDisplay: {
    marginTop: 10,
    padding: "8px 14px",
    background: "#d1fae5",
    borderRadius: 8,
    fontSize: 13,
    color: "#059669",
    fontWeight: 500,
  },
};
