import React, { useState } from "react";
import { downloadAPI } from "../services/api";
import toast from "react-hot-toast";
import { Download, Loader2, Plus, X, Video, Volume2 } from "lucide-react";

const DownloadPage = () => {
  const [singleUrl, setSingleUrl] = useState("");
  const [multipleUrls, setMultipleUrls] = useState([""]);
  const [quality, setQuality] = useState("best");
  const [downloadType, setDownloadType] = useState("video"); // 'video' or 'audio'
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMode, setDownloadMode] = useState("single"); // 'single' or 'multiple'
  const [downloadProgress, setDownloadProgress] = useState({});

  const addUrlField = () => {
    setMultipleUrls([...multipleUrls, ""]);
  };

  const removeUrlField = (index) => {
    const newUrls = multipleUrls.filter((_, i) => i !== index);
    setMultipleUrls(newUrls.length > 0 ? newUrls : [""]);
  };

  const updateUrl = (index, value) => {
    const newUrls = [...multipleUrls];
    newUrls[index] = value;
    setMultipleUrls(newUrls);
  };

  const validateYouTubeUrl = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return regex.test(url);
  };

  const handleSingleDownload = async (e) => {
    e.preventDefault();

    if (!validateYouTubeUrl(singleUrl)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsDownloading(true);

    try {
      let response;
      if (downloadType === "video") {
        response = await downloadAPI.downloadSingle({
          url: singleUrl,
          quality: quality,
        });
      } else {
        response = await downloadAPI.downloadSingleAudio({
          url: singleUrl,
        });
      }

      if (response.data.task_id) {
        // Start polling for status
        pollDownloadStatus(response.data.task_id, "single");
      }
    } catch (error) {
      toast.error(`Failed to start ${downloadType} download`);
      setIsDownloading(false);
    }
  };

  const handleMultipleDownload = async (e) => {
    e.preventDefault();

    const validUrls = multipleUrls.filter(
      (url) => url && validateYouTubeUrl(url)
    );

    if (validUrls.length === 0) {
      toast.error("Please enter at least one valid YouTube URL");
      return;
    }

    if (validUrls.length > 10) {
      toast.error(`Maximum 10 ${downloadType}s can be downloaded at once`);
      return;
    }

    setIsDownloading(true);

    try {
      let response;
      if (downloadType === "video") {
        response = await downloadAPI.downloadMultiple({
          urls: validUrls,
          quality: quality,
        });
      } else {
        response = await downloadAPI.downloadMultipleAudio({
          urls: validUrls,
        });
      }

      if (response.data.task_id) {
        // Start polling for status
        pollDownloadStatus(response.data.task_id, "multiple");
      }
    } catch (error) {
      toast.error(`Failed to start ${downloadType} download`);
      setIsDownloading(false);
    }
  };

  const pollDownloadStatus = async (taskId, mode) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await downloadAPI.getStatus(taskId);
        const data = response.data;

        setDownloadProgress({
          status: data.status,
          progress: data.progress,
          message: data.message || data.error,
        });

        if (data.status === "completed") {
          clearInterval(pollInterval);
          setIsDownloading(false);

          // Trigger download
          const downloadUrl = `${process.env.REACT_APP_API_URL}/download/file/${taskId}`;
          window.location.href = downloadUrl;

          toast.success(
            mode === "single"
              ? `${downloadType === "video" ? "Video" : "Audio"} downloaded successfully!`
              : `${downloadType === "video" ? "Videos" : "Audio files"} downloaded successfully!`
          );

          // Reset form
          if (mode === "single") {
            setSingleUrl("");
          } else {
            setMultipleUrls([""]);
          }
          setDownloadProgress({});
        } else if (data.status === "error") {
          clearInterval(pollInterval);
          setIsDownloading(false);
          toast.error(data.error || "Download failed");
          setDownloadProgress({});
        }
      } catch (error) {
        clearInterval(pollInterval);
        setIsDownloading(false);
        toast.error("Failed to check download status");
        setDownloadProgress({});
      }
    }, 2000);

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isDownloading) {
        setIsDownloading(false);
        toast.error("Download timeout");
        setDownloadProgress({});
      }
    }, 600000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Download YouTube {downloadType === "video" ? "Videos" : "Audio"}
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Download single or multiple YouTube {downloadType}s {downloadType === "video" ? "in your preferred quality" : "as MP3 files"}
            </p>
          </div>
        </div>
      </div>

      {/* Download Type Selector */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setDownloadType("video")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadType === "video"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <Video className="inline-block w-5 h-5 mr-2" />
            Video
          </button>
          <button
            onClick={() => setDownloadType("audio")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadType === "audio"
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <Volume2 className="inline-block w-5 h-5 mr-2" />
            Audio
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setDownloadMode("single")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadMode === "single"
                ? "bg-gray-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            {downloadType === "video" ? (
              <Video className="inline-block w-5 h-5 mr-2" />
            ) : (
              <Volume2 className="inline-block w-5 h-5 mr-2" />
            )}
            Single {downloadType === "video" ? "Video" : "Audio"}
          </button>
          <button
            onClick={() => setDownloadMode("multiple")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadMode === "multiple"
                ? "bg-gray-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <Download className="inline-block w-5 h-5 mr-2" />
            Multiple {downloadType === "video" ? "Videos" : "Audio Files"}
          </button>
        </div>

        {/* Quality Selector - Only for video downloads */}
        {downloadType === "video" && (
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Video Quality
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="best">Best Quality</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
            </select>
          </div>
        )}

        {/* Single Download Form */}
        {downloadMode === "single" && (
          <form onSubmit={handleSingleDownload} className="space-y-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isDownloading}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter a YouTube video URL to download as {downloadType === "video" ? "video" : "MP3 audio"}
              </p>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isDownloading}
                className={`px-8 py-4 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  downloadType === "video" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    {downloadType === "video" ? "Downloading..." : "Extracting Audio..."}
                  </>
                ) : (
                  <>
                    {downloadType === "video" ? (
                      <Video className="inline-block w-5 h-5 mr-2" />
                    ) : (
                      <Volume2 className="inline-block w-5 h-5 mr-2" />
                    )}
                    Download {downloadType === "video" ? "Video" : "Audio"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Multiple Downloads Form */}
        {downloadMode === "multiple" && (
          <form onSubmit={handleMultipleDownload} className="space-y-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  YouTube URLs (Max 10)
                </label>
                <button
                  type="button"
                  onClick={addUrlField}
                  disabled={multipleUrls.length >= 10}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-gray-400"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {multipleUrls.map((url, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      placeholder={`https://www.youtube.com/watch?v=... (Video ${
                        index + 1
                      })`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isDownloading}
                    />
                    {multipleUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        disabled={isDownloading}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Enter multiple YouTube URLs to download as a zip file containing {downloadType === "video" ? "videos" : "MP3 audio files"}
              </p>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isDownloading}
                className={`px-8 py-4 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  downloadType === "video" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    Creating Zip...
                  </>
                ) : (
                  <>
                    <Download className="inline-block w-5 h-5 mr-2" />
                    Download All {downloadType === "video" ? "Videos" : "Audio Files"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Progress Display */}
        {isDownloading && downloadProgress.status && (
          <div className="mt-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Download Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                <span className="font-medium text-gray-900 dark:text-white">{downloadProgress.status}</span>
              </div>
              {downloadProgress.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Progress:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {downloadProgress.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {downloadProgress.message && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {downloadProgress.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadPage;
