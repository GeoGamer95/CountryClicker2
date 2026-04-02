const CITY_ROUND_COUNT = 10;
const CITY_ADVANCE_DELAY_MS = 3000;
const COUNTRY_ADVANCE_DELAY_MS = 1200;
const WORLD_MAP_SCORING_SIZE_KM = 25000;
const SCORE_DECAY_FACTOR = 8;
const EARTH_RADIUS_KM = 6371;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.25;
const ISLAND_BOX_THRESHOLD = 10;
const ISLAND_BOX_MIN_SIZE = 14;
const ISLAND_BOX_PADDING = 1.5;
const TOUCH_PAN_THRESHOLD_PX = 8;

function assetUrl(relativePath) {
  return new URL(relativePath, document.baseURI).toString();
}

const cities = [
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437 },
  { name: "Mexico City", country: "Mexico", latitude: 19.4326, longitude: -99.1332 },
  { name: "Lima", country: "Peru", latitude: -12.0464, longitude: -77.0428 },
  { name: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816 },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
  { name: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357 },
  { name: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792 },
  { name: "Moscow", country: "Russia", latitude: 55.7558, longitude: 37.6173 },
  { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { name: "Bangkok", country: "Thailand", latitude: 13.7563, longitude: 100.5018 },
  { name: "Beijing", country: "China", latitude: 39.9042, longitude: 116.4074 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978 },
  { name: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
  { name: "Auckland", country: "New Zealand", latitude: -36.8509, longitude: 174.7645 }
];

const boxedIslandCountries = new Set([
  "Antigua and Barbuda", "Bahamas", "Bahrain", "Barbados", "Cabo Verde", "Comoros",
  "Dominica", "Fiji", "Grenada", "Kiribati", "Maldives", "Malta", "Marshall Islands",
  "Mauritius", "Micronesia", "Nauru", "Palau", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "Sao Tome and Principe", "Seychelles",
  "Singapore", "Solomon Islands", "Tonga", "Trinidad and Tobago", "Tuvalu", "Vanuatu"
]);

const standardCountryCodes = new Set([
  "AFG", "ALB", "DZA", "AND", "AGO", "ATG", "ARG", "ARM", "AUS", "AUT",
  "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BTN",
  "BOL", "BIH", "BWA", "BRA", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM",
  "CMR", "CAN", "CAF", "TCD", "CHL", "CHN", "COL", "COM", "COG", "CRI",
  "CIV", "HRV", "CUB", "CYP", "CZE", "COD", "DNK", "DJI", "DMA", "DOM",
  "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FJI", "FIN",
  "FRA", "GAB", "GMB", "GEO", "DEU", "GHA", "GRC", "GRD", "GTM", "GIN",
  "GNB", "GUY", "HTI", "HND", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ",
  "IRL", "ISR", "ITA", "JAM", "JPN", "JOR", "KAZ", "KEN", "KIR", "PRK",
  "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE",
  "LTU", "LUX", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MRT",
  "MUS", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MAR", "MOZ", "MMR",
  "NAM", "NRU", "NPL", "NLD", "NZL", "NIC", "NER", "NGA", "MKD", "NOR",
  "OMN", "PAK", "PLW", "PAN", "PNG", "PRY", "PER", "PHL", "POL", "PRT",
  "QAT", "ROU", "RUS", "RWA", "KNA", "LCA", "VCT", "WSM", "SMR", "STP",
  "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SVK", "SVN", "SLB", "SOM",
  "ZAF", "SSD", "ESP", "LKA", "SDN", "SUR", "SWE", "CHE", "SYR", "TJK",
  "THA", "TLS", "TGO", "TON", "TTO", "TUN", "TUR", "TKM", "TUV", "UGA",
  "UKR", "ARE", "GBR", "TZA", "USA", "URY", "UZB", "VUT", "VEN", "VNM",
  "YEM", "ZMB", "ZWE", "VAT", "PSE", "TWN", "UNK"
]);

const countryCodeOverrides = new Map([
  ["France", "FRA"],
  ["Norway", "NOR"],
  ["Kosovo", "UNK"]
]);

const dom = {
  promptText: document.getElementById("promptText"),
  flagPrompt: document.getElementById("flagPrompt"),
  flagImage: document.getElementById("flagImage"),
  roundText: document.getElementById("roundText"),
  scoreText: document.getElementById("scoreText"),
  detailText: document.getElementById("detailText"),
  cityModeButton: document.getElementById("cityModeButton"),
  countryModeButton: document.getElementById("countryModeButton"),
  capitalModeButton: document.getElementById("capitalModeButton"),
  flagModeButton: document.getElementById("flagModeButton"),
  restartButton: document.getElementById("restartButton"),
  changeModeButton: document.getElementById("changeModeButton"),
  mapSvg: document.getElementById("mapSvg"),
  mapBackground: document.getElementById("mapBackground"),
  gridLayer: document.getElementById("gridLayer"),
  landLayer: document.getElementById("landLayer"),
  countryLayer: document.getElementById("countryLayer"),
  islandBoxLayer: document.getElementById("islandBoxLayer"),
  answerLayer: document.getElementById("answerLayer"),
  cityOverlayLayer: document.getElementById("cityOverlayLayer"),
  roundCountModal: document.getElementById("roundCountModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalSubtitle: document.getElementById("modalSubtitle"),
  modalOptions: document.getElementById("modalOptions"),
  modalCancelButton: document.getElementById("modalCancelButton")
};

const state = {
  mode: "none",
  roundLimit: CITY_ROUND_COUNT,
  roundLabel: String(CITY_ROUND_COUNT),
  roundsPlayed: 0,
  totalScore: 0,
  acceptingInput: false,
  remainingCities: [],
  remainingCountries: [],
  currentCity: null,
  currentCountry: null,
  nextRoundTimeoutId: null,
  zoom: 1,
  centerX: 0,
  centerY: 0,
  isPanning: false,
  panStartClientX: 0,
  panStartClientY: 0,
  panStartCenterX: 0,
  panStartCenterY: 0,
  touchMode: "none",
  touchMoved: false,
  lastTouchPoint: null,
  lastPinchDistance: 0,
  lastPinchMidpoint: null,
  suppressNextClick: false,
  countries: [],
  countryMetadata: [],
  countriesLoadPromise: null,
  landPathElements: new Map(),
  countryByKey: new Map(),
  countryPathElements: new Map(),
  countryBoxElements: new Map()
};

init().catch((error) => {
  console.error(error);
  renderGrid();
  resetView();
  showModeSelection();
});

async function init() {
  wireEvents();

  const [countriesGeoJson, countryMetadata] = await Promise.all([
    fetchJson(assetUrl("assets/countries-lite.geojson")),
    fetchJson(assetUrl("assets/country-capitals.json"))
  ]);

  state.countryMetadata = countryMetadata;
  state.countries = normalizeCountries(countriesGeoJson.features ?? [], state.countryMetadata);
  state.countryByKey = new Map(state.countries.map((country) => [country.key, country]));

  renderGrid();
  renderLand();
  renderCountries();
  resetView();
  showModeSelection();
}

function wireEvents() {
  dom.cityModeButton.addEventListener("click", () => startGame("cities", false));
  dom.countryModeButton.addEventListener("click", () => startGame("countries", true));
  dom.capitalModeButton.addEventListener("click", () => startGame("capitals", true));
  dom.flagModeButton.addEventListener("click", () => startGame("flags", true));
  dom.restartButton.addEventListener("click", restartCurrentMode);
  dom.changeModeButton.addEventListener("click", showModeSelection);

  dom.mapSvg.addEventListener("click", handleMapClick);

  dom.mapSvg.addEventListener("wheel", handleWheel, { passive: false });
  dom.mapSvg.addEventListener("mousedown", handleMouseDown);
  dom.mapSvg.addEventListener("touchstart", handleTouchStart, { passive: false });
  dom.mapSvg.addEventListener("touchmove", handleTouchMove, { passive: false });
  dom.mapSvg.addEventListener("touchend", handleTouchEnd, { passive: false });
  dom.mapSvg.addEventListener("touchcancel", handleTouchCancel, { passive: false });
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
  dom.mapSvg.addEventListener("contextmenu", (event) => event.preventDefault());
  window.addEventListener("resize", updateViewBox);
}

async function startGame(mode, promptForRoundCount) {
  clearNextRoundTimer();

  if (mode !== "cities") {
    setPromptText("Loading country map...");
    dom.detailText.textContent = "Preparing the country outlines for this mode.";
    try {
      await ensureCountriesLoaded();
    } catch (error) {
      console.error(error);
      state.mode = "none";
      state.acceptingInput = false;
      clearCityOverlay();
      clearCountryHighlights();
      hideFlagPrompt();
      toggleModeButtons(true);
      updateLayerVisibility();
      resetView();
      setPromptText("Failed to load country map");
      dom.detailText.textContent = "Refresh the page and try again.";
      return;
    }
  }

  if ((mode === "countries" || mode === "capitals" || mode === "flags") && promptForRoundCount) {
    const selection = await chooseRoundCount(mode, getAvailableTargetCount(mode));
    if (!selection) {
      showModeSelection();
      return;
    }

    state.roundLimit = selection.roundCount;
    state.roundLabel = selection.displayLabel;
  } else if (mode === "cities") {
    state.roundLimit = CITY_ROUND_COUNT;
    state.roundLabel = String(CITY_ROUND_COUNT);
  }

  state.mode = mode;
  state.roundsPlayed = 0;
  state.totalScore = 0;
  state.currentCity = null;
  state.currentCountry = null;
  state.acceptingInput = false;
  clearCityOverlay();
  clearCountryHighlights();
  hideFlagPrompt();
  toggleModeButtons(false);

  if (mode === "cities") {
    state.remainingCities = shuffle(cities).slice(0, Math.min(state.roundLimit, cities.length));
    state.remainingCountries = [];
  } else {
    state.remainingCountries = shuffle(getCountryTargetsForMode(mode)).slice(0, Math.min(state.roundLimit, getCountryTargetsForMode(mode).length));
    state.remainingCities = [];
  }

  startRound();
}

function restartCurrentMode() {
  if (state.mode === "none") {
    showModeSelection();
    return;
  }

  startGame(state.mode, false);
}

function showModeSelection() {
  clearNextRoundTimer();
  state.mode = "none";
  state.roundLimit = CITY_ROUND_COUNT;
  state.roundLabel = String(CITY_ROUND_COUNT);
  state.roundsPlayed = 0;
  state.totalScore = 0;
  state.acceptingInput = false;
  state.currentCity = null;
  state.currentCountry = null;
  state.remainingCities = [];
  state.remainingCountries = [];

  clearCityOverlay();
  clearCountryHighlights();
  hideFlagPrompt();
  toggleModeButtons(true);
  setPromptText("Choose a game mode");
  dom.roundText.textContent = "10 rounds for cities";
  dom.scoreText.textContent = "Cities: distance score. Countries, capitals, and flags: correct answers out of your selected round size.";
  dom.detailText.textContent = "Country, capital, and flag modes all ask for 10, 25, 50, 100, or all countries.";
  updateLayerVisibility();
  resetView();
}

function startRound() {
  clearNextRoundTimer();

  if (state.mode === "none") {
    return;
  }

  if (state.roundsPlayed >= state.roundLimit) {
    showGameComplete();
    return;
  }

  state.roundsPlayed += 1;
  state.acceptingInput = true;
  clearCityOverlay();
  clearCountryHighlights();
  updateLayerVisibility();
  resetView();

  if (state.mode === "cities") {
    state.currentCity = state.remainingCities.shift();
    state.currentCountry = null;
    hideFlagPrompt();
    setPromptText(`Click: ${state.currentCity.name}, ${state.currentCity.country}`);
    dom.detailText.textContent = "Mouse wheel or pinch zooms, drag pans, and click or tap locks in your guess.";
  } else if (state.mode === "countries") {
    state.currentCountry = state.remainingCountries.shift();
    state.currentCity = null;
    hideFlagPrompt();
    setPromptText(`Click the country: ${state.currentCountry.name}`);
    dom.detailText.textContent = `Mouse wheel or pinch zooms, drag pans, and click or tap a country outline to answer. Round size: ${state.roundLabel}.`;
  } else if (state.mode === "capitals") {
    state.currentCountry = state.remainingCountries.shift();
    state.currentCity = null;
    hideFlagPrompt();
    setPromptText(`Click the country for: ${state.currentCountry.capital}`);
    dom.detailText.textContent = `Mouse wheel or pinch zooms, drag pans, and click or tap the country that matches the capital. Round size: ${state.roundLabel}.`;
  } else {
    state.currentCountry = state.remainingCountries.shift();
    state.currentCity = null;
    showFlagPrompt(state.currentCountry);
    dom.detailText.textContent = `Click the country for this flag. Round size: ${state.roundLabel}.`;
  }

  dom.roundText.textContent = `Round ${state.roundsPlayed} of ${state.roundLimit}`;
  updateScoreText();
}

function showGameComplete() {
  state.acceptingInput = false;
  clearCountryHighlights();
  hideFlagPrompt();
  setPromptText("Game complete");

  dom.roundText.textContent = `Rounds finished: ${state.roundLimit}/${state.roundLimit}`;

  if (state.mode === "cities") {
    dom.detailText.textContent = `Final cumulative score: ${state.totalScore}/${state.roundLimit * 5000}.`;
  } else if (state.mode === "countries") {
    dom.detailText.textContent = `Final country score: ${state.totalScore}/${state.roundLimit} correct.`;
  } else if (state.mode === "capitals") {
    dom.detailText.textContent = `Final capital score: ${state.totalScore}/${state.roundLimit} correct.`;
  } else {
    dom.detailText.textContent = `Final flag score: ${state.totalScore}/${state.roundLimit} correct.`;
  }

  updateScoreText();
}

function handleCityGuess(longitude, latitude) {
  state.acceptingInput = false;

  const guess = { longitude, latitude };
  const actual = { longitude: state.currentCity.longitude, latitude: state.currentCity.latitude };
  const distanceKm = haversineDistanceKm(guess, actual);
  const score = calculateGeoGuessrScore(distanceKm);

  state.totalScore += score;
  drawCityOverlay(guess, actual);
  dom.detailText.textContent = `You were ${formatNumber(distanceKm)} km away. Round score: ${score}/5000. Cumulative score: ${state.totalScore}/${state.roundLimit * 5000}. Next round in ${CITY_ADVANCE_DELAY_MS / 1000} seconds.`;
  updateScoreText();
  state.currentCity = null;
  scheduleNextRound(CITY_ADVANCE_DELAY_MS);
}

function handleCountryGuess(selectedCountryKey) {
  if (!state.acceptingInput || !state.currentCountry) {
    return;
  }

  const selectedCountry = state.countryByKey.get(selectedCountryKey);
  if (!selectedCountry) {
    return;
  }

  state.acceptingInput = false;
  const isCorrect = selectedCountry.key === state.currentCountry.key;
  highlightCountry(selectedCountry.key, isCorrect ? "correct" : "wrong");

  if (isCorrect) {
    state.totalScore += 1;
    dom.detailText.textContent = `Correct. Score: ${state.totalScore}/${state.roundLimit}. Next round in ${(COUNTRY_ADVANCE_DELAY_MS / 1000).toFixed(1)} seconds.`;
  } else {
    const targetLabel = state.mode === "capitals"
      ? `${state.currentCountry.name} (${state.currentCountry.capital})`
      : state.mode === "flags"
        ? `${state.currentCountry.name} ${state.currentCountry.flagEmoji ?? ""}`.trim()
        : state.currentCountry.name;

    dom.detailText.textContent = `Incorrect. You clicked ${selectedCountry.name}. The correct answer was ${targetLabel}. Score: ${state.totalScore}/${state.roundLimit}.`;
  }

  updateScoreText();
  state.currentCountry = null;
  scheduleNextRound(COUNTRY_ADVANCE_DELAY_MS);
}

function updateScoreText() {
  if (state.mode === "cities") {
    const completedRounds = state.roundsPlayed - (state.acceptingInput ? 1 : 0);
    const average = completedRounds > 0 ? Math.round(state.totalScore / completedRounds) : 0;
    dom.scoreText.textContent = `Cumulative score: ${state.totalScore}/${state.roundLimit * 5000} | Average: ${average.toLocaleString()} | Remaining rounds: ${state.remainingCities.length}`;
    return;
  }

  if (state.mode === "countries") {
    dom.scoreText.textContent = `Countries correct: ${state.totalScore}/${state.roundLimit} | Remaining rounds: ${state.remainingCountries.length}`;
    return;
  }

  if (state.mode === "capitals") {
    dom.scoreText.textContent = `Capitals correct: ${state.totalScore}/${state.roundLimit} | Remaining rounds: ${state.remainingCountries.length}`;
    return;
  }

  if (state.mode === "flags") {
    dom.scoreText.textContent = `Flags correct: ${state.totalScore}/${state.roundLimit} | Remaining rounds: ${state.remainingCountries.length}`;
    return;
  }

  dom.scoreText.textContent = "";
}

function setPromptText(text) {
  dom.flagPrompt.classList.add("hidden");
  dom.promptText.classList.remove("hidden");
  dom.promptText.textContent = text;
}

function showFlagPrompt(country) {
  dom.promptText.classList.add("hidden");
  dom.flagPrompt.classList.remove("hidden");
  dom.flagImage.src = assetUrl(`assets/flags/${country.alpha2.toLowerCase()}.png`);
  dom.flagImage.alt = `${country.name} flag`;
}

function hideFlagPrompt() {
  dom.flagPrompt.classList.add("hidden");
  dom.flagImage.removeAttribute("src");
  dom.promptText.classList.remove("hidden");
}

function toggleModeButtons(showModeButtons) {
  const display = showModeButtons ? "" : "none";
  dom.cityModeButton.style.display = display;
  dom.countryModeButton.style.display = display;
  dom.capitalModeButton.style.display = display;
  dom.flagModeButton.style.display = display;
  dom.restartButton.classList.toggle("hidden", showModeButtons);
  dom.changeModeButton.classList.toggle("hidden", showModeButtons);
}

function getAvailableTargetCount(mode) {
  if (mode === "capitals") {
    return state.countries.filter((country) => Boolean(country.capital)).length;
  }

  if (mode === "flags") {
    return state.countries.filter((country) => Boolean(country.alpha2)).length;
  }

  return state.countries.length;
}

function getCountryTargetsForMode(mode) {
  if (mode === "capitals") {
    return state.countries.filter((country) => Boolean(country.capital));
  }

  if (mode === "flags") {
    return state.countries.filter((country) => Boolean(country.alpha2));
  }

  return state.countries.slice();
}

function scheduleNextRound(delayMs) {
  clearNextRoundTimer();
  state.nextRoundTimeoutId = window.setTimeout(() => {
    state.nextRoundTimeoutId = null;
    startRound();
  }, delayMs);
}

function clearNextRoundTimer() {
  if (state.nextRoundTimeoutId !== null) {
    window.clearTimeout(state.nextRoundTimeoutId);
    state.nextRoundTimeoutId = null;
  }
}

function chooseRoundCount(mode, totalTargets) {
  const targetLabel = mode === "capitals" ? "capitals" : mode === "flags" ? "flags" : "countries";
  const options = [
    { label: "10", roundCount: 10, displayLabel: "10" },
    { label: "25", roundCount: 25, displayLabel: "25" },
    { label: "50", roundCount: 50, displayLabel: "50" },
    { label: "100", roundCount: 100, displayLabel: "100" },
    { label: "All", roundCount: totalTargets, displayLabel: "all" }
  ];

  dom.modalTitle.textContent = `How many ${targetLabel}?`;
  dom.modalSubtitle.textContent = `Choose the number of ${targetLabel} for this game.`;
  dom.modalOptions.replaceChildren();
  dom.roundCountModal.classList.remove("hidden");

  return new Promise((resolve) => {
    dom.modalCancelButton.onclick = null;

    const close = (selection) => {
      dom.roundCountModal.classList.add("hidden");
      dom.modalOptions.replaceChildren();
      dom.modalCancelButton.onclick = null;
      document.removeEventListener("keydown", keyHandler);
      resolve(selection);
    };

    const keyHandler = (event) => {
      if (event.key === "Escape") {
        close(null);
      }
    };

    document.addEventListener("keydown", keyHandler);
    dom.modalCancelButton.onclick = () => close(null);

    for (const option of options) {
      const button = document.createElement("button");
      button.textContent = option.label;
      button.disabled = option.label !== "All" && option.roundCount > totalTargets;
      button.addEventListener("click", () => close(option), { once: true });
      dom.modalOptions.appendChild(button);
    }
  });
}

async function ensureCountriesLoaded() {
  if (state.countries.length > 0) {
    return;
  }

  if (state.countriesLoadPromise) {
    await state.countriesLoadPromise;
    return;
  }

  state.countriesLoadPromise = (async () => {
    const countriesGeoJson = await fetchJson(assetUrl("assets/countries-lite.geojson"));
    state.countries = normalizeCountries(countriesGeoJson.features ?? [], state.countryMetadata);
    state.countryByKey = new Map(state.countries.map((country) => [country.key, country]));
    renderCountries();
  })();

  try {
    await state.countriesLoadPromise;
  } finally {
    state.countriesLoadPromise = null;
  }
}

function renderGrid() {
  const lines = [];

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    lines.push(makeSvgElement("line", {
      x1: -180,
      y1: -latitude,
      x2: 180,
      y2: -latitude,
      class: "map-grid"
    }));
  }

  for (let longitude = -120; longitude <= 120; longitude += 60) {
    lines.push(makeSvgElement("line", {
      x1: longitude,
      y1: -90,
      x2: longitude,
      y2: 90,
      class: "map-grid"
    }));
  }

  dom.gridLayer.replaceChildren(...lines);
}

function renderLand() {
  state.landPathElements.clear();

  const paths = state.countries.map((country) => {
    const path = makeSvgElement("path", {
        d: country.pathData,
        class: "land-shape",
        "fill-rule": "evenodd"
      });

    state.landPathElements.set(country.key, path);
    return path;
  });

  dom.landLayer.replaceChildren(...paths);
}

function renderCountries() {
  dom.countryPathElements.clear();
  dom.countryBoxElements.clear();

  const countryPaths = state.countries.map((country) => {
    const path = makeSvgElement("path", {
      d: country.pathData,
      class: "country-shape",
      "fill-rule": "evenodd"
    });

    path.dataset.countryKey = country.key;
    dom.countryPathElements.set(country.key, path);
    return path;
  });

  dom.countryLayer.replaceChildren(...countryPaths);

  const islandBoxes = [];
  for (const country of state.countries) {
    const boxes = buildIslandBoxes(country, dom.countryPathElements.get(country.key));
    dom.countryBoxElements.set(country.key, boxes);

    for (const box of boxes) {
      box.dataset.countryKey = country.key;
      islandBoxes.push(box);
    }
  }

  dom.islandBoxLayer.replaceChildren(...islandBoxes);
}

function buildIslandBoxes(country, pathElement) {
  const boxes = [];
  if (!boxedIslandCountries.has(country.name) || !pathElement) {
    return boxes;
  }

  const bounds = pathElement.getBBox();
  if (bounds.width > ISLAND_BOX_THRESHOLD && bounds.height > ISLAND_BOX_THRESHOLD) {
    return boxes;
  }

  const width = Math.max(bounds.width + (ISLAND_BOX_PADDING * 2), ISLAND_BOX_MIN_SIZE);
  const height = Math.max(bounds.height + (ISLAND_BOX_PADDING * 2), ISLAND_BOX_MIN_SIZE);

  boxes.push(makeSvgElement("rect", {
    x: bounds.x + (bounds.width / 2) - (width / 2),
    y: bounds.y + (bounds.height / 2) - (height / 2),
    width,
    height,
    rx: 1.2,
    class: "island-box"
  }));

  return boxes;
}

function updateLayerVisibility() {
  const cityMode = state.mode === "cities";
  const modeSelection = state.mode === "none";
  const countryMode = state.mode === "countries" || state.mode === "capitals" || state.mode === "flags";
  dom.gridLayer.style.display = cityMode ? "" : "none";
  dom.landLayer.style.display = "";
  dom.landLayer.style.opacity = cityMode || modeSelection ? "1" : "0.8";
  dom.countryLayer.style.display = countryMode ? "" : "none";
  dom.islandBoxLayer.style.display = countryMode ? "" : "none";
  dom.cityOverlayLayer.style.display = cityMode ? "" : "none";
}

function clearCountryHighlights() {
  dom.answerLayer.replaceChildren();

  for (const path of state.landPathElements.values()) {
    path.style.removeProperty("fill");
    path.style.removeProperty("stroke");
    path.style.removeProperty("stroke-width");
  }

  for (const path of state.countryPathElements.values()) {
    path.classList.remove("highlight-correct", "highlight-wrong");
    path.style.removeProperty("fill");
    path.style.removeProperty("stroke");
    path.style.removeProperty("stroke-width");
  }

  for (const boxes of state.countryBoxElements.values()) {
    for (const box of boxes) {
      box.classList.remove("highlight-correct", "highlight-wrong");
      box.style.removeProperty("fill");
      box.style.removeProperty("stroke");
      box.style.removeProperty("stroke-width");
    }
  }
}

function highlightCountry(countryKey, highlight) {
  const className = highlight === "correct" ? "highlight-correct" : "highlight-wrong";
  renderAnswerOverlay(countryKey, highlight);

  const landPath = state.landPathElements.get(countryKey);
  if (landPath) {
    applyHighlightStyle(landPath, highlight, false);
  }

  const path = state.countryPathElements.get(countryKey);
  if (path) {
    path.classList.add(className);
    applyHighlightStyle(path, highlight, false);
  }

  for (const box of state.countryBoxElements.get(countryKey) ?? []) {
    box.classList.add(className);
    applyHighlightStyle(box, highlight, true);
  }
}

function applyHighlightStyle(element, highlight, isBox) {
  if (highlight === "correct") {
    element.style.fill = isBox ? "rgba(74, 160, 96, 0.45)" : "rgba(74, 160, 96, 0.88)";
    element.style.stroke = "#2d7a44";
    element.style.strokeWidth = isBox ? "1" : "1.25";
    return;
  }

  element.style.fill = isBox ? "rgba(203, 84, 84, 0.42)" : "rgba(203, 84, 84, 0.82)";
  element.style.stroke = "#9f2f2f";
  element.style.strokeWidth = isBox ? "1" : "1.25";
}

function renderAnswerOverlay(countryKey, highlight) {
  const country = state.countryByKey.get(countryKey);
  if (!country) {
    dom.answerLayer.replaceChildren();
    return;
  }

  const overlayElements = [
    makeSvgElement("path", {
      d: country.pathData,
      class: "answer-highlight",
      "fill-rule": "evenodd"
    })
  ];

  for (const box of state.countryBoxElements.get(countryKey) ?? []) {
    overlayElements.push(makeSvgElement("rect", {
      x: box.getAttribute("x"),
      y: box.getAttribute("y"),
      width: box.getAttribute("width"),
      height: box.getAttribute("height"),
      rx: box.getAttribute("rx"),
      class: "answer-highlight answer-highlight-box"
    }));
  }

  for (const element of overlayElements) {
    applyHighlightStyle(element, highlight, element.classList.contains("answer-highlight-box"));
  }

  dom.answerLayer.replaceChildren(...overlayElements);
}

function clearCityOverlay() {
  dom.cityOverlayLayer.replaceChildren();
}

function drawCityOverlay(guess, actual) {
  dom.cityOverlayLayer.replaceChildren(
    makeSvgElement("line", {
      x1: guess.longitude,
      y1: -guess.latitude,
      x2: actual.longitude,
      y2: -actual.latitude,
      class: "guess-line"
    }),
    makeSvgElement("circle", {
      cx: guess.longitude,
      cy: -guess.latitude,
      r: 1.6,
      class: "guess-marker guess"
    }),
    makeSvgElement("circle", {
      cx: actual.longitude,
      cy: -actual.latitude,
      r: 1.6,
      class: "guess-marker actual"
    })
  );
}

function handleWheel(event) {
  event.preventDefault();
  const nextZoom = clamp(event.deltaY < 0 ? state.zoom * ZOOM_STEP : state.zoom / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
  zoomAtClientPoint(event.clientX, event.clientY, nextZoom);
}

function zoomAtClientPoint(clientX, clientY, nextZoom) {
  const rect = dom.mapSvg.getBoundingClientRect();
  const ratioX = (clientX - rect.left) / rect.width;
  const ratioY = (clientY - rect.top) / rect.height;
  const currentView = getCurrentViewBox();
  const focusX = currentView.x + (currentView.width * ratioX);
  const focusY = currentView.y + (currentView.height * ratioY);

  if (Math.abs(nextZoom - state.zoom) < 0.001) {
    return;
  }

  const nextWidth = 360 / nextZoom;
  const nextHeight = 180 / nextZoom;
  const nextX = focusX - (nextWidth * ratioX);
  const nextY = focusY - (nextHeight * ratioY);

  state.zoom = nextZoom;
  state.centerX = nextX + (nextWidth / 2);
  state.centerY = nextY + (nextHeight / 2);
  clampViewCenter();
  updateViewBox();
}

function panByClientDelta(deltaClientX, deltaClientY) {
  const rect = dom.mapSvg.getBoundingClientRect();
  const view = getCurrentViewBox();
  const deltaX = (deltaClientX / rect.width) * view.width;
  const deltaY = (deltaClientY / rect.height) * view.height;
  state.centerX -= deltaX;
  state.centerY -= deltaY;
  clampViewCenter();
  updateViewBox();
}

function handleMouseDown(event) {
  if (event.button !== 2) {
    return;
  }

  event.preventDefault();
  state.isPanning = true;
  state.panStartClientX = event.clientX;
  state.panStartClientY = event.clientY;
  state.panStartCenterX = state.centerX;
  state.panStartCenterY = state.centerY;
}

function handleMouseMove(event) {
  if (!state.isPanning) {
    return;
  }

  const rect = dom.mapSvg.getBoundingClientRect();
  const view = getCurrentViewBox();
  const deltaX = ((event.clientX - state.panStartClientX) / rect.width) * view.width;
  const deltaY = ((event.clientY - state.panStartClientY) / rect.height) * view.height;
  state.centerX = state.panStartCenterX - deltaX;
  state.centerY = state.panStartCenterY - deltaY;
  clampViewCenter();
  updateViewBox();
}

function handleMouseUp() {
  state.isPanning = false;
}

function handleTouchStart(event) {
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    state.touchMode = "pan";
    state.touchMoved = false;
    state.lastTouchPoint = { clientX: touch.clientX, clientY: touch.clientY };
    state.lastPinchDistance = 0;
    state.lastPinchMidpoint = null;
    return;
  }

  if (event.touches.length >= 2) {
    event.preventDefault();
    const firstTouch = event.touches[0];
    const secondTouch = event.touches[1];
    state.touchMode = "pinch";
    state.touchMoved = true;
    state.lastTouchPoint = null;
    state.lastPinchDistance = getTouchDistance(firstTouch, secondTouch);
    state.lastPinchMidpoint = getTouchMidpoint(firstTouch, secondTouch);
  }
}

function handleTouchMove(event) {
  if (event.touches.length === 1 && state.touchMode === "pan" && state.lastTouchPoint) {
    const touch = event.touches[0];
    const deltaClientX = touch.clientX - state.lastTouchPoint.clientX;
    const deltaClientY = touch.clientY - state.lastTouchPoint.clientY;

    if (Math.abs(deltaClientX) > TOUCH_PAN_THRESHOLD_PX || Math.abs(deltaClientY) > TOUCH_PAN_THRESHOLD_PX || state.touchMoved) {
      event.preventDefault();
      state.touchMoved = true;
      panByClientDelta(deltaClientX, deltaClientY);
    }

    state.lastTouchPoint = { clientX: touch.clientX, clientY: touch.clientY };
    return;
  }

  if (event.touches.length >= 2) {
    event.preventDefault();

    const firstTouch = event.touches[0];
    const secondTouch = event.touches[1];
    const midpoint = getTouchMidpoint(firstTouch, secondTouch);
    const distance = getTouchDistance(firstTouch, secondTouch);

    if (state.touchMode !== "pinch" || !state.lastPinchMidpoint || state.lastPinchDistance <= 0) {
      state.touchMode = "pinch";
      state.touchMoved = true;
      state.lastTouchPoint = null;
      state.lastPinchMidpoint = midpoint;
      state.lastPinchDistance = distance;
      return;
    }

    panByClientDelta(midpoint.clientX - state.lastPinchMidpoint.clientX, midpoint.clientY - state.lastPinchMidpoint.clientY);
    zoomAtClientPoint(midpoint.clientX, midpoint.clientY, clamp(state.zoom * (distance / state.lastPinchDistance), MIN_ZOOM, MAX_ZOOM));

    state.touchMode = "pinch";
    state.touchMoved = true;
    state.lastPinchMidpoint = midpoint;
    state.lastPinchDistance = distance;
  }
}

function handleTouchEnd(event) {
  if (event.touches.length === 0) {
    if (state.touchMode === "pan" && !state.touchMoved && event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      const point = getSvgPointFromClient(touch.clientX, touch.clientY);
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      if (point) {
        state.suppressNextClick = true;
        handleMapSelection(target, point);
      }
    } else if (state.touchMode !== "none") {
      state.suppressNextClick = true;
    }

    resetTouchGesture();
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    state.touchMode = "pan";
    state.lastTouchPoint = { clientX: touch.clientX, clientY: touch.clientY };
    state.lastPinchDistance = 0;
    state.lastPinchMidpoint = null;
    state.touchMoved = true;
    return;
  }

  const firstTouch = event.touches[0];
  const secondTouch = event.touches[1];
  state.touchMode = "pinch";
  state.touchMoved = true;
  state.lastTouchPoint = null;
  state.lastPinchDistance = getTouchDistance(firstTouch, secondTouch);
  state.lastPinchMidpoint = getTouchMidpoint(firstTouch, secondTouch);
}

function handleTouchCancel() {
  resetTouchGesture();
  state.suppressNextClick = true;
}

function resetTouchGesture() {
  state.touchMode = "none";
  state.touchMoved = false;
  state.lastTouchPoint = null;
  state.lastPinchDistance = 0;
  state.lastPinchMidpoint = null;
}

function handleMapClick(event) {
  if (state.suppressNextClick) {
    state.suppressNextClick = false;
    return;
  }

  if (event.button !== 0 || state.isPanning) {
    return;
  }

  const point = getSvgPoint(event);
  if (!point) {
    return;
  }

  handleMapSelection(event.target, point);
}

function handleMapSelection(target, point) {
  if (state.mode === "cities" && state.acceptingInput && state.currentCity) {
    handleCityGuess(point.x, -point.y);
    return;
  }

  if ((state.mode === "countries" || state.mode === "capitals" || state.mode === "flags") && state.acceptingInput && state.currentCountry) {
    const targetElement = target instanceof Element
      ? target.closest("[data-country-key]")
      : null;

    const selectedCountryKey = targetElement?.dataset.countryKey
      ?? findCountryAtPoint(point.x, -point.y);

    if (selectedCountryKey) {
      handleCountryGuess(selectedCountryKey);
    }
  }
}

function resetView() {
  state.zoom = MIN_ZOOM;
  state.centerX = 0;
  state.centerY = 0;
  clampViewCenter();
  updateViewBox();
}

function updateViewBox() {
  const width = 360 / state.zoom;
  const height = 180 / state.zoom;
  dom.mapSvg.setAttribute("viewBox", `${state.centerX - (width / 2)} ${state.centerY - (height / 2)} ${width} ${height}`);
}

function getCurrentViewBox() {
  const width = 360 / state.zoom;
  const height = 180 / state.zoom;
  return {
    x: state.centerX - (width / 2),
    y: state.centerY - (height / 2),
    width,
    height
  };
}

function clampViewCenter() {
  const width = 360 / state.zoom;
  const height = 180 / state.zoom;
  state.centerX = clamp(state.centerX, -180 + (width / 2), 180 - (width / 2));
  state.centerY = clamp(state.centerY, -90 + (height / 2), 90 - (height / 2));
}

function getSvgPoint(event) {
  return getSvgPointFromClient(event.clientX, event.clientY);
}

function getSvgPointFromClient(clientX, clientY) {
  const point = dom.mapSvg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transform = dom.mapSvg.getScreenCTM();
  return transform ? point.matrixTransform(transform.inverse()) : null;
}

function getTouchMidpoint(firstTouch, secondTouch) {
  return {
    clientX: (firstTouch.clientX + secondTouch.clientX) / 2,
    clientY: (firstTouch.clientY + secondTouch.clientY) / 2
  };
}

function getTouchDistance(firstTouch, secondTouch) {
  return Math.hypot(secondTouch.clientX - firstTouch.clientX, secondTouch.clientY - firstTouch.clientY);
}

function normalizeCountries(features, metadataItems) {
  const metadataByCode = buildMetadataMap(metadataItems);
  const countries = [];

  for (const feature of features) {
    const properties = feature.properties ?? {};
    let alpha3 = properties["ISO3166-1-Alpha-3"];
    const name = properties.name;

    if (!name || !alpha3) {
      continue;
    }

    if (alpha3 === "-99" && countryCodeOverrides.has(name)) {
      alpha3 = countryCodeOverrides.get(name);
    }

    if (!standardCountryCodes.has(alpha3)) {
      continue;
    }

    const polygons = geometryToPolygons(feature.geometry);
    if (!polygons.length) {
      continue;
    }

    const metadata = metadataByCode.get(alpha3) ?? null;
    const alpha2 = metadata?.alpha2 ?? (alpha3 === "UNK" ? "XK" : null);
    const capital = metadata?.capital ?? (alpha3 === "UNK" ? "Pristina" : null);
    const flagEmoji = metadata?.flagEmoji ?? (alpha3 === "UNK" ? "🇽🇰" : null);

    countries.push({
      key: alpha3,
      name,
      alpha3,
      alpha2,
      capital,
      flagEmoji,
      polygons,
      pathData: polygonsToPathData(polygons)
    });
  }

  return countries.sort((left, right) => left.name.localeCompare(right.name));
}

function buildMetadataMap(items) {
  const metadata = new Map();

  for (const item of items) {
    if (!item.cca3 || !item.cca2) {
      continue;
    }

    metadata.set(item.cca3, {
      alpha2: item.cca2,
      capital: Array.isArray(item.capital) && item.capital.length > 0 ? item.capital[0] : null,
      flagEmoji: item.flag ?? null
    });
  }

  return metadata;
}

function geometryToPolygons(geometry) {
  if (!geometry?.type || !geometry.coordinates) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return [{ rings: geometry.coordinates }];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((rings) => ({ rings }));
  }

  return [];
}

