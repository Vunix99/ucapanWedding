AOS.init({
  duration: 1000, // Durasi default untuk animasi
  once: true, // Animasi hanya berjalan sekali
});

const btnScroll = document.getElementById("btnScroll");
const carouselInner = document.getElementById("carouselInner");
const progressBarSegments = document.querySelectorAll(".progress-segment");
const ringIcon = document.getElementById("ringIcon");
const weddingText = document.getElementById("weddingText");
const animatedImages = document.getElementById("animatedImages");
const weddingBlessing = document.getElementById("weddingBlessing");

const backgroundMusic = document.getElementById("backgroundMusic");

// Elemen-elemen untuk Component 3
const heading3 = document.getElementById("heading3");
const subtext3 = document.getElementById("subtext3");
const videoCarouselContainer = document.getElementById(
  "videoCarouselContainer"
);

// Video Carousel Elements
const videoCarousel = document.getElementById("videoCarousel");
const prevVideoBtn = document.getElementById("prevVideoBtn");
const nextVideoBtn = document.getElementById("nextVideoBtn");

// --- Preloader Elements ---
const preloader = document.getElementById("preloader");
const progressBarFill = document.getElementById("progressBarFill");
const downloadedSizeSpan = document.getElementById("downloadedSize");
const totalSizeSpan = document.getElementById("totalSize");
const progressPercentageSpan = document.getElementById("progressPercentage");

// --- Initial Message Elements ---
const initialMessage = document.getElementById("initialMessage");
const viewMessageButton = document.getElementById("viewMessageButton");
const mobileWrapper = document.querySelector(".mobile-wrapper");

// --- Daftar Video & Caption (PERHATIAN: PERLU DIISI MANUAL jika tanpa sisi server) ---
const videoFilenames = [
  "RIAN.mp4",
  "ARES.mp4",
  "ARVA.mp4",
  "FAIT.mp4",
  "OCIT.mp4",
  "OPUNG.mp4",
  "YUGI.mp4",
  "ZIDAN.mp4",
  "MUKLAS.mp4",

  // Tambahkan semua nama file .mp4 Anda di sini
];

const allCaptions = [
  "Semoga cinta kalian abadi hingga jannah!",
  "Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah.",
  "Happy Wedding! Semoga menjadi keluarga yang selalu berbahagia.",
  "Turut berbahagia atas pernikahan kalian, Mas Rizal & Mbak Desy!",
  "Langgeng terus ya sampai kakek nenek, samawa!",
  "Barakallahu lakuma! Semoga diberkahi Allah SWT.",
  "Ikut terharu melihat kebahagiaan kalian. Selamat menikah!",
  "Selamat atas babak baru kehidupan kalian. Indah sekali!",
  "Momen paling spesial! Selamat menempuh bahtera rumah tangga.",
  "Semoga selalu dilimpahi keberkahan dan kebahagiaan.",
  "Selamat menempuh perjalanan cinta yang tak berujung.",
  "Kisah cinta kalian adalah inspirasi. Selamat, pasangan serasi!",
  "Doa terbaik untuk kalian berdua di hari bahagia ini.",
  "Cinta sejati telah menemukan jalannya. Selamat menikah!",
  "Semoga setiap hari kalian dipenuhi tawa dan cinta.",
  "Happy Ever After, Mas Rizal dan Mbak Desy!",
  "Hari ini adalah awal dari selamanya. Selamat!",
  "Semoga cinta kalian tumbuh kuat setiap hari.",
  "Selamat atas ikatan suci ini, semoga langgeng selamanya.",
  "Dari hati yang terdalam, selamat atas pernikahan kalian!",
];

const videoList = [];
const usedCaptions = new Set();

function getRandomCaption() {
  let availableCaptions = allCaptions.filter(
    (caption) => !usedCaptions.has(caption)
  );
  if (availableCaptions.length === 0) {
    usedCaptions.clear();
    availableCaptions = allCaptions;
  }
  const randomIndex = Math.floor(Math.random() * availableCaptions.length);
  const selectedCaption = availableCaptions[randomIndex];
  usedCaptions.add(selectedCaption);
  return selectedCaption;
}

videoFilenames.forEach((filename) => {
  videoList.push({
    filename: filename,
    caption: getRandomCaption(),
  });
});

