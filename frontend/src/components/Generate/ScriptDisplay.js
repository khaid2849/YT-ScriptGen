import React, { useState } from "react";
import { scriptsAPI } from "../../services/api";
import toast from "react-hot-toast";

const ScriptDisplay = ({ script, onNewScript }) => {
  const [activeTab, setActiveTab] = useState("formatted");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);

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
          textToCopy = JSON.stringify(textToCopy, null, 2);
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
      {/* Video Info Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {script.video_title || "Untitled Video"}
          </h2>
          <p className="text-blue-100 text-lg">
            Transcript generated successfully
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{formatDuration(script.video_duration)}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Generated:</span>
              <span className="ml-2">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="px-8 pt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Generated Transcript
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("formatted")}
                className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === "formatted"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Formatted with Timestamps
              </button>
              <button
                onClick={() => setActiveTab("plain")}
                className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === "plain"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Plain Text
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${
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
        <div className="p-8">
          <div className={`${
            activeTab === "json" 
              ? "bg-gray-900 text-gray-100 font-mono text-sm p-6 rounded-xl" 
              : "bg-gray-50 rounded-xl p-6"
          } max-h-[500px] overflow-y-auto custom-scrollbar`}>
            <pre className={`whitespace-pre-wrap ${
              activeTab === "json" ? "" : "font-sans text-gray-700"
            } leading-relaxed`}>
              {renderContent()}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleDownload(activeTab === "json" ? "json" : "txt")}
              disabled={downloading}
              className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
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
              className="flex-1 bg-white text-gray-900 py-4 px-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-3"
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