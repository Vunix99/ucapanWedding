// Hapus atau komentari baris ini jika Anda tidak lagi menggunakan GSAP sama sekali
// import { gsap } from "gsap"; // <--- HAPUS ATAU KOMENTARI INI

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

// Elemen-elemen untuk Component 4
const component4 = document.querySelector(".component-4"); // PENTING: Ambil elemen div .component-4
const thanks = document.getElementById("thanks");
const full_member_photo = document.getElementById("full_member_photo");
const lastMessage = document.getElementById("lastMessage");
const signature4 = document.getElementById("signature4");

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
  "ACUN.mp4",

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
  const selectedCaption = availableCaptions[randomIndex]; // Corrected  usedCaptions.add(selectedCaption);
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
const maxIndex = 3;
let textAnimationPromise = null;

let animationTimeouts = [];
let animationInProgress = false;
let component2AnimationCompleted = false;

// --- Preloader Logic ---
let totalExpectedBytes = 0;
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

totalExpectedBytes = 0;

// Function to update progress display
function updateProgress(currentLoadedBytes, currentTotalExpectedBytes) {
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
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    let assetSize = 0;

    if (contentLength) {
      assetSize = parseInt(contentLength, 10);
    } else {
      console.warn(
        `Content-Length not available for ${url}. Using estimated size if available.`
      );
      assetSize = 0;
    }

    const actualFetch = await fetch(url);
    if (!actualFetch.ok) {
      throw new Error(`HTTP error! status: ${actualFetch.status}`);
    }

    return assetSize;
  } catch (error) {
    console.warn(`Failed to load asset or get size for ${url}:`, error);
    return 0;
  }
}

async function startLoadingAssets() {
  let currentLoadedBytes = 0;
  let totalKnownBytes = 0;
  const assetSizes = {};

  for (const assetPath of assetsToLoad) {
    try {
      const response = await fetch(assetPath, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        totalKnownBytes += size;
        assetSizes[assetPath] = size;
      } else {
        console.warn(
          `Content-Length not available for ${assetPath}. Skipping for total calculation for now.`
        );
      }
    } catch (error) {
      console.warn(`Failed HEAD request for ${assetPath}:`, error);
    }
  }
  totalExpectedBytes = totalKnownBytes;
  totalSizeSpan.textContent = (totalExpectedBytes / (1024 * 1024)).toFixed(1);

  for (const assetPath of assetsToLoad) {
    currentLoadedBytes += assetSizes[assetPath] || 0;
    updateProgress(currentLoadedBytes, totalExpectedBytes);
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
  startLoadingAssets();
  setRealViewportHeight();
});

viewMessageButton.addEventListener("click", () => {
  initialMessage.classList.remove("show");
  initialMessage.classList.add("hidden");

  setTimeout(() => {
    mobileWrapper.classList.add("show-content");
    document.body.style.overflow = "auto";
    initVideoCarousel();

    if (backgroundMusic && backgroundMusic.paused) {
      const playPromise = backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Background music started after user interaction.");
          })
          .catch((error) => {
            console.warn("Autoplay prevented:", error);
          });
      }
    }
  }, 500);
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
    animationInProgress = true;
    component2AnimationCompleted = false;

    console.log("Component 2 animation started.");

    clearAnimationTimeouts();

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

          component2AnimationCompleted = true;
          animationInProgress = false;
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

  if (totalVideos > 1) {
    const lastClone = videoCarousel.lastElementChild.cloneNode(true);
    lastClone.classList.add("clone");
    videoCarousel.insertBefore(lastClone, videoCarousel.firstElementChild);

    const firstClone = videoCarousel.children[1].cloneNode(true);
    firstClone.classList.add("clone");
    videoCarousel.appendChild(firstClone);

    currentVideoIndex = 0;
    const initialOffset = -(currentVideoIndex + 1) * 100;
    videoCarousel.style.transform = `translateX(${initialOffset}%)`;
    videoCarousel.style.transition = "none";
  }
}

async function stopAllVideos() {
  const allVideoElements = videoCarousel.querySelectorAll("video");
  let anyVideoPlaying = false;

  const stopPromises = Array.from(allVideoElements).map(async (video) => {
    if (video && !video.paused) {
      anyVideoPlaying = true;
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

function pauseBackgroundMusic() {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    console.log("Background music paused.");
  }
}

function resumeBackgroundMusic() {
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
        });
    }
  }
}

let userHasInteracted = false;
let isTransitioning = false;

function detectUserInteraction() {
  if (!userHasInteracted) {
    userHasInteracted = true;
    console.log("User interaction detected - videos can now play with sound.");
    resumeBackgroundMusic();
  }
}

document.addEventListener("click", detectUserInteraction, {
  once: false,
});
document.addEventListener("keydown", detectUserInteraction, {
  once: false,
});
document.addEventListener("touchstart", detectUserInteraction, {
  once: false,
});

