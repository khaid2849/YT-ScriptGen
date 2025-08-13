/**
 * Message Handler Utility for Backend Messages
 * 
 * This utility handles translation of backend messages that can come as:
 * 1. Translation keys (preferred): "celery.transcription.starting"
 * 2. Direct text (fallback): "Processing video..."
 * 3. Mixed format with both key and fallback text
 */

/**
 * Handles backend message translation
 * @param {Object} messageData - Message data from backend
 * @param {Function} t - Translation function from useLanguage hook
 * @returns {string} Translated message
 */
export const handleBackendMessage = (messageData, t) => {
  // Handle different message formats from backend
  
  // Format 1: Object with message_key and optional fallback
  if (typeof messageData === 'object' && messageData !== null) {
    const { message_key, message_fallback, message } = messageData;
    
    if (message_key) {
      // Try to translate the key
      const translated = t(message_key);
      // If translation exists (key !== translated text), use it
      if (translated !== message_key) {
        return translated;
      }
      // Otherwise, fall back to provided fallback or original message
      return message_fallback || message || message_key;
    }
    
    // If no message_key, check for direct message
    if (message) {
      return tryTranslateDirectMessage(message, t);
    }
  }
  
  // Format 2: Direct string (could be key or text)
  if (typeof messageData === 'string') {
    return tryTranslateDirectMessage(messageData, t);
  }
  
  // Fallback
  return t('celery.unknown_status');
};

/**
 * Attempts to translate a direct message string
 * @param {string} message - Direct message string
 * @param {Function} t - Translation function
 * @returns {string} Translated message or original if not a key
 */
const tryTranslateDirectMessage = (message, t) => {
  // Check if it looks like a translation key (contains dots and no spaces)
  if (isTranslationKey(message)) {
    const translated = t(message);
    // If translation exists, use it
    if (translated !== message) {
      return translated;
    }
  }
  
  // Check if it's a known message pattern and try to map it to a key
  const mappedKey = mapLegacyMessageToKey(message);
  if (mappedKey) {
    const translated = t(mappedKey);
    if (translated !== mappedKey) {
      return translated;
    }
  }
  
  // Return original message as fallback
  return message;
};

/**
 * Checks if a string looks like a translation key
 * @param {string} str - String to check
 * @returns {boolean} True if it looks like a translation key
 */
const isTranslationKey = (str) => {
  // Translation keys typically have dots and no spaces
  return str.includes('.') && !str.includes(' ') && str.length > 3;
};

/**
 * Maps legacy/hardcoded messages to translation keys
 * @param {string} message - Original message
 * @returns {string|null} Translation key or null if no mapping
 */
const mapLegacyMessageToKey = (message) => {
  // Common message patterns that might come from backend
  const messageMap = {
    // Transcription messages
    'Starting transcription...': 'celery.transcription.starting',
    'Processing video...': 'celery.transcription.downloading_video',
    'Downloading video...': 'celery.transcription.downloading_video', 
    'Extracting audio...': 'celery.transcription.extracting_audio',
    'Processing audio...': 'celery.transcription.processing_audio',
    'Generating transcript...': 'celery.transcription.generating_transcript',
    'Adding timestamps...': 'celery.transcription.adding_timestamps',
    'Finalizing...': 'celery.transcription.finalizing',
    'Transcription completed': 'celery.transcription.completed',
    'Transcription failed': 'celery.transcription.failed',
    
    // Download messages  
    'Starting download...': 'celery.download.starting',
    'Fetching video info...': 'celery.download.fetching_info',
    'Downloading...': 'celery.download.downloading',
    'Converting...': 'celery.download.converting',
    'Compressing...': 'celery.download.compressing',
    'Creating zip...': 'celery.download.creating_zip',
    'Download completed': 'celery.download.completed',
    'Download failed': 'celery.download.failed',
    
    // Progress messages
    'Initializing...': 'celery.progress.initializing',
    'Preparing...': 'celery.progress.preparing',
    'Cleaning up...': 'celery.progress.cleanup',
    'Finishing...': 'celery.progress.finishing',
    
    // General messages
    'Processing...': 'celery.processing',
    'Starting...': 'celery.starting',
    'Completed': 'celery.completed',
    'Failed': 'celery.failed',
    'Error': 'celery.error'
  };
  
  return messageMap[message] || null;
};

/**
 * Formats progress message with percentage
 * @param {Object} progressData - Progress data from backend
 * @param {Function} t - Translation function
 * @returns {Object} Formatted progress object
 */
export const formatProgressMessage = (progressData, t) => {
  const { progress, message, message_key, stage } = progressData;
  
  // Get translated message
  const translatedMessage = handleBackendMessage(
    message_key ? { message_key, message_fallback: message } : message,
    t
  );
  
  // Add progress percentage if available
  const formattedMessage = progress !== undefined && progress >= 0
    ? `${translatedMessage} (${Math.round(progress)}%)`
    : translatedMessage;
  
  return {
    message: formattedMessage,
    progress: progress || 0,
    stage: stage || null
  };
};

export default { handleBackendMessage, formatProgressMessage };