const videoBasePath = "/asset/img/";

let currentVideoIndex = 0;
let totalVideos = 0;

let currentIndex = 0;
const maxIndex = 2;
let textAnimationPromise = null;

let animationTimeouts = [];
let animationInProgress = false; // Indicates if any animation for component 2 is currently running/scheduled
let component2AnimationCompleted = false; // New flag to track if component 2 animation has fully finished

// --- Preloader Logic ---
// Remove ASSET_SIZES if you want to rely purely on Content-Length,
// but keep it as a fallback or for assets where Content-Length might not be consistently sent.
// const ASSET_SIZES = { ... }; // You might still keep this for fallback/initial estimation

let totalExpectedBytes = 0; // This will now be dynamically calculated
let loadedBytes = 0;

// Add main images and music
const initialAssets = [
  "/asset/music/bg-music.mp3",
  "/asset/img/background.png",
  "/asset/img/msrizal1.png",
  "/asset/img/msrizal2.png",
  "/asset/img/ring-icon.png",
  "/asset/img/component2-1.png",
  "/asset/img/component2-2.png",
];

// Add video paths for metadata loading (we'll fetch them to get content-length)
const videoAssetPaths = videoFilenames.map(
  (filename) => `${videoBasePath}${filename}`
);

const assetsToLoad = [...initialAssets, ...videoAssetPaths];

// Initially, estimate total size or set to 0.
// We'll update totalExpectedBytes as we get Content-Length from responses.
totalExpectedBytes = 0; // Initialize to 0, it will be populated as we get actual sizes

// Function to update progress display
function updateProgress(currentLoadedBytes, currentTotalExpectedBytes) {
  // Ensure totalExpectedBytes is not zero to prevent division by zero
  const percentage =
    currentTotalExpectedBytes > 0
      ? Math.min(
          100,
          Math.floor((currentLoadedBytes / currentTotalExpectedBytes) * 100)
        )
      : 0;

  progressBarFill.style.width = `${percentage}%`;
  downloadedSizeSpan.textContent =
    (currentLoadedBytes / (1024 * 1024)).toFixed(1) + " Mb";
  totalSizeSpan.textContent =
    (currentTotalExpectedBytes / (1024 * 1024)).toFixed(1) + " Mb";
  progressPercentageSpan.textContent = percentage;

  if (percentage >= 100 && currentLoadedBytes >= currentTotalExpectedBytes) {
    // Ensure both conditions for completion
    setTimeout(() => {
      preloader.classList.add("hidden");
      setTimeout(() => {
        initialMessage.classList.add("show");
        document.body.style.overflow = "hidden";
      }, 500);
    }, 300);
  }
}

async function loadAsset(url) {
  try {
    const response = await fetch(url, { method: "HEAD" }); // Use HEAD request to get headers first
    const contentLength = response.headers.get("content-length");
    let assetSize = 0;

    if (contentLength) {
      assetSize = parseInt(contentLength, 10);
    } else {
      // Fallback: If Content-Length is not available (e.g., CORS issues, or server doesn't send it)
      // You might use your ASSET_SIZES map here as a fallback or a default small size.
      console.warn(
        `Content-Length not available for ${url}. Using estimated size if available.`
      );
      // If ASSET_SIZES exists, you can use it here as a fallback:
      // assetSize = ASSET_SIZES[url] || (url.includes(".mp4") ? ASSET_SIZES["video_metadata"] : 0);
      // For now, we'll just return 0 if no Content-Length
      assetSize = 0; // Or a small default for unmeasurable assets
    }

    // Now, actually fetch the asset to mark it as 'loaded'
    // We're essentially doing a two-step: get size, then 'load' (which happens very fast now)
    const actualFetch = await fetch(url);
    if (!actualFetch.ok) {
      throw new Error(`HTTP error! status: ${actualFetch.status}`);
    }

    return assetSize; // Return the actual (or estimated) size
  } catch (error) {
    console.warn(`Failed to load asset or get size for ${url}:`, error);
    return 0; // Return 0 bytes on error
  }
}

