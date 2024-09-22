// ==UserScript==
// @name         Skin Changer
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Injects a custom skinchanger UI into the currencies & plushie pages on Nattobot
// @author       Hyrulien
// @match        https://nattobot.com/inventory/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Hyrulien/ArtifactFilterNattobot/main/skinchanger.js
// @downloadURL  https://raw.githubusercontent.com/Hyrulien/ArtifactFilterNattobot/main/skinchanger.js
// ==/UserScript==

(function() {
    const style = document.createElement('style');
    style.textContent = `
      #skinchanger-panel {
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
        font-family: 'Arial', sans-serif;
        transition: box-shadow 0.3s ease-in-out;
      }
      #skinchanger-panel:hover {
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
      }
      #skinchanger-panel .header {
        cursor: move;
        user-select: none;
      }
      #skinchanger-panel .close-btn {
        display: flex;
        position: absolute;
        justify-content: center;
        align-items: center;
        top: 10px;
        right: 10px;
        width: 25px;
        height: 25px;
        font-size: 14px;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        background-color: #e74c3c;
        transition: background-color 0.2s;
      }
      #skinchanger-panel .close-btn:hover {
        background-color: #c0392b;
      }
      #skinchanger-panel .expand-btn {
        display: flex;
        position: absolute;
        justify-content: center;
        align-items: center;
        top: 10px;
        right: 50px;
        width: 25px;
        height: 25px;
        font-size: 14px;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        background-color: #3498db;
        transition: background-color 0.2s;
      }
      #skinchanger-panel .expand-btn:hover {
        background-color: #2980b9;
      }
      #skinchanger-panel h3 {
        margin-bottom: 10px;
        color: #37474f;
        font-size: 18px;
        text-align: center;
      }
      #skinchanger-panel label {
        display: block;
        font-size: 14px;
        margin-bottom: 4px;
        color: #546e7a;
      }
      #skinchanger-panel input[type="text"],
      #skinchanger-panel button {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border-radius: 4px;
        border: 1px solid #b0bec5;
        background: #f5f5f5;
        color: #37474f;
        transition: border-color 0.2s, background-color 0.2s;
        box-sizing: border-box;
      }
      #skinchanger-panel input:focus,
      #skinchanger-panel button:focus {
        border-color: #1e88e5;
        outline: none;
      }
      #apply-skin, #reset-skin, #showSkinsButton {
        background-color: #f5f5f5;
        color: #37474f;
        font-weight: bold;
        border: none;
        cursor: pointer;
      }
      #apply-skin:hover {
        background-color: #007bff;
        color: white;
      }
      #reset-skin:hover {
        background-color: #ff6b6b;
        color: white;
      }
      #showSkinsButton:hover {
        background-color: #ff6b6b;
        color: white;
      }
      .advanced-options {
        display: none; /* Initially hide advanced options */
        margin-top: 10px;
      }
.modal {
    display: none;
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    user-select: text; /* Allow text selection */
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover, .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
}
.modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

#skinDetails {
    white-space: pre-wrap;
    word-wrap: break-word;
    user-select: text; /* Allow text selection */
    cursor: text; /* Change cursor to text selection */
}



    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'skinchanger-panel';
    panel.innerHTML = `
      <div class="header">
        <button class="expand-btn">+</button>
        <button class="close-btn">✖</button>
        <h3>Skinchanger</h3>
      </div>
<div id="myModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <pre id="skinDetails"></pre> <!-- Use <pre> for better formatting -->
    </div>
</div>


      <label for="currency-name">Item Name</label>
      <input type="text" id="currency-name" placeholder="e.g Black Cat Plush">
      <label for="border-url">Border URL (PNG/MP4)</label>
      <input type="text" id="border-url" placeholder="Enter border URL">
      <label for="background-url">Background URL (PNG/MP4)</label>
      <input type="text" id="background-url" placeholder="Enter background URL">
      <div class="advanced-options">
        <label for="currency-namechange">Change Item Name</label>
        <input type="text" id="currency-namechange" placeholder="Enter New Item Name">
        <label for="currency-image">Change Item Image</label>
        <input type="text" id="currency-image" placeholder="Enter New image URL">
        <label for="currency-description">Change Item Description</label>
        <input type="text" id="currency-description" placeholder="Enter New Item description">
        <label for="text-color">Text Color (Hex)</label>
        <input type="text" id="text-color" placeholder="e.g. #ff5733">
      </div>
      <button id="apply-skin">Apply Skin</button>
      <button id="reset-skin">Reset</button>
      <button id="showSkinsButton">Show Applied Skins</button>
    `;
    document.body.appendChild(panel);

const checkURL = () => {
    return window.location.hash === '#currencies' || window.location.hash === '#plushies';
};

const togglePanelVisibility = () => {
    panel.style.display = checkURL() ? 'block' : 'none';
};

// Keypress functionality to hide/unhide the panel
document.addEventListener('keypress', (e) => {
    if (e.key === '§') { // Change '§' to whatever key you want to use
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }
});

togglePanelVisibility();

const loadSavedSettings = () => {
    const position = JSON.parse(localStorage.getItem('skinchangerPosition'));
    if (position) {
        panel.style.top = position.top || '10px';
        panel.style.left = position.left || '10px';
    }

    const appliedSkins = JSON.parse(localStorage.getItem('appliedSkins')) || {};
    const currencyElements = document.querySelectorAll('.card_currency');

    for (const key in appliedSkins) {
        const [baseName, identifier] = key.split('#');
        const currencyElement = Array.from(currencyElements).find(card => {
            const img = card.querySelector('img');
            return img && img.alt.includes(baseName.trim()) && (identifier ? img.alt.includes(identifier) : true);
        });

        if (currencyElement) {
            const { borderUrl, backgroundUrl, currencyNameChange, currencyImage, currencyDescription, textColor } = appliedSkins[key];

            // Apply the loaded settings to the currencyElement
            if (borderUrl) {
                currencyElement.style.backgroundImage = `url(${borderUrl})`;
            }
            if (backgroundUrl) {
                const videoElem = document.createElement('video');
                videoElem.src = backgroundUrl;
                videoElem.autoplay = true;
                videoElem.muted = true;
                videoElem.loop = true;
                videoElem.style.position = 'absolute';
                videoElem.style.right = '6px';
                videoElem.style.bottom = '4px';
                videoElem.style.width = 'calc(100% - 10px)';
                videoElem.style.height = 'calc(100% - 7px)';
                videoElem.style.zIndex = '-1';
                videoElem.style.objectFit = 'fill';
                videoElem.style.objectPosition = 'center';
                currencyElement.prepend(videoElem);
            }
            if (currencyNameChange) {
                const nameElement = currencyElement.querySelector('h4');
                if (nameElement) nameElement.textContent = currencyNameChange;
            }
if (currencyImage) {
    const imgElement = currencyElement.querySelector('img');
    if (imgElement) {
        imgElement.src = currencyImage;
        imgElement.setAttribute('data-src', currencyImage);
    }
}

            if (currencyDescription) {
                const descriptionElement = currencyElement.querySelector('p');
                if (descriptionElement) descriptionElement.textContent = currencyDescription;
            }
            if (textColor) {
                const h4Element = currencyElement.querySelector('h4');
                const pElement = currencyElement.querySelector('p');
                if (h4Element) h4Element.style.color = textColor;
                if (pElement) pElement.style.color = textColor;
        }
      }
    }
};

    loadSavedSettings();

    const savePosition = () => {
        const position = {
            top: panel.style.top,
            left: panel.style.left
        };
        localStorage.setItem('skinchangerPosition', JSON.stringify(position));
    };

    const dragElement = (element, handle) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const dragMouseDown = (e) => {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };
        const elementDrag = (e) => {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        };
        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
            savePosition();
        };
        handle.onmousedown = dragMouseDown;
    };

    dragElement(panel, panel.querySelector('.header'));

    document.querySelector('.close-btn').onclick = () => {
        panel.style.display = 'none';
    };

    document.querySelector('.expand-btn').onclick = () => {
        const advancedOptions = panel.querySelector('.advanced-options');
        advancedOptions.style.display = advancedOptions.style.display === 'block' ? 'none' : 'block';
    };

const applySkin = () => {
    const currencyName = document.getElementById('currency-name').value.trim();
    const currencyNumber = currencyName.match(/\d+/);
    const baseName = currencyName.replace(/\d+$/, '').trim();
    const borderUrl = document.getElementById('border-url').value;
    const backgroundUrl = document.getElementById('background-url').value;
    const currencyNameChange = document.getElementById('currency-namechange').value;
    const currencyImage = document.getElementById('currency-image').value;
    const currencyDescription = document.getElementById('currency-description').value;
    const textColor = document.getElementById('text-color').value;

    const appliedSkins = JSON.parse(localStorage.getItem('appliedSkins')) || {};
    const currency = currencyName.trim();
    if (!currency) return;

    const isPlushiesActive = window.location.hash === '#plushies';
    const currencyElements = document.querySelectorAll('.card_currency');

    const applicableElements = Array.from(currencyElements).filter(card => {
        const img = card.querySelector('img');
        const isCorrectPage = isPlushiesActive ? card.closest('#plushies') : card.closest('#currencies');
        const normalizedAlt = img.alt.replace(/\s+/g, '');
        const normalizedInput = baseName.replace(/\s+/g, '');

        return img && normalizedAlt.includes(normalizedInput) && isCorrectPage; // Partial match
    });

    let currencyElement = null;

    if (currencyNumber && applicableElements.length > 0) {
        const index = parseInt(currencyNumber[0], 10) - 1;
        if (index >= 0 && index < applicableElements.length) {
            currencyElement = applicableElements[index];
        }
    } else {
        currencyElement = applicableElements[0];
    }

    if (currencyElement) {
        // Save the skin with both base name and identifier
        const saveKey = `${baseName}#${currencyNumber ? currencyNumber[0] : ''}`;
        appliedSkins[saveKey] = {
            borderUrl,
            backgroundUrl,
            currencyNameChange,
            currencyImage,
            currencyDescription,
            textColor,
        };

        localStorage.setItem('appliedSkins', JSON.stringify(appliedSkins));

        if (borderUrl) {
            currencyElement.style.backgroundImage = `url(${borderUrl})`;
        }
        if (backgroundUrl) {
            const videoElem = document.createElement('video');
            videoElem.src = backgroundUrl;
            videoElem.autoplay = true;
            videoElem.muted = true;
            videoElem.loop = true;
            videoElem.style.position = 'absolute';
            videoElem.style.right = '6px';
            videoElem.style.bottom = '4px';
            videoElem.style.width = 'calc(100% - 10px)';
            videoElem.style.height = 'calc(100% - 7px)';
            videoElem.style.zIndex = '-1';
            videoElem.style.objectFit = 'fill';
            videoElem.style.objectPosition = 'center';
            currencyElement.prepend(videoElem);
        }
        if (currencyNameChange) {
            const NameChangeElement = currencyElement.querySelector('h4');
            if (NameChangeElement) {
                NameChangeElement.textContent = currencyNameChange;
            }
        }
if (currencyImage) {
    const imgElement = currencyElement.querySelector('img');
    if (imgElement) {
        imgElement.src = currencyImage;
        imgElement.setAttribute('data-src', currencyImage);
    }
}

        if (currencyDescription) {
            const descriptionElement = currencyElement.querySelector('p');
            if (descriptionElement) {
                descriptionElement.textContent = currencyDescription;
            }
        }
        if (textColor) {
    const h4Element = currencyElement.querySelector('h4');
    const pElement = currencyElement.querySelector('p');
    if (h4Element) h4Element.style.color = textColor;
    if (pElement) pElement.style.color = textColor;
}


    }
};

