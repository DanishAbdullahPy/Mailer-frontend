import React, { useState } from 'react';
import axios from 'axios';
import './EmailSender.css';

const API_BASE_URL = 'https://mailer-backend-fkm3.onrender.com/api';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const EmailSender = () => {
  const [emails, setEmails] = useState('');
  const [area, setArea] = useState('Full Stack Developer');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Enhanced email data extraction with support for JSON format
  const extractEmailData = (emailString) => {
    const lines = emailString.split('\n').map(line => line.trim()).filter(line => line); // FIXED: \n instead of \\n
    const emailData = [];

    for (const line of lines) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(line);
        if (parsed.email && parsed.email.includes('@')) {
          emailData.push({
            email: parsed.email,
            name: parsed.name || null,
            company: parsed.company || null
          });
        }
      } catch (e) {
        // If not JSON, treat as plain email
        if (line.includes('@')) {
          emailData.push({
            email: line,
            name: null,
            company: null
          });
        }
      }
    }

    return emailData;
  };

  const handleSendEmails = async () => {
    if (!emails.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    setSending(true);
    setResults([]);
    setShowResults(false);

    try {
      const emailList = extractEmailData(emails);
      
      const response = await axios.post(`${API_BASE_URL}/send-bulk-emails`, {
        emails: emailList,
        area: area
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      setResults(response.data.results);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error sending emails:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to send emails. Error: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendSingle = async (emailData) => {
    try {
      setSending(true);
      const response = await axios.post(`${API_BASE_URL}/send-email`, {
        email: emailData.email.trim(),
        name: emailData.name,
        company: emailData.company,
        area: area
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      alert(`Email sent successfully to ${emailData.email}`);
      
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      const errorCode = error.response?.data?.code || 'No code';
      
      alert(`Failed to send email to ${emailData.email}\nError: ${errorMessage}\nCode: ${errorCode}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-sender-container">
      <div className="header">
        <h1>📧 Job Application Sender</h1>
        <p>Send personalized job applications quickly</p>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="area">Job Position:</label>
          <input
            type="text"
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g., Full Stack Developer, Backend Developer"
          />
        </div>

        <div className="form-group">
          <label htmlFor="emails">Email Addresses (one per line):</label>
          <textarea
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder={`Format 1 - Plain emails:
hr@company1.com
recruiter@company2.com

Format 2 - JSON with details:
{"email": "hr@company1.com", "name": "John Doe", "company": "TechCorp"}
{"email": "jobs@company2.com", "company": "StartupXYZ"}`}
            rows="10"
          />
          <small className="help-text">
            <strong>Two formats supported:</strong><br/>
            <strong>1. Plain emails:</strong> hr@company.com (auto-detects names/companies)<br/>
            <strong>2. JSON format:</strong> {`{"email": "hr@company.com", "name": "John", "company": "TechCorp"}`}
          </small>
        </div>

        <div className="button-group">
          <button 
            onClick={handleSendEmails}
            disabled={sending || !emails.trim()}
            className="send-button primary"
          >
            {sending ? '📤 Sending...' : '🚀 Send All Emails'}
          </button>
        </div>

        {emails.trim() && (
          <div className="preview-section">
            <h3>📋 Preview Recipients ({extractEmailData(emails).length})</h3>
            <div className="email-preview-list">
              {extractEmailData(emails).slice(0, 5).map((emailData, index) => (
                <div key={index} className="email-preview-item">
                  <div className="email-details">
                    <strong>{emailData.email}</strong>
                    {emailData.name && <div className="detail-item">👤 {emailData.name}</div>}
                    {emailData.company && <div className="detail-item">🏢 {emailData.company}</div>}
                    {!emailData.name && !emailData.company && <div className="detail-item">🤖 Auto-detect</div>}
                  </div>
                  <button
                    onClick={() => handleSendSingle(emailData)}
                    disabled={sending}
                    className="send-button small"
                  >
                    Send
                  </button>
                </div>
              ))}
              {extractEmailData(emails).length > 5 && (
                <div className="more-emails">
                  +{extractEmailData(emails).length - 5} more emails...
                </div>
              )}
            </div>
          </div>
        )}

        {showResults && (
          <div className="results-section">
            <h3>📊 Sending Results</h3>
            <div className="results-summary">
              <div className="stat">
                <span className="stat-number">{results.filter(r => r.status === 'sent').length}</span>
                <span className="stat-label">Sent</span>
              </div>
              <div className="stat">
                <span className="stat-number">{results.filter(r => r.status === 'failed').length}</span>
                <span className="stat-label">Failed</span>
              </div>
              <div className="stat">
                <span className="stat-number">{results.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>

            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className={`result-item ${result.status}`}>
                  <div className="result-info">
                    <strong>{result.email}</strong>
                    <span className="result-details">
                      {result.name} • {result.company}
                    </span>
                  </div>
                  <span className={`status-badge ${result.status}`}>
                    {result.status === 'sent' ? '✅' : '❌'} {result.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSender;
