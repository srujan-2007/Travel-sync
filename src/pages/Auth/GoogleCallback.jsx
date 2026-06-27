import React, { useEffect } from 'react';

function GoogleCallback() {
  useEffect(() => {
    try {
      // Parse the hash parameters
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      const error = params.get('error');

      if (idToken) {
        // Send the ID token back to the opener window
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_SUCCESS', idToken },
            window.location.origin
          );
        }
      } else if (error) {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_FAILURE', error: error || 'Failed to authenticate with Google' },
            window.location.origin
          );
        }
      } else {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_FAILURE', error: 'No token found in response' },
            window.location.origin
          );
        }
      }
    } catch (err) {
      console.error('Error in Google callback handler:', err);
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_FAILURE', error: err.message },
          window.location.origin
        );
      }
    } finally {
      // Close the popup window
      window.close();
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Authenticating with Google...</h2>
        <p>Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}

export default GoogleCallback;
