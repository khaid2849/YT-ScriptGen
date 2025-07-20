import React, { useState, useRef } from "react";
import { scriptsAPI, downloadAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Copy, FileText, FileJson, Video, Loader2 } from "lucide-react";

const ScriptDisplay = ({ script, onNewScript }) => {
  const [activeTab, setActiveTab] = useState("formatted");
  const [downloading, setDownloading] = useState(false);
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [copying, setCopying] = useState(false);
  const videoRef = useRef(null);

  // Extract video ID from URL for embedding
  const getVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
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

  const handleDownloadVideo = async () => {
    setDownloadingVideo(true);
    try {
      const response = await downloadAPI.downloadScriptVideo(script.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${script.video_title || "video"}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Video downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download video");
    } finally {
      setDownloadingVideo(false);
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
            .map((item) => `${item.timestamp}: ${item.script}`)
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
        duration: script.video_duration || 0,
      },
      formatted_script: script.formatted_script || [],
      transcript_text: script.transcript_text || "",
    };
    return JSON.stringify(jsonData, null, 2);
  };

  const formatTranscript = () => {
    if (!script.formatted_script) return "No transcript available";

    if (typeof script.formatted_script === "string") {
      return script.formatted_script;
    }

    if (Array.isArray(script.formatted_script)) {
      return script.formatted_script
        .map((item) => `${item.timestamp}: ${item.script}`)
        .join("\n\n");
    }

    return "No transcript available";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Video Preview */}
      {videoId && (
        <div className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {script.video_title || "YouTube Video"}
            </h3>
          </div>
          <div className="relative aspect-video">
            <iframe
              ref={videoRef}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Script Display */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6 pt-4">
            <button
              onClick={() => setActiveTab("formatted")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "formatted"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Formatted Script
            </button>
            <button
              onClick={() => setActiveTab("plain")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "plain"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Plain Text
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "json"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {activeTab === "formatted" && formatTranscript()}
              {activeTab === "plain" && script.transcript_text}
              {activeTab === "json" && generateJSONContent()}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleCopyToClipboard}
              disabled={copying}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {copying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy to Clipboard
            </button>

            <button
              onClick={() => handleDownload("txt")}
              disabled={downloading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Download TXT
            </button>

            <button
              onClick={() => handleDownload("json")}
              disabled={downloading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileJson className="w-4 h-4 mr-2" />
              )}
              Download JSON
            </button>

            <button
              onClick={handleDownloadVideo}
              disabled={downloadingVideo}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {downloadingVideo ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Video className="w-4 h-4 mr-2" />
              )}
              Download Video
            </button>
          </div>

          {/* New Script Button */}
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={onNewScript}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Generate New Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;
