var animals = [];
var staff = [];
var customers = [];
var rentalTypes = [];
var statusTypes = [{"id": "0", "name": "Open"}, {"id": "1", "name": "Closed"}];
var reservationTable = {
    "columnOrder": [
        {"id": "reservation_id", "readonly": true},
        {"id": "date", "type": "date", "readonly": true},
        {"id": "is_completed", "type": "dropdown", "items": statusTypes},
        {"id": "l_name", "type": "text", "readonly": true},
        {"id": "f_name", "type": "text", "readonly": true},
        {"id": "rental_name", "readonly": true},
        {"id": "animal_name", "readonly": true},
        {"id": "accessory_name", "type": "text", "readonly": true},
        {"id": "time", "type": "number", "readonly": true},
        {"id": "cost", "type": "text", "readonly": true},
        {"id": "staff_name", "readonly": true},
        {"id": "actions", "edit": updateStatus, "cancel": cancel}
    ],
    "columnHeader": ["ID", "Date", "Status", "Last Name", "First Name", "Rental Type", "Animal Name", "Accessories", "Duration", "Total Cost", "Approved By"],
    "data": []
};

// DOM Elements
var createReservationButton = document.getElementById("create-reservation");
var createRentalTypeButton = document.getElementById("create-rental-type");
var allReservationsInput = document.getElementById("all-reservations");
var closedReservationsInput = document.getElementById("closed-reservations");
var openReservationsInput = document.getElementById("open-reservations");

var createListener = function(type) {
    var inputs = [];
    var forms = [];
    var button;
    switch(type) {
        case "reservation":
            getStaffNames();
            getRentalTypes();
            getAnimals("available");
            getCustomers();
            forms = [
                {"id": "test-form", "listener": populateDropdown.bind(this, "populate_test")},
                {"id": "reservation-form", "listener": insertReservation.bind(this)} 
            ];
            inputs = [
                {"type": "date", "id": "date", "label": "Date", "form": "reservation-form", "required": true},
                {"type": "dropdown", "id": "is_completed", "items": statusTypes, "label": "Reservation Status", "form": "reservation-form"},
                {"type": "dropdown", "id": "animal", "items": animals, "label": "Select Available Animal", "form": "reservation-form", "required": true},
                {"type": "dropdown", "id": "customer_id", "items": customers, "label": "Select Customer", "form": "reservation-form", "required": true},
                {"type": "dropdown", "id": "rental_id", "items": rentalTypes, "label": "Select Rental Type", "form": "reservation-form", "required": true},
                {"type": "dropdown", "id": "staff_id", "items": staff, "label": "Select Staff", "form": "reservation-form", "required": true},
                {"type": "number", "id": "time", "label": "Time", "form": "reservation-form", "listener": updateCost, "required": true},
                {"type": "number", "id": "cost", "label": "Cost", "readonly": true, "form": "reservation-form", "required": true},
                {"type": "submit", "id": "submit-order", "form": "reservation-form", "skipBreak": true}
            ];
            
            createRentalTypeButton.disabled = false;        
            button = createReservationButton;
            break;
        case "rental-type":
            forms = [
                {"id": "rental-form", "listener": insertRentalType.bind(this)}
            ];

            inputs = [
                {"type": "text", "id": "type", "label": "Rental Type", "form": "rental-form"},
                {"type": "submit", "id": "submit-rental", "form": "rental-form", "skipBreak": true}
            ];
            
            createReservationButton.disabled = false;
            button = createRentalTypeButton;
            break;
    }
    var container = document.getElementById("create-container");
    container.appendChild(insertAddForm.call(this, button, forms, inputs));

};

