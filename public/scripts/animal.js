var animal_types = [];
var animal_breed_types = [];
var tableInfo = {
    "columnOrder": [
        {"id": "id", "readonly": true},
        {"id": "name", "type": "text"},
        {"id": "type", "type": "dropdown", "items": animal_types, "readonly": true},
        {"id": "breed", "type": "dropdown", "items": [], "readonly": true},
        {"id": "cost_per_hour", "type": "number"}
    ],
    "columnHeader": ["ID", "Name", "Type", "Breed", "Cost Per Hour"],
    "data": []
};
 

var breedTable = {
    "columnOrder": [
        {"id": "id", "readonly": true}, 
        {"id": "breed_name", "type": "text"},
        {"id": "type_name", "type": "dropdown", "items": animal_types},
        {"id": "actions", "edit": updateBreed, "cancel": updateBreedTable}
    ],
    "columnHeader": ["ID", "Breed Name", "Type Name"],
    "data": []
};


var allFilter = document.getElementById("view-all");
var availFilter = document.getElementById("view-avail");

var addBreedButton = document.getElementById("add-animal-breed");
var addTypeButton = document.getElementById("add-animal-type");
var addAnimalButton = document.getElementById("add-animal");
var createListener = function(type) {
    var inputs = [];
    var forms = [];
    var button;
    switch(type) {
        case "animal":
            getAllTypes();
            forms = [
                {"id": "insert-animal", "listener": insertAnimal.bind(this)},
	        {"id": "get-breed-form", "listener": getBreeds.bind(this)}
            ];

            inputs = [
                {"type": "text", "id": "name", "label": "Name", "form": "insert-animal", "required": true},
                {"type": "dropdown", "id": "type", "items": animal_types, "label": "Type", "form": "insert-animal", "skipBreak": true},
	        {"type": "submit", "id": "get-breed", "value": "Get Breeds", "form": "get-breed-form"},
                {"type": "dropdown", "id": "breed", "items": [], "label": "Breed", "form": "insert-animal"},
	        {"type": "number", "id": "cost", "label": "Cost Per Hour", "form": "insert-animal", "required": true},
                {"type": "submit", "id": "submit-animal", "form": "insert-animal", "skipBreak": true}
            ];
            addTypeButton.disabled = false;  
            addBreedButton.disabled = false;        
            button = addAnimalButton;
            break;
        case "type":
            forms = [
                {"id": "type-form", "listener": insertType.bind(this)}
            ];

            inputs = [
                {"type": "text", "id": "new-type", "label": "Type", "form": "type-form", "required": true},
                {"type": "submit", "id": "submit-type", "form": "type-form", "skipBreak": true}
            ];
            addAnimalButton.disabled = false;  
            addBreedButton.disabled = false;        
            button = addTypeButton;
            break;
        case "breed":
            getAllTypes();
            forms = [
                {"id": "breed-form", "listener": insertBreed.bind(this)}
            ];

            inputs = [
                {"type": "text", "id": "new-breed", "label": "Breed", "form": "breed-form", "required": true},
                {"type": "dropdown", "id": "type_menu", "items": animal_breed_types, "label": "Type", "form": "breed-form"},
                {"type": "submit", "id": "submit-breed", "form": "breed-form", "skipBreak": true}
            ];
            addAnimalButton.disabled = false;  
            addTypeButton.disabled = false;        
            button = addBreedButton;
            break;
    };
    var container = document.getElementById("create-container");
    container.appendChild(insertAddForm.call(this, button, forms, inputs));
};


function insertAnimal(listener) {
    event.preventDefault();
    var data = {};
    data.name = document.getElementById('name').value;
    data.type = document.getElementById('type').value;
    data.breed = document.getElementById('breed').value;
    data.cost = document.getElementById('cost').value;
    var postRequest = httpRequest("POST", "/animal/api", data);
    postRequest.then(function(result) {
        updateTable(result);
        removeInsertForm(addAnimalButton, document.getElementById("insert-form"));
    }).catch(alertError);
};