async function startLoadingAssets() {
  let currentLoadedBytes = 0;
  let totalKnownBytes = 0;
  const assetSizes = {}; // Store known sizes here

  // First pass: Try to get total expected bytes by HEAD requests
  for (const assetPath of assetsToLoad) {
    try {
      const response = await fetch(assetPath, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        totalKnownBytes += size;
        assetSizes[assetPath] = size;
      } else {
        // If Content-Length isn't available, make a reasonable estimate
        // You can uncomment and use your ASSET_SIZES object here if you have it
        // const estimatedSize = ASSET_SIZES[assetPath] || (assetPath.includes(".mp4") ? ASSET_SIZES["video_metadata"] : 0);
        // totalKnownBytes += estimatedSize;
        // assetSizes[assetPath] = estimatedSize;
        console.warn(
          `Content-Length not available for ${assetPath}. Skipping for total calculation for now.`
        );
      }
    } catch (error) {
      console.warn(`Failed HEAD request for ${assetPath}:`, error);
    }
  }
  totalExpectedBytes = totalKnownBytes; // Set the total expected bytes
  totalSizeSpan.textContent = (totalExpectedBytes / (1024 * 1024)).toFixed(1); // Update total size display

  // Second pass: Actually load the assets and update progress
  for (const assetPath of assetsToLoad) {
    // You might not even need the 'loadAsset' function if you're just doing HEAD requests
    // and then letting the browser's normal loading handle the rest.
    // For a more precise progress bar *during* loading, you'd use fetch with readable streams.
    // However, for simply displaying the total loaded vs. total expected, this is simpler.

    // Simulate loading by waiting a bit and then adding the asset's size
    // In a real scenario, you'd track progress of the actual download.
    currentLoadedBytes += assetSizes[assetPath] || 0; // Add the known size
    updateProgress(currentLoadedBytes, totalExpectedBytes);
    // For a true progress bar, this is where you'd actually fetch the asset with progress
    // const res = await fetch(assetPath); // Or just let the browser fetch it normally.
    // If you really want detailed progress per asset:
    // const response = await fetch(assetPath);
    // const reader = response.body.getReader();
    // let receivedLength = 0; // bytes received
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) {
    //     break;
    //   }
    //   receivedLength += value.length;
    //   // Update progress here with (currentLoadedBytes - assetSizes[assetPath] + receivedLength)
    // }
  }
}

// --- End Preloader Logic ---

function setRealViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--real-vh", `${vh}px`);
}

window.addEventListener("resize", setRealViewportHeight);
window.addEventListener("orientationchange", setRealViewportHeight);

document.addEventListener("DOMContentLoaded", () => {
  // Start preloading assets immediately
  startLoadingAssets();
  setRealViewportHeight();
});

viewMessageButton.addEventListener("click", () => {
  initialMessage.classList.remove("show");
  initialMessage.classList.add("hidden"); // Hide the initial message

  setTimeout(() => {
    mobileWrapper.classList.add("show-content"); // Show the main content
    document.body.style.overflow = "auto"; // Allow scrolling again
    initVideoCarousel(); // Initialize video carousel and attempt to play music

    // Attempt to play background music on user interaction
    if (backgroundMusic && backgroundMusic.paused) {
      const playPromise = backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Background music started after user interaction.");
          })
          .catch((error) => {
            console.warn("Autoplay prevented:", error);
            // Autoplay was prevented. User might need to manually enable sound.
          });
      }
    }
  }, 500); // Delay to match initialMessage transition
});

function setAnimationTimeout(fn, delay) {
  const id = setTimeout(fn, delay);
  animationTimeouts.push(id);
  return id;
}

function clearAnimationTimeouts() {
  animationTimeouts.forEach(clearTimeout);
  animationTimeouts = [];
}

function animateWeddingText() {
  return new Promise((resolve) => {
    const textContainer = document.getElementById("weddingText");
    const rawText = "Happy Wedding\nMas Rizal & Mbak Desy";
    const chars = Array.from(rawText);

    textContainer.innerHTML = "";
    let visibleCharCount = 0;
    let aborted = false;

    const abort = () => {
      aborted = true;
      textContainer.innerHTML = rawText.replace(/\n/g, "<br>");
      resolve();
    };

    animateWeddingText.abort = abort;

    chars.forEach((char, index) => {
      if (aborted) return;

      let span;
      if (char === "\n") {
        span = document.createElement("br");
        textContainer.appendChild(span);
        return;
      } else {
        span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        span.style.opacity = 0;
        span.style.transition = "opacity 0.3s ease";
        span.style.display = "inline-block";
        textContainer.appendChild(span);

        setAnimationTimeout(() => {
          if (!aborted) {
            span.style.opacity = 1;
          }
        }, visibleCharCount * 70);

        visibleCharCount++;
      }
    });

    setAnimationTimeout(() => {
      if (!aborted) resolve();
    }, visibleCharCount * 70 + 500);
  });
}

