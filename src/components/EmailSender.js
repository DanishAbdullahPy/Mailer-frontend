import React, { useState } from 'react';
import axios from 'axios';
import './EmailSender.css';

const EmailSender = () => {
  const [emails, setEmails] = useState('');
  const [area, setArea] = useState('Full Stack Developer');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  const extractEmailData = (emailString) => {
    return emailString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('@'))
      .map(email => ({ email }));
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

  const handleSendSingle = async (email) => {
    try {
      setSending(true);
      const response = await axios.post(`${API_BASE_URL}/send-email`, {
        email: email.trim(),
        area: area
      });
      
      alert(`Email sent successfully to ${email}`);
      
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      const errorCode = error.response?.data?.code || 'No code';
      
      alert(`Failed to send email to ${email}\nError: ${errorMessage}\nCode: ${errorCode}`);
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
            placeholder="hr@company1.com&#10;recruiter@company2.com&#10;jobs@company3.com"
            rows="8"
          />
          <small className="help-text">
            Enter one email per line. Names and companies will be auto-detected from email addresses.
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
                  <span className="email-address">{emailData.email}</span>
                  <button
                    onClick={() => handleSendSingle(emailData.email)}
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