function insertType(listener) {
    event.preventDefault();
    var data = {};
    data.type_name = document.getElementById('new-type').value;
    var postRequest = httpRequest("POST", "/animal/api/type", data);
    postRequest.then(function(result) {
	getAllTypes();
        removeInsertForm(addTypeButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

function insertBreed(listener) {
    event.preventDefault();
    var data = {};
    data.breed_name = document.getElementById('new-breed').value;
    data.type_id = document.getElementById('type_menu').value;
    var postRequest = httpRequest("POST", "/animal/api/breed", data);
    postRequest.then(function(result) {
        getAllBreeds();
        removeInsertForm(addBreedButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

function getAllTypes() {
    var getRequest = httpRequest("GET", "/animal/api/type", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        animal_types = [];
        for (var i = 0; i < data.length; i++) {
            var row = {};
            row["id"] = data[i]["type_id"];
            row["name"] = data[i]["name"];
            animal_types.push(row);
        }
        animal_breed_types = [{"id": 0, "name": "None"}];
        for (var i = 0; i < data.length; i++) {
            var row = {};
            row["id"] = data[i]["type_id"];
            row["name"] = data[i]["name"];
            animal_breed_types.push(row);
        }
        breedTable["columnOrder"][2]["items"] = animal_breed_types;
        
    }).catch(alertError);
};
                                             

function getAllBreeds() {
   
    var getRequest = httpRequest("GET", "animal/api/breed", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        breedTable["data"] = data;
        updateBreedTable();
    }).catch(alertError);
};


function getBreeds() {
    var request = "/animal/api/breed?filter=";
    var id = document.getElementById('type') ? document.getElementById("type").value : "";
    var route = request + id;
    var getRequest = httpRequest("GET", route, {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        var dropdown = document.getElementById('breed');
        dropdown.innerHTML = "";
        var item = document.createElement("option");
        item.setAttribute("value", 0);
        item.textContent = "None";
        dropdown.appendChild(item);
        if (data.length != 0) {
            for (var i=0; i < data.length; i++) {
                var row = document.createElement("option");
                row.id = data[i]["breed_id"];
                row.setAttribute("value", data[i]["breed_id"]);
                row.textContent = data[i]["name"];
                dropdown.appendChild(row);
            }

        }
    }).catch(alertError);
};


function getAllAnimals(option) {
    var route = "";
    switch(option) {
        case "available":
            route = "/animal/api/?filter=available";
            break;        
        case "all":
            route = "/animal/api";
            break;
    }
    var getRequest = httpRequest("GET", route, {});
    getRequest.then(function(result) {
        updateTable(result);
        checkButton(option, result);
    }).catch(alertError);
};

function checkButton(button, result) {
    switch(button) {
        case "all":
            allFilter.checked = true;
            availFilter.checked = false;
            break;
        case "available":
            allFilter.checked = false;
            availFilter.checked = true;
            break;
    }
    var data = JSON.parse(result.responseText);
    tableInfo["data"] = data.payload;
};


function updateTable(result){
    var data = JSON.parse(result.responseText);
    tableInfo["data"] = data.payload;
    generateTable(tableInfo);
};


function updateBreed(id) {
    console.log("id", id, animal_types);
    var data = {};
    data["id"] = id;
    for (var i = 0; i < breedTable["columnOrder"].length; i++) {
        var key = breedTable["columnOrder"][i]["id"];
        var isReadonly = breedTable["columnOrder"][i]["readonly"];
        if (key !== "actions" && !isReadonly) {
            var element = document.getElementById(key + "-" + id + "-input");
            data[key] = element.value;
        }
    }
    var putRequest = httpRequest("PUT", "/animal/api/breed", data);
    putRequest.then(function(result) {
        var rows = JSON.parse(result.responseText).payload;
        breedTable["data"] = rows;
        updateBreedTable();
    })
};



function updateBreedTable() {
    generateTable(breedTable, "table-body-1");
};


function pageInit() {
    addAnimalButton.addEventListener("click", createListener.bind(this, "animal"), false);
    addTypeButton.addEventListener("click", createListener.bind(this, "type") , false);
    addBreedButton.addEventListener("click", createListener.bind(this, "breed") , false);
    availFilter.addEventListener("click", getAllAnimals.bind(this, "available"), false);
    allFilter.addEventListener("click", getAllAnimals.bind(this, "all"), false);
    getAllAnimals("all");
    getAllTypes();
    getAllBreeds();
};

document.addEventListener("DOMContentLoaded", pageInit);