function resetComponent2Animations() {
  clearAnimationTimeouts();
  if (animateWeddingText.abort) {
    animateWeddingText.abort();
    animateWeddingText.abort = null;
  }

  ringIcon.classList.remove("animate");
  weddingText.classList.remove("show");
  animatedImages.classList.remove("show");
  weddingBlessing.classList.remove("show");

  weddingText.innerHTML = "Happy Wedding<br />Mas Rizal & Mbak Desy";

  animatedImages.style.transform = "translateY(20px)";
  weddingBlessing.style.transform = "translateY(30px)";
}

function hideComponent2Immediately() {
  clearAnimationTimeouts();
  if (animateWeddingText.abort) {
    animateWeddingText.abort();
    animateWeddingText.abort = null;
  }

  ringIcon.classList.remove("animate");
  weddingText.classList.remove("show");
  animatedImages.classList.remove("show");
  weddingBlessing.classList.remove("show");

  weddingText.innerHTML = "";

  animatedImages.style.transform = "translateY(0)";
  weddingBlessing.style.transform = "translateY(0)";
}

function triggerRingAnimation() {
  return new Promise((resolve) => {
    // Set flags at the start of animation
    animationInProgress = true;
    component2AnimationCompleted = false;

    console.log("Component 2 animation started.");

    clearAnimationTimeouts();

    // Reset immediately before starting new animation
    resetComponent2Animations();

    setAnimationTimeout(() => {
      ringIcon.classList.add("animate");
    }, 100);

    setAnimationTimeout(() => {
      weddingText.classList.add("show");
      textAnimationPromise = animateWeddingText();

      textAnimationPromise.then(() => {
        setAnimationTimeout(() => {
          animatedImages.classList.add("show");
        }, 200);

        setAnimationTimeout(() => {
          weddingBlessing.classList.add("show");

          // All visual animations are done, set component2AnimationCompleted to true
          component2AnimationCompleted = true;
          animationInProgress = false; // Animation sequence fully completed
          console.log("Component 2 animation finished.");
          resolve();
        }, 600);
      });
    }, 2600);
  });
}

// --- Video Carousel Functions dengan Wrap Around Effect ---
function loadVideos() {
  videoCarousel.innerHTML = "";
  totalVideos = videoList.length;

  videoList.forEach((videoData, index) => {
    const videoItem = document.createElement("div");
    videoItem.classList.add("video-item");

    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-wrapper");

    const videoElement = document.createElement("video");
    videoElement.setAttribute("controls", "");
    videoElement.setAttribute("playsinline", "");
    videoElement.setAttribute("webkit-playsinline", "");
    videoElement.setAttribute("preload", "metadata");

    const sourceElement = document.createElement("source");
    sourceElement.setAttribute("src", `${videoBasePath}${videoData.filename}`);
    sourceElement.setAttribute("type", "video/mp4");

    videoElement.appendChild(sourceElement);
    videoWrapper.appendChild(videoElement);

    const captionElement = document.createElement("p");
    captionElement.classList.add("video-caption");
    captionElement.textContent = videoData.caption;

    videoItem.appendChild(videoWrapper);
    videoItem.appendChild(captionElement);
    videoCarousel.appendChild(videoItem);
  });

  // Clone first and last items for seamless wrap around
  if (totalVideos > 1) {
    // Clone last item and prepend
    const lastClone = videoCarousel.lastElementChild.cloneNode(true);
    lastClone.classList.add("clone");
    videoCarousel.insertBefore(lastClone, videoCarousel.firstElementChild);

    // Clone first item and append
    const firstClone = videoCarousel.children[1].cloneNode(true); // children[1] because [0] is now the clone
    firstClone.classList.add("clone");
    videoCarousel.appendChild(firstClone);

    // Set initial position (offset by one because of prepended clone)
    currentVideoIndex = 0;
    const initialOffset = -(currentVideoIndex + 1) * 100;
    videoCarousel.style.transform = `translateX(${initialOffset}%)`;
    videoCarousel.style.transition = "none"; // No transition for initial setup
  }
}