function geometryToPathData(geometry) {
  return polygonsToPathData(geometryToPolygons(geometry));
}

function polygonsToPathData(polygons) {
  const segments = [];

  for (const polygon of polygons) {
    for (const ring of polygon.rings) {
      if (!Array.isArray(ring) || ring.length < 3) {
        continue;
      }

      const commands = ring.map(([longitude, latitude], index) => `${index === 0 ? "M" : "L"}${longitude},${-latitude}`);
      commands.push("Z");
      segments.push(commands.join(" "));
    }
  }

  return segments.join(" ");
}

function findCountryAtPoint(longitude, latitude) {
  for (const country of state.countries) {
    if (countryContainsPoint(country, longitude, latitude)) {
      return country.key;
    }
  }

  return null;
}

function countryContainsPoint(country, longitude, latitude) {
  for (const polygon of country.polygons) {
    const [outerRing, ...holes] = polygon.rings;
    if (!Array.isArray(outerRing) || outerRing.length < 3) {
      continue;
    }

    if (!pointInRing(longitude, latitude, outerRing)) {
      continue;
    }

    const insideHole = holes.some((hole) => pointInRing(longitude, latitude, hole));
    if (!insideHole) {
      return true;
    }
  }

  return false;
}

function pointInRing(longitude, latitude, ring) {
  let inside = false;

  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index, index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[previousIndex];
    const intersects = ((y1 > latitude) !== (y2 > latitude))
      && (longitude < (((x2 - x1) * (latitude - y1)) / ((y2 - y1) || Number.EPSILON)) + x1);

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function haversineDistanceKm(start, end) {
  const dLat = toRadians(end.latitude - start.latitude);
  const dLon = toRadians(end.longitude - start.longitude);
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);
  const a = (Math.sin(dLat / 2) ** 2) + (Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dLon / 2) ** 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function calculateGeoGuessrScore(distanceKm) {
  if (distanceKm <= 0.025) {
    return 5000;
  }

  const score = 5000 * Math.exp((-SCORE_DECAY_FACTOR * distanceKm) / WORLD_MAP_SCORING_SIZE_KM);
  return clamp(Math.round(score), 0, 5000);
}

function shuffle(items) {
  const next = items.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function toRadians(value) {
  return value * Math.PI / 180;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json();
}

function makeSvgElement(tagName, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}
