// At the top of the file, update the API URL
const API_BASE_URL = 'https://mailer-backend-fkm3.onrender.com/api';

// Update axios configuration to handle CORS better
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const EmailSender = () => {
  // ... your existing state and functions ...

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
      
      // Add explicit headers
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

  const handleSendSingle = async (email) => {
    try {
      setSending(true);
      const response = await axios.post(`${API_BASE_URL}/send-email`, {
        email: email.trim(),
        area: area
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
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

  // ... rest of your component
};
