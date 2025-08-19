'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

export default function GoogleDriveImage({ 
  url, 
  alt = 'Material Image', 
  className = 'h-full w-full object-cover',
  fallbackIcon = Package,
  showErrorDetails = false 
}) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlIndex, setUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  // Enhanced Google Drive URL conversion with multiple fallbacks
  const generateFallbackUrls = (originalUrl) => {
    if (!originalUrl) return [];

    console.log('🔗 GoogleDriveImage - Processing URL:', originalUrl);

    // Extract file ID using multiple patterns
    const extractFileId = (url) => {
      const patterns = [
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)\//,
        /[?&]id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          console.log('📝 GoogleDriveImage - Extracted File ID:', match[1]);
          return match[1];
        }
      }
      return null;
    };

    const fileId = extractFileId(originalUrl);
    
    if (!fileId) {
      console.log('⚠️ GoogleDriveImage - No file ID found, trying original URL');
      return [originalUrl];
    }

    // Multiple fallback URL formats
    const fallbackUrls = [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/uc?id=${fileId}`,
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      originalUrl
    ];

    console.log('🔄 GoogleDriveImage - Generated fallback URLs:', fallbackUrls);
    return fallbackUrls;
  };

  const fallbackUrls = generateFallbackUrls(url);

  useEffect(() => {
    if (fallbackUrls.length > 0) {
      setCurrentUrl(fallbackUrls[0]);
      setUrlIndex(0);
      setIsLoading(true);
      setHasError(false);
      setErrorDetails('');
    }
  }, [url]);

  const handleImageError = (e) => {
    console.error(`❌ GoogleDriveImage - Failed to load URL ${urlIndex + 1}/${fallbackUrls.length}:`, currentUrl);
    
    setErrorDetails(`Failed URL ${urlIndex + 1}/${fallbackUrls.length}: ${currentUrl}`);

    if (urlIndex < fallbackUrls.length - 1) {
      const nextIndex = urlIndex + 1;
      const nextUrl = fallbackUrls[nextIndex];
      
      console.log(`🔄 GoogleDriveImage - Trying fallback ${nextIndex + 1}/${fallbackUrls.length}:`, nextUrl);
      
      setUrlIndex(nextIndex);
      setCurrentUrl(nextUrl);
    } else {
      console.log('❌ GoogleDriveImage - All fallback URLs failed');
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ GoogleDriveImage - Successfully loaded URL ${urlIndex + 1}/${fallbackUrls.length}:`, currentUrl);
    setIsLoading(false);
    setHasError(false);
  };

  if (!url) {
    const FallbackIcon = fallbackIcon;
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded">
        <FallbackIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (hasError) {
    const FallbackIcon = fallbackIcon;
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-2 text-center">
        <FallbackIcon className="h-8 w-8 text-gray-400 mb-1" />
        <p className="text-xs text-gray-500">Image Error</p>
        {showErrorDetails && (
          <p className="text-xs text-red-500 mt-1 break-all">{errorDetails}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={currentUrl}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse">
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  );
}