async function playVideo(videoElement) {
  if (!videoElement) return;

  pauseBackgroundMusic();

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
      videoElement.volume = 1.0;
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
    videoElement.volume = 1.0;
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
    resumeBackgroundMusic();
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
  if (isTransitioning) return;

  try {
    isTransitioning = true;
    await stopAllVideos();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const targetPosition = -(index + 1) * 100;

    videoCarousel.style.transition = "transform 0.3s ease-in-out";
    videoCarousel.style.transform = `translateX(${targetPosition}%)`;

    const handleTransitionEnd = () => {
      videoCarousel.removeEventListener("transitionend", handleTransitionEnd);

      if (index === -1) {
        currentVideoIndex = totalVideos - 1;
        videoCarousel.style.transition = "none";
        videoCarousel.style.transform = `translateX(${
          -(currentVideoIndex + 1) * 100
        }%)`;
      } else if (index === totalVideos) {
        currentVideoIndex = 0;
        videoCarousel.style.transition = "none";
        videoCarousel.style.transform = `translateX(${
          -(currentVideoIndex + 1) * 100
        }%)`;
      } else {
        currentVideoIndex = index;
      }

      isTransitioning = false;

      const activeVideoElement = getActiveVideoElement();
      if (activeVideoElement) {
        playVideo(activeVideoElement);
      }
    };

    videoCarousel.addEventListener("transitionend", handleTransitionEnd);

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
  const allVideoItems = Array.from(videoCarousel.children).filter(
    (item) => !item.classList.contains("clone")
  );
  return allVideoItems[currentVideoIndex]?.querySelector("video");
}

function nextVideo() {
  if (isTransitioning) return;

  if (currentVideoIndex === totalVideos - 1) {
    showVideo(totalVideos, "forward");
  } else {
    showVideo(currentVideoIndex + 1, "forward");
  }
}

function prevVideo() {
  if (isTransitioning) return;

  if (currentVideoIndex === 0) {
    showVideo(-1, "backward");
  } else {
    showVideo(currentVideoIndex - 1, "backward");
  }
}

prevVideoBtn.addEventListener("click", () => {
  detectUserInteraction();
  prevVideo();
});

nextVideoBtn.addEventListener("click", () => {
  detectUserInteraction();
  nextVideo();
});

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
      nextVideo();
    } else {
      prevVideo();
    }
  }
});

function initVideoCarousel() {
  loadVideos();
}

function updateProgressBar() {
  progressBarSegments.forEach((segment, index) => {
    if (index === currentIndex) {
      segment.classList.add("active");
    } else {
      segment.classList.remove("active");
    }
  });

  if (currentIndex === maxIndex) {
    btnScroll.classList.add("hidden");
  } else {
    btnScroll.classList.remove("hidden");
  }
}

