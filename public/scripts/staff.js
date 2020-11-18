var tableInfo = {
    "columnOrder": [
        {"id": "staff_id", "type": "text", "readonly": true}, 
        {"id": "l_name", "type": "text"}, 
        {"id": "f_name", "type": "text"}, 
        {"id": "start_date", "type": "date"}, 
        {"id": "end_date", "type": "date"},
        {"id": "actions", "edit": updateStaff, "cancel": cancel}
    ],
    "columnHeader": ["ID", "Last Name", "First Name", "Start Date", "End Date"],
    "data": [],
    "route": "/staff/api",
    "callback": {"edit": function(){}}
}

// DOM Elements
var addStaffButton = document.getElementById("add-staff");
var allStaffInput = document.getElementById("all-staff");
var currentStaffInput = document.getElementById("current-staff");
var pastStaffInput = document.getElementById("past-staff");
var createListener = function() {
    var forms = [
        {"id": "staff-insert", "listener": insertStaff.bind(this)}
    ];

    var inputs = [
        {"type": "text", "id": "f_name", "label": "First Name", "form": "staff-insert", "required": true},
        {"type": "text", "id": "l_name", "label": "Last Name", "form": "staff-insert", "required": true},
        {"type": "date", "id": "start_date", "label": "Start Date", "form": "staff-insert", "required": true},
        {"type": "date", "id": "end_date", "label": "End Date", "form": "staff-insert"},
        {"type": "submit", "id": "submit-staff", "form": "staff-insert", "skipBreak": true}
    ];
    
    var container = document.getElementById("create-container");    
    container.appendChild(insertAddForm.call(this, addStaffButton, forms, inputs));
};

function insertStaff(listener) {
    event.preventDefault();
    var values = extractFormValues(listener);
    var data = {};
    for (var i = 0; i < values.length; i++) {
        Object.assign(data, values[i]);
    }

    var postRequest = httpRequest("POST", "/staff/api", data);
    postRequest.then(function(result) {
        updateTable(result);
        removeInsertForm(addStaffButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

function updateStaff(id) {
    var data = {};
    data["id"] = id;
    for (var i = 0; i < tableInfo["columnOrder"].length; i++) {
        var key = tableInfo["columnOrder"][i]["id"];
        var isReadonly = tableInfo["columnOrder"][i]["readonly"];
        if (key != "actions" && !isReadonly) {
            var element = document.getElementById(key + "-" + id + "-input");
            data[key] = element.value;
        }
    }
    var putRequest = httpRequest("PUT", "/staff/api", data);
    putRequest.then(function(result) {
        updateTable(result);
    }).catch(alertError);
};

function getStaff(option, radioButton) {
    var route = "";
    var data = {};
    switch(option) {
        case "current":
            route = "/staff/api/?filter=current";
            break;
        case "past":
            route = "/staff/api/?filter=past";
            break;
        default:
            route = "/staff/api";
            break;
    }
    var getRequest = httpRequest("GET", route, data);
    getRequest.then(function(result) {
        updateTable(result);
        changeRadioSelect(radioButton);
    });
};

function updateTable(result) {
    var data = JSON.parse(result.responseText);
    for (var i = 0; i < data.payload.length; i++) {
        data.payload[i]["start_date"] = formatDate(data.payload[i]["start_date"], true);
        if (data.payload[i]["end_date"]) {
            data.payload[i]["end_date"] = formatDate(data.payload[i]["end_date"], true);
        }
    }
    tableInfo["data"] = data.payload;
    generateTable(tableInfo);
};

function cancel() {
    generateTable(tableInfo);
};

// Radio box not showing selected with listener, add this for temporary fix
function changeRadioSelect(radio) {
    allStaffInput.checked = false;
    currentStaffInput.checked = false;
    pastStaffInput.checked = false;
    radio.checked = true;   
};

function pageInit() {
    addStaffButton.addEventListener("click", createListener.bind(this), false);
    allStaffInput.addEventListener("click", getStaff.bind(this, null, allStaffInput), false);
    currentStaffInput.addEventListener("click", getStaff.bind(this, "current", currentStaffInput), false);
    pastStaffInput.addEventListener("click", getStaff.bind(this, "past", pastStaffInput), false);
    getStaff(null, allStaffInput);
};

document.addEventListener("DOMContentLoaded", pageInit);
