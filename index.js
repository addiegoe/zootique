var express = require("express");
var handlebars = require("express-handlebars").create({defaultLayout: "main"});
var bodyParser = require("body-parser");
var path = require("path");
var app = express();
var mysql = require("./dbconfig.js");

app.engine("handlebars", handlebars.engine);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "handlebars");
app.set("port", 9004);

// Set up routes in the form of /PAGE_NAME/api
app.use("/reservation/api", require("./routes/reservationApi"));
app.use("/staff/api", require("./routes/staffApi"));
app.use("/accessory/api", require("./routes/accessoryApi"));
app.use("/customer/api", require("./routes/customerApi"));
app.use("/animal/api", require("./routes/animalApi"));

// Keep these routes as is for page rendering
app.get("/", function(req, res) {
    res.render("home");
});

app.get("/description", function(req, res) {
res.render("description");
});

app.get("/customer", function(req, res) {
    res.render("customer");
});

app.get("/staff", function(req, res) {
    res.render("staff");
});

app.get("/reservation", function(req, res) {
    res.render("reservation");
});

app.get("/animal", function(req, res) {
    res.render("animal");
});

app.get("/accessory", function(req, res) {
    res.render("accessory");
});

app.use(function(req,res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get("port"), function() {
    console.log("Listening on port " + app.get("port") + "!");
});
