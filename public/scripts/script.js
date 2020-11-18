function insertAddForm (button, formList, inputList) {
    var formContainer = document.getElementById("insert-form");
    if (formContainer) {
        formContainer.innerHTML = "";
    } else {
        formContainer = document.createElement("div");
        formContainer.id = "insert-form";
    }
    for (var i = 0; i < formList.length; i++) {
        var form = document.createElement("form");
        form.id = formList[i]["id"];
        form.addEventListener("submit", formList[i]["listener"].bind(this), false);
        formContainer.appendChild(form);
    }

    var inputContainer = document.createElement("div");
    formContainer.appendChild(inputContainer);
    
    for (var i = 0; i < inputList.length; i++) {
        if (inputList[i]["type"] !== "dropdown" && inputList[i]["type"] !== "submit") {
            var input = document.createElement("input");
            var label = document.createElement("label");

            input.type = inputList[i]["type"];
            input.id = inputList[i]["id"];
            input.setAttribute("form", inputList[i]["form"]);
            
            label.setAttribute("for", inputList[i]["id"]);
            label.textContent = inputList[i]["label"] + ": ";

            if (inputList[i]["readonly"]) {
                input.setAttribute("readonly", "");
            }
            
            if (inputList[i]["listener"]) {
                input.addEventListener("input", inputList[i]["listener"].bind(this), false);
            }

            if (inputList[i]["required"]) {
                input.setAttribute("required", "");
            }

            inputContainer.appendChild(label);
            inputContainer.appendChild(input);
        } else if (inputList[i]["type"] == "dropdown") {
            var label = document.createElement("label");
            var dropdown = document.createElement("select");
            label.textContent = inputList[i]["label"] + ": ";
            dropdown.id = inputList[i]["id"];
            dropdown.setAttribute("form", inputList[i]["form"]);

            for (var j = 0; j < inputList[i]["items"].length; j++) {
                var item = document.createElement("option");
                item.setAttribute("value", inputList[i]["items"][j]["id"]);
                item.setAttribute("id", inputList[i]["items"][j]["id"]);
                item.textContent = inputList[i]["items"][j]["name"];
                if (j == 0) {
                    item.setAttribute("selected", "");
                }
                dropdown.appendChild(item);
            }

            if (inputList[i]["listener"]) {
                dropdown.addEventListener("click", inputList[i]["listener"].bind(this), false);
            }

            if (inputList[i]["required"]) {
                dropdown.setAttribute("required", "");
            }

            inputContainer.appendChild(label);
            inputContainer.appendChild(dropdown);
        } else if (inputList[i]["type"] == "submit") {
            var submit = document.createElement("input");
            submit.type = "submit";
            submit.setAttribute("form", inputList[i]["form"]);

            if (inputList[i]["value"]) {
                submit.setAttribute("value", inputList[i]["value"]);
            }

            inputContainer.appendChild(submit);
        }

        if (!inputList[i]["skipBreak"]) {
            inputContainer.appendChild(document.createElement("br"));
        }

        
    }

    var cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    inputContainer.appendChild(cancelButton);
    cancelButton.addEventListener("click", removeInsertForm.bind(this, button, formContainer), false);
        
    button.disabled = true;
    return formContainer;
};

// Takes the form submit listener and extracts the data values from the inputs
// Will return a list of objects for each value in the form of {attribute_name: value}
function extractFormValues (formListener) {
    var formElement = formListener["srcElement"];
    var values = [];
    for (var i = 0; i < formElement.length; i++) {
        // Check for id to ignore submit input elements
        if (formElement[i]["id"]) {
            var object = {};
            object[formElement[i]["id"]] = formElement[i]["value"]; 
            values.push(object);
        }
    }
    return values;
};

function removeInsertForm(button, formDOM) {
    button.disabled = false;
    formDOM.remove();
};

function populateDropdown(idToUpdate, data, route) {
    // Run http request with value to get values from db?
    //console.log(extractFormValues(value));
    event.preventDefault();
    var dropdownContainer = document.getElementById(idToUpdate);
    dropdownContainer.innerHTML = "";
    for (var i = 0; i < data.length; i++) {
        var item = document.createElement("option");
        item.id = data[i]["id"];
        item.setAttribute("value", data[i]["id"]);
        item.textContent = data[i]["name"];
        dropdownContainer.appendChild(item);
    }
};


