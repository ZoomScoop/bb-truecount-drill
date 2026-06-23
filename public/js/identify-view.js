import { buildPricingLinks } from "./pricing-links.js";
import { calcProfit } from "./profit-calc.js";
import { getSupabase } from "./supabase-client.js";

let currentImageFile = null;
let currentImageDataUrl = null;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fillForm(card) {
  document.getElementById("f-category").value = card.category || "other";
  document.getElementById("f-name").value = card.name || "";
  document.getElementById("f-set").value = card.set_name || "";
  document.getElementById("f-year").value = card.year || "";
  document.getElementById("f-number").value = card.card_number || "";
  document.getElementById("f-variant").value = card.variant || "";
  document.getElementById("f-condition").value = card.condition_notes || "";
  document.getElementById("confidence-note").textContent = card.confidence
    ? `Identification confidence: ${card.confidence}. Double-check and correct the fields above before saving.`
    : "";

  const linksEl = document.getElementById("price-links");
  linksEl.innerHTML = "";
  buildPricingLinks(card).forEach(({ label, url }) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "link-pill";
    a.textContent = label;
    linksEl.appendChild(a);
  });
}

function renderProfit() {
  const acquisitionCost = parseFloat(document.getElementById("f-cost").value) || 0;
  const marketPrice = parseFloat(document.getElementById("f-market").value) || 0;
  const feePct = parseFloat(document.getElementById("f-fee").value) || 0;
  const shippingCost = parseFloat(document.getElementById("f-shipping").value) || 0;

  const out = document.getElementById("profit-output");
  const result = calcProfit({ acquisitionCost, marketPrice, feePct, shippingCost });

  if (!result) {
    out.className = "muted";
    out.textContent = "Enter a cost and market price above.";
    return;
  }

  const sign = result.netProfit >= 0 ? "profit-pos" : "profit-neg";
  out.className = sign;
  const roi = result.roiPct === null ? "" : ` (${result.roiPct.toFixed(1)}% ROI)`;
  out.textContent = `Net profit: $${result.netProfit.toFixed(2)}${roi} — after $${result.fees.toFixed(2)} est. fees and $${shippingCost.toFixed(2)} shipping.`;
}

export function initIdentifyView() {
  const photoInput = document.getElementById("photo-input");
  const status = document.getElementById("identify-status");
  const resultBox = document.getElementById("result-box");
  const thumb = document.getElementById("result-thumb");

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;
    currentImageFile = file;

    status.textContent = "Identifying card...";
    resultBox.style.display = "none";

    try {
      currentImageDataUrl = await fileToBase64(file);
      const [, mediaType, base64] = currentImageDataUrl.match(/^data:(.+);base64,(.+)$/) || [];

      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });

      if (!res.ok) throw new Error("identify failed");
      const { card } = await res.json();

      thumb.src = currentImageDataUrl;
      fillForm(card);
      renderProfit();
      resultBox.style.display = "block";
      status.textContent = "";
    } catch (err) {
      console.error(err);
      status.textContent = "Could not identify that photo. Try again or fill the fields in manually.";
      thumb.src = currentImageDataUrl || "";
      fillForm({});
      resultBox.style.display = "block";
    }
  });

  ["f-cost", "f-market", "f-fee", "f-shipping"].forEach((id) =>
    document.getElementById(id).addEventListener("input", renderProfit)
  );

  document.getElementById("save-card").addEventListener("click", async () => {
    const errEl = document.getElementById("save-error");
    errEl.textContent = "";

    try {
      const supabase = await getSupabase();
      let image_url = null;

      if (currentImageFile) {
        const path = `${Date.now()}-${currentImageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("card-images")
          .upload(path, currentImageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("card-images").getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const row = {
        category: document.getElementById("f-category").value,
        name: document.getElementById("f-name").value,
        set_name: document.getElementById("f-set").value,
        year: document.getElementById("f-year").value,
        card_number: document.getElementById("f-number").value,
        variant: document.getElementById("f-variant").value,
        condition_notes: document.getElementById("f-condition").value,
        image_url,
        acquisition_cost: parseFloat(document.getElementById("f-cost").value) || null,
        acquisition_date: new Date().toISOString().slice(0, 10),
        last_market_price: undefined,
        last_listed_price: parseFloat(document.getElementById("f-market").value) || null,
        collectr_value: parseFloat(document.getElementById("f-collectr").value) || null,
        notes: document.getElementById("f-notes").value,
      };
      delete row.last_market_price;

      const { error: insertError } = await supabase.from("cards").insert(row);
      if (insertError) throw insertError;

      document.getElementById("result-box").style.display = "none";
      document.getElementById("photo-input").value = "";
      document.getElementById("identify-status").textContent = "Saved to your collection.";
      currentImageFile = null;
      currentImageDataUrl = null;
    } catch (err) {
      console.error(err);
      errEl.textContent = err.message || "Could not save this card.";
    }
  });
}
