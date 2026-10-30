const WHATSAPP = "https://wa.me/31629754087";

/* Mobiel menu */
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("hoofdmenu");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
}

toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    toggle.focus();
  }
});
matchMedia("(min-width: 960px)").addEventListener("change", () => setMenu(false));

/* Werkbon: stelt het WhatsApp-bericht samen */
const werkbon = document.querySelector(".werkbon");
const preview = werkbon.querySelector("[data-preview]");
const send = werkbon.querySelector("[data-send]");
const rijdtGroup = werkbon.querySelector("[data-rijdt]");
const bubble = werkbon.querySelector(".bubble");
const kortingLabel = werkbon.querySelector("[data-korting]");
const kortingInput = kortingLabel.querySelector("input");

const openers = {
  reparatie: "ik wil een reparatie laten inschatten.",
  onderhoud: "ik wil een onderhoudsbeurt inplannen.",
  schade: "ik heb schade aan mijn scooter.",
  fatbike: "ik wil mijn fatbike laten repareren of onderhouden.",
  kopen: "hebben jullie op dit moment een scooter te koop?",
  anders: "ik heb een vraag over mijn scooter.",
};

function buildMessage() {
  const soort = werkbon.querySelector('input[name="soort"]:checked').value;
  const rijdt = werkbon.querySelector('input[name="rijdt"]:checked').value;
  const model = werkbon.querySelector('input[name="model"]').value.trim().replace(/\s+/g, " ");
  const korting = kortingInput.checked;
  const vraagtRijden = soort !== "kopen";

  const parts = [`Hoi RB Wheels, ${openers[soort]}`];
  if (model && soort !== "kopen") parts.push(`Het gaat om een ${model}.`);
  if (vraagtRijden) {
    const voertuig = soort === "fatbike" ? "fatbike" : "scooter";
    parts.push(
      rijdt === "nee"
        ? `Mijn ${voertuig} rijdt niet meer, kunnen jullie hem ophalen?`
        : "Hij rijdt nog, dus ik kan hem langsbrengen."
    );
  }
  if (soort === "schade") parts.push("Ik stuur zo foto's mee.");
  // De korting geldt op een service, dus niet bij het kopen van een scooter
  if (korting && soort !== "kopen") parts.push("Ik wil graag de 10% websitekorting gebruiken.");

  rijdtGroup.hidden = !vraagtRijden;
  kortingLabel.hidden = soort === "kopen";
  return parts.join(" ");
}

function render() {
  const message = buildMessage();
  preview.textContent = message;
  send.href = `${WHATSAPP}?text=${encodeURIComponent(message)}`;
  bubble.classList.remove("is-updated");
  void bubble.offsetWidth;
  bubble.classList.add("is-updated");
}

werkbon.addEventListener("input", render);
werkbon.addEventListener("change", render);
render();
bubble.classList.remove("is-updated");

/* Kortingsaanbod: verschijnt zodra de werkbon uit beeld is, tot de bezoeker hem gebruikt of wegklikt */
const offer = document.querySelector(".offer");
const OFFER_KEY = "rbw-korting";

function offerSeen() {
  try { return localStorage.getItem(OFFER_KEY) !== null; } catch { return false; }
}
function closeOffer(reason) {
  offer.hidden = true;
  observer.disconnect();
  try { localStorage.setItem(OFFER_KEY, reason); } catch { /* geen opslag: dan komt hij volgende keer terug */ }
}

const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
    offer.hidden = false;
    observer.disconnect();
  }
});
if (!offerSeen()) observer.observe(werkbon);

offer.querySelector("[data-offer-close]").addEventListener("click", () => closeOffer("gesloten"));
offer.querySelector("[data-offer-use]").addEventListener("click", () => {
  closeOffer("gebruikt");
  const soort = werkbon.querySelector('input[name="soort"]:checked');
  if (soort.value === "kopen") werkbon.querySelector('input[value="reparatie"]').checked = true;
  kortingInput.checked = true;
  render();
  werkbon.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  kortingInput.focus({ preventScroll: true });
});

/* Openingstijden: vandaag markeren en tonen of de garage nu open is (Nederlandse tijd) */
const OPEN = 10 * 60;
const CLOSE = 17 * 60 + 30;
const dagen = ["", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];

function amsterdamNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday")) + 1;
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function nextOpening(day, minutes) {
  if (day <= 5 && minutes < OPEN) return "vandaag";
  const tomorrow = (day % 7) + 1;
  let next = tomorrow;
  while (next > 5) next = (next % 7) + 1;
  return next === tomorrow ? "morgen" : dagen[next];
}

function renderOpeningHours() {
  const { day, minutes } = amsterdamNow();
  document.querySelector(`.hours tr[data-day="${day}"]`)?.classList.add("is-today");

  const status = document.querySelector("[data-open-status]");
  const open = day <= 5 && minutes >= OPEN && minutes < CLOSE;
  status.classList.toggle("is-open", open);
  status.textContent = open
    ? "Nu open, tot 17:30"
    : `Nu gesloten, ${nextOpening(day, minutes)} vanaf 10:00 weer open`;
  status.hidden = false;
}

renderOpeningHours();

document.querySelector("[data-year]").textContent = new Date().getFullYear();