// Function to stop all videos in the carousel
async function stopAllVideos() {
  const allVideoElements = videoCarousel.querySelectorAll("video");
  let anyVideoPlaying = false; // Track if any video is playing or about to play

  const stopPromises = Array.from(allVideoElements).map(async (video) => {
    if (video && !video.paused) {
      anyVideoPlaying = true; // A video was playing
      try {
        await new Promise((resolve) => {
          const checkAndPause = () => {
            if (video.readyState >= 2) {
              video.pause();
              video.currentTime = 0;
              video.muted = true;
              resolve();
            } else {
              setTimeout(checkAndPause, 10);
            }
          };
          checkAndPause();
        });
      } catch (error) {
        console.warn("Error stopping video:", error);
        video.pause();
        video.currentTime = 0;
        video.muted = true;
      }
    }
  });

  await Promise.allSettled(stopPromises);
}

// New: Function to pause background music
function pauseBackgroundMusic() {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    console.log("Background music paused.");
  }
}

// New: Function to resume background music
function resumeBackgroundMusic() {
  // Attempt to play immediately when called, but handle the promise
  if (backgroundMusic && backgroundMusic.paused) {
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Background music resumed.");
        })
        .catch((error) => {
          console.warn(
            "Failed to resume background music (likely autoplay policy):",
            error
          );
          // This error often means autoplay was prevented. User interaction will still be needed.
        });
    }
  }
}
// Track user interaction (still useful for video playback with sound)
let userHasInteracted = false;
let isTransitioning = false; // Flag to prevent multiple transitions

function detectUserInteraction() {
  if (!userHasInteracted) {
    userHasInteracted = true;
    console.log("User interaction detected - videos can now play with sound.");
    // The background music should already be attempting to play on load,
    // but this ensures it plays if the initial attempt failed due to browser policies.
    resumeBackgroundMusic();
  }
}

// Add event listeners to detect user interaction
document.addEventListener("click", detectUserInteraction, {
  once: false,
});
document.addEventListener("keydown", detectUserInteraction, {
  once: false,
});
document.addEventListener("touchstart", detectUserInteraction, {
  once: false,
});