document.getElementById('apply-skin').onclick = applySkin;




// Reset button logic
document.querySelector('#reset-skin').onclick = () => {
    const resetCurrencyName = document.getElementById('currency-name').value.trim();
    const appliedSkins = JSON.parse(localStorage.getItem('appliedSkins')) || {};

    if (resetCurrencyName) {
        const currencyNumber = resetCurrencyName.match(/\d+/);
        const baseName = resetCurrencyName.replace(/\d*$/, '').trim();
        const saveKey = `${baseName}#${currencyNumber ? currencyNumber[0] : ''}`;

        // Check if the skin exists before deleting
        if (appliedSkins[saveKey]) {
            delete appliedSkins[saveKey]; // Remove the specific item skin
            localStorage.setItem('appliedSkins', JSON.stringify(appliedSkins)); // Update localStorage

            // Reset the UI for the specific item
            const currencyElements = document.querySelectorAll('.card_currency');
            Array.from(currencyElements).forEach(card => {
                const img = card.querySelector('img');
                if (img && img.alt.includes(baseName)) {
                    // Reset background image and other properties
                    card.style.backgroundImage = ''; // Reset background
                    const nameElement = card.querySelector('h4');
                    if (nameElement) nameElement.textContent = baseName; // Reset name to baseName
                    const descriptionElement = card.querySelector('p');
                    if (descriptionElement) descriptionElement.textContent = ''; // Reset description

                }
            });
        }
    } else {
        localStorage.clear(); // Clear the entire localStorage
    }


    location.reload();
};

