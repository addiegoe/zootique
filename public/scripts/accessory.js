var accessoryTable = {
    "columnOrder": [
        {"id": "accessory_id", "readonly": true}, 
        {"id": "name", "type": "text"},
        {"id": "actions", "edit": updateAccessory, "cancel": cancel, "delete": updateAllTables, "route": "/accessory/api"}
    ],
    "columnHeader": ["ID", "Accessory Name"],
    "data": []
};

var accessoryAnimalTable = {
    "columnOrder": [
        {"id": "animal_name"},
        {"id": "accessories"}
    ],
    "columnHeader": ["Animal Name", "Associated Accessories"],
    "data": []
};

var addAccessoryButton = document.getElementById("add-accessory");
var removeAnimalAccessoryButton = document.getElementById("delete-animal-accessory");
var addAnimalAccessoryButton = document.getElementById("add-animal-accessory");
var animals = [];
var allAnimals = [];
var accessories = [];
var allAccessories = [];

var createListener = function(type) {
    var forms = [];
    var inputs = [];
    var button;

    switch(type) {
        case "add-accessory":
            forms = [
                {"id": "accessory-insert", "listener": insertAccessory.bind(this)}
            ];

            inputs = [
                {"type": "text", "id": "name", "label": "Accessory Name", "form": "accessory-insert", "required": true},
                {"type": "submit", "id": "submit-accessory", "form": "accessory-insert", "skipBreak": true}
            ];

            removeAnimalAccessoryButton.disabled = false;
            addAnimalAccessoryButton.disabled = false;
            button = addAccessoryButton;
            break;
        case "insert-animal-accessory":
            getAllAnimals();
            forms = [
                {"id": "insert-animal-accessory", "listener": insertAnimalAccessory.bind(this)}
            ];

            inputs = [
                {"type": "dropdown", "id": "animal-id", "items": allAnimals, "label": "Select Animal", "form": "insert-animal-accessory", "listener": displayDiffAccessories, "required": true},
                {"type": "dropdown", "id": "accessory-id", "items": allAccessories, "label": "Select Accessory", "form": "insert-animal-accessory", "required": true},
                {"type": "submit", "id": "insert-accessory", "form": "insert-animal-accessory", "skipBreak": true}
            ];

            removeAnimalAccessoryButton.disabled = false;
            addAccessoryButton.disabled = false;
            button = addAnimalAccessoryButton;
            break;
        case "remove-animal-accessory":
            getAnimalsWithAcc();
            firstAnimalAccessories(true);
            forms = [
                {"id": "remove-animal-accessory", "listener": removeAnimalAccessory.bind(this)}
            ];

            inputs = [
                {"type": "dropdown", "id": "animal-id", "items": animals, "label": "Select Animal", "form": "remove-animal-acessory", "listener": displayAccessories, "required": true},
                {"type": "dropdown", "id": "accessory-id", "items": accessories, "label": "Select Accessory", "form": "insert-animal-accessory", "required": true},
                {"type": "submit", "id": "remove-accessory", "form": "remove-animal-accessory", "skipBreak": true}
            ];

            addAnimalAccessoryButton.disabled = false;
            addAccessoryButton.disabled = false;
            button = removeAnimalAccessoryButton;
            break;
        default:
            break;
    }
    
    var container = document.getElementById("create-container");
    container.appendChild(insertAddForm.call(this, button, forms, inputs));
};

function updateAccessory(id) {
    var data = {};
    data["id"] = id;
    for (var i = 0; i < accessoryTable["columnOrder"].length; i++) {
        var key = accessoryTable["columnOrder"][i]["id"];
        var isReadonly = accessoryTable["columnOrder"][i]["readonly"];
        if (key != "actions" && !isReadonly) {
            var element = document.getElementById(key + "-" + id + "-input");
            data[key] = element.value;
        }
    }
    var putRequest = httpRequest("PUT", "/accessory/api", data);
    putRequest.then(function(result) {
        var rows = JSON.parse(result.responseText).payload;
            updateAccessoryTable(rows[0]);
            updateAssociationTable(rows[1]);
        }).catch(alertError);
};

// Retrieves and displays accessories that an animal does not have, populates dropdown
function displayDiffAccessories(listener, id) {
    var animal;
    if (listener) {
        var animalDOM = document.getElementById("animal-id");
        animal = animalDOM.options[animalDOM.selectedIndex].value;
    } else {
        animal = id;
    }
    var getRequest = httpRequest("GET", "/accessory/api/diff/?id=" + animal, {});
    getRequest.then(function(result) {
        var rows = JSON.parse(result.responseText).payload;
        allAccessories = [];
        for (var i = 0; i < rows.length; i++) {
            var object = {};
            object["id"] = rows[i]["accessory_id"];
            object["name"] = rows[i]["name"];
            allAccessories.push(object);
        }

        if (listener) {
            populateDropdown("accessory-id", allAccessories);
        }
    }).catch(alertError);
};

// Displays accessories associated with a certain animal and populates in dropdown
function displayAccessories(listener) {
    var value = listener.srcElement.value;
    event.preventDefault();
    var data = [];
    for (var i = 0; i < accessories.length; i++) {
        if (accessories[i]["animal_id"] == value) {
            var object = {};
            object["id"] = accessories[i]["id"];
            object["name"] = accessories[i]["name"];
            data.push(object);
        }   
    }
    populateDropdown("accessory-id", data);
};

