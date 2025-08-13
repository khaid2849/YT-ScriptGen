export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      generate: "Generate",
      download: "Download",
      contact: "Contact",
    },

    // Home Page
    home: {
      title: "YouTube Script Generator",
      subtitle:
        "Convert any YouTube video into perfectly formatted transcripts with timestamps, plus download videos and audio in multiple formats. Free, fast, and powered by advanced AI.",
      getStarted: "Start Generating Scripts",
      featuresTitle: "Why Choose Our Script Generator?",
      howItWorksTitle: "How It Works",
      ctaTitle: "Ready to Generate Your First Script?",
      ctaSubtitle:
        "Join thousands of content creators, students, and researchers who use our tool daily.",
      ctaButton: "Generate Script Now - It's Free!",
      features: [
        {
          title: "Accurate Transcription",
          description:
            "AI-powered speech recognition for precise video-to-text conversion",
        },
        {
          title: "Timestamp Generation",
          description: "Automatic timestamps for easy navigation and reference",
        },
        {
          title: "Multiple Formats",
          description: "Export your transcripts as TXT or JSON files",
        },
        {
          title: "Video Download",
          description:
            "Download YouTube videos in multiple quality options (Best, 720p, 480p)",
        },
        {
          title: "Audio Download",
          description:
            "Extract and download high-quality MP3 audio from any YouTube video",
        },
        {
          title: "Batch Downloads",
          description:
            "Download multiple videos or audio files as convenient ZIP archives",
        },
        {
          title: "Fast Processing",
          description:
            "Quick turnaround time for all video lengths and downloads",
        },
        {
          title: "YouTube Support",
          description: "Works with any public YouTube video URL",
        },
        {
          title: "100% Free",
          description:
            "No hidden costs, no subscriptions, completely free to use",
        },
      ],
      steps: [
        {
          title: "Paste YouTube URL",
          description: "Copy and paste any YouTube video URL into our tool",
        },
        {
          title: "Choose Your Option",
          description:
            "Generate transcripts, download videos, or extract audio files",
        },
        {
          title: "Get Your Content",
          description:
            "Download scripts, videos (MP4), or audio files (MP3) instantly",
        },
      ],
    },

    // Generate Page
    generate: {
      title: "Generate Script",
      description:
        "Transform any YouTube video into a professionally formatted transcript with timestamps.",
      subtitle: "Enter a YouTube URL to generate a script",
      urlPlaceholder: "Enter YouTube URL here...",
      generateButton: "Generate Script",
      processing: "Processing your video...",
      error: "Failed to generate script. Please try again.",
      success: "Script generated successfully!",
      failedPaste:
        "Failed to paste from clipboard. Please ensure clipboard permissions are granted.",
      pleaseEnterUrl: "Please enter a valid YouTube URL",
      startingTranscription: "Starting transcription...",
      failedToStartTranscription: "Failed to start transcription",
      transcriptionCompleted: "Transcription completed!",
      transcriptionFailed: "Transcription failed",
      failedToFetchScript: "Failed to fetch script",
      videoTranscriptionCompleted:
        "Your video has been successfully transcribed. Download or copy your script below.",
      pastePublicUrl:
        "Paste any public YouTube video URL to generate a transcript",
      generateScript: "Generate Script",
      processingTime:
        "This may take a few minutes depending on the video length...",
      progress: "Progress",
      urlPastedFromClipboard: "URL pasted from clipboard!",
      videoContent: "Video Content",
      downloadOptions: "Download Options",
      downloadVideo: "Download Video",
      downloadAudio: "Download Audio",
      script: "Script",
      text: "Text",
      plainText: "Plain Text",
      json: "JSON",
      copyToClipboard: "Copy to Clipboard",
      downloadText: "Download Text",
      downloadPlainText: "Download Plain Text",
      downloadJson: "Download JSON",
      videoProcessingStarted: "Video processing started!",
      bestQuality: "Best Quality",
      hd720p: "720p HD",
      sd480p: "480p SD",
    },

    // Download Page
    download: {
      title: "Download Script",
      subtitle: "Your generated script is ready",
      downloadTxt: "Download as TXT",
      downloadPdf: "Download as PDF",
      copyToClipboard: "Copy to Clipboard",
      backToGenerate: "Generate Another",
      pleaseEnterUrl: "Please enter a valid YouTube URL",
      maximumDownloads:
        "Maximum 10 videos or audio files can be downloaded at once",
      failedToStartDownload: "Failed to start download",
      downloadFailed: "Download failed",
      failedToCheckStatus: "Failed to check download status",
      downloadYouTube: "Download YouTube",
      downloadSingleOrMultiple: "Download single or multiple",
      video: "Video",
      videos: "Videos",
      audio: "Audio",
      audioFiles: "Audio Files",
      single: "Single",
      multiple: "Multiple",
      videoQuality: "Video Quality",
      bestQuality: "Best Quality",
      youtubeUrl: "YouTube URL",
      enterYoutubeUrl: "Enter a YouTube video URL to download as",
      downloading: "Downloading...",
      extractingAudio: "Extracting Audio...",
      download: "Download",
      youtubeUrls: "YouTube URLs",
      enterMultipleYoutubeUrls:
        "Enter multiple YouTube URLs to download as a zip file containing",
      creatingZip: "Creating Zip...",
      downloadAll: "Download All",
      downloadProgress: "Download Progress",
      status: "Status",
      progress: "Progress",
      hd720p: "720p HD",
      sd480p: "480p SD",
      max10: "(Max 10)",
    },

    // Contact Page
    contact: {
      title: "Contact Us",
      subtitle: "Get in touch with our team",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "your.email@example.com",
      messagePlaceholder: "Your message...",
      success: "Message sent successfully!",
      error: "Failed to send message. Please try again.",
      pleaseFillInAllRequiredFields: "Please fill in all required fields",
      messageMustBeAtLeast10CharactersLong:
        "Message must be at least 10 characters long",
      failedToSendMessage: "Failed to send message",
      haveQuestionsFeedbackOrNeedHelp:
        "Have questions, feedback, or need help? We'd love to hear from you.",
      getInTouch: "Get in Touch",
      sendUsAMessageAndWeWillRespondWithin24Hours:
        "Send us a message and we'll respond within 24 hours.",
      contactInformation: "Contact Information",
      email: "Email",
      responseTime: "Response Time",
      within24Hours: "Within 24 hours",
      support: "Support",
      availableMonFri: "Available Mon-Fri",
      quickTips: "Quick Tips",
      sendUsAMessage: "Send us a Message",
      yourName: "Your Name",
      yourEmail: "Your Email",
      subject: "Subject",
      message: "Message",
      sending: "Sending...",
      sendMessage: "Send Message",
      requiredFields: "Required Fields",
      frequentlyAskedQuestions: "Frequently Asked Questions",
      howAccurateIsTheTranscription: "How accurate is the transcription?",
      ourAIAchieves95AccuracyForClearAudio:
        "Our AI achieves 95%+ accuracy for clear audio. Results may vary based on audio quality and accents.",
      whatVideoFormatsAreSupported: "What video formats are supported?",
      weSupportAllPublicYouTubeVideos:
        "We support all public YouTube videos. Private or age-restricted videos cannot be processed.",
      isThereAVideoLengthLimit: "Is there a video length limit?",
      currentlyWeSupportVideosUpTo1HourInLength:
        "Currently, we support videos up to 1 hour in length for optimal processing speed.",
      canIEditTheTranscriptAfterGeneration:
        "Can I edit the transcript after generation?",
      yesDownloadTheTranscriptAndEditItInAnyTextEditor:
        "Yes! Download the transcript and edit it in any text editor. JSON format is also available for developers.",
      beSpecificAboutYourIssue: "Be specific about your issue",
      includeVideoURLsIfRelevant: "Include video URLs if relevant",
      checkOurFAQSectionFirst: "Check our FAQ section first",
      generalInquiry: "General Inquiry",
      technicalSupport: "Technical Support",
      bugReport: "Bug Report",
      featureRequest: "Feature Request",
      feedback: "Feedback",
      other: "Other",
      tellUsHowWeCanHelpYou: "Tell us how we can help you...",
      maxCharacters: "5000 characters",
    },

    // Footer
    footer: {
      quickLinks: "Quick Links",
      home: "Home",
      generateScript: "Generate Script",
      download: "Download",
      contact: "Contact",
      about: "About",
      freeAIPoweredYouTubeToolForTranscriptionAndDownloads:
        "Free AI-powered YouTube tool for transcription and downloads. Convert videos into professionally formatted scripts with timestamps, plus download videos and audio in multiple formats.",
      scriptGenIsAFreeToolBuiltToHelpContentCreatorsStudentsAndResearchersEasilyTranscribeYouTubeVideosAndDownloadContent:
        "ScriptGen is a free tool built to help content creators, students, and researchers easily transcribe YouTube videos and download content.",
      generateScriptsDownloadVideosAudioInMultipleFormatsNoSignUpRequiredNoHiddenFees:
        "Generate scripts, download videos/audio in multiple formats. No sign-up required. No hidden fees.",
      scriptGenByKhaid: "ScriptGen by Khaid",
      allRightsReserved: "All rights reserved.",
      aiPoweredTranscription: "AI-Powered Transcription",
      timestampGeneration: "Timestamp Generation",
      jsonTxtExport: "JSON & TXT Export",
      videoDownloadMp4: "Video Download (MP4)",
      audioDownloadMp3: "Audio Download (MP3)",
      qualitySelection: "Quality Selection",
    },

    // Common
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
    },

    // Backend/Celery Messages
    celery: {
      // General status messages
      starting: "Starting...",
      processing: "Processing...",
      completed: "Completed",
      failed: "Failed",
      error: "Error occurred",
      timeout: "Task timeout",
      unknown_status: "Unknown status",

      // Transcription specific messages
      transcription: {
        starting: "Starting transcription...",
        downloading_video: "Downloading video...",
        extracting_audio: "Extracting audio from video...",
        processing_audio: "Processing audio for transcription...",
        generating_transcript: "Generating transcript with AI...",
        adding_timestamps: "Adding timestamps to transcript...",
        finalizing: "Finalizing transcript...",
        completed: "Transcription completed successfully!",
        failed: "Transcription failed",
        video_not_found: "Video not found or unavailable",
        audio_extraction_failed: "Failed to extract audio from video",
        transcription_api_error: "Transcription service error",
        invalid_video_format: "Invalid or unsupported video format"
      },

      // Download specific messages
      download: {
        starting: "Starting download...",
        fetching_info: "Fetching video information...",
        downloading: "Downloading video...",
        extracting_audio: "Extracting audio...",
        converting: "Converting to requested format...",
        compressing: "Compressing files...",
        creating_zip: "Creating ZIP archive...",
        completed: "Download completed successfully!",
        failed: "Download failed",
        video_unavailable: "Video is unavailable or private",
        quality_not_available: "Requested quality not available",
        disk_space_error: "Insufficient disk space",
        network_error: "Network connection error",
        conversion_failed: "File conversion failed"
      },

      // Progress stages
      progress: {
        initializing: "Initializing task...",
        preparing: "Preparing...",
        stage_1: "Processing stage 1 of 4...",
        stage_2: "Processing stage 2 of 4...", 
        stage_3: "Processing stage 3 of 4...",
        stage_4: "Processing stage 4 of 4...",
        cleanup: "Cleaning up temporary files...",
        finishing: "Finishing up..."
      }
    },
  },

  es: {
    // Navigation
    nav: {
      home: "Inicio",
      generate: "Generar",
      download: "Descargar",
      contact: "Contacto",
    },

    // Home Page
    home: {
      title: "Generador de Guiones de YouTube",
      subtitle:
        "Convierte cualquier video de YouTube en transcripciones perfectamente formateadas con marcas de tiempo, además descarga videos y audio en múltiples formatos. Gratis, rápido y potenciado por IA avanzada.",
      getStarted: "Comenzar a Generar Guiones",
      featuresTitle: "¿Por Qué Elegir Nuestro Generador de Guiones?",
      howItWorksTitle: "Cómo Funciona",
      ctaTitle: "¿Listo para Generar Tu Primer Guión?",
      ctaSubtitle:
        "Únete a miles de creadores de contenido, estudiantes e investigadores que usan nuestra herramienta diariamente.",
      ctaButton: "Generar Guión Ahora - ¡Es Gratis!",
      features: [
        {
          title: "Transcripción Precisa",
          description:
            "Reconocimiento de voz impulsado por IA para conversión precisa de video a texto",
        },
        {
          title: "Generación de Marcas de Tiempo",
          description:
            "Marcas de tiempo automáticas para navegación y referencia fácil",
        },
        {
          title: "Múltiples Formatos",
          description: "Exporta tus transcripciones como archivos TXT o JSON",
        },
        {
          title: "Descarga de Video",
          description:
            "Descarga videos de YouTube en múltiples opciones de calidad (Mejor, 720p, 480p)",
        },
        {
          title: "Descarga de Audio",
          description:
            "Extrae y descarga audio MP3 de alta calidad de cualquier video de YouTube",
        },
        {
          title: "Descargas por Lotes",
          description:
            "Descarga múltiples videos o archivos de audio como archivos ZIP convenientes",
        },
        {
          title: "Procesamiento Rápido",
          description:
            "Tiempo de respuesta rápido para videos de cualquier duración y descargas",
        },
        {
          title: "Soporte para YouTube",
          description: "Funciona con cualquier URL de video público de YouTube",
        },
        {
          title: "100% Gratis",
          description:
            "Sin costos ocultos, sin suscripciones, completamente gratis de usar",
        },
      ],
      steps: [
        {
          title: "Pegar URL de YouTube",
          description:
            "Copia y pega cualquier URL de video de YouTube en nuestra herramienta",
        },
        {
          title: "Elige Tu Opción",
          description:
            "Genera transcripciones, descarga videos o extrae archivos de audio",
        },
        {
          title: "Obtén Tu Contenido",
          description:
            "Descarga guiones, videos (MP4) o archivos de audio (MP3) al instante",
        },
      ],
    },

    // Generate Page
    generate: {
      title: "Generar Guión",
      description:
        "Transforma cualquier video de YouTube en un guión perfectamente formateado con marcas de tiempo.",
      subtitle: "Ingresa una URL de YouTube para generar un guión",
      urlPlaceholder: "Ingresa la URL de YouTube aquí...",
      generateButton: "Generar Guión",
      processing: "Procesando tu video...",
      error: "Error al generar el guión. Por favor intenta de nuevo.",
      success: "¡Guión generado exitosamente!",
      failedPaste:
        "Error al pegar desde el portapapeles. Por favor, asegúrate de que los permisos del portapapeles estén concedidos.",
      pleaseEnterUrl: "Por favor, ingrese una URL de YouTube válida",
      startingTranscription: "Iniciando la transcripción...",
      failedToStartTranscription: "Error al iniciar la transcripción",
      transcriptionCompleted: "Transcripción completada!",
      transcriptionFailed: "Error al completar la transcripción",
      failedToFetchScript: "Error al recuperar el guión",
      videoTranscriptionCompleted:
        "Tu video ha sido transcrito exitosamente. Descarga o copia tu guión a continuación.",
      pastePublicUrl:
        "Copia y pega cualquier URL de video de YouTube público para generar una transcripción",
      generateScript: "Generar Guión",
      processingTime:
        "Esto puede tomar unos minutos dependiendo de la duración del video...",
      progress: "Progreso",
      urlPastedFromClipboard: "URL pegada desde el portapapeles!",
      videoContent: "Contenido del Video",
      downloadOptions: "Opciones de Descarga",
      downloadVideo: "Descargar Video",
      downloadAudio: "Descargar Audio",
      script: "Guión",
      text: "Texto",
      plainText: "Texto Plano",
      json: "JSON",
      copyToClipboard: "Copiar al Portapapeles",
      downloadText: "Descargar Texto",
      downloadPlainText: "Descargar Texto Plano",
      downloadJson: "Descargar JSON",
      videoProcessingStarted: "Procesamiento de video iniciado!",
      bestQuality: "Mejor Calidad",
      hd720p: "720p HD",
      sd480p: "480p SD",
    },

    // Download Page
    download: {
      title: "Descargar Guión",
      subtitle: "Tu guión generado está listo",
      downloadTxt: "Descargar como TXT",
      downloadPdf: "Descargar como PDF",
      copyToClipboard: "Copiar al Portapapeles",
      backToGenerate: "Generar Otro",
      pleaseEnterUrl: "Por favor, ingrese una URL de YouTube válida",
      maximumDownloads:
        "Máximo 10 videos o archivos de audio pueden ser descargados a la vez",
      failedToStartDownload: "Error al iniciar la descarga",
      downloadFailed: "Error al descargar",
      failedToCheckStatus: "Error al verificar el estado de la descarga",
      downloadYouTube: "Descargar YouTube",
      downloadSingleOrMultiple: "Descargar un o múltiples",
      video: "Video",
      videos: "Videos",
      audio: "Audio",
      audioFiles: "Archivos de Audio",
      single: "Soltera",
      multiple: "Múltiple",
      videoQuality: "Calidad de Video",
      bestQuality: "Mejor Calidad",
      youtubeUrl: "URL de YouTube",
      enterYoutubeUrl:
        "Ingrese una URL de video de YouTube para descargar como",
      downloading: "Descargando...",
      extractingAudio: "Extrayendo Audio...",
      download: "Descargar",
      youtubeUrls: "URLs de YouTube",
      enterMultipleYoutubeUrls:
        "Ingrese múltiples URLs de video de YouTube para descargar como un archivo ZIP que contiene",
      creatingZip: "Creando ZIP...",
      downloadAll: "Descargar Todo",
      downloadProgress: "Progreso de Descarga",
      status: "Estado",
      progress: "Progreso",
      hd720p: "720p HD",
      sd480p: "480p SD",
      max10: "(Máximo 10)",
    },

    // Contact Page
    contact: {
      title: "Contáctanos",
      subtitle: "Ponte en contacto con nuestro equipo",
      name: "Nombre",
      email: "Correo",
      message: "Mensaje",
      send: "Enviar Mensaje",
      namePlaceholder: "Tu nombre",
      emailPlaceholder: "tu.correo@ejemplo.com",
      messagePlaceholder: "Tu mensaje...",
      success: "¡Mensaje enviado exitosamente!",
      error: "Error al enviar el mensaje. Por favor intenta de nuevo.",
      pleaseFillInAllRequiredFields:
        "Por favor, complete todos los campos requeridos",
      messageMustBeAtLeast10CharactersLong:
        "El mensaje debe tener al menos 10 caracteres",
      failedToSendMessage: "Error al enviar el mensaje",
      haveQuestionsFeedbackOrNeedHelp:
        "¿Tiene preguntas, comentarios o necesita ayuda? Nos encantaría escucharle.",
      getInTouch: "Contacto",
      sendUsAMessageAndWeWillRespondWithin24Hours:
        "Envíenos un mensaje y nos pondremos en contacto con usted dentro de 24 horas.",
      contactInformation: "Información de Contacto",
      email: "Correo",
      responseTime: "Tiempo de Respuesta",
      within24Hours: "Dentro de 24 horas",
      support: "Soporte",
      availableMonFri: "Disponible de Lunes a Viernes",
      quickTips: "Consejos Rápidos",
      sendUsAMessage: "Envíenos un Mensaje",
      yourName: "Su Nombre",
      yourEmail: "Su Correo",
      subject: "Asunto",
      message: "Mensaje",
      sending: "Enviando...",
      sendMessage: "Enviar Mensaje",
      requiredFields: "Campos requeridos",
      frequentlyAskedQuestions: "Preguntas Frecuentes",
      howAccurateIsTheTranscription: "¿Qué precisión tiene la transcripción?",
      ourAIAchieves95AccuracyForClearAudio:
        "Nuestra IA alcanza una precisión del 95%+ para audio claro. Los resultados pueden variar según la calidad del audio y los acentos.",
      whatVideoFormatsAreSupported: "¿Qué formatos de video son compatibles?",
      weSupportAllPublicYouTubeVideos:
        "Soportamos todos los videos de YouTube públicos. Los videos privados o restringidos por edad no pueden ser procesados.",
      isThereAVideoLengthLimit: "¿Hay un límite de duración de video?",
      currentlyWeSupportVideosUpTo1HourInLength:
        "Actualmente, soportamos videos de hasta 1 hora de duración para un procesamiento óptimo.",
      canIEditTheTranscriptAfterGeneration:
        "¿Puedo editar la transcripción después de la generación?",
      yesDownloadTheTranscriptAndEditItInAnyTextEditor:
        "¡Sí! Descargue la transcripción y edite en cualquier editor de texto. El formato JSON también está disponible para desarrolladores.",
      beSpecificAboutYourIssue: "Sé específico sobre tu problema",
      includeVideoURLsIfRelevant: "Incluye URLs de video si son relevantes",
      checkOurFAQSectionFirst:
        "Revisa nuestra sección de preguntas frecuentes primero",
      generalInquiry: "Demanda General",
      technicalSupport: "Soporte Técnico",
      bugReport: "Reportar un Bug",
      featureRequest: "Demanda de Función",
      feedback: "Feedback",
      other: "Otro",
      tellUsHowWeCanHelpYou: "Dinos cómo podemos ayudarte...",
      maxCharacters: "5000 caracteres",
    },

    // Footer
    footer: {
      quickLinks: "Enlaces Rápidos",
      home: "Inicio",
      generateScript: "Generar Guión",
      download: "Descargar",
      contact: "Contacto",
      about: "Acerca de",
      freeAIPoweredYouTubeToolForTranscriptionAndDownloads:
        "Herramienta de YouTube impulsada por IA gratuita para transcripción y descargas. Convierte videos en guiones perfectamente formateados con marcas de tiempo, además de descargar videos y audio en múltiples formatos.",
      scriptGenIsAFreeToolBuiltToHelpContentCreatorsStudentsAndResearchersEasilyTranscribeYouTubeVideosAndDownloadContent:
        "ScriptGen es una herramienta gratuita diseñada para ayudar a creadores de contenido, estudiantes y investigadores a transcribir fácilmente videos de YouTube y descargar contenido.",
      generateScriptsDownloadVideosAudioInMultipleFormatsNoSignUpRequiredNoHiddenFees:
        "Genera guiones, descarga videos/audio en múltiples formatos. Sin registro requerido. Sin cargos ocultos.",
      scriptGenByKhaid: "ScriptGen por Khaid",
      allRightsReserved: "Todos los derechos reservados.",
      aiPoweredTranscription: "Transcriptión AI-Powered",
      timestampGeneration: "Generación de Timestamp",
      jsonTxtExport: "Exportación JSON & TXT",
      videoDownloadMp4: "Descarga de Video (MP4)",
      audioDownloadMp3: "Descarga de Audio (MP3)",
      qualitySelection: "Selección de Calidad",
    },

    // Common
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar",
    },

    // Backend/Celery Messages
    celery: {
      // General status messages
      starting: "Iniciando...",
      processing: "Procesando...",
      completed: "Completado",
      failed: "Falló",
      error: "Error ocurrido",
      timeout: "Tiempo de espera agotado",
      unknown_status: "Estado desconocido",

      // Transcription specific messages
      transcription: {
        starting: "Iniciando transcripción...",
        downloading_video: "Descargando video...",
        extracting_audio: "Extrayendo audio del video...",
        processing_audio: "Procesando audio para transcripción...",
        generating_transcript: "Generando transcripción con IA...",
        adding_timestamps: "Añadiendo marcas de tiempo a la transcripción...",
        finalizing: "Finalizando transcripción...",
        completed: "¡Transcripción completada exitosamente!",
        failed: "Transcripción falló",
        video_not_found: "Video no encontrado o no disponible",
        audio_extraction_failed: "Falló la extracción de audio del video",
        transcription_api_error: "Error del servicio de transcripción",
        invalid_video_format: "Formato de video inválido o no soportado"
      },

      // Download specific messages
      download: {
        starting: "Iniciando descarga...",
        fetching_info: "Obteniendo información del video...",
        downloading: "Descargando video...",
        extracting_audio: "Extrayendo audio...",
        converting: "Convirtiendo al formato solicitado...",
        compressing: "Comprimiendo archivos...",
        creating_zip: "Creando archivo ZIP...",
        completed: "¡Descarga completada exitosamente!",
        failed: "Descarga falló",
        video_unavailable: "Video no disponible o privado",
        quality_not_available: "Calidad solicitada no disponible",
        disk_space_error: "Espacio insuficiente en disco",
        network_error: "Error de conexión de red",
        conversion_failed: "Falló la conversión de archivo"
      },

      // Progress stages
      progress: {
        initializing: "Inicializando tarea...",
        preparing: "Preparando...",
        stage_1: "Procesando etapa 1 de 4...",
        stage_2: "Procesando etapa 2 de 4...", 
        stage_3: "Procesando etapa 3 de 4...",
        stage_4: "Procesando etapa 4 de 4...",
        cleanup: "Limpiando archivos temporales...",
        finishing: "Finalizando..."
      }
    },
  },

  fr: {
    // Navigation
    nav: {
      home: "Accueil",
      generate: "Générer",
      download: "Télécharger",
      contact: "Contact",
    },

    // Home Page
    home: {
      title: "Générateur de Scripts YouTube",
      subtitle:
        "Convertissez n'importe quelle vidéo YouTube en transcriptions parfaitement formatées avec horodatage, plus téléchargez des vidéos et audio dans plusieurs formats. Gratuit, rapide et alimenté par une IA avancée.",
      getStarted: "Commencer à Générer des Scripts",
      featuresTitle: "Pourquoi Choisir Notre Générateur de Scripts?",
      howItWorksTitle: "Comment Ça Marche",
      ctaTitle: "Prêt à Générer Votre Premier Script?",
      ctaSubtitle:
        "Rejoignez des milliers de créateurs de contenu, étudiants et chercheurs qui utilisent notre outil quotidiennement.",
      ctaButton: "Générer un Script Maintenant - C'est Gratuit!",
      features: [
        {
          title: "Transcription Précise",
          description:
            "Reconnaissance vocale alimentée par IA pour une conversion précise vidéo-vers-texte",
        },
        {
          title: "Génération d'Horodatage",
          description:
            "Horodatages automatiques pour une navigation et référence faciles",
        },
        {
          title: "Formats Multiples",
          description: "Exportez vos transcriptions en fichiers TXT ou JSON",
        },
        {
          title: "Téléchargement Vidéo",
          description:
            "Téléchargez des vidéos YouTube en plusieurs options de qualité (Meilleure, 720p, 480p)",
        },
        {
          title: "Téléchargement Audio",
          description:
            "Extrayez et téléchargez de l'audio MP3 haute qualité de n'importe quelle vidéo YouTube",
        },
        {
          title: "Téléchargements par Lots",
          description:
            "Téléchargez plusieurs vidéos ou fichiers audio sous forme d'archives ZIP pratiques",
        },
        {
          title: "Traitement Rapide",
          description:
            "Temps de traitement rapide pour toutes les longueurs de vidéo et téléchargements",
        },
        {
          title: "Support YouTube",
          description:
            "Fonctionne avec n'importe quelle URL de vidéo YouTube publique",
        },
        {
          title: "100% Gratuit",
          description:
            "Pas de coûts cachés, pas d'abonnements, entièrement gratuit à utiliser",
        },
      ],
      steps: [
        {
          title: "Coller l'URL YouTube",
          description:
            "Copiez et collez n'importe quelle URL de vidéo YouTube dans notre outil",
        },
        {
          title: "Choisissez Votre Option",
          description:
            "Générez des transcriptions, téléchargez des vidéos ou extrayez des fichiers audio",
        },
        {
          title: "Obtenez Votre Contenu",
          description:
            "Téléchargez scripts, vidéos (MP4) ou fichiers audio (MP3) instantanément",
        },
      ],
    },

    // Generate Page
    generate: {
      title: "Générer un Script",
      description:
        "Transformez n'importe quelle vidéo YouTube en un script parfaitement formaté avec horodatage.",
      subtitle: "Entrez une URL YouTube pour générer un script",
      urlPlaceholder: "Entrez l'URL YouTube ici...",
      generateButton: "Générer le Script",
      processing: "Traitement de votre vidéo...",
      error: "Échec de la génération du script. Veuillez réessayer.",
      success: "Script généré avec succès!",
      failedPaste: "Échec de la génération du script. Veuillez réessayer.",
      pleaseEnterUrl: "Veuillez entrer une URL YouTube valide",
      startingTranscription: "Démarrage de la transcription...",
      failedToStartTranscription: "Échec du démarrage de la transcription",
      transcriptionCompleted: "Transcription terminée!",
      transcriptionFailed: "Échec de la transcription",
      failedToFetchScript: "Échec de la récupération du script",
      videoTranscriptionCompleted:
        "Votre vidéo a été transcrite avec succès. Téléchargez ou copiez votre script ci-dessous.",
      pastePublicUrl:
        "Collez n'importe quelle URL de vidéo YouTube publique pour générer une transcription",
      generateScript: "Générer le Script",
      processingTime:
        "Cela peut prendre quelques minutes selon la longueur de la vidéo...",
      progress: "Progression",
      urlPastedFromClipboard: "URL collée depuis le presse-papiers!",
      videoContent: "Contenu de la Vidéo",
      downloadOptions: "Options de Téléchargement",
      downloadVideo: "Télécharger la Vidéo",
      downloadAudio: "Télécharger l'Audio",
      script: "Script",
      text: "Texte",
      plainText: "Texte Plair",
      json: "JSON",
      copyToClipboard: "Copier dans le Presse-papiers",
      downloadText: "Télécharger le Texte",
      downloadPlainText: "Télécharger le Texte Plair",
      downloadJson: "Télécharger le JSON",
      videoProcessingStarted: "Traitement de la vidéo démarré!",
      bestQuality: "Meilleure Qualité",
      hd720p: "720p HD",
      sd480p: "480p SD",
    },

    // Download Page
    download: {
      title: "Télécharger le Script",
      subtitle: "Votre script généré est prêt",
      downloadTxt: "Télécharger en TXT",
      downloadPdf: "Télécharger en PDF",
      copyToClipboard: "Copier dans le Presse-papiers",
      backToGenerate: "Générer un Autre",
      pleaseEnterUrl: "Veuillez entrer une URL YouTube valide",
      maximumDownloads:
        "Maximum 10 vidéos ou fichiers audio peuvent être téléchargés à la fois",
      failedToStartDownload: "Échec du démarrage du téléchargement",
      downloadFailed: "Échec du téléchargement",
      failedToCheckStatus:
        "Échec de la vérification du statut du téléchargement",
      downloadYouTube: "Télécharger YouTube",
      downloadSingleOrMultiple: "Télécharger un ou plusieurs",
      video: "Vidéo",
      videos: "Plusieurs vidéos",
      audio: "Audio",
      audioFiles: "Fichiers Audio",
      single: "Célibataire",
      multiple: "Multiple",
      videoQuality: "Qualité de la Vidéo",
      bestQuality: "Meilleure Qualité",
      youtubeUrl: "URL YouTube",
      enterYoutubeUrl: "Entrez une URL de vidéo YouTube à télécharger en",
      downloading: "Téléchargement...",
      extractingAudio: "Extraction de l'Audio...",
      download: "Télécharger",
      youtubeUrls: "URLs YouTube",
      enterMultipleYoutubeUrls:
        "Entrez plusieurs URLs de vidéo YouTube pour télécharger en tant que fichier ZIP contenant",
      creatingZip: "Création du ZIP...",
      downloadAll: "Télécharger Tout",
      downloadProgress: "Progression du Téléchargement",
      status: "Statut",
      progress: "Progression",
      hd720p: "720p HD",
      sd480p: "480p SD",
      max10: "(Max 10)",
    },

    // Contact Page
    contact: {
      title: "Nous Contacter",
      subtitle: "Entrez en contact avec notre équipe",
      name: "Nom",
      email: "Email",
      message: "Message",
      send: "Envoyer le Message",
      namePlaceholder: "Votre nom",
      emailPlaceholder: "votre.email@exemple.com",
      messagePlaceholder: "Votre message...",
      success: "Message envoyé avec succès!",
      error: "Échec de l'envoi du message. Veuillez réessayer.",
      pleaseFillInAllRequiredFields: "Veuillez remplir tous les champs requis",
      messageMustBeAtLeast10CharactersLong:
        "Le message doit contenir au moins 10 caractères",
      failedToSendMessage: "Échec de l'envoi du message",
      haveQuestionsFeedbackOrNeedHelp:
        "Vous avez des questions, des commentaires ou besoin d'aide? Nous aimerions vous entendre.",
      getInTouch: "Entrez en Contact",
      sendUsAMessageAndWeWillRespondWithin24Hours:
        "Envoyez-nous un message et nous vous répondrons dans les 24 heures.",
      contactInformation: "Informations de Contact",
      email: "Email",
      responseTime: "Temps de Réponse",
      within24Hours: "Dans les 24 heures",
      support: "Support",
      availableMonFri: "Disponible du Lundi au Vendredi",
      quickTips: "Conseils Rapides",
      sendUsAMessage: "Envoyez-nous un Message",
      yourName: "Votre Nom",
      yourEmail: "Votre Email",
      subject: "Sujet",
      message: "Message",
      sending: "Envoi...",
      sendMessage: "Envoyer le Message",
      requiredFields: "Champs requis",
      frequentlyAskedQuestions: "Questions Fréquemment Posées",
      howAccurateIsTheTranscription:
        "Quelle est la précision de la transcription?",
      ourAIAchieves95AccuracyForClearAudio:
        "Notre IA atteint 95%+ de précision pour l'audio clair. Les résultats peuvent varier en fonction de la qualité de l'audio et des accents.",
      whatVideoFormatsAreSupported: "Quels formats de vidéo sont supportés?",
      weSupportAllPublicYouTubeVideos:
        "Nous supportons toutes les vidéos YouTube publiques. Les vidéos privées ou restreintes par âge ne peuvent pas être traitées.",
      isThereAVideoLengthLimit: "Y a-t-il une limite de longueur de vidéo?",
      currentlyWeSupportVideosUpTo1HourInLength:
        "Actuellement, nous supportons les vidéos jusqu'à 1 heure de longueur pour un traitement optimal.",
      canIEditTheTranscriptAfterGeneration:
        "Puis-je modifier le transcript après la génération?",
      yesDownloadTheTranscriptAndEditItInAnyTextEditor:
        "Oui! Téléchargez le transcript et modifiez-le dans n'importe quel éditeur de texte. Le format JSON est également disponible pour les développeurs.",
      beSpecificAboutYourIssue: "Soyez précis sur votre problème",
      includeVideoURLsIfRelevant: "Incluez les URL de vidéo si pertinentes",
      checkOurFAQSectionFirst: "Vérifiez notre section FAQ d'abord",
      generalInquiry: "Demande Générale",
      technicalSupport: "Support Technique",
      bugReport: "Signaler un Bug",
      featureRequest: "Demande de Fonctionnalité",
      feedback: "Feedback",
      other: "Autre",
      tellUsHowWeCanHelpYou: "Dites-nous comment nous pouvons vous aider...",
      maxCharacters: "5000 caractères",
    },

    // Footer
    footer: {
      quickLinks: "Liens Rapides",
      home: "Accueil",
      generateScript: "Générer un Script",
      download: "Télécharger",
      contact: "Contact",
      about: "À propos",
      freeAIPoweredYouTubeToolForTranscriptionAndDownloads:
        "Outil de YouTube alimenté par l'IA gratuit pour la transcription et les téléchargements. Convertissez des vidéos en scripts parfaitement formatés avec horodatage, plus téléchargez des vidéos et audio dans plusieurs formats. Gratuit, rapide et alimenté par une IA avancée.",
      scriptGenIsAFreeToolBuiltToHelpContentCreatorsStudentsAndResearchersEasilyTranscribeYouTubeVideosAndDownloadContent:
        "ScriptGen est un outil gratuit conçu pour aider les créateurs de contenu, les étudiants et les chercheurs à transcrire facilement des vidéos YouTube et à télécharger du contenu.",
      generateScriptsDownloadVideosAudioInMultipleFormatsNoSignUpRequiredNoHiddenFees:
        "Générez des scripts, téléchargez des vidéos/audio dans plusieurs formats. Pas de compte requis. Pas de frais cachés.",
      scriptGenByKhaid: "ScriptGen par Khaid",
      allRightsReserved: "Tous droits réservés.",
      aiPoweredTranscription: "Transcription alimentée par l'IA",
      timestampGeneration: "Génération d'horodatage",
      jsonTxtExport: "Exportation JSON & TXT",
      videoDownloadMp4: "Téléchargement de vidéo (MP4)",
      audioDownloadMp3: "Téléchargement d'audio (MP3)",
      qualitySelection: "Sélection de qualité",
    },

    // Common
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      save: "Sauvegarder",
      delete: "Supprimer",
      edit: "Modifier",
      close: "Fermer",
    },

    // Backend/Celery Messages
    celery: {
      // General status messages
      starting: "Démarrage...",
      processing: "Traitement...",
      completed: "Terminé",
      failed: "Échoué",
      error: "Erreur survenue",
      timeout: "Délai d'attente dépassé",
      unknown_status: "État inconnu",

      // Transcription specific messages
      transcription: {
        starting: "Démarrage de la transcription...",
        downloading_video: "Téléchargement de la vidéo...",
        extracting_audio: "Extraction de l'audio de la vidéo...",
        processing_audio: "Traitement de l'audio pour transcription...",
        generating_transcript: "Génération de la transcription avec IA...",
        adding_timestamps: "Ajout d'horodatages à la transcription...",
        finalizing: "Finalisation de la transcription...",
        completed: "Transcription terminée avec succès!",
        failed: "Transcription échouée",
        video_not_found: "Vidéo introuvable ou indisponible",
        audio_extraction_failed: "Échec de l'extraction audio de la vidéo",
        transcription_api_error: "Erreur du service de transcription",
        invalid_video_format: "Format vidéo invalide ou non supporté"
      },

      // Download specific messages
      download: {
        starting: "Démarrage du téléchargement...",
        fetching_info: "Récupération des informations vidéo...",
        downloading: "Téléchargement de la vidéo...",
        extracting_audio: "Extraction de l'audio...",
        converting: "Conversion au format demandé...",
        compressing: "Compression des fichiers...",
        creating_zip: "Création de l'archive ZIP...",
        completed: "Téléchargement terminé avec succès!",
        failed: "Téléchargement échoué",
        video_unavailable: "Vidéo indisponible ou privée",
        quality_not_available: "Qualité demandée non disponible",
        disk_space_error: "Espace disque insuffisant",
        network_error: "Erreur de connexion réseau",
        conversion_failed: "Échec de la conversion de fichier"
      },

      // Progress stages
      progress: {
        initializing: "Initialisation de la tâche...",
        preparing: "Préparation...",
        stage_1: "Traitement étape 1 sur 4...",
        stage_2: "Traitement étape 2 sur 4...", 
        stage_3: "Traitement étape 3 sur 4...",
        stage_4: "Traitement étape 4 sur 4...",
        cleanup: "Nettoyage des fichiers temporaires...",
        finishing: "Finalisation..."
      }
    },
  },
};

export const languages = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
};
