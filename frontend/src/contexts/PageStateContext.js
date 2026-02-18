import React, { createContext, useContext, useState } from "react";

const PageStateContext = createContext(null);

export const PageStateProvider = ({ children }) => {
  // ── Generate page state ──────────────────────────────────────────────────
  const [generateUrl, setGenerateUrl] = useState("");
  const [generateStatus, setGenerateStatus] = useState("idle"); // idle | processing | completed | failed
  const [generateTaskId, setGenerateTaskId] = useState(null);
  const [generateScriptId, setGenerateScriptId] = useState(null);
  const [generateScriptData, setGenerateScriptData] = useState(null);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateStatusMessage, setGenerateStatusMessage] = useState("");

  const resetGenerate = () => {
    setGenerateStatus("idle");
    setGenerateTaskId(null);
    setGenerateScriptId(null);
    setGenerateScriptData(null);
    setGenerateProgress(0);
    setGenerateStatusMessage("");
    setGenerateUrl("");
  };

  // ── Download page state ──────────────────────────────────────────────────
  const [downloadSingleUrl, setDownloadSingleUrl] = useState("");
  const [downloadMultipleUrls, setDownloadMultipleUrls] = useState([""]);
  const [downloadQuality, setDownloadQuality] = useState("best");
  const [downloadType, setDownloadType] = useState("video"); // video | audio
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMode, setDownloadMode] = useState("single"); // single | multiple
  const [downloadProgress, setDownloadProgress] = useState({});

  return (
    <PageStateContext.Provider
      value={{
        // Generate
        generateUrl, setGenerateUrl,
        generateStatus, setGenerateStatus,
        generateTaskId, setGenerateTaskId,
        generateScriptId, setGenerateScriptId,
        generateScriptData, setGenerateScriptData,
        generateProgress, setGenerateProgress,
        generateStatusMessage, setGenerateStatusMessage,
        resetGenerate,

        // Download
        downloadSingleUrl, setDownloadSingleUrl,
        downloadMultipleUrls, setDownloadMultipleUrls,
        downloadQuality, setDownloadQuality,
        downloadType, setDownloadType,
        isDownloading, setIsDownloading,
        downloadMode, setDownloadMode,
        downloadProgress, setDownloadProgress,
      }}
    >
      {children}
    </PageStateContext.Provider>
  );
};

export const usePageState = () => {
  const ctx = useContext(PageStateContext);
  if (!ctx) throw new Error("usePageState must be used within PageStateProvider");
  return ctx;
};
