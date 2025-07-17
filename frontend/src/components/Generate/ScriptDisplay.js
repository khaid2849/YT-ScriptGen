import React, { useState, useRef, useEffect } from "react";
import { scriptsAPI } from "../../services/api";
import toast from "react-hot-toast";

const ScriptDisplay = ({ script, onNewScript }) => {
  const [activeTab, setActiveTab] = useState("formatted");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [isVideoCollapsed, setIsVideoCollapsed] = useState(false);
  const videoRef = useRef(null);

  // Extract video ID from URL for embedding
  const getVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(script.video_url);

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const response = await scriptsAPI.download(script.id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${script.video_title || "transcript"}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} file downloaded successfully!`);
    } catch (error) {
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setCopying(true);
    try {
      let textToCopy = "";
      
      if (activeTab === "formatted") {
        textToCopy = script.formatted_script || script.transcript_text || "";
        if (typeof textToCopy === "object") {
          textToCopy = script.formatted_script
            .map(item => `${item.timestamp}: ${item.script}`)
            .join("\n\n");
        }
      } else if (activeTab === "plain") {
        textToCopy = script.transcript_text || "";
      } else if (activeTab === "json") {
        textToCopy = generateJSONContent();
      }
      
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    } finally {
      setCopying(false);
    }
  };

  const generateJSONContent = () => {
    const jsonData = {
      video_info: {
        title: script.video_title || "Untitled",
        url: script.video_url,
        duration: formatDuration(script.video_duration)
      },
      formatted_script: []
    };

    if (script.formatted_script && Array.isArray(script.formatted_script)) {
      jsonData.formatted_script = script.formatted_script.map(item => ({
        time: item.timestamp || item.time || "",
        text: item.script || item.text || ""
      }));
    }

    return JSON.stringify(jsonData, null, 2);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const renderContent = () => {
    if (activeTab === "formatted") {
      if (typeof script.formatted_script === "string") {
        return script.formatted_script;
      } else if (Array.isArray(script.formatted_script)) {
        return script.formatted_script
          .map(item => `${item.timestamp}: ${item.script}`)
          .join("\n\n");
      }
      return script.transcript_text || "No formatted transcript available";
    } else if (activeTab === "plain") {
      return script.transcript_text || "No plain text transcript available";
    } else if (activeTab === "json") {
      return generateJSONContent();
    }
  };

  return (
    <div className="space-y-8">
      {/* Video Player Section - Collapsible on Mobile */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Video Player</h3>
            <button
              onClick={() => setIsVideoCollapsed(!isVideoCollapsed)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className={`w-6 h-6 transform transition-transform ${isVideoCollapsed ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`${isVideoCollapsed ? 'hidden' : 'block'} lg:block`}>
            {videoId ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  ref={videoRef}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={script.video_title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Video preview not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-4">
          {script.video_title || "Untitled Video"}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-100 text-xs">Duration</p>
              <p className="font-semibold">{formatDuration(script.video_duration)}</p>
            </div>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-blue-100 text-xs">Words</p>
              <p className="font-semibold">
                {script.transcript_text ? script.transcript_text.split(" ").length : 0}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-blue-100 text-xs">Generated</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M13 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-blue-100 text-xs">Source</p>
              <a 
                href={script.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-4 sm:px-8 pt-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Generated Transcript
            </h3>
            <div className="flex flex-wrap gap-2 -mb-px">
              <button
                onClick={() => setActiveTab("formatted")}
                className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === "formatted"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="hidden sm:inline">Formatted with </span>Timestamps
              </button>
              <button
                onClick={() => setActiveTab("plain")}
                className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === "plain"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Plain Text
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === "json"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Content */}
        <div className="p-4 sm:p-8">
          <div className={`${
            activeTab === "json" 
              ? "bg-gray-900 text-gray-100 font-mono text-xs sm:text-sm p-4 sm:p-6 rounded-xl" 
              : "bg-gray-50 rounded-xl p-4 sm:p-6"
          } max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar`}>
            <pre className={`whitespace-pre-wrap ${
              activeTab === "json" ? "" : "font-sans text-sm sm:text-base text-gray-700"
            } leading-relaxed`}>
              {renderContent()}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleDownload(activeTab === "json" ? "json" : "txt")}
              disabled={downloading}
              className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading ? "Downloading..." : `Download ${activeTab === "json" ? "JSON" : "TXT"}`}
            </button>

            <button
              onClick={handleCopyToClipboard}
              disabled={copying}
              className="flex-1 bg-white text-gray-900 py-3 sm:py-4 px-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copying ? "Copying..." : "Copy to Clipboard"}
            </button>
          </div>

          {/* Generate Another Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onNewScript}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto group"
            >
              Generate Another Script
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;