function firstAnimalAccessories(isRemove) {
    var data = [];
    var firstAnimalID = animals[0]["id"];
    for (var i = 0; i < accessories.length; i++) {
        if (accessories[i]["animal_id"] == firstAnimalID) {
            var object = {};
            object["id"] = accessories[i]["id"];
            object["name"] = accessories[i]["name"];
            data.push(object);
        }
    }
    if (isRemove) {
        accessories = data;
    } else {
        allAccessories = data;
    }
};

// Insert a new accessory association for selected animal
function insertAnimalAccessory(listener) {
    event.preventDefault();
    var values = extractFormValues(listener);
    var data = {};
    for (var i = 0; i < values.length; i++) {
        Object.assign(data, values[i]);
    }

    var postRequest = httpRequest("POST", "/accessory/api/animal", data);
    postRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        accessoryAnimalTable["data"] = combineAccessories(data);
        generateTable(accessoryAnimalTable, "table-body-1");
        removeInsertForm(addAnimalAccessoryButton, document.getElementById("insert-form"));
        getAnimalsWithAcc();
    }).catch(alertError);
};

// Concatenates all the accessories for display per animal
function combineAccessories(data) {
    var values = {};
    var formattedData = [];
    for (var i = 0; i < data.length; i++) {
        if (!values[data[i]["animal_name"]]) {
            values[data[i]["animal_name"]] = [];
        }
        values[data[i]["animal_name"]].push(data[i]["accessory_name"]);
    }

    for (var key in values) {
        var object = {};
        object["animal_name"] = key;
        object["accessories"] = values[key].join(", ");
        formattedData.push(object)
    }
    return formattedData;
};

// Removes an accessory association from animal
function removeAnimalAccessory(listener) {
    event.preventDefault();
    var animalDOM = document.getElementById("animal-id");
    var animal = animalDOM.options[animalDOM.selectedIndex].value;
    var accessoryDOM = document.getElementById("accessory-id");
    var accessory = accessoryDOM.options[accessoryDOM.selectedIndex].id;
    var data = {
        "animal_id": animal,
        "accessory_id": accessory
    };
    var deleteRequest = httpRequest("DELETE", "/accessory/api/animal", data);
    deleteRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        updateAssociationTable(data);
        removeInsertForm(removeAnimalAccessoryButton, document.getElementById("insert-form"));
        getAnimalsWithAcc();
    }).catch(alertError);
};

// Retrieve animals with accessories and their accessories
function getAnimalsWithAcc() {
    var getRequest = httpRequest("GET", "/accessory/api/animal", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        animals = [];
        animalIDs = [];
        accessories = [];
        for (var i = 0; i < data.length; i++) {
            var accessory = {};
            if (!animalIDs.includes(data[i]["animal_id"])) {
                var animal = {};
                animal["id"] = data[i]["animal_id"];
                animal["name"] = data[i]["animal_name"];
                animalIDs.push(data[i]["animal_id"]);
                animals.push(animal);
            }
            accessory["animal_id"] = data[i]["animal_id"];
            accessory["id"] = data[i]["accessory_id"];
            accessory["name"] = data[i]["accessory_name"];
            accessories.push(accessory);
        }
    }).catch(alertError);
};

// Retrieve all animals and store
function getAllAnimals() {
    var getRequest = httpRequest("GET", "/animal/api", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        allAnimals = [];
        for (var i = 0; i < data.length; i++) {
            var row = {};
            row["id"] = data[i]["id"];
            row["name"] = data[i]["name"];
            allAnimals.push(row);
        }
        displayDiffAccessories(null, allAnimals[0]["id"]);
    }).catch(alertError);
};

// Insert individual accessories
function insertAccessory(listener) {
    event.preventDefault();
    var data = extractFormValues(listener);
    var postRequest = httpRequest("POST", "/accessory/api", data[0]);
    postRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        updateAccessoryTable(data);
        removeInsertForm(addAccessoryButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

// Retrieve all accessories available and accessories associated by animal
function getAllAccessories() {
    var getRequest = httpRequest("GET", "/accessory/api", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        updateAccessoryTable(data[0]);
        updateAssociationTable(data[1]);
    }).catch(alertError);
};

// Updates the table that lists all accessories
function updateAccessoryTable(result){
    accessoryTable["data"] = result;
    generateTable(accessoryTable);
};

// Updates the table that lists all accessories per animal
function updateAssociationTable(result) {
    accessoryAnimalTable["data"] = combineAccessories(result);
    generateTable(accessoryAnimalTable, "table-body-1");
};

// Updates both tables when needed (ex: delete)
function updateAllTables(result) {
    var data = JSON.parse(result.responseText).payload;
    updateAccessoryTable(data[0]);
    updateAssociationTable(data[1]);
};

function cancel() {
    generateTable(accessoryTable);
};

function pageInit() {
    addAccessoryButton.addEventListener("click", createListener.bind(this, "add-accessory"), false);
    addAnimalAccessoryButton.addEventListener("click", createListener.bind(this, "insert-animal-accessory"), false);
    removeAnimalAccessoryButton.addEventListener("click", createListener.bind(this, "remove-animal-accessory"), false);
    getAllAccessories();
    getAnimalsWithAcc();
    getAllAnimals();
};

document.addEventListener("DOMContentLoaded", pageInit);
