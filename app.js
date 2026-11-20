const API_URL = "https://pokeapi.co/api/v2/pokemon";
const MAX_POKEMON_ID = 1025;

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#pokemon-search");
const randomButton = document.querySelector("#random-button");
const statusMessage = document.querySelector("#status-message");
const pokemonCard = document.querySelector("#pokemon-card");
const pokemonImage = document.querySelector("#pokemon-image");
const pokemonNumber = document.querySelector("#pokemon-number");
const pokemonName = document.querySelector("#pokemon-name");
const pokemonTypes = document.querySelector("#pokemon-types");
const pokemonHeight = document.querySelector("#pokemon-height");
const pokemonWeight = document.querySelector("#pokemon-weight");
const pokemonStats = document.querySelector("#pokemon-stats");

const typeColors = {
  bug: "#7b9b42",
  dark: "#5b5364",
  dragon: "#7761b5",
  electric: "#c28b17",
  fairy: "#c46b91",
  fighting: "#b65c45",
  fire: "#cc6841",
  flying: "#7387bb",
  ghost: "#716594",
  grass: "#5c9666",
  ground: "#ab8752",
  ice: "#5b9c9b",
  normal: "#8b887c",
  poison: "#98629e",
  psychic: "#c45e76",
  rock: "#948144",
  steel: "#71858c",
  water: "#5686bd",
};

function setLoading(isLoading, message = "") {
  statusMessage.hidden = !isLoading;
  statusMessage.textContent = message;
  pokemonCard.hidden = isLoading;
  searchInput.disabled = isLoading;
  randomButton.disabled = isLoading;
}

function formatName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatHeight(heightDecimeters) {
  const meters = heightDecimeters / 10;
  let totalInches = Math.round(meters * 39.37007874);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return `${meters.toFixed(1)} m (${feet} ft ${inches} in)`;
}

function formatWeight(weightHectograms) {
  const kilograms = weightHectograms / 10;
  const pounds = kilograms * 2.2046226218;

  return `${kilograms.toFixed(1)} kg (${pounds.toFixed(1)} lb)`;
}

function renderPokemon(pokemon) {
  const image =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default;

  if (image) {
    pokemonImage.src = image;
  } else {
    pokemonImage.removeAttribute("src");
  }
  pokemonImage.alt = image
    ? `Illustration of ${formatName(pokemon.name)}`
    : `No illustration available for ${formatName(pokemon.name)}`;
  pokemonNumber.textContent = `NO. ${String(pokemon.id).padStart(3, "0")}`;
  pokemonName.textContent = formatName(pokemon.name);
  pokemonHeight.textContent = formatHeight(pokemon.height);
  pokemonWeight.textContent = formatWeight(pokemon.weight);

  pokemonTypes.replaceChildren(
    ...pokemon.types.map(({ type }) => {
      const badge = document.createElement("span");
      badge.className = "type-badge";
      badge.textContent = type.name;
      badge.style.setProperty("--type-color", typeColors[type.name] ?? "#66716c");
      return badge;
    }),
  );

  pokemonStats.replaceChildren(
    ...pokemon.stats.map(({ base_stat: value, stat }) => {
      const item = document.createElement("li");
      item.className = "stat-row";

      const label = document.createElement("span");
      label.className = "stat-name";
      label.textContent = formatName(stat.name);

      const track = document.createElement("span");
      track.className = "stat-track";
      track.setAttribute("aria-hidden", "true");

      const bar = document.createElement("span");
      bar.className = "stat-bar";
      bar.style.setProperty("--stat-width", `${Math.min((value / 255) * 100, 100)}%`);
      track.append(bar);

      const score = document.createElement("span");
      score.className = "stat-score";
      score.textContent = value;
      score.setAttribute("aria-label", `${stat.name}: ${value}`);

      item.append(label, track, score);
      return item;
    }),
  );

  statusMessage.hidden = true;
  pokemonCard.hidden = false;
}

async function findPokemon(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    searchInput.focus();
    return;
  }

  setLoading(true, "Looking through the field guide…");

  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(normalizedQuery)}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No Pokémon found for “${query.trim()}”. Try a name or Pokédex number.`);
      }
      throw new Error("The field guide couldn’t be reached. Please try again.");
    }

    const pokemon = await response.json();
    renderPokemon(pokemon);
  } catch (error) {
    statusMessage.textContent =
      error instanceof TypeError
        ? "Couldn’t connect to the field guide. Check your connection and try again."
        : error.message;
    statusMessage.hidden = false;
    pokemonCard.hidden = true;
  } finally {
    searchInput.disabled = false;
    randomButton.disabled = false;
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  findPokemon(searchInput.value);
});

randomButton.addEventListener("click", () => {
  const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  searchInput.value = "";
  findPokemon(String(randomId));
});

findPokemon("25");
