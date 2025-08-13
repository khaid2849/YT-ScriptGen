import React, { useState } from "react";
import { downloadAPI } from "../services/api";
import toast from "react-hot-toast";
import { Download, Loader2, Plus, X, Video, Volume2, Clipboard } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { handleBackendMessage, formatProgressMessage } from "../utils/messageHandler";

const DownloadPage = () => {
  const { t } = useLanguage();
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSingleUrl(text);
      toast.success(t("generate.urlPastedFromClipboard"));
    } catch (error) {
      toast.error(t("generate.failedPaste"));
    }
  };

  const handlePasteMultiple = async (index) => {
    try {
      const text = await navigator.clipboard.readText();
      updateUrl(index, text);
      toast.success(t("generate.urlPastedFromClipboard"));
    } catch (error) {
      toast.error(t("generate.failedPaste"));
    }
  };

  const handleSingleDownload = async (e) => {
    e.preventDefault();

    if (!validateYouTubeUrl(singleUrl)) {
      toast.error(t("download.pleaseEnterUrl"));
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
      toast.error(t("download.pleaseEnterUrl"));
      return;
    }

    if (validUrls.length > 10) {
      toast.error(t("download.maximumDownloads"));
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
      toast.error(t("download.failedToStartDownload"));
      setIsDownloading(false);
    }
  };

  const pollDownloadStatus = async (taskId, mode) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await downloadAPI.getStatus(taskId);
        const data = response.data;

        // Handle message with translation
        const translatedMessage = handleBackendMessage(
          data.message || data.error || data, 
          t
        );

        setDownloadProgress({
          status: data.status,
          progress: data.progress || 0,
          message: translatedMessage,
        });

        if (data.status === "completed") {
          clearInterval(pollInterval);
          setIsDownloading(false);

          // Trigger download
          const downloadUrl = `${process.env.REACT_APP_API_URL}/download/file/${taskId}`;
          window.location.href = downloadUrl;

          // Use translated success messages
          const successKey = mode === "single" 
            ? (downloadType === "video" 
              ? "celery.download.completed" 
              : "celery.download.completed")
            : "celery.download.completed";
          
          toast.success(t(successKey));

          // Reset form
          if (mode === "single") {
            setSingleUrl("");
          } else {
            setMultipleUrls([""]);
          }
          setDownloadProgress({});
        } else if (data.status === "error" || data.status === "failed") {
          clearInterval(pollInterval);
          setIsDownloading(false);
          const errorMessage = handleBackendMessage(data.error || data.message, t);
          toast.error(errorMessage || t("download.downloadFailed"));
          setDownloadProgress({});
        }
      } catch (error) {
        clearInterval(pollInterval);
        setIsDownloading(false);
        toast.error(t("download.failedToCheckStatus"));
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
              {t("download.downloadYouTube")}{" "}
              {downloadType === "video" ? "Videos" : "Audio"}
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              {t("download.downloadSingleOrMultiple")} {downloadType}s{" "}
              {downloadType === "video"
                ? "in your preferred quality"
                : "as MP3 files"}
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
            {t("download.video")}
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
            {t("download.audio")}
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
            {t("download.single")}{" "}
            {downloadType === "video"
              ? t("download.video")
              : t("download.audio")}
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
            {t("download.multiple")}{" "}
            {downloadType === "video"
              ? t("download.videos")
              : t("download.audioFiles")}
          </button>
        </div>

        {/* Quality Selector - Only for video downloads */}
        {downloadType === "video" && (
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t("download.videoQuality")}
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="best">{t("download.bestQuality")}</option>
              <option value="720p">{t("download.hd720p")}</option>
              <option value="480p">{t("download.sd480p")}</option>
            </select>
          </div>
        )}

        {/* Single Download Form */}
        {downloadMode === "single" && (
          <form onSubmit={handleSingleDownload} className="space-y-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t("download.youtubeUrl")}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isDownloading}
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={isDownloading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Paste from clipboard"
                >
                  <Clipboard size={20} />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t("download.enterYoutubeUrl")}{" "}
                {downloadType === "video"
                  ? t("download.video")
                  : t("download.audio")}
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
                    {downloadType === "video"
                      ? t("download.downloading")
                      : t("download.extractingAudio")}
                  </>
                ) : (
                  <>
                    {downloadType === "video" ? (
                      <Video className="inline-block w-5 h-5 mr-2" />
                    ) : (
                      <Volume2 className="inline-block w-5 h-5 mr-2" />
                    )}
                    {t("download.download")}{" "}
                    {downloadType === "video"
                      ? t("download.video")
                      : t("download.audio")}
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
                  {t("download.youtubeUrls")} {t("download.max10")}
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
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        placeholder={`https://www.youtube.com/watch?v=... (Video ${
                          index + 1
                        })`}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isDownloading}
                      />
                      <button
                        type="button"
                        onClick={() => handlePasteMultiple(index)}
                        disabled={isDownloading}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Paste from clipboard"
                      >
                        <Clipboard size={16} />
                      </button>
                    </div>
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
                {t("download.enterMultipleYoutubeUrls")}{" "}
                {downloadType === "video"
                  ? t("download.videos")
                  : t("download.audioFiles")}
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
                    {t("download.creatingZip")}
                  </>
                ) : (
                  <>
                    <Download className="inline-block w-5 h-5 mr-2" />
                    {t("download.downloadAll")}{" "}
                    {downloadType === "video"
                      ? t("download.videos")
                      : t("download.audioFiles")}
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
              {t("download.downloadProgress")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("download.status")}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {downloadProgress.status}
                </span>
              </div>
              {downloadProgress.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("download.progress")}:
                    </span>
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
