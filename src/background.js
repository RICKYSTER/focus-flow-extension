// background.js — Background logic for FocusFlow

chrome.runtime.onInstalled.addListener(() => {
  console.log("FocusFlow Extension Installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (message.action === "closeTabAfter" && tabId && message.minutes) {
    const delayMs = message.minutes * 60 * 1000;

    setTimeout(() => {
      chrome.tabs.remove(tabId);
    }, delayMs);
  }

  else if (message.action === "forceCloseTab" && tabId) {
    chrome.tabs.remove(tabId, () => {
      chrome.storage.local.get("ff_lastClosed", (data) => {
        const context = data.ff_lastClosed;
        if (context) {
          chrome.notifications.create("ff_closure_notice", {
            type: "basic",
            iconUrl: "icon128.png",
            title: "FocusFlow",
            message: `You just closed "${context.title}". Was it important?`,
            buttons: [
              { title: "Yes, take me back" },
              { title: "No, I'm ready to focus" }
            ],
            priority: 2
          });
        }
      });
    });
  }
});

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (notifId === "ff_closure_notice") {
    chrome.storage.local.get("ff_lastClosed", (data) => {
      const { url, time } = data.ff_lastClosed || {};

      if (btnIdx === 0 && url) {
        // If YouTube, reopen at last time
        const newUrl = url.includes("youtube.com") && time
          ? `${url.split("&")[0]}&t=${Math.floor(time)}s`
          : url;

        chrome.tabs.create({ url: newUrl });
      } else {
        const affirmations = [
          "🌟 Nice choice. Let's do great work now.",
          "🚀 Focus mode: engaged.",
          "🧘 You’ve got this. Stay sharp.",
          "🔔 Distraction dodged. Carry on!"
        ];
        const msg = affirmations[Math.floor(Math.random() * affirmations.length)];

        chrome.notifications.create("ff_focus_affirm", {
          type: "basic",
          iconUrl: "icon128.png",
          title: "FocusFlow",
          message: msg
        });
      }
    });
  }
});
