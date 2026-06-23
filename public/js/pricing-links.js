export function buildPricingLinks(card) {
  const q = [card.year, card.set_name, card.name, card.card_number, card.variant]
    .filter(Boolean)
    .join(" ")
    .trim();
  const encoded = encodeURIComponent(q);

  return [
    { label: "eBay sold listings", url: `https://www.ebay.com/sch/i.html?_nkw=${encoded}&LH_Sold=1&LH_Complete=1` },
    { label: "PriceCharting", url: `https://www.pricecharting.com/search-products?q=${encoded}&type=prices` },
    { label: "TCGplayer", url: `https://www.tcgplayer.com/search/all/product?q=${encoded}` },
  ];
}
