# 🧠 FocusFlow Extension – Design Document

This document outlines the behavior logic and flow for the FocusFlow browser extension designed to promote focus, reduce distraction, and enforce intentional browsing — especially on YouTube.

---

## ✅ Rule 1: First-Time Site Detection

### Logic:
- On first visit to any site after install, show a popup:
  > "Do you want FocusFlow to manage your time on this site?"

- If user clicks:
  - [✔ Yes] → Site added to focus list, user sets time limit
  - [✘ No] → Site ignored

---

## ⏱ Rule 2: Per-Site Time Limits

### Logic:
- Once a site is in the focus list:
  - A timer starts on every visit
  - Timer is visible in the extension popup (badge or UI)
  - When time is up:
    - Show warning: “5-minute grace period started”
    - After grace ends, auto-close tab + show popup:
      > “You’ve exceeded your time. This tab was closed to help you refocus.”

---

## 📺 Rule 3: YouTube – Smart Exit Detection

### Trigger:
User exits or switches away from an active video before it finishes

### Popup Message:
> "You're leaving the video before it finishes. Why?"

### Options (Refined):
1. ⏭️ **Not what I expected**  
   _Logs the event; no action taken._

2. ⏱ **Will finish later today**  
   _Adds video to “watch priority” list; will follow up later._

3. 🕒 **Running out of time – will check later**  
   _Blocks YouTube for the rest of the day._

4. 🎯 **Redirecting to a more important video**  
   _Triggers Rule 4 flow (user gets 1 minute to find the new video)._

---

## 🔁 Rule 4: Important Video Redirect with 1-Minute Timeout

### Trigger:
User selects: "Redirecting to a more important video"

### Flow:
1. Timer starts — user has 60 seconds to find and open the “important” video.
2. After 60 seconds, show popup:
   > “⏳ Time’s up. What would you like to do next?”

   #### Options:
   - [🔁 Go back to the unfinished video]
   - [❌ Close YouTube for now]
   - [🕐 Mark current session unfinished]

3. Logic for “unfinished” videos:
   - Saved in `watchList` with timestamp
   - When user opens YouTube next time:
     - Show popup:  
       > "You left a video unfinished. Ready to continue?"

     - If ignored/skipped again → video is removed from watch priority (prevents tab hoarding)

---

## ⌛ Rule 5: Watching Over Time Limit

### Trigger:
User is currently watching a YouTube video when time + grace period ends

### Flow:
- Don’t close the tab immediately.
- Instead, show popup:
  > “Your time is up. Is this video important to finish?”

  - [✔ Yes] → Allow full video to play + 15-second buffer, then close
  - [✘ No] → Close the site immediately

---

## 🧠 Design Philosophy

- Encourage **intentional content consumption**
- Discourage **hoarding tabs for "later"**
- Build **positive habits** through **gentle nudges** and **rules with logic**
- Allow user some flexibility while still **maintaining accountability**

---

## 📌 Storage Objects

- `focusSites`: list of domains with time limits
- `watchList`: list of unfinished YouTube videos
  ```js
  {
    url: "https://youtube.com/watch?v=abc123",
    status: "unfinished",
    attempts: 1,
    addedAt: "2025-06-12T10:00:00"
  }

