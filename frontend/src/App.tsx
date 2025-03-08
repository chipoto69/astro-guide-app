import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Define interfaces for TypeScript
interface FormData {
  name: string;
  birthday: string;
  birthplace: string;
  jobTitle: string;
}

interface ResultData {
  userId?: number;
  name?: string;
  sunSign: string;
  hdType: string;
  chatResponse: string;
}

interface ChatMessage {
  text: string;
  isBot: boolean;
}

function App() {
  // State variables
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthday: '',
    birthplace: '',
    jobTitle: ''
  });
  const [results, setResults] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Send data to backend
      const response = await axios.post('/api/user', formData);
      
      // Update results state with response data
      setResults(response.data);
      
      // Add initial chatbot message
      setChatMessages([
        {
          text: `Welcome ${formData.name}! ${response.data.chatResponse}`,
          isBot: true
        }
      ]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send a message to the chatbot
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const newMessage = { text: messageText, isBot: false };
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);
    
    // Simple chat functionality for MVP - just echo back with personalized prefix
    if (results) {
      setTimeout(() => {
        setChatMessages([
          ...updatedMessages, 
          { 
            text: `As a ${results.sunSign} ${results.hdType}, I suggest you ${messageText.includes('?') ? 'consider your inner guidance' : 'follow your intuition on this matter'}.`, 
            isBot: true 
          }
        ]);
      }, 1000);
    }
  };

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = document.getElementById('chatInput') as HTMLInputElement;
    sendMessage(input.value);
    input.value = '';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Astro Guide</h1>
        <p>Discover your astrological and human design insights</p>
      </header>
      
      <main>
        {!results ? (
          <section className="form-section">
            <h2>Enter Your Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="birthday">Birthday:</label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="birthplace">Place of Birth:</label>
                <input
                  type="text"
                  id="birthplace"
                  name="birthplace"
                  value={formData.birthplace}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title:</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Discover Your Guide'}
              </button>
              
              {error && <p className="error-message">{error}</p>}
            </form>
          </section>
        ) : (
          <section className="results-section">
            <div className="profile-info">
              <h2>Your Profile</h2>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Birthday:</strong> {new Date(formData.birthday).toLocaleDateString()}</p>
              <p><strong>Place of Birth:</strong> {formData.birthplace}</p>
              <p><strong>Job Title:</strong> {formData.jobTitle}</p>
              <p><strong>Sun Sign:</strong> {results.sunSign}</p>
              <p><strong>Human Design Type:</strong> {results.hdType}</p>
            </div>
            
            <div className="chat-section">
              <h2>Your Personalized Guide</h2>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleChatSubmit} className="chat-input">
                <input
                  type="text"
                  id="chatInput"
                  placeholder="Ask something..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
            
            <button onClick={() => {
              setResults(null);
              setChatMessages([]);
            }}>
              Start Over
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
