var tableInfo = {
    "columnOrder": [
        {"id": "customer_id", "readonly": true},
        {"id": "f_name", "type": "text"},
        {"id": "l_name", "type": "text"},
        {"id": "email", "type": "email"},
        {"id": "address", "type": "text"},
        {"id": "telephone", "type": "tel"},
        {"id": "birthdate", "type": "date"},
        {"id": "actions", "edit": updateCustomer, "cancel": cancel}
    ],
    "columnHeader": ["ID", "First Name", "Last Name", "email", "Address", "Phone Number", "Birthdate"],
    "data": [],
    "route": "/customer/api",
    "callback": {"edit": function(){}}
};
  
var addCustomerButton = document.getElementById("add-customer");
var createListener = function() {
    var forms = [
        {"id": "insert-customer", "listener": insertCustomer.bind(this)}
    ];

    var inputs = [
        {"type": "text", "id": "f_name", "label": "First Name", "form": "insert-customer", "required": true},
        {"type": "text", "id": "l_name", "label": "Last Name", "form": "insert-customer", "required": true},
	{"type": "email", "id": "email", "label": "Email Address", "form": "insert-customer", "required": true},
        {"type": "text", "id": "address", "label": "Address", "form": "insert-customer", "required": true},
	{"type": "tel", "id": "telephone", "label": "Telephone", "form": "insert-customer", "required": true},
        {"type": "date", "id": "birthdate", "label": "Birthdate", "form": "insert-customer", "required": true},
        {"type": "submit", "id": "submit-customer", "form": "insert-customer", "skipBreak": true}
    ];
    
    var container = document.getElementById("create-container");    
    container.appendChild(insertAddForm.call(this, addCustomerButton, forms, inputs));
};

function insertCustomer(listener) {
    event.preventDefault();
    var data = {};
    data.f_name = document.getElementById('f_name').value;
    data.l_name = document.getElementById('l_name').value;
    data.email = document.getElementById('email').value;
    data.address = document.getElementById('address').value;
    data.telephone = document.getElementById('telephone').value;
    data.birthdate = document.getElementById('birthdate').value;
    var postRequest = httpRequest("POST", "/customer/api", data);
    postRequest.then(function(result) {
        updateTable(result);
        removeInsertForm(addCustomerButton, document.getElementById("insert-form"));
    }).catch(alertError);
};

function getAllCustomers() {
    var getRequest = httpRequest("GET", "/customer/api", {});
    getRequest.then(function(result) {
        updateTable(result);
    }).catch(alertError);
};

function updateTable(result){
    var data = JSON.parse(result.responseText).payload;
    for (var i = 0; i < data.length; i++) {
        data[i]["birthdate"] = formatDate(data[i]["birthdate"], true);
    }
    tableInfo["data"] = data;
    generateTable(tableInfo);
};

function cancel() {
    generateTable(tableInfo);
};


function updateCustomer(id) {
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
    var putRequest = httpRequest("PUT", "/customer/api", data);
    putRequest.then(function(result) {
        updateTable(result);
    }).catch(alertError);
};

function pageInit() {
    addCustomerButton.addEventListener("click", createListener.bind(this), false);
    getAllCustomers();
};

document.addEventListener("DOMContentLoaded", pageInit);
