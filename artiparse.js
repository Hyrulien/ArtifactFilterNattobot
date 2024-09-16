// ==UserScript==
// @name         Inventory Filter Injector
// @namespace    http://tampermonkey.net/
// @version      1.0.1
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
      width: 200px; /* Revert to old size */
      padding: 10px;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      z-index: 1000;
      cursor: move; /* Cursor to indicate draggable */
      transform: translate(0, 0); /* Start with no translation */
      user-select: none; /* Prevent text selection while dragging */
    }
    #filter-panel .close-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ff0000;
      color: #fff;
      border: none;
      padding: 5px;
      cursor: pointer;
      z-index: 1001; /* Ensure it is above other elements */
    }
    #filter-panel input, #filter-panel select {
      display: block;
      margin-bottom: 5px;
    }
    #filter-panel select {
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  // Create the UI panel
  const panel = document.createElement('div');
  panel.id = 'filter-panel';
  panel.innerHTML = `
    <button class="close-btn">X</button>
    <h3>Filter Artifacts</h3>
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
      <option value="hp">HP</option>
      <option value="crit">CritChance</option>
      <option value="acc">Accuracy</option>
      <option value="critdmg">CritDamage</option>
      <option value="spd">Speed</option>
      <option value="heal">HealingPerRound</option>
      <option value="dmgrange">DamageRange</option>
      <option value="dbl">DoubleDamageChance</option>
      <option value="addchance">AdditionalRoundChance</option>
      <option value="atkp">Attack_Percent</option>
      <option value="hpp">HP_Percent</option>
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
      <option value="hp">HP</option>
      <option value="crit">CritChance</option>
      <option value="acc">Accuracy</option>
      <option value="critdmg">CritDamage</option>
      <option value="spd">Speed</option>
      <option value="heal">HealingPerRound</option>
      <option value="dmgrange">DamageRange</option>
      <option value="dbl">DoubleDamageChance</option>
      <option value="addchance">AdditionalRoundChance</option>
      <option value="atkp">Attack_Percent</option>
      <option value="hpp">HP_Percent</option>
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
    6: 'br',              // Bracelet
    7: 'ri',              // Ring
    8: 'ea'               // Earrings
  };

  // Filter items based on user input
  function filterItems({
    slot = null,
    mainStatType = null,
    substats = []
  } = {}) {
    // Convert custom names to actual values
    slot = Object.keys(slotMappings).find(key => slotMappings[key] === slot) || slot;
    slot = bindings[slot] || slot;

    mainStatType = bindings[mainStatType] || mainStatType;
    substats = substats.map(stat => bindings[stat] || stat);

    // Select all item elements within the inventory
    var items = document.querySelectorAll('.inventory .item');

    // Loop through each item and toggle visibility based on the data attributes
    items.forEach(function(item) {
      var jsonData = JSON.parse(item.getAttribute('data-json'));

      var itemSlot = jsonData.Slot;
      var itemMainStatType = jsonData.MainStatType;
      var itemSubStats = jsonData.SubStats;

      var matchesSlot = slot === null || itemSlot == slot;
      var matchesMainStatType = mainStatType === null || itemMainStatType == mainStatType;

      // Ensure that all selected substats are present in the item's substats
      var matchesSubstats = substats.length === 0 || substats.every(substat => itemSubStats.includes(substat));

      if (matchesSlot && matchesMainStatType && matchesSubstats) {
        item.style.display = 'block'; // Show the item
      } else {
        item.style.display = 'none';  // Hide the item
      }
    });
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

    filterItems({
      slot: slot || null,
      mainStatType: mainStatType || null,
      substats
    });
  });

  // Handle filter reset
  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('slot').value = '';
    document.getElementById('mainStatType').value = '';
    document.getElementById('substats').selectedIndex = -1;
    filterItems(); // Reset filters
  });

  // Make the filter panel draggable
  const panelElement = document.getElementById('filter-panel');

  let isDragging = false;
  let startX, startY, startLeft, startTop;

  panelElement.addEventListener('mousedown', (e) => {
    if (e.target !== panelElement) return; 
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
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  // Handle close button click
  panelElement.querySelector('.close-btn').addEventListener('click', () => {
    document.body.removeChild(panelElement);
  });
  // Load the UI and make it draggable if URL contains #artifacts
  function loadUI() {
    if (checkURL()) {
      document.getElementById('filter-panel').style.display = '';
      makeDraggable(document.getElementById('filter-panel'));
    } else {
      document.getElementById('filter-panel').style.display = 'none';
    }
  }

  // Load UI on initial load
  loadUI();

  // Reload UI when hash changes
  window.addEventListener('hashchange', loadUI);
})();
