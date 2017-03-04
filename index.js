let app = require('electron').remote;
let dialog = app.dialog;
let fs = require('fs');
let fse = require('fs-extra')
let JSONbig = require('json-bigint');

/* Files */
let structuresFile, saveFile, itemsFile;
let structures, save, items;

/* Reference UI elements */
let chooseFolderBtn = document.getElementById('choose-folder-btn');
let globalSettingsDiv = document.getElementById('global-settings-div');
let saveSettingsDiv = document.getElementById('save-settings-div');
let structuresSpawnTable = document.getElementById('structures-spawn-table');
let saveStructuresBtn = document.getElementById('save-structures-btn');

window.onload = function() {
    chooseFolderBtn.addEventListener('click', pickFolder);
    globalSettingsDiv.style.display = 'none';
    saveSettingsDiv.style.display = 'none';
    structuresSpawnTable.style.display = 'none';
    saveStructuresBtn.style.display = 'none';
    chooseFolderBtn.style.backgroundColor = 'red';
}

function pickFolder() {
    dialog.showOpenDialog({
        title: 'Select your Hellion Dedicated Server folder.',
        properties: ['openDirectory']
    }, findFiles);
}

function findFiles(folder) {
    if (folder === undefined || folder.length <= 0) {
        dialog.showErrorBox('No folder selected', 'Select your Hellion Dedicated Server folder.');
        return;
    }

    // Determine most recent save file
    var rootFiles = fs.readdirSync(folder[0]);
    var allSaves = [];
    rootFiles.forEach(function(v) {
        if (v.startsWith('ServerSave_') && v.endsWith('.save')) {
            allSaves.push(v);
        }
    });

    // Backup Data folder
    try {
        fse.copySync(folder + '/Data', folder + '/BackupData');
    } catch (e) {
        console.log(e)
        dialog.showErrorBox('Backup failed', 'Failed to backup Data folder. Quitting now!');
        return;
    }

    // Read files into memory
    try {
        saveFile = folder + '/' + allSaves.sort()[0];
        save = JSONbig.parse(fs.readFileSync(saveFile, 'utf8'));
    } catch (e) {
        console.log('Save file not found or loaded');
    }

    try {
        structuresFile = folder + '/Data/Structures.json';
        structures = JSONbig.parse(fs.readFileSync(structuresFile, 'utf8'));
    } catch (e) {
        dialog.showErrorBox('Structures file not loaded', 'Malformed or nonexistent Data/Structures.json file!');
        return;
    }

    try {
        itemsFile = folder + '/Data/DynamicObjects.json';
    } catch (e) {
        dialog.showErrorBox('DynamicObjects file not loaded', 'Malformed or nonexistent Data/DynamicObjects.json file!');
        return;
    }

    chooseFolderBtn.style.backgroundColor = '';

    // Populate structures
    let structureSelect = document.getElementById('structures-select');

    // Clean and create default
    structureSelect.innerHTML = '';
    let defaultStructure = document.createElement('option');
    defaultStructure.innerHTML = ' ===== Select a structure ===== ';
    defaultStructure.setAttribute('value', 'default');
    defaultStructure.setAttribute('selected', 'selected');
    structureSelect.appendChild(defaultStructure);

    // Turn each structure into options
    structures.forEach(function(v) {
        let structureOption = document.createElement('option');

        let structureName = v['SceneName'];
        structureOption.innerHTML = structureName;
        structureOption.setAttribute('value', structureName);

        structureSelect.appendChild(structureOption);
    });

    structureSelect.addEventListener('change', populateStructure);

    // Read items into array
    items = {};
    let itemObj = JSONbig.parse(fs.readFileSync(itemsFile, 'utf8'));
    itemObj.forEach(function(v) {
        items[v['ItemID']] = v['PrefabPath'].substr(v['PrefabPath'].lastIndexOf('/') + 1);
    });

    globalSettingsDiv.style.display = 'block';
    saveSettingsDiv.style.display = 'block';
}

function populateStructure(event) {
    let structureName = event.target.value;

    if (structureName === 'default') {
        console.log('No such structures found!');
        structuresSpawnTable.style.display = 'none';
        return;
    }

    // Find structure
    let structure = structures.find(function(v) {
        return v['SceneName'] === structureName;
    });

    if (!structure) {
        console.log('No such structures found!');
        return;
    }

    // Clean and create default
    structuresSpawnTable.innerHTML = '<tr><th>Item</th><th>Respawn (s)</th><th>Spawn Chance</th><th>Min Health</th><th>Max Health</th></tr>';

    // Turn each object into row
    let objectsInStructure = structure['DynamicObjects'];
    objectsInStructure.forEach(function(v) {
        let arenaItem = v['SpawnSettings'].find(function(x) {
            return x['Case'] === 0;
        });

        // if item is found in the arena
        if (arenaItem) {
            let arenaRow = document.createElement('tr');

            let arenaItemName = document.createElement('td');
            arenaItemName.innerHTML = items[v['ItemID']];
            arenaRow.appendChild(arenaItemName);

            ['RespawnTime', 'SpawnChance', 'MinHealth', 'MaxHealth'].forEach(function(w) {
                let arenaCell = document.createElement('td');

                arenaCell.innerHTML = arenaItem[w];
                arenaCell.setAttribute('contenteditable', 'true');

                arenaCell.addEventListener('input', function() {
                    arenaItem[w] = +arenaCell.innerHTML.replace(/[^\d\.]*/g, '');
                    // objectCell.style.backgroundColor = '#FFCCCB';
                });

                arenaRow.appendChild(arenaCell);
            });

            structuresSpawnTable.appendChild(arenaRow);
        }

        let derelictItem = v['SpawnSettings'].find(function(x) {
            return x['Case'] === 1;
        });

        // if item is found in derelict
        if (derelictItem) {
            let derelictRow = document.createElement('tr');

            let derelictItemName = document.createElement('td');
            derelictItemName.innerHTML = items[v['ItemID']] + ' (derelict)';
            derelictRow.appendChild(derelictItemName);
            derelictRow.style.backgroundColor = '#FFCCCB';

            ['RespawnTime', 'SpawnChance', 'MinHealth', 'MaxHealth'].forEach(function(w) {
                let derelictCell = document.createElement('td');

                derelictCell.innerHTML = derelictItem[w];
                derelictCell.setAttribute('contenteditable', 'true');

                derelictCell.addEventListener('input', function() {
                    derelictItem[w] = +derelictCell.innerHTML.replace(/[^\d\.]*/g, '');
                });

                derelictRow.appendChild(derelictCell);
            });

            structuresSpawnTable.appendChild(derelictRow);
        }
    });

    structuresSpawnTable.style.display = 'block';
    saveStructuresBtn.style.display = 'block';

    saveStructuresBtn.addEventListener('click', saveStructures);
}

function saveStructures() {
    fs.writeFileSync(structuresFile, JSONbig.stringify(structures, null, 2), 'utf8');
}
