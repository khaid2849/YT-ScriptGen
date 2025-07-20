import React, { useState } from "react";
import { downloadAPI } from "../services/api";
import toast from "react-hot-toast";
import { Download, Loader2, Plus, X, Video } from "lucide-react";

const DownloadPage = () => {
  const [singleUrl, setSingleUrl] = useState("");
  const [multipleUrls, setMultipleUrls] = useState([""]);
  const [quality, setQuality] = useState("best");
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
      const response = await downloadAPI.downloadSingle({
        url: singleUrl,
        quality: quality,
      });

      if (response.data.task_id) {
        // Start polling for status
        pollDownloadStatus(response.data.task_id, "single");
      }
    } catch (error) {
      toast.error("Failed to start download");
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
      toast.error("Maximum 10 videos can be downloaded at once");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await downloadAPI.downloadMultiple({
        urls: validUrls,
        quality: quality,
      });

      if (response.data.task_id) {
        // Start polling for status
        pollDownloadStatus(response.data.task_id, "multiple");
      }
    } catch (error) {
      toast.error("Failed to start download");
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
              ? "Video downloaded successfully!"
              : "Videos downloaded successfully!"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Download YouTube Videos
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Download single or multiple YouTube videos in your preferred
              quality
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setDownloadMode("single")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadMode === "single"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Video className="inline-block w-5 h-5 mr-2" />
            Single Video
          </button>
          <button
            onClick={() => setDownloadMode("multiple")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              downloadMode === "multiple"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Download className="inline-block w-5 h-5 mr-2" />
            Multiple Videos
          </button>
        </div>

        {/* Quality Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="best">Best Quality</option>
            <option value="720p">720p HD</option>
            <option value="480p">480p SD</option>
          </select>
        </div>

        {/* Single Video Form */}
        {downloadMode === "single" && (
          <form onSubmit={handleSingleDownload} className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isDownloading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a YouTube video URL to download
              </p>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isDownloading}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="inline-block w-5 h-5 mr-2" />
                    Download Video
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Multiple Videos Form */}
        {downloadMode === "multiple" && (
          <form onSubmit={handleMultipleDownload} className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  YouTube URLs (Max 10)
                </label>
                <button
                  type="button"
                  onClick={addUrlField}
                  disabled={multipleUrls.length >= 10}
                  className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isDownloading}
                    />
                    {multipleUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isDownloading}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Enter multiple YouTube URLs to download as a zip file
              </p>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isDownloading}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    Creating Zip...
                  </>
                ) : (
                  <>
                    <Download className="inline-block w-5 h-5 mr-2" />
                    Download All Videos
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Progress Display */}
        {isDownloading && downloadProgress.status && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Download Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{downloadProgress.status}</span>
              </div>
              {downloadProgress.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">
                      {downloadProgress.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {downloadProgress.message && (
                <p className="text-sm text-gray-600">
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