// Function to play a specific video (improved)
// Function to play a specific video (improved)
async function playVideo(videoElement) {
  if (!videoElement) return;

  pauseBackgroundMusic(); // Pause music when a video is about to play

  try {
    if (videoElement.readyState < 2) {
      videoElement.load();
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Video load timeout"));
        }, 5000);

        const onLoadedData = () => {
          clearTimeout(timeout);
          videoElement.removeEventListener("loadeddata", onLoadedData);
          videoElement.removeEventListener("error", onError);
          resolve();
        };

        const onError = (e) => {
          clearTimeout(timeout);
          videoElement.removeEventListener("loadeddata", onLoadedData);
          videoElement.removeEventListener("error", onError);
          reject(e);
        };

        videoElement.addEventListener("loadeddata", onLoadedData);
        videoElement.addEventListener("error", onError);
      });
    }

    videoElement.currentTime = 0;

    if (userHasInteracted) {
      videoElement.muted = false;
      // --- UBAH INI: Atur volume ke 1.0 (100% maksimal) ---
      videoElement.volume = 1.0;
      // --- END UBAH ---
      try {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Video playback started with sound");
          return;
        }
      } catch (error) {
        console.log("Failed to play with sound, trying muted:", error);
      }
    }

    videoElement.muted = true;
    // --- UBAH INI JUGA: Atur volume ke 1.0 (100% maksimal) ---
    videoElement.volume = 1.0;
    // --- END UBAH ---
    const playPromise = videoElement.play();

    if (playPromise !== undefined) {
      await playPromise;
      console.log("Video playback started (muted)");
      showUnmuteIndicator(videoElement);
    }
  } catch (error) {
    console.warn("Video playback failed:", error);
    videoElement.pause();
    videoElement.muted = true;
    resumeBackgroundMusic(); // Resume music if video fails to play
  }
}
function showUnmuteIndicator(videoElement) {
  const existingIndicator =
    videoElement.parentElement.querySelector(".unmute-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }

  const indicator = document.createElement("div");
  indicator.className = "unmute-indicator";
  indicator.innerHTML = "🔊 Tap untuk unmute";
  indicator.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      cursor: pointer;
      z-index: 10;
      transition: opacity 0.3s;
    `;

  indicator.addEventListener("click", (e) => {
    e.stopPropagation();
    videoElement.muted = false;
    indicator.remove();
    userHasInteracted = true;
  });

  setTimeout(() => {
    if (indicator.parentElement) {
      indicator.style.opacity = "0";
      setTimeout(() => indicator.remove(), 300);
    }
  }, 3000);

  videoElement.parentElement.style.position = "relative";
  videoElement.parentElement.appendChild(indicator);
}

async function showVideo(index, direction = "none") {
  if (isTransitioning) return; // Prevent multiple transitions

  try {
    isTransitioning = true;
    await stopAllVideos();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Calculate position with clones (add 1 because of prepended clone)
    const targetPosition = -(index + 1) * 100;

    // Enable transition for smooth movement
    videoCarousel.style.transition = "transform 0.3s ease-in-out";
    videoCarousel.style.transform = `translateX(${targetPosition}%)`;

    // Handle wrap around after transition
    const handleTransitionEnd = () => {
      videoCarousel.removeEventListener("transitionend", handleTransitionEnd);

      // Check if we need to handle wrap around
      if (index === -1) {
        // We went to the clone of last item, now jump to actual last item
        currentVideoIndex = totalVideos - 1;
        videoCarousel.style.transition = "none";
        videoCarousel.style.transform = `translateX(${
          -(currentVideoIndex + 1) * 100
        }%)`;
      } else if (index === totalVideos) {
        // We went to the clone of first item, now jump to actual first item
        currentVideoIndex = 0;
        videoCarousel.style.transition = "none";
        videoCarousel.style.transform = `translateX(${
          -(currentVideoIndex + 1) * 100
        }%)`;
      } else {
        currentVideoIndex = index;
      }

      isTransitioning = false;

      // Play the active video
      const activeVideoElement = getActiveVideoElement();
      if (activeVideoElement) {
        playVideo(activeVideoElement);
      }
    };

    videoCarousel.addEventListener("transitionend", handleTransitionEnd);

    // Fallback in case transitionend doesn't fire
    setTimeout(() => {
      if (isTransitioning) {
        handleTransitionEnd();
      }
    }, 500);
  } catch (error) {
    console.error("Error in showVideo:", error);
    isTransitioning = false;
  }
}

function getActiveVideoElement() {
  // Get the actual active video (not from clones)
  const allVideoItems = Array.from(videoCarousel.children).filter(
    (item) => !item.classList.contains("clone")
  );
  return allVideoItems[currentVideoIndex]?.querySelector("video");
}

function nextVideo() {
  if (isTransitioning) return;

  if (currentVideoIndex === totalVideos - 1) {
    // Going from last to first - use clone for smooth transition
    showVideo(totalVideos, "forward");
  } else {
    showVideo(currentVideoIndex + 1, "forward");
  }
}

function prevVideo() {
  if (isTransitioning) return;

  if (currentVideoIndex === 0) {
    // Going from first to last - use clone for smooth transition
    showVideo(-1, "backward");
  } else {
    showVideo(currentVideoIndex - 1, "backward");
  }
}

// Event listeners
prevVideoBtn.addEventListener("click", () => {
  detectUserInteraction();
  prevVideo();
});

nextVideoBtn.addEventListener("click", () => {
  detectUserInteraction();
  nextVideo();
});

// Touch controls
let startVideoX = 0;
let endVideoX = 0;
const videoCarouselThreshold = 50;

videoCarousel.addEventListener("touchstart", (e) => {
  detectUserInteraction();
  startVideoX = e.touches[0].clientX;
});

videoCarousel.addEventListener("touchend", (e) => {
  endVideoX = e.changedTouches[0].clientX;
  const diffX = startVideoX - endVideoX;

  if (Math.abs(diffX) > videoCarouselThreshold && !isTransitioning) {
    if (diffX > 0) {
      nextVideo(); // Swipe left - next video
    } else {
      prevVideo(); // Swipe right - previous video
    }
  }
});

// Initialize carousel
function initVideoCarousel() {
  loadVideos();
  // REMOVE or comment out the direct call to resumeBackgroundMusic() here for initial load
  // resumeBackgroundMusic(); // <--- REMOVE THIS LINE OR COMMENT IT OUT
  // Video tidak akan diputar di sini lagi, hanya di goToSlide(2)
}

// --- End Video Carousel Functions ---

function updateProgressBar() {
  progressBarSegments.forEach((segment, index) => {
    if (index === currentIndex) {
      segment.classList.add("active");
    } else {
      segment.classList.remove("active");
    }
  });

  if (currentIndex === 2) {
    btnScroll.classList.add("hidden");
  } else {
    btnScroll.classList.remove("hidden");
  }
}

function goToSlide(index) {
  const previousIndex = currentIndex;
  currentIndex = index;
  carouselInner.style.transform = `translateY(-${currentIndex * 100}vh)`;
  updateProgressBar();

  // Handle animations for component 2
  if (currentIndex === 1) {
    stopAllVideos(); // Stop videos when entering component 2
    resumeBackgroundMusic(); // Ensure music resumes when on component 2

    // Only trigger animation if it's not already running AND hasn't completed yet
    if (!animationInProgress && !component2AnimationCompleted) {
      triggerRingAnimation();
    } else if (component2AnimationCompleted) {
      // If animation completed previously, just ensure elements are shown without re-animating
      ringIcon.classList.add("animate");
      weddingText.classList.add("show");
      weddingText.innerHTML = "Happy Wedding<br />Mas Rizal & Mbak Desy";
      animatedImages.classList.add("show");
      weddingBlessing.classList.add("show");
    }
  } else if (previousIndex === 1) {
    // When leaving component 2, reset animations and flags
    resetComponent2Animations();
    hideComponent2Immediately();
    animationInProgress = false;
    component2AnimationCompleted = false;
  }

  // Handle animations and video for component 3
  if (currentIndex === 2) {
    pauseBackgroundMusic(); // Pause music when entering component 3

    heading3.classList.add("aos-animate", "aos-zoom-in");
    subtext3.classList.add("aos-animate", "aos-fade-up");
    videoCarouselContainer.classList.add("aos-animate", "aos-fade-up");

    setTimeout(() => {
      heading3.style.transitionDuration = "1000ms";
      subtext3.style.transitionDelay = "500ms";
      videoCarouselContainer.style.transitionDelay = "800ms";
    }, 50);

    showVideo(currentVideoIndex);
  } else if (previousIndex === 2) {
    heading3.classList.remove("aos-animate", "aos-zoom-in");
    subtext3.classList.remove("aos-animate", "aos-fade-up");
    videoCarouselContainer.classList.remove("aos-animate", "aos-fade-up");

    heading3.style.transitionDuration = "";
    subtext3.style.transitionDelay = "";
    videoCarouselContainer.style.transitionDelay = "";

    stopAllVideos(); // Stop videos when leaving component 3
    resumeBackgroundMusic(); // Resume music when leaving component 3
  }

  // --- Add this block to handle music for component 1 ---
  if (currentIndex === 0) {
    stopAllVideos(); // Ensure no videos are playing
    resumeBackgroundMusic(); // Play background music for component 1
  }
  // --- End of added block ---

  // Ensure music is playing if not on component 3 and no video is playing
  if (currentIndex !== 2) {
    // Check if any video is currently playing after a short delay
    // This is a safety net in case video transitions are slow
    setTimeout(() => {
      const allVideoElements = videoCarousel.querySelectorAll("video");
      const anyVideoCurrentlyPlaying = Array.from(allVideoElements).some(
        (video) => !video.paused && !video.ended
      );
      if (!anyVideoCurrentlyPlaying) {
        resumeBackgroundMusic();
      }
    }, 500);
  }
}
// Event listener untuk button scroll dengan proteksi
btnScroll.addEventListener("click", (e) => {
  // If on component 2 and animation is in progress, prevent changing slide
  if (currentIndex === 1 && animationInProgress) {
    console.log("Click ignored - Component 2 animation is running");
    e.preventDefault(); // Mencegah tindakan default tombol
    return;
  }

  // Only allow scrolling forward from component 0 and 1
  if (currentIndex < maxIndex) {
    currentIndex++;
    goToSlide(currentIndex);
  }
  // If already at maxIndex (component 2), do nothing or reset to 0 based on desired behavior
  // For now, it will stay at maxIndex
});

// Event listener untuk klik layar dengan proteksi
document.addEventListener("click", function (e) {
  // Skip jika klik pada button atau elemen control
  if (
    e.target.closest("button") ||
    e.target.closest(".control-element") ||
    e.target.closest(".unmute-indicator")
  ) {
    return;
  }

  // If on component 2 and animation is in progress, prevent changing slide
  if (currentIndex === 1 && animationInProgress) {
    console.log("Screen click ignored - Component 2 animation is running");
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent other click handlers from firing
    return;
  }

  // Perform normal navigation if not protected
  // This will only go to the next slide
  if (currentIndex < maxIndex) {
    currentIndex++;
    goToSlide(currentIndex);
  } else {
    // If at the last slide, loop back to the first or stay
    currentIndex = 0; // Or keep it at maxIndex if you don't want to loop
    goToSlide(currentIndex);
  }
});

progressBarSegments.forEach((segment, index) => {
  segment.addEventListener("click", () => {
    goToSlide(index);
  });
});

let startY = 0;
let endY = 0;
const threshold = 50;

const carouselContainer = document.getElementById("carouselContainer");

carouselContainer.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].clientY;
    isSwiping = false; // Reset flag
  },
  { passive: true }
); // Gunakan passive: true untuk peningkatan kinerja (tidak akan memanggil preventDefault di touchstart)

carouselContainer.addEventListener(
  "touchmove",
  (e) => {
    // Hanya jika satu jari disentuh dan belum ada swipe aktif
    if (e.touches.length === 1 && !isSwiping) {
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;

      // Jika pergerakan vertikal cukup signifikan untuk dianggap sebagai swipe
      if (Math.abs(diffY) > 5) {
        // Sedikit toleransi sebelum menandai sebagai swipe
        isSwiping = true;
        // Jika ini adalah swipe vertikal, cegah default agar tidak memicu pull-to-refresh
        // Penting: hanya panggil preventDefault jika Anda yakin ingin mengelola scroll secara manual
        e.preventDefault();
      }
    }
  },
  { passive: false } // Gunakan passive: false agar preventDefault bisa berfungsi
);

carouselContainer.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

carouselContainer.addEventListener("touchend", (e) => {
  if (isSwiping) {
    // Hanya proses jika ada swipe vertikal yang terdeteksi
    endY = e.changedTouches[0].clientY;
    const diffY = startY - endY;

    // Add protection for swipe gestures on Component 2
    if (currentIndex === 1 && animationInProgress) {
      console.log("Swipe ignored - Component 2 animation is running");
      isSwiping = false; // Reset flag
      return;
    }

    if (diffY > threshold) {
      // Swipe Up (pindah ke komponen berikutnya)
      currentIndex++;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex; // Batasi agar tidak melebihi indeks terakhir
      }
    } else if (diffY < -threshold) {
      // Swipe Down (pindah ke komponen sebelumnya)
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = 0; // Batasi agar tidak kurang dari indeks pertama
      }
    }
    goToSlide(currentIndex);
    isSwiping = false; // Reset flag setelah selesai
  }
});

carouselContainer.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault(); // Mencegah scrolling default browser

    // Add protection for wheel events on Component 2
    if (currentIndex === 1 && animationInProgress) {
      console.log("Wheel ignored - Component 2 animation is running");
      return;
    }

    if (e.deltaY > 0) {
      // Gulir ke bawah (pindah ke komponen berikutnya)
      currentIndex++;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
    } else {
      // Gulir ke atas (pindah ke komponen sebelumnya)
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = 0;
      }
    }
    goToSlide(currentIndex);
  },
  { passive: false } // Penting: Gunakan passive: false untuk memungkinkan preventDefault
);
