import { getSupabase } from "./supabase-client.js";

function fmt(n) {
  return `$${(n || 0).toFixed(2)}`;
}

function cardRow(card) {
  const estValue = card.status === "sold" ? 0 : card.last_listed_price || card.last_sold_price || 0;
  const cost = card.acquisition_cost || 0;
  const gain = estValue - cost;

  const div = document.createElement("div");
  div.className = "card-box portfolio-card";
  div.innerHTML = `
    <img src="${card.image_url || ""}" />
    <div class="meta">
      <strong>${card.name || "Unknown"}</strong>
      <div class="muted">${[card.set_name, card.year, card.card_number, card.variant].filter(Boolean).join(" · ")}</div>
      <div class="muted">Cost: ${fmt(cost)} · Status: ${card.status}</div>
      ${
        card.status === "sold"
          ? `<div class="muted">Sold: ${fmt(card.sold_price)} on ${card.sold_date || ""}</div>`
          : `<div class="${gain >= 0 ? "profit-pos" : "profit-neg"}">Est. value: ${fmt(estValue)} (${gain >= 0 ? "+" : ""}${fmt(gain)})</div>
             <button class="btn mark-sold-btn">Mark sold</button>
             <div class="mark-sold-form" style="display:none;">
               <label>Sold price ($)</label><input type="number" step="0.01" class="sold-price" />
               <button class="btn primary confirm-sold-btn">Confirm</button>
             </div>`
      }
    </div>
  `;

  if (card.status !== "sold") {
    const markBtn = div.querySelector(".mark-sold-btn");
    const form = div.querySelector(".mark-sold-form");
    markBtn.addEventListener("click", () => {
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
    div.querySelector(".confirm-sold-btn").addEventListener("click", async () => {
      const soldPrice = parseFloat(div.querySelector(".sold-price").value);
      if (!soldPrice) return;
      const supabase = await getSupabase();
      await supabase
        .from("cards")
        .update({ status: "sold", sold_price: soldPrice, sold_date: new Date().toISOString().slice(0, 10) })
        .eq("id", card.id);
      await renderPortfolio();
    });
  }

  return div;
}

export async function renderPortfolio() {
  const listEl = document.getElementById("portfolio-list");
  listEl.innerHTML = "<p class=\"muted\">Loading...</p>";

  try {
    const supabase = await getSupabase();
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    let totalSpent = 0;
    let totalValueHeld = 0;
    let realizedProfit = 0;

    cards.forEach((card) => {
      const cost = card.acquisition_cost || 0;
      totalSpent += cost;
      if (card.status === "sold") {
        realizedProfit += (card.sold_price || 0) - cost;
      } else {
        totalValueHeld += card.last_listed_price || card.last_sold_price || 0;
      }
    });

    document.getElementById("t-spent").textContent = fmt(totalSpent);
    document.getElementById("t-value").textContent = fmt(totalValueHeld);
    document.getElementById("t-unrealized").textContent = fmt(totalValueHeld - totalSpent);
    document.getElementById("t-realized").textContent = fmt(realizedProfit);

    listEl.innerHTML = "";
    if (cards.length === 0) {
      listEl.innerHTML = "<p class=\"muted\">No cards yet — identify and add your first one.</p>";
    }
    cards.forEach((card) => listEl.appendChild(cardRow(card)));
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<p class="error">${err.message || "Could not load portfolio."}</p>`;
  }
}

export function initPortfolioView() {
  renderPortfolio();
}
