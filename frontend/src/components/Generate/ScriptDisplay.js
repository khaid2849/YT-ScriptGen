import React, { useState, useRef } from "react";
import { scriptsAPI, downloadAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  Copy,
  Video,
  Loader2,
  Download,
  Volume2,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const ScriptDisplay = ({ script, onNewScript }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("formatted");
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("best");
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
    }
  };

  const handleDownloadVideo = async (quality = selectedQuality) => {
    setDownloadingVideo(true);
    try {
      const response = await downloadAPI.downloadScriptVideoWithQuality(
        script.id,
        quality
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${script.video_title || "video"}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Video (${quality}) downloaded successfully!`);
      setShowQualityMenu(false);
    } catch (error) {
      toast.error("Failed to download video");
    } finally {
      setDownloadingVideo(false);
    }
  };

  const handleDownloadAudio = async () => {
    setDownloadingAudio(true);
    try {
      const response = await downloadAPI.downloadScriptAudio(script.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${script.video_title || "audio"}.mp3`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Audio downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download audio");
    } finally {
      setDownloadingAudio(false);
    }
  };

  const cleanDuplicatedText = (text) => {
    if (!text || typeof text !== "string") return text;

    // Remove patterns like "text"text" or texttext where the same content is repeated
    const trimmed = text.trim();
    const halfLength = Math.floor(trimmed.length / 2);

    // Check if the first half equals the second half
    if (halfLength > 0) {
      const firstHalf = trimmed.substring(0, halfLength);
      const secondHalf = trimmed.substring(halfLength);

      if (firstHalf === secondHalf) {
        return firstHalf;
      }
    }

    // Handle quoted duplications like "text"text"
    const quotedPattern = /^"([^"]+)"\1"?$/;
    const quotedMatch = trimmed.match(quotedPattern);
    if (quotedMatch) {
      return `"${quotedMatch[1]}"`;
    }

    return text;
  };

  const handleCopyToClipboard = async () => {
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
    }
  };

  const generateJSONContent = () => {
    // Clean the formatted_script data to avoid duplication
    let cleanedFormattedScript = script.formatted_script || [];

    // If formatted_script is an array, ensure no duplicate timestamps and clean field values
    if (Array.isArray(cleanedFormattedScript)) {
      const seen = new Set();
      cleanedFormattedScript = cleanedFormattedScript
        .filter((item) => {
          if (!item || !item.timestamp) return false;
          const key = `${item.timestamp}-${item.script?.substring(0, 50)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((item) => ({
          ...item,
          // Clean duplicated values within fields
          timestamp: cleanDuplicatedText(item.timestamp),
          script: cleanDuplicatedText(item.script),
        }));
    }

    const jsonData = {
      video_info: {
        title: script.video_title || "Untitled",
        url: script.video_url,
        duration: script.video_duration || 0,
      },
      formatted_script: cleanedFormattedScript,
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

  const formatTranscriptWithStyling = () => {
    if (!script.formatted_script) {
      return (
        <div className="text-gray-500 dark:text-gray-400 italic">
          No transcript available
        </div>
      );
    }

    if (typeof script.formatted_script === "string") {
      return (
        <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-serif">
          {script.formatted_script}
        </div>
      );
    }

    if (Array.isArray(script.formatted_script)) {
      return script.formatted_script.map((item, index) => (
        <div
          key={index}
          className="mb-4 p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-blue-500"
        >
          <div className="flex items-start space-x-3">
            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 rounded-md flex-shrink-0">
              {item.timestamp}
            </span>
            <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200 font-serif flex-1">
              {item.script}
            </p>
          </div>
        </div>
      ));
    }

    return (
      <div className="text-gray-500 dark:text-gray-400 italic">
        No transcript available
      </div>
    );
  };

  const formatJSONWithLineNumbers = (jsonString) => {
    try {
      const obj = JSON.parse(jsonString);
      const formattedJson = JSON.stringify(obj, null, 2);
      const lines = formattedJson.split("\n");

      return (
        <div className="flex font-mono text-sm">
          <div className="flex-shrink-0 w-12 bg-gray-50 dark:bg-gray-800 text-right pr-3 py-2 border-r border-gray-200 dark:border-gray-700">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-gray-500 dark:text-gray-400 leading-6 h-6"
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 py-2 px-3 overflow-x-auto">
            {lines.map((line, index) => (
              <div key={index} className="leading-6 h-6">
                {highlightJSONLine(line)}
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="p-4">
          <pre className="whitespace-pre-wrap text-sm text-red-500 font-mono">
            {jsonString}
          </pre>
        </div>
      );
    }
  };

  const renderJSONWithLineHighlighting = (jsonString) => {
    const lines = jsonString.split("\n");

    return (
      <div>
        {lines.map((line, index) => (
          <div key={index} className="hover:bg-gray-800 px-2 -mx-2 rounded">
            {highlightJSONLine(line)}
          </div>
        ))}
      </div>
    );
  };

  const highlightJSONLine = (line) => {
    const parts = [];
    let currentIndex = 0;

    // Define patterns with jsonformatter.org-like colors
    const patterns = [
      {
        regex: /"([^"\\]|\\.)*"(?=\s*:)/g,
        className: "text-blue-600 dark:text-blue-400", // JSON keys (blue)
      },
      {
        regex: /:\s*"([^"\\]|\\.)*"/g,
        className: "text-green-600 dark:text-green-400", // String values (green)
        isValue: true,
      },
      {
        regex: /\b(true|false)\b/g,
        className: "text-purple-600 dark:text-purple-400", // Booleans (purple)
      },
      {
        regex: /\bnull\b/g,
        className: "text-gray-500 dark:text-gray-400", // null (gray)
      },
      {
        regex: /\b\d+\.?\d*\b/g,
        className: "text-red-600 dark:text-red-400", // Numbers (red)
      },
      {
        regex: /[{}[\],]/g,
        className: "text-gray-700 dark:text-gray-300", // Brackets and commas
      },
      {
        regex: /:/g,
        className: "text-gray-700 dark:text-gray-300", // Colons
      },
    ];

    const matches = [];

    patterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          className: pattern.className,
          isValue: pattern.isValue,
        });
      }
    });

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (prefer earlier ones)
    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    filteredMatches.forEach((match, index) => {
      if (match.start > currentIndex) {
        parts.push(
          <span
            key={`text-${index}`}
            className="text-gray-800 dark:text-gray-200"
          >
            {line.substring(currentIndex, match.start)}
          </span>
        );
      }

      // Handle string values differently (show : separately)
      if (match.isValue) {
        const colonIndex = match.text.indexOf(":");
        parts.push(
          <span
            key={`colon-${index}`}
            className="text-gray-700 dark:text-gray-300"
          >
            {match.text.substring(0, colonIndex + 1)}
          </span>
        );
        parts.push(
          <span key={`value-${index}`} className={match.className}>
            {match.text.substring(colonIndex + 1)}
          </span>
        );
      } else {
        parts.push(
          <span key={`match-${index}`} className={match.className}>
            {match.text}
          </span>
        );
      }
      currentIndex = match.end;
    });

    if (currentIndex < line.length) {
      parts.push(
        <span key="text-end" className="text-gray-800 dark:text-gray-200">
          {line.substring(currentIndex)}
        </span>
      );
    }

    return parts.length > 0 ? (
      parts
    ) : (
      <span className="text-gray-800 dark:text-gray-200">{line}</span>
    );
  };

  const qualityOptions = [
    { value: "best", label: t("generate.bestQuality") },
    { value: "720p", label: t("generate.hd720p") },
    { value: "480p", label: t("generate.sd480p") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Video Content Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("generate.videoContent")}
          </h2>

          {/* Video Preview */}
          {videoId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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

          {/* Download Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("generate.downloadOptions")}
            </h3>
            <div className="space-y-3">
              {/* Video Download with Quality Selection */}
              <div className="relative">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadVideo()}
                    disabled={downloadingVideo}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-l-md shadow-lg hover:shadow-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {downloadingVideo ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4 mr-2" />
                    )}
                    {t("generate.downloadVideo")} ({selectedQuality})
                  </button>
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-r-md shadow-lg hover:shadow-xl border-l border-blue-500 transition-all duration-200"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Quality Dropdown */}
                {showQualityMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedQuality(option.value);
                          setShowQualityMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 ${
                          selectedQuality === option.value
                            ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Audio Download */}
              <button
                onClick={handleDownloadAudio}
                disabled={downloadingAudio}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-md shadow-lg hover:shadow-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {downloadingAudio ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-2" />
                )}
                {t("generate.downloadAudio")} (MP3)
              </button>
            </div>
          </div>
        </div>

        {/* Script Section */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("generate.script")}
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-600">
              <div className="flex space-x-8 px-6 pt-4">
                <button
                  onClick={() => setActiveTab("formatted")}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "formatted"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t("generate.text")}
                </button>
                <button
                  onClick={() => setActiveTab("plain")}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "plain"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t("generate.plainText")}
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "json"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t("generate.json")}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {activeTab === "formatted" && (
                  <div className="space-y-3">
                    {formatTranscriptWithStyling()}
                  </div>
                )}
                {activeTab === "plain" && (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-sans">
                    {script.transcript_text}
                  </div>
                )}
                {activeTab === "json" && (
                  <div
                    className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    style={{ width: "max-content" }}
                  >
                    {formatJSONWithLineNumbers(generateJSONContent())}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t("generate.copyToClipboard")}
                </button>

                {activeTab === "formatted" && (
                  <button
                    onClick={() => handleDownload("txt")}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("generate.downloadText")}
                  </button>
                )}

                {activeTab === "plain" && (
                  <button
                    onClick={() => handleDownload("txt")}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("generate.downloadPlainText")}
                  </button>
                )}

                {activeTab === "json" && (
                  <button
                    onClick={() => handleDownload("json")}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("generate.downloadJson")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Script Button */}
      <div className="mt-8">
        <button
          onClick={onNewScript}
          className="w-full px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Generate New Script
        </button>
      </div>
    </div>
  );
};

export default ScriptDisplay;