document.getElementById('showSkinsButton').onclick = () => {
    const currencyName = document.getElementById('currency-name').value.trim();
    const currencyNumber = currencyName.match(/\d+/);
    const baseName = currencyName.replace(/\d+$/, '').trim();

    const appliedSkins = JSON.parse(localStorage.getItem('appliedSkins')) || {};

    if (!currencyName) {
        alert("Please enter a valid item name.");
        return;
    }

    const saveKey = `${baseName}#${currencyNumber ? currencyNumber[0] : ''}`;
    const skinDetails = document.getElementById('skinDetails');

    if (appliedSkins[saveKey]) {
        const skinData = appliedSkins[saveKey];
        skinDetails.textContent = `
            Applied Skin Data:
            Border URL: ${skinData.borderUrl || "No border URL applied."}
            Background URL: ${skinData.backgroundUrl || "No background URL applied."}
            Name Change: ${skinData.currencyNameChange || "No name change applied."}
            Image: ${skinData.currencyImage || "No image applied."}
            Description: ${skinData.currencyDescription || "No description applied."}
            Text Color: ${skinData.textColor || "No text color applied."}
        `;

        document.getElementById('myModal').style.display = "block";
    } else {
        alert("No applied skin found for this item. Please check the item name.");
    }
};

// Close modal functionality
document.querySelector('.close').onclick = () => {
    document.getElementById('myModal').style.display = "none";
};

// Close modal when clicking outside of it
window.onclick = (event) => {
    const modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};








    window.addEventListener('hashchange', togglePanelVisibility);
})();
