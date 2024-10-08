// ==UserScript==
// @name         Inventory Filter Injector
// @namespace    http://tampermonkey.net/
// @version      1.0.8
// @description  Injects a custom filter UI into the inventory page on Nattobot
// @author       Hyrulien
// @match        https://nattobot.com/inventory/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Hyrulien/ArtifactFilterNattobot/main/artiparse.js
// @downloadURL  https://raw.githubusercontent.com/Hyrulien/ArtifactFilterNattobot/main/artiparse.js
// ==/UserScript==

(function() {

  function checkURL() {
    return window.location.hash === '#artifacts';
  }

  // Create a style element to style the UI
  const style = document.createElement('style');
style.textContent = `
  #filter-panel {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 250px;
    padding: 15px;
    background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%);
    border-radius: 8px;
    border: 1px solid #b0bec5;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    cursor: move;
    transform: translate(0, 0);
    font-family: 'Arial', sans-serif;
    user-select: none;
    transition: box-shadow 0.3s ease-in-out;
  }
  #filter-panel:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
  #filter-panel .close-btn,
  #filter-panel .pin-btn {
    position: absolute;
    top: 10px;
    width: 25px;
    height: 25px;
    font-size: 14px;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  #filter-panel .close-btn {
    right: 10px;
    background-color: #e74c3c;
  }
  #filter-panel .close-btn:hover {
    background-color: #c0392b;
  }
  #filter-panel .pin-btn {
    right: 50px;
    background-color: #2ecc71;
  }
  #filter-panel .pin-btn:hover {
    background-color: #27ae60;
  }
  #filter-panel h3 {
    margin-bottom: 10px;
    color: #37474f;
    font-size: 18px;
    text-align: center;
  }
  #filter-panel label {
    display: block;
    font-size: 14px;
    margin-bottom: 4px;
    color: #546e7a;
  }
  #filter-panel select,
  #filter-panel button {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 4px;
    border: 1px solid #b0bec5;
    background: #f5f5f5;
    color: #37474f;
    transition: border-color 0.2s, background-color 0.2s;
  }
  #filter-panel select:focus,
  #filter-panel button:focus {
    border-color: #1e88e5;
    outline: none;
  }
  #apply-filters, #reset-filters {
    background-color: #f5f5f5;
    color: #37474f;
    font-weight: bold;
    border: none;
    cursor: pointer;
  }
  #apply-filters:hover {
    background-color: #007bff;
    color: white;
  }
  #reset-filters:hover {
    background-color: #ff6b6b;
    color: white;
  }
`;
document.head.appendChild(style);


  // Create the UI panel
  const panel = document.createElement('div');
  panel.id = 'filter-panel';
  panel.innerHTML = `
    <button class="close-btn">X</button>
    <button class="pin-btn">Pin</button>
    <div id="artifact-counter" style="margin-top: 10px; font-size: 14px;">0/200</div>
    <h3>Filter Artifacts</h3>
    <label for="setType">Set Type:</label>
    <select id="setType">
      <option value="">Any</option>
      <option value="power">Power Set</option>
      <option value="blacklion">Black Lion Set</option>
      <option value="holy">Holy Set</option>
    </select>
    <label for="level">Level:</label>
    <select id="level">
      <option value="">Any</option>
      <option value="below50">Below Lvl 50</option>
      <option value="above50">Above Lvl 50</option>
    </select>
    <label for="slot">Slot:</label>
    <select id="slot">
      <option value="">Any</option>
      <option value="he">Helmet</option>
      <option value="ch">Chest Plate</option>
      <option value="gl">Gloves</option>
      <option value="bo">Boots</option>
      <option value="ne">Necklace</option>
      <option value="br">Bracelet</option>
      <option value="ri">Ring</option>
      <option value="ea">Earrings</option>
    </select>
    <label for="mainStatType">Main Stat Type:</label>
    <select id="mainStatType">
      <option value="">Any</option>
      <option value="atk">Attack</option>
      <option value="atkp">Attack_Percent</option>
      <option value="hp">HP</option>
      <option value="hpp">HP_Percent</option>
      <option value="dbl">DoubleDamageChance</option>
      <option value="addchance">AdditionalRoundChance</option>
      <option value="crit">CritChance</option>
      <option value="critdmg">CritDamage</option>
      <option value="acc">Accuracy</option>
      <option value="spd">Speed</option>
      <option value="heal">HealingPerRound</option>
      <option value="dmgrange">DamageRange</option>
      <option value="eva">Evasion</option>
      <option value="dmgred">DamageReduction</option>
      <option value="defpen">DefencePenetration</option>
      <option value="light">LightDamage</option>
      <option value="dark">DarkDamage</option>
      <option value="fire">FireDamage</option>
      <option value="water">WaterDamage</option>
      <option value="wind">WindDamage</option>
      <option value="lightning">LightningDamage</option>
      <option value="earth">EarthDamage</option>
      <option value="totaldmg">TotalDamage</option>
      <option value="energy">EnergyDamage</option>
    </select>
    <label for="substats">Substats:</label>
    <select id="substats" multiple size="10">
      <option value="atk">Attack</option>
      <option value="atkp">Attack%</option>
      <option value="hp">HP</option>
      <option value="hpp">HP%</option>
      <option value="dbl">DoubleDamage%</option>
      <option value="addchance">AdditionalRoundChance</option>
      <option value="crit">CritChance</option>
      <option value="critdmg">CritDamage</option>
      <option value="acc">Accuracy</option>
      <option value="spd">Speed</option>
      <option value="heal">HealingPerRound</option>
      <option value="dmgrange">DamageRange</option>
      <option value="eva">Evasion</option>
      <option value="dmgred">DamageReduction</option>
      <option value="defpen">DefencePenetration</option>
      <option value="light">LightDamage</option>
      <option value="dark">DarkDamage</option>
      <option value="fire">FireDamage</option>
      <option value="water">WaterDamage</option>
      <option value="wind">WindDamage</option>
      <option value="lightning">LightningDamage</option>
      <option value="earth">EarthDamage</option>
      <option value="totaldmg">TotalDamage</option>
      <option value="energy">EnergyDamage</option>
    </select>
    <button id="apply-filters">Apply Filters</button>
    <button id="reset-filters">Reset Filters</button>
  `;
  document.body.appendChild(panel);

  // Define custom bindings for slots, main stat types, and substats
  const bindings = {
    atk: 1,                // Attack
    hp: 2,                 // HP
    crit: 4,               // CritChance
    acc: 8,                // Accuracy
    critdmg: 16,           // CritDamage
    spd: 32,               // Speed
    heal: 64,              // HealingPerRound
    dmgrange: 128,         // DamageRange
    dbl: 256,              // DoubleDamageChance
    addchance: 512,        // AdditionalRoundChance
    atkp: 1024,            // Attack_Percent
    hpp: 2048,             // HP_Percent
    eva: 4096,             // Evasion
    dmgred: 8192,          // DamageReduction
    defpen: 16384,         // DefencePenetration
    light: 32768,          // LightDamage
    dark: 65536,           // DarkDamage
    fire: 131072,          // FireDamage
    water: 262144,         // WaterDamage
    wind: 524288,          // WindDamage
    lightning: 1048576,    // LightningDamage
    earth: 2097152,        // EarthDamage
    totaldmg: 4194304,     // TotalDamage
    energy: 8388608        // EnergyDamage
  };

  // Define slot mappings
  const slotMappings = {
    1: 'he',              // Helmet
    2: 'ch',              // Chest Plate
    3: 'gl',              // Gloves
    4: 'bo',              // Boots
    5: 'ne',              // Necklace
     6: 'br',             // Bracelet
    7: 'ri',              // Ring
    8: 'ea'               // Earrings
  };

  // Define set mappings for ArtifactID
  const setMappings = {
    power: [17, 18, 19, 20, 21, 22, 23, 24],
    blacklion: [1, 2, 3, 4, 5, 6, 7, 8],
    holy: [9, 10, 11, 12, 13, 14, 15, 16]
  };
// Artifact counting function
function getArtifactCount() {
    // Select all artifacts from the inventory
    const artifacts = document.querySelectorAll('.inventory .item');
    return artifacts; // Return the NodeList for further processing
}

// Update the artifact count in the UI
function updateArtifactCount() {
    const artifacts = getArtifactCount(); // Get all artifacts
    const maxArtifacts = 250;
    const counterElement = document.getElementById('artifact-counter');
    counterElement.textContent = `${artifacts.length}/${maxArtifacts}`; // Show total count
}

// Update artifact count when filters are applied
const updateArtifactCountOnFilter = () => {
    const artifacts = getArtifactCount(); // Get all artifacts
    const maxArtifacts = 250;

    // Filter artifacts that are currently displayed
    const visibleArtifacts = Array.from(artifacts).filter(artifact => {
        return window.getComputedStyle(artifact).display === 'block';
    });

    // Update the UI with the count of visible artifacts
    document.getElementById('artifact-counter').textContent = `${visibleArtifacts.length}/${maxArtifacts}`;
};

// Initialize the artifact counter when the page is loaded
window.addEventListener('load', updateArtifactCount);


// Filter items based on user input
function filterItems({
    slot = null,
    mainStatType = null,
    substats = [],
    setType = null,
    level = null
} = {}) {
    // Convert custom names to actual values
    slot = Object.keys(slotMappings).find(key => slotMappings[key] === slot) || slot;
    slot = bindings[slot] || slot;

    mainStatType = bindings[mainStatType] || mainStatType;
    substats = substats.map(stat => bindings[stat] || stat);

    const setArtifactIDs = setType ? setMappings[setType] : null;

    // Select all item elements within the inventory
    var items = document.querySelectorAll('.inventory .item');

    // Loop through each item and toggle visibility based on the data attributes
    items.forEach(function(item) {
        var jsonData = JSON.parse(item.getAttribute('data-json'));

        var itemSlot = jsonData.Slot;
        var itemMainStatType = jsonData.MainStatType;
        var itemSubStats = jsonData.SubStats;
        var itemArtifactID = jsonData.ArtifactID;
        var itemLevel = jsonData.Level; // Assuming the level is included in the data-json

        var matchesSlot = slot === null || itemSlot == slot;
        var matchesMainStatType = mainStatType === null || itemMainStatType == mainStatType;

        // Ensure that all selected substats are present in the item's substats
        var matchesSubstats = substats.length === 0 || substats.every(substat => itemSubStats.includes(substat));

        // Check if the item matches the selected set's ArtifactID
        var matchesSet = setArtifactIDs === null || setArtifactIDs.includes(itemArtifactID);

        // Check level filter
        var matchesLevel = true;
        if (level === 'below50') {
            matchesLevel = itemLevel <= 50;
        } else if (level === 'above50') {
            matchesLevel = itemLevel > 50;
        }

        if (matchesSlot && matchesMainStatType && matchesSubstats && matchesSet && matchesLevel) {
            item.style.display = 'block'; // Show the item
        } else {
            item.style.display = 'none';  // Hide the item
        }
    });

    // Update the artifact count after filtering
    updateArtifactCountOnFilter();
}
  // Handle max 4 substats
  document.getElementById('substats').addEventListener('change', (e) => {
    const options = e.target.options;
    let selectedCount = 0;
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCount++;
      }
    }
    if (selectedCount > 4) {
      e.target.value = [...e.target.options].filter(opt => opt.selected).slice(0, 4).map(opt => opt.value);
    }
  });

  // Handle filter application
  document.getElementById('apply-filters').addEventListener('click', () => {
    const slot = document.getElementById('slot').value;
    const mainStatType = document.getElementById('mainStatType').value;
    const substats = Array.from(document.getElementById('substats').selectedOptions).map(option => option.value);
    const setType = document.getElementById('setType').value;
    const level = document.getElementById('level').value;

    filterItems({
      slot: slot || null,
      mainStatType: mainStatType || null,
      substats,
      setType: setType || null,
      level: level || null
    });
      updateArtifactCountOnFilter();
  });

  // Handle filter reset
  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('slot').value = '';
    document.getElementById('mainStatType').value = '';
    document.getElementById('substats').selectedIndex = -1;
    document.getElementById('setType').value = '';
    filterItems(); // Reset filters
  });

  // Handle pin/unpin functionality
  let isPinned = localStorage.getItem('filterPanelPinned') === 'true';

  function updatePinButton() {
    document.querySelector('#filter-panel .pin-btn').textContent = isPinned ? 'Pin' : 'Pin';
  }

  function savePanelPosition() {
    const panelElement = document.getElementById('filter-panel');
    localStorage.setItem('filterPanelLeft', panelElement.style.left);
    localStorage.setItem('filterPanelTop', panelElement.style.top);
  }

  function restorePanelPosition() {
    const panelElement = document.getElementById('filter-panel');
    const savedLeft = localStorage.getItem('filterPanelLeft');
    const savedTop = localStorage.getItem('filterPanelTop');
    if (savedLeft && savedTop) {
      panelElement.style.left = savedLeft;
      panelElement.style.top = savedTop;
    }
  }

  // Make the filter panel draggable
  const panelElement = document.getElementById('filter-panel');

  let isDragging = false;
  let startX, startY, startLeft, startTop;

  panelElement.addEventListener('mousedown', (e) => {
    if (e.target !== panelElement || isPinned) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(window.getComputedStyle(panelElement).left, 10);
    startTop = parseInt(window.getComputedStyle(panelElement).top, 10);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panelElement.style.left = `${startLeft + dx}px`;
    panelElement.style.top = `${startTop + dy}px`;
  }

  function onMouseUp() {
    if (!isPinned) savePanelPosition();
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  // Handle close button click
  panelElement.querySelector('.close-btn').addEventListener('click', () => {
    document.body.removeChild(panelElement);
    localStorage.removeItem('filterPanelLeft');
    localStorage.removeItem('filterPanelTop');
  });

  // Handle pin/unpin button click
  document.querySelector('#filter-panel .pin-btn').addEventListener('click', () => {
    isPinned = !isPinned;
    localStorage.setItem('filterPanelPinned', isPinned);
    updatePinButton();
  });

  // Initialize pin button text
  updatePinButton();

  // Load the UI and make it draggable
  function loadUI() {
    if (checkURL()) {
      document.getElementById('filter-panel').style.display = '';
      restorePanelPosition();
    } else {
      document.getElementById('filter-panel').style.display = 'none';
    }
  }

  // Load UI on initial load
  loadUI();

  // Reload UI when hash changes
  window.addEventListener('hashchange', loadUI);
})();
