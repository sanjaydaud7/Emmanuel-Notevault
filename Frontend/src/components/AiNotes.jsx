import React, { useState, useRef, useEffect } from 'react';
import '../styles/AiNotes.css';

const AiNotes = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Use backend API base; default to local server in development
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // Replace mock AI generation with backend call
  const generateNotes = async (userPrompt) => {
    const res = await fetch(`${API_BASE}/api/ai/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });
    let data;
    try {
      data = await res.json();
    } catch {
      const txt = await res.text();
      throw new Error(txt || 'Failed to generate notes');
    }
    if (!res.ok || data?.success === false) {
      throw new Error(data?.detail || data?.message || 'Failed to generate notes');
    }
    return data.content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const notes = await generateNotes(prompt);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: notes,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: error?.message || 'Error generating notes. Please try again.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setPrompt('');
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="ai-notes-container">
      <div className="ai-notes-header">
        <div className="header-content">
        </div>
        {conversation.length > 0 && (
          <button onClick={clearConversation} className="clear-all-btn">
            Clear Chat
          </button>
        )}
      </div>

      <div className="conversation-area">
        {conversation.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">🤖</div>
            <h2>Welcome to AI Notes Generator</h2>
            <p>Ask me to generate notes on any topic, and I'll provide comprehensive, structured information.</p>
            <div className="example-prompts">
              <div className="example-prompt" onClick={() => setPrompt("Explain React hooks and their benefits")}>
                "Explain React hooks and their benefits"
              </div>
              <div className="example-prompt" onClick={() => setPrompt("Create notes about machine learning basics")}>
                "Create notes about machine learning basics"
              </div>
              <div className="example-prompt" onClick={() => setPrompt("Summarize JavaScript ES6 features")}>
                "Summarize JavaScript ES6 features"
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {conversation.map((message) => (
              <div key={message.id} className={`message ${message.type}-message`}>
                <div className="message-avatar">
                  {message.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.type === 'ai' ? (
                      <pre>{message.content}</pre>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  <div className="message-actions">
                    <button onClick={() => copyMessage(message.content)} className="copy-btn">
                      📋 Copy
                    </button>
                    <span className="timestamp">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message loading">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me to generate notes on any topic..."
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              disabled={!prompt.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiNotes;
