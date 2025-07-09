import React from 'react';

interface FacebookShareProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  className?: string;
}

export const FacebookShare: React.FC<FacebookShareProps> = ({
  url,
  title = "Check out MarketPace",
  description = "Supporting local commerce and community",
  image,
  className = ""
}) => {
  const handleShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    
    // Open Facebook share dialog
    window.open(
      shareUrl,
      'facebook-share-dialog',
      'width=626,height=436,resizable=yes,scrollbars=yes,toolbar=no,location=yes,directories=no,status=yes,menubar=no,copyhistory=no'
    );
  };

  const handleAdvancedShare = () => {
    if (window.FB) {
      window.FB.ui({
        method: 'share',
        href: url,
        quote: description,
      }, (response: any) => {
        if (response && !response.error_message) {
          console.log('Post was shared successfully.');
        } else {
          console.log('Error occurred while sharing.');
        }
      });
    } else {
      // Fallback to simple share
      handleShare();
    }
  };

  return (
    <div className={`facebook-share ${className}`}>
      <button
        onClick={handleAdvancedShare}
        style={{
          background: '#1877f2',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'background-color 0.3s ease'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Share
      </button>
    </div>
  );
};