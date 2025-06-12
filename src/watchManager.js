// YouTube unfinished video logic
// Will handle unfinished YouTube videos in the future

const watchList = [];

function saveUnfinishedVideo(url) {
  watchList.push({ url, status: "unfinished", addedAt: new Date().toISOString() });
  console.log("Saved unfinished video:", url);
}
