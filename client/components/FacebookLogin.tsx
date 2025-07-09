import React, { useEffect } from 'react';

interface FacebookLoginProps {
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  buttonText?: string;
  className?: string;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const FacebookLogin: React.FC<FacebookLoginProps> = ({
  onSuccess,
  onError,
  buttonText = "Continue with Facebook",
  className = ""
}) => {
  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Load SDK script
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    if (!window.FB) {
      loadFacebookSDK();
    }
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      onError({ message: 'Facebook SDK not loaded' });
      return;
    }

    window.FB.login((response: any) => {
      if (response.authResponse) {
        // Get user info
        window.FB.api('/me', { fields: 'name,email,picture' }, (userResponse: any) => {
          onSuccess({
            ...userResponse,
            accessToken: response.authResponse.accessToken
          });
        });
      } else {
        onError({ message: 'User cancelled login or did not fully authorize.' });
      }
    }, { 
      scope: 'email,public_profile,pages_manage_metadata,pages_read_engagement',
      return_scopes: true 
    });
  };

  return (
    <button
      onClick={handleFacebookLogin}
      className={`facebook-login-btn ${className}`}
      style={{
        background: '#1877f2',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.3s ease'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      {buttonText}
    </button>
  );
};