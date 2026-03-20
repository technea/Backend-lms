/**
 * Extracts YouTube Video ID from various URL formats
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The Video ID or null if invalid
 */
export const getYouTubeID = (url) => {
    if (!url) return null;
    
    // Regular expressions for different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Converts a YouTube URL to an embed-friendly URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The embed URL or null if invalid
 */
export const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeID(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

/**
 * Validates if the given URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid
 */
export const isValidYouTubeUrl = (url) => {
    return !!getYouTubeID(url);
};
