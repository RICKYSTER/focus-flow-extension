// Injected into sites for popups
console.log("FocusFlow content script running on", window.location.hostname);

(async () => {
  const currentDomain = window.location.hostname;

  chrome.storage.local.get(["trackedSites"], (data) => {
    const trackedSites = data.trackedSites || {};

    if (!(currentDomain in trackedSites)) {
      askUserToEnableFocus(currentDomain);
    }
  });
})();

function askUserToEnableFocus(domain) {
  const wrapper = document.createElement("div");

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

  // Animate it in
  setTimeout(() => {
    if (banner) {
      banner.style.top = "20px";
      banner.style.opacity = "1";
    }
  }, 100);

  const closeWithDelayedMessage = (msg) => {
    // Slide down and fade
    banner.style.top = "100px";
    banner.style.opacity = "0";

    setTimeout(() => {
      banner.innerHTML = `<div style="padding: 16px 0; font-size: 14px;">${msg}</div>`;
      banner.style.top = "20px";
      banner.style.opacity = "1";
    }, 1500); // Show message after 1.5s

    setTimeout(() => {
      wrapper.remove();
    }, 4500); // Total 1.5s delay + 3s show = 4.5s
  };

  document.getElementById("ff-yes").onclick = () => {
    saveFocusPreference(domain, true);
    closeWithDelayedMessage(randomFrom(yesResponses));
  };

  document.getElementById("ff-no").onclick = () => {
    saveFocusPreference(domain, false);
    closeWithDelayedMessage(randomFrom(noResponses));
  };
}

function saveFocusPreference(domain, enabled) {
  chrome.storage.local.get(["trackedSites"], (data) => {
    const trackedSites = data.trackedSites || {};
    trackedSites[domain] = enabled;
    chrome.storage.local.set({ trackedSites });
  });
}
