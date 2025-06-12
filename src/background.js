// background logic for FocusFlow
chrome.runtime.onInstalled.addListener(() => {
  console.log("FocusFlow Extension Installed.");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "closeTabAfter" && sender.tab && msg.minutes) {
    const delayMs = msg.minutes * 60 * 1000;

    setTimeout(() => {
      chrome.tabs.remove(sender.tab.id);
    }, delayMs);
  }

  // Immediate force close after countdown
  if (msg.action === "forceCloseTab") {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  }
});
