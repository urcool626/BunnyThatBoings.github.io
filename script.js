/* -------------------------------------------------------
   LOAD DATA FROM lists.json
------------------------------------------------------- */

async function loadData() {
  try {
    const response = await fetch("lists.json");
    if (!response.ok) throw new Error("Failed to load lists.json");
    return await response.json();
  } catch (err) {
    console.error("JSON load error:", err);
    return { videos: [], futureVideos: [] };
  }
}

/* -------------------------------------------------------
   TAG BUILDER
------------------------------------------------------- */

function buildTagsHTML(tags) {
  if (!tags || tags.length === 0) return "";
  return `<div class="tags">${tags
    .map(t => `<span class="tag">${t}</span>`)
    .join("")}</div>`;
}

/* -------------------------------------------------------
   YOUTUBE ID PARSER
------------------------------------------------------- */

function getVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

/* -------------------------------------------------------
   LIST BUILDER
------------------------------------------------------- */

function buildList(container, items, startRank) {
  for (let l = 0; l < items.length; l++) {
    const v = items[l];
    const rank = startRank + l;
    const id = getVideoId(v.url);

    const thumbSrc =
      v.thumb || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null);

    const thumbHTML = thumbSrc
      ? `<img src="${thumbSrc}" alt="thumbnail" />`
      : `<span class="play-tri"></span>`;

    const a = document.createElement("a");
    a.href = v.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    if (v.unverified) {
      a.classList.add("unverified-item");
      const pct = Math.min(100, Math.max(0, v.progress ?? 0));

      a.innerHTML = `
        <div class="thumb thumb-overlay-wrap">
          ${thumbHTML}
          <div class="unverified-label">Unverified</div>
        </div>
        <div class="info">
          <div class="name">${v.name}</div>
          <div class="url">${pct}% progress</div>
          ${buildTagsHTML(v.tags)}
        </div>
        <div class="rank">
          <div>${String(rank).padStart(2, "0")}</div>
          <div class="unverified-badge">Unverified</div>
        </div>`;
    } else {
      a.innerHTML = `
        <div class="thumb">${thumbHTML}</div>
        <div class="info">
          <div class="name">${v.name}</div>
          <div class="url">${v.url}</div>
          ${buildTagsHTML(v.tags)}
        </div>
        <div class="rank">${String(rank).padStart(2, "0")}</div>`;
    }

    container.appendChild(a);
  }
}

/* -------------------------------------------------------
   INITIALIZE PAGE
------------------------------------------------------- */

loadData().then(data => {
  const { videos, futureVideos } = data;

  buildList(document.getElementById("list"), videos, 1);
  buildList(document.getElementById("future-list"), futureVideos, 1);
});

/* -------------------------------------------------------
   TAB SWITCHING
------------------------------------------------------- */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    document
      .querySelectorAll(".tab-btn")
      .forEach(b => b.classList.remove("active"));

    document
      .querySelectorAll(".tab-panel")
      .forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById("panel-" + target).classList.add("active");
  });
});
