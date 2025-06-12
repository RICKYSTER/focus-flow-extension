// Injected into sites for popups
(() => {
  console.log("FocusFlow content script running on", window.location.hostname);

  // Skip if running inside an iframe to prevent double execution or UI issues
  if (window.top !== window.self) {
    console.warn("🪞 Skipping FocusFlow logic inside iframe.");
    return;
  }

  // Wait for full page load before injecting the UI
  window.addEventListener("load", () => {
    const currentDomain = window.location.hostname;

    chrome.storage.local.get(["trackedSites"], (data) => {
      const trackedSites = data.trackedSites || {};
      if (!(currentDomain in trackedSites)) {
        askUserToEnableFocus(currentDomain);
      }
    });
  });
})();

// Show initial banner asking user if they want to enable FocusFlow for this domain
function askUserToEnableFocus(domain) {
  const wrapper = document.createElement("div");

  // Response messages to keep it cinematic and mentor-like
  const yesResponses = [
    "🧭 Alright. Let's do our best.",
    "🎯 Focus sharpens the mind. Let's begin.",
    "🌿 Stillness breeds clarity. Stay the course.",
    "🔒 Your attention matters. Guard it well.",
    "📘 Let’s walk the present moment, together."
  ];

  const noResponses = [
    "📌 Understood. We'll pause for now.",
    "🕊️ Even a break can be purposeful.",
    "🪞 Awareness is enough for today.",
    "⚖️ Not every battle must be fought now.",
    "🌗 Rest, but do not stray too far."
  ];

  const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  wrapper.innerHTML = `
    <div id="ff-banner" style="
      position: fixed;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 340px;
      backdrop-filter: blur(14px);
      background: rgba(30, 30, 30, 0.5);
      color: #fff;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
      font-family: 'Segoe UI', sans-serif;
      font-size: 15px;
      text-align: center;
      z-index: 9999;
      opacity: 0;
      transition: top 0.6s ease, opacity 0.8s ease;
    ">
      <div style="font-size: 17px; margin-bottom: 8px;">🔍 A quick check-in</div>
      <div style="margin-bottom: 14px;">
        Would you like <b>FocusFlow</b> to walk with you on <span style="color:#9bdcff;">${domain}</span>?<br>
        Just gentle nudges to stay present.
      </div>
      <div>
        <button id="ff-yes" style="
          background: rgba(80, 180, 120, 0.8); color: white;
          padding: 8px 16px; border: none;
          border-radius: 8px; margin-right: 8px;
          cursor: pointer;
          font-weight: 500;
        ">Yes, let’s stay mindful</button>

        <button id="ff-no" style="
          background: rgba(130,130,130,0.5); color: white;
          padding: 8px 16px; border: none;
          border-radius: 8px;
          cursor: pointer;
        ">Not now, thank you</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  const banner = document.getElementById("ff-banner");

  // Slide in the banner smoothly
  setTimeout(() => {
    banner.style.top = "20px";
    banner.style.opacity = "1";
  }, 100);

  // Fade out and replace with message before removing
  const closeWithDelayedMessage = (msg) => {
    banner.style.top = "100px";
    banner.style.opacity = "0";

    setTimeout(() => {
      banner.innerHTML = `<div style="padding: 16px 0; font-size: 14px;">${msg}</div>`;
      banner.style.top = "20px";
      banner.style.opacity = "1";

      // Auto-remove after 3 seconds
      setTimeout(() => {
        wrapper.remove();
      }, 3000);
    }, 600);
  };

  // YES: Save focus preference and ask time limit
  document.getElementById("ff-yes").onclick = () => {
    saveFocusPreference(domain, true);
    closeWithDelayedMessage(randomFrom(yesResponses));

    // Ask for time limit after short delay
    setTimeout(() => {
      askTimeLimit(domain);
    }, 4000);
  };

  // NO: Just dismiss and remember the domain
  document.getElementById("ff-no").onclick = () => {
    saveFocusPreference(domain, false);
    closeWithDelayedMessage(randomFrom(noResponses));
  };
}

// Ask user how long they want to focus
function askTimeLimit(domain) {
  const minutes = prompt(`⏳ How many minutes would you like to stay focused on ${domain}?`);
  const timeLimit = parseInt(minutes);

  if (!isNaN(timeLimit) && timeLimit > 0) {
    chrome.storage.sync.set({ [`limit_${domain}`]: timeLimit }, () => {
      console.log(`⏱️ Limit of ${timeLimit} minutes set for ${domain}`);
      startTimer(domain, timeLimit);
    });
  } else {
    alert("⚠️ Please enter a valid number.");
  }
}

// Timer that checks if time has elapsed, then triggers grace period
function startTimer(domain, limitMinutes) {
  const startTime = Date.now();

  const checkInterval = setInterval(() => {
    const now = Date.now();
    const elapsedMinutes = (now - startTime) / (1000 * 60);

    if (elapsedMinutes >= limitMinutes) {
      clearInterval(checkInterval);
      triggerGracePeriod(domain);
    }
  }, 10000); // check every 10 seconds
}

// Grace period of 5 minutes after focus time ends
function triggerGracePeriod(domain) {
  const banner = document.createElement("div");
  banner.innerText = `🛎️ Time’s up on ${domain}. You now have 5 minutes to wrap up.`;

  Object.assign(banner.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff176',
    color: '#333',
    padding: '14px 22px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    fontFamily: 'Segoe UI, sans-serif',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    zIndex: 9999,
    animation: 'blinkYellow 0.8s infinite alternate',
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes blinkYellow {
      0% { opacity: 1; }
      100% { opacity: 0.5; }
    }
    @keyframes blinkRedText {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0.4; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(banner);

  // Auto remove banner
  setTimeout(() => banner.remove(), 5000);

  // Start final countdown after grace period
  setTimeout(() => {
    startFinalCountdown(domain);
  }, 5 * 60 * 1000); // 5 minutes
}

// Final 5-second countdown before tab close
function startFinalCountdown(domain) {
  const countdownDiv = document.createElement("div");
  countdownDiv.innerText = "5";

  Object.assign(countdownDiv.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    fontSize: '64px',
    fontWeight: 'bold',
    color: '#ff4444',
    fontFamily: 'Segoe UI, sans-serif',
    zIndex: 10000,
    animation: 'blinkRedText 0.7s infinite alternate',
    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
    background: 'transparent'
  });

  document.body.appendChild(countdownDiv);

  let counter = 5;
  const interval = setInterval(() => {
    counter--;
    if (counter > 0) {
      countdownDiv.innerText = counter;
    } else {
      clearInterval(interval);
      countdownDiv.remove();

      captureVideoContext();

      // Ask background script to close tab
      try {
        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({ action: "forceCloseTab" });
        }
      } catch (err) {
        console.warn("⚠️ Could not send force close message:", err);
      }
    }
  }, 1000);
}

// Save video playback context (for YouTube rules later)
function captureVideoContext() {
  const video = document.querySelector('video');
  const title = document.title;
  const currentTime = video?.currentTime || 0;

  chrome.storage.local.set({
    ff_lastClosed: {
      title,
      url: location.href,
      time: currentTime,
      timestamp: Date.now()
    }
  });
}

// Save user's domain preference for FocusFlow
function saveFocusPreference(domain, enabled) {
  chrome.storage.local.get(["trackedSites"], (data) => {
    const trackedSites = data.trackedSites || {};
    trackedSites[domain] = enabled;
    chrome.storage.local.set({ trackedSites });
  });
}
