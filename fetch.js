const fetch = require("node-fetch");

const YT_KEY = process.env.YT_KEY;
const FIREBASE_PROJECT = process.env.FB_PROJECT;
const FIREBASE_API_KEY = process.env.FB_API_KEY;

/* =========================
   FETCH FROM YOUTUBE
========================= */

async function fetchYouTube() {

  const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&q=india breaking news crime accident politics&part=snippet,id&type=video&order=date&maxResults=25`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.log("YouTube Error:", data.error);
    return [];
  }

  return data.items || [];
}

/* =========================
   SAVE TO FIRESTORE
========================= */

async function saveToFirestore(video) {

  const videoId = video.id.videoId;

  if (!videoId) return;

  const firestoreURL =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/news/${videoId}?key=${FIREBASE_API_KEY}`;

  const body = {
    fields: {
      videoId: { stringValue: videoId },
      title: { stringValue: video.snippet.title },
      description: { stringValue: video.snippet.description || "" },
      channel: { stringValue: video.snippet.channelTitle },
      thumbnail: { stringValue: video.snippet.thumbnails.high.url },
      publishedAt: { stringValue: video.snippet.publishedAt }
    }
  };

  await fetch(firestoreURL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  console.log("Saved:", videoId);
}

/* =========================
   MAIN RUNNER
========================= */

async function run() {

  const videos = await fetchYouTube();

  for (let video of videos) {
    await saveToFirestore(video);
  }

  console.log("Fetch complete");
}

run();