// Insert new reservation
function insertReservation(listener) {
    event.preventDefault();
    var data = extractFormValues(listener);
    var formattedData = {};
    for (var i = 0; i < data.length; i++) {
        Object.assign(formattedData, data[i]);
    }
    var postRequest = httpRequest("POST", "/reservation/api", formattedData);
    postRequest.then(function(result) {
        var rows = JSON.parse(result.responseText).payload;
        reservationTable["data"] = formatReservation(rows);
        generateTable(reservationTable);
        getAnimals("available");
        removeInsertForm(createReservationButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

// Update the cost of the reservation depending on time input
function updateCost(listener) {
    var animalDOM = document.getElementById("animal");
    var animalIndex = animalDOM.options[animalDOM.selectedIndex].value;
    var input = listener.data;
    var costInput = document.getElementById("cost");
    for (var i = 0; i < animals.length; i++) {
        if (animalIndex == animals[i]["id"]) {
            costInput.value = animals[i]["cost_per_hour"] * Number(input);
        }
    }
};


function updateStatus(id) {
    var data = {};
    data["id"] = id;
    for (var i = 0; i < reservationTable["columnOrder"].length; i++) {
        var key = reservationTable["columnOrder"][i]["id"];
        var isReadonly = reservationTable["columnOrder"][i]["readonly"];
        if (key == "is_completed") {
            var element = document.getElementById(key + "-" + id + "-input");
            data[key] = element.options[element.selectedIndex].value;
        } else if (key == "animal_name") {
            console.log('here', document.getElementById(key + "-" + id).textContent)
            data[key] = document.getElementById(key + "-" + id).textContent;
        }
    }

    var putRequest = httpRequest("PUT", "/reservation/api", data);
    putRequest.then(function(result) {
        var rows = JSON.parse(result.responseText).payload;
        reservationTable["data"] = formatReservation(rows);
        generateTable(reservationTable);
        getAnimals("available");
    }).catch(alertError);
};

function cancel() {
    generateTable(reservationTable);
};

// Retrieve list of animals
function getAnimals(option) {
    var route = "";
    switch(option) {
        case "available":
            route = "/animal/api/?filter=available";
            break;
        case "unavailable":
            route = "/animal/api/?filter=unavailable";
            break;
    }
    var getRequest = httpRequest("GET", route, {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        animals = data;
    }).catch(alertError);
};

// Insert new rental type
function insertRentalType(listener) {
    event.preventDefault();
    var data = extractFormValues(listener);
    var postRequest = httpRequest("POST", "/reservation/api/rental", data[0]);
    postRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        rentalTypes = [];
        for (var i = 0; i < data.length; i++) {
            var type = {};
            type["id"] = data[i]["rental_id"];
            type["name"] = data[i]["type"];
            rentalTypes.push(type);
        }
        removeInsertForm(createRentalTypeButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

// Retrieve all staff
function getStaffNames() {
    var getRequest = httpRequest("GET", "/staff/api", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        staff = [];
        for (var i = 0; i < data.length; i++) {
            var row = {};
            row["id"] = data[i]["staff_id"];
            row["name"] = data[i]["f_name"] + " " + data[i]["l_name"];
            staff.push(row);
        }
    }).catch(alertError);
};

// Retrieve rental types
function getRentalTypes() {
    var getRequest = httpRequest("GET", "/reservation/api/rental", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        rentalTypes = [];
        for (var i = 0; i < data.length; i++) {
            var type = {};
            type["id"] = data[i]["rental_id"];
            type["name"] = data[i]["type"];
            rentalTypes.push(type);
        }
    }).catch(alertError);
};

// Retrieve reservations based on criteria
function getReservations(option, radioButton) {
    var route = "";
    var data = {};
    switch(option) {
        case "closed":
            route = "/reservation/api/?filter=closed";
            break;
        case "open":
            route = "/reservation/api/?filter=open";
            break;
        default:
            route = "/reservation/api";
            break;
    }
    var getRequest = httpRequest("GET", route, data);
    getRequest.then(function(result) {
        reservationTable["data"] = formatReservation(JSON.parse(result.responseText).payload);
        generateTable(reservationTable);
        changeRadioSelect(radioButton);
    }).catch(alertError);
};

function getCustomers() {
    var getRequest = httpRequest("GET", "/customer/api", {});
    getRequest.then(function(result) {
        var data = JSON.parse(result.responseText).payload;
        customers = [];
        for (var i = 0; i < data.length; i++) {
            var row = {};
            row["id"] = data[i]["customer_id"];
            row["name"] = data[i]["f_name"] + " " + data[i]["l_name"];
            customers.push(row);
        }
    }).catch(alertError);
};

// Change the selected radio button
function changeRadioSelect(radio) {
    allReservationsInput.checked = false;
    openReservationsInput.checked = false;
    closedReservationsInput.checked = false;
    radio.checked = true;
};

// Format the reservations from database
function formatReservation(data) {
    var reservations = data[0];
    var accessories = data[1];
    var results = [];
    var accessoryList = [];
    for (var i = 0; i < reservations.length; i++) {
        accessoryList = [];
        var current = reservations[i];
        var row = {};
        row["reservation_id"] = current["id"];
        row["rental_name"] = current["type"];
        row["is_completed"] = current["is_completed"] ? "Closed" : "Open";
        row["l_name"] = current["c_lname"];
        row["f_name"] = current["c_fname"]
        row["date"] = formatDate(current["date"], true);
        row["animal_name"] = current["animal"];
        row["time"] = current["time"];
        row["cost"] = current["cost"];
        row["staff_name"] = current["s_fname"] + " " + current["s_lname"];

        for (var j = 0; j < accessories.length; j++) {
            if (accessories[j]["reservation_id"] == current["id"]) {
                accessoryList.push(accessories[j]["name"]);
            }
        }

        row["accessory_name"] = accessoryList.join(", ");
        results.push(row);
    }
    return results;
};


function pageInit() {
    createReservationButton.addEventListener("click", createListener.bind(this, "reservation"), false);
    createRentalTypeButton.addEventListener("click", createListener.bind(this, "rental-type") , false);
    allReservationsInput.addEventListener("click", getReservations.bind(this, null, allReservationsInput), false);
    closedReservationsInput.addEventListener("click", getReservations.bind(this, "closed", closedReservationsInput), false);
    openReservationsInput.addEventListener("click", getReservations.bind(this, "open", openReservationsInput), false);
    getReservations(null, allReservationsInput);
    getRentalTypes();
    getStaffNames();
    getAnimals("available");
    getCustomers();
};

document.addEventListener("DOMContentLoaded", pageInit);