function goToSlide(index) {
  const previousIndex = currentIndex; // Menyimpan indeks sebelumnya
  currentIndex = index; // Memperbarui indeks saat ini

  // Mengubah posisi carousel secara vertikal
  carouselInner.style.transform = `translateY(-${currentIndex * 100}vh)`;

  // Memperbarui tampilan progress bar (asumsi fungsi updateProgressBar() sudah ada)
  updateProgressBar();

  // --- Logika untuk Component 2 ---
  if (currentIndex === 1) {
    stopAllVideos(); // Menghentikan semua video jika ada
    resumeBackgroundMusic(); // Melanjutkan musik latar

    if (!animationInProgress && !component2AnimationCompleted) {
      triggerRingAnimation(); // Memicu animasi cincin jika belum selesai
    } else if (component2AnimationCompleted) {
      // Menambahkan kelas untuk menampilkan elemen jika animasi sudah selesai
      ringIcon.classList.add("animate");
      weddingText.classList.add("show");
      weddingText.innerHTML = "Happy Wedding<br />Mas Rizal & Mbak Desy";
      animatedImages.classList.add("show");
      weddingBlessing.classList.add("show");
    }
  } else if (previousIndex === 1) {
    // Mereset animasi dan menyembunyikan elemen Component 2 saat meninggalkan slide
    resetComponent2Animations();
    hideComponent2Immediately();
    animationInProgress = false;
    component2AnimationCompleted = false;
  }

  // --- Logika untuk Component 3 ---
  if (currentIndex === 2) {
    pauseBackgroundMusic(); // Menghentikan musik latar

    // Menambahkan kelas AOS untuk memicu animasi
    heading3.classList.add("aos-animate", "aos-zoom-in");
    subtext3.classList.add("aos-animate", "aos-fade-up");
    videoCarouselContainer.classList.add("aos-animate", "aos-fade-up");

    // Memberikan sedikit penundaan agar AOS punya waktu untuk menginisialisasi
    setTimeout(() => {
      heading3.style.transitionDuration = "1000ms";
      subtext3.style.transitionDelay = "500ms";
      videoCarouselContainer.style.transitionDelay = "800ms";
    }, 50);

    showVideo(currentVideoIndex); // Menampilkan video pertama (asumsi fungsi showVideo sudah ada)
  } else if (previousIndex === 2) {
    // Menghapus kelas AOS dan membersihkan gaya saat meninggalkan Component 3
    heading3.classList.remove("aos-animate", "aos-zoom-in");
    subtext3.classList.remove("aos-animate", "aos-fade-up");
    videoCarouselContainer.classList.remove("aos-animate", "aos-fade-up");

    heading3.style.transitionDuration = "";
    subtext3.style.transitionDelay = "";
    videoCarouselContainer.style.transitionDelay = "";

    stopAllVideos(); // Menghentikan semua video
    resumeBackgroundMusic(); // Melanjutkan musik latar
  }

  // --- Logika untuk Component 4 ---
  if (currentIndex === 3) {
    // When this slide becomes active, ensure AOS re-observes or triggers animations
    // One way is to trigger AOS refresh or re-add the classes for a re-animation
    // However, the best approach is to let AOS handle it if the elements are within the viewport.
    // If AOS isn't re-triggering, you might need to force a refresh or manually add 'aos-animate'
    // and then remove it to allow AOS to re-add it.

    // A common technique for re-triggering AOS animations on slide change
    // is to remove and then re-add the original AOS classes after a short delay.
    // This simulates the element becoming "out of view" and then "in view" again for AOS.

    thanks.classList.remove("aos-animate");
    full_member_photo.classList.remove("aos-animate");
    lastMessage.classList.remove("aos-animate");
    signature4.classList.remove("aos-animate");

    // Re-add the AOS data attributes if they were removed (which they aren't in your example, but good to be aware)
    // And then re-add the 'aos-animate' class after a brief timeout if AOS doesn't automatically re-trigger.
    setTimeout(() => {
      thanks.classList.add("aos-animate");
      full_member_photo.classList.add("aos-animate");
      lastMessage.classList.add("aos-animate");
      signature4.classList.add("aos-animate");
    }, 50); // A small delay
  } else if (previousIndex === 3) {
    // When leaving the slide, remove the 'aos-animate' class to reset the animation state.
    thanks.classList.remove("aos-animate");
    full_member_photo.classList.remove("aos-animate");
    lastMessage.classList.remove("aos-animate");
    signature4.classList.remove("aos-animate");
  }
}

btnScroll.addEventListener("click", (e) => {
  if (currentIndex === 1 && animationInProgress) {
    console.log("Click ignored - Component 2 animation is running");
    e.preventDefault();
    return;
  }

  if (currentIndex < maxIndex) {
    currentIndex++;
    goToSlide(currentIndex);
  }
});

document.addEventListener("click", function (e) {
  if (
    e.target.closest("button") ||
    e.target.closest(".control-element") ||
    e.target.closest(".unmute-indicator")
  ) {
    return;
  }

  if (currentIndex === 1 && animationInProgress) {
    console.log("Screen click ignored - Component 2 animation is running");
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (currentIndex < maxIndex) {
    currentIndex++;
    goToSlide(currentIndex);
  } else {
    currentIndex = 0;
    goToSlide(currentIndex);
  }
});

progressBarSegments.forEach((segment, index) => {
  segment.addEventListener("click", () => {
    if (currentIndex === 1 && animationInProgress) {
      console.log(
        "Progress bar click ignored - Component 2 animation is running"
      );
      return;
    }
    goToSlide(index);
  });
});

let startY = 0;
let endY = 0;
const threshold = 50;

const carouselContainer = document.getElementById("carouselContainer");
let isSwiping = false;

carouselContainer.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].clientY;
    isSwiping = false;
  },
  { passive: true }
);

carouselContainer.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length === 1 && !isSwiping) {
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;

      if (Math.abs(diffY) > 5) {
        isSwiping = true;
        e.preventDefault();
      }
    }
  },
  { passive: false }
);

carouselContainer.addEventListener("touchend", (e) => {
  if (isSwiping) {
    endY = e.changedTouches[0].clientY;
    const diffY = startY - endY;

    if (currentIndex === 1 && animationInProgress) {
      console.log("Swipe ignored - Component 2 animation is running");
      isSwiping = false;
      return;
    }

    if (diffY > threshold) {
      currentIndex++;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
    } else if (diffY < -threshold) {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = 0;
      }
    }
    goToSlide(currentIndex);
    isSwiping = false;
  }
});

carouselContainer.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();

    if (currentIndex === 1 && animationInProgress) {
      console.log("Wheel ignored - Component 2 animation is running");
      return;
    }

    if (e.deltaY > 0) {
      currentIndex++;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
    } else {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = 0;
      }
    }
    goToSlide(currentIndex);
  },
  { passive: false }
);
