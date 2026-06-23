export function calcProfit({ acquisitionCost, marketPrice, feePct = 13, shippingCost = 0 }) {
  if (!(marketPrice > 0) || !(acquisitionCost >= 0)) return null;

  const fees = marketPrice * (feePct / 100);
  const netRevenue = marketPrice - fees - shippingCost;
  const netProfit = netRevenue - acquisitionCost;
  const roiPct = acquisitionCost > 0 ? (netProfit / acquisitionCost) * 100 : null;

  return { fees, netRevenue, netProfit, roiPct };
}
