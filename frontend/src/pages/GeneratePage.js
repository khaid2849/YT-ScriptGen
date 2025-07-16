import React, { useState, useEffect } from 'react';
import { transcriptionAPI, scriptsAPI } from '../services/api';
import ScriptDisplay from '../components/Generate/ScriptDisplay';
import toast from 'react-hot-toast';

const GeneratePage = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, completed, failed
  const [taskId, setTaskId] = useState(null);
  const [scriptId, setScriptId] = useState(null);
  const [scriptData, setScriptData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let interval;
    
    if (taskId && status === 'processing') {
      interval = setInterval(() => {
        checkTaskStatus(taskId);
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [taskId, status]);

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]{11}$/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]{11}$/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]{11}$/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    
    if (!validateYouTubeUrl(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }
    
    try {
      setStatus('processing');
      setProgress(0);
      setStatusMessage('Starting transcription...');
      
      const response = await transcriptionAPI.create({ video_url: url });
      
      setTaskId(response.data.task_id);
      setProgress(response.data.progress);
      setStatusMessage(response.data.message);
      
      toast.success('Video processing started!');
    } catch (error) {
      console.error('Error starting transcription:', error);
      setStatus('failed');
      toast.error(error.response?.data?.detail || 'Failed to start transcription');
    }
  };

  const checkTaskStatus = async (taskId) => {
    try {
      const response = await transcriptionAPI.getStatus(taskId);
      const data = response.data;
      
      setProgress(data.progress);
      setStatusMessage(data.message);
      
      if (data.status === 'completed' && data.script_id) {
        setStatus('completed');
        setScriptId(data.script_id);
        await fetchScript(data.script_id);
        toast.success('Transcription completed!');
      } else if (data.status === 'failed') {
        setStatus('failed');
        toast.error(data.message || 'Transcription failed');
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const fetchScript = async (id) => {
    try {
      const response = await scriptsAPI.getById(id);
      setScriptData(response.data);
    } catch (error) {
      console.error('Error fetching script:', error);
      toast.error('Failed to fetch script');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setTaskId(null);
    setScriptId(null);
    setScriptData(null);
    setProgress(0);
    setStatusMessage('');
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {status === 'completed' ? 'Your Script is Ready!' : 'Generate Your Script'}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {status === 'completed' 
                ? 'Your video has been successfully transcribed. Download or copy your script below.'
                : 'Transform any YouTube video into a professionally formatted transcript with timestamps.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {status === 'idle' && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <label htmlFor="youtube-url" className="block text-lg font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  id="youtube-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Paste any public YouTube video URL to generate a transcript
                </p>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl"
                >
                  Generate Script
                </button>
              </div>
            </form>
          </div>
        )}

        {status === 'processing' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Video</h2>
                <p className="text-gray-600">{statusMessage}</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div 
                      style={{ width: `${progress}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 text-center">
                  This may take a few minutes depending on the video length...
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && scriptData && (
          <ScriptDisplay script={scriptData} onNewScript={handleReset} />
        )}

        {status === 'failed' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
              <p className="text-gray-600 mb-6">{statusMessage || 'Something went wrong while processing your video.'}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePage;