const FIELDS = [
  ["location", "위치"],
  ["symptom", "증상"],
  ["firstSeen", "처음 발견한 날짜"],
  ["impact", "현재 영향"],
  ["request", "요청 사항"],
];
const MAX_PHOTOS = 3;
const $ = (id) => document.getElementById(id);
let photos = []; // data URL

function show(step) {
  for (const s of ["write", "confirm", "done"]) $("step-" + s).hidden = s !== step;
}
function showError(el, msg) { el.textContent = msg; el.hidden = !msg; }

// 사진을 최대 1600px JPEG로 줄여 data URL로 만든다
function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function renderPhotos(el) {
  el.innerHTML = photos.map((p) => `<img src="${p}" alt="첨부 사진">`).join("");
}

$("photos").addEventListener("change", async (e) => {
  const files = [...e.target.files];
  showError($("write-error"), files.length > MAX_PHOTOS ? `사진은 ${MAX_PHOTOS}장까지만 첨부할 수 있어요. 앞의 ${MAX_PHOTOS}장만 사용합니다.` : "");
  photos = await Promise.all(files.slice(0, MAX_PHOTOS).map(shrink));
  renderPhotos($("preview"));
});

$("btn-organize").addEventListener("click", async () => {
  const text = $("raw").value.trim();
  if (!text) return showError($("write-error"), "상황을 써 주세요.");
  if (photos.length < 1) return showError($("write-error"), "사진을 1장 이상 첨부해 주세요.");
  showError($("write-error"), "");
  const btn = $("btn-organize");
  btn.disabled = true;
  btn.textContent = "정리하는 중…";
  try {
    const res = await fetch("/api/organize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    $("ai-failed").hidden = !data.aiFailed;
    $("fields").innerHTML = FIELDS.map(([k, label]) => `
      <label for="f-${k}">${label}</label>
      <textarea id="f-${k}" rows="${k === "symptom" ? 4 : 2}"></textarea>`).join("");
    for (const [k] of FIELDS) $("f-" + k).value = data.fields[k];
    renderPhotos($("confirm-photos"));
    show("confirm");
  } catch (e) {
    showError($("write-error"), e.message || "정리하지 못했어요. 다시 시도해 주세요.");
  } finally {
    btn.disabled = false;
    btn.textContent = "정리하기";
  }
});

$("btn-back").addEventListener("click", () => show("write"));

$("btn-send").addEventListener("click", async () => {
  const fields = Object.fromEntries(FIELDS.map(([k]) => [k, $("f-" + k).value]));
  const btn = $("btn-send");
  btn.disabled = true;
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields, photos }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    $("share-url").value = data.url;
    $("open-link").href = data.url;
    show("done");
  } catch (e) {
    showError($("confirm-error"), e.message || "보내지 못했어요. 다시 시도해 주세요.");
  } finally {
    btn.disabled = false;
  }
});

$("btn-copy").addEventListener("click", async () => {
  const input = $("share-url");
  try {
    await navigator.clipboard.writeText(input.value);
  } catch {
    input.select();
    document.execCommand("copy");
  }
  $("copied").hidden = false;
});