function httpRequest(method, route, data) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open(method, route, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(data));
        event.preventDefault();
        req.addEventListener("load", function() {
            if (req.status >= 200 && req.status < 400) {
                resolve(req);
            } else {
                reject(req);
            }
        });
    });
};

// Recreates the table - assumes table id of "table-body"
function generateTable(tableInfo, idOverride) {
    var table = document.getElementById(idOverride || "table-body");
    var header = document.createElement("thead");
    var body = document.createElement("tbody");
    var length = tableInfo["columnOrder"].length;
    table.innerHTML = "";
    for (var i = 0; i < length; i++) {
        var column = document.createElement("th");
        if (i != tableInfo["columnHeader"].length) {
            column.textContent = tableInfo["columnHeader"][i];
        }
        header.appendChild(column);
    }
    for (var i = 0; i < tableInfo["data"].length; i++) {
        var row = document.createElement("tr");
        var id = tableInfo["data"][i][tableInfo["columnOrder"][0]["id"]];
        for (var j = 0; j < tableInfo["columnOrder"].length; j++) {
            var key = tableInfo["columnOrder"][j]["id"];
            var cell = document.createElement("td");
            cell.id = key + "-" + id;
            cell.textContent = key == "actions" ? "" : tableInfo["data"][i][key];
            if (key == "actions") {
                if (tableInfo["columnOrder"][j]["edit"]) {
                    var editButton = document.createElement("button");
                    editButton.textContent = "Edit";
                    editButton.addEventListener("click", editItem.bind(this, id, tableInfo["columnOrder"][j]["edit"], tableInfo["columnOrder"]), false);
                    cell.appendChild(editButton);
                } 
                if (tableInfo["columnOrder"][j]["delete"]) {
                    var deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.addEventListener("click", deleteItem.bind(this, id, tableInfo["columnOrder"][j]["route"], tableInfo["columnOrder"][j]["delete"]), false);
                    cell.appendChild(deleteButton);
                }
            }
            row.appendChild(cell);
        }
        body.appendChild(row);
    }
    table.appendChild(header);
    table.appendChild(body);
};

function editItem (id, callback, rowOrder) {
    for (var i = 0; i < rowOrder.length; i++) {
        if (!rowOrder[i]["readonly"]) {
            var key = rowOrder[i]["id"];
            var element = document.getElementById(key + "-" + id);
            var value = element.textContent || "";
            element.innerHTML = "";
            if (key != "actions") {
                if (rowOrder[i]["type"] == "dropdown") {
                    var dropdown = document.createElement("select");
                    dropdown.id = (key + "-" + id + "-input");
                    for (var j = 0; j < rowOrder[i]["items"].length; j++) {
                        var item = document.createElement("option");
                        var index;
                        item.setAttribute("value", rowOrder[i]["items"][j]["id"]);
                        item.textContent = rowOrder[i]["items"][j]["name"];
                        if (value == rowOrder[i]["items"][j]["name"]) {
                            index = rowOrder[i]["items"][j]["id"];
                        }

                        dropdown.appendChild(item);
                        dropdown.selectedIndex = index;
                    }
                    element.appendChild(dropdown);
                } else {
                    var input = document.createElement("input");
                    input.setAttribute("type", rowOrder[i]["type"]);
                    input.setAttribute("value", rowOrder[i]["type"] == "date" ? (value ? formatDate(value, false) : "") : value);
                    input.setAttribute("id", key + "-" + id + "-input");
                    element.appendChild(input);
                }
            } else {
                var button = document.createElement("button");
                button.textContent = "Update";
                button.addEventListener("click", callback.bind(this,id), false);
                element.appendChild(button);
                var cancel = document.createElement("button");
                cancel.textContent = "Cancel";
                cancel.addEventListener("click", rowOrder[i]["cancel"], false);
                element.appendChild(cancel);
            }
        }
    }
};

function deleteItem(id, route, callback) {
    var deleteRequest = httpRequest("DELETE", route, {"id": id});
    deleteRequest.then(callback);
};

// Convert date to proper formats (for db or for display)
function formatDate(string, forDisplay) {
    var dateArray = string.split("-");
    if (forDisplay) {
        return dateArray[1] + "-" + dateArray[2] + "-" + dateArray[0];
    } else {
        return dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1];
    }
};

function alertError(error) {
    alert("Something went wrong. Try again.");
    console.log(error)
};
