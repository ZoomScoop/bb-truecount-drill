import { initIdentifyView } from "./identify-view.js";
import { initPortfolioView, renderPortfolio } from "./portfolio-view.js";

const views = {
  identify: document.getElementById("view-identify"),
  portfolio: document.getElementById("view-portfolio"),
};
const navButtons = {
  identify: document.getElementById("nav-identify"),
  portfolio: document.getElementById("nav-portfolio"),
};

function showView(name) {
  Object.entries(views).forEach(([key, el]) => el.classList.toggle("active", key === name));
  Object.entries(navButtons).forEach(([key, el]) => el.classList.toggle("active", key === name));
  if (name === "portfolio") renderPortfolio();
}

navButtons.identify.addEventListener("click", () => showView("identify"));
navButtons.portfolio.addEventListener("click", () => showView("portfolio"));

initIdentifyView();
initPortfolioView();
