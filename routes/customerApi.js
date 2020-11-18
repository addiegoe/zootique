var express = require("express");
var router = express.Router();
var mysql = require("../dbconfig");

router.route("/")
    .get(function(req, res) {
        mysql.pool.query(getQuery("getCustomers"), function(err, rows) {
            if (err) {
                console.log('here')
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var data = [req.body.f_name,req.body.l_name,req.body.email,req.body.address,req.body.telephone,req.body.birthdate];
        mysql.pool.query(getQuery("insertCustomer"), data, function(err) {
            mysql.pool.query(getQuery("getCustomers"), function(err, rows) {
                if (err) {
                    res.status(400).json({"error": err});
                }
                res.json({"payload": rows});
            });
        });
    })
    .put(function(req, res) {
        var data = [
            req.body["f_name"],
            req.body["l_name"],
            req.body["email"],
            req.body["address"],
            req.body["telephone"],
            req.body["birthdate"],
            req.body["id"]
        ];
        var query = getQuery("updateCustomer");
        mysql.pool.query(query, data, function(err) {
            mysql.pool.query(getQuery("getCustomers"), function(err, rows) {
                if (err) {
                    res.status(400).json({"error": err});
                }
                res.json({"payload": rows});
            });
        });
    });

function getQuery(type) {
    var query = "";
    switch(type) {
        case "getCustomers":
            query = "SELECT customer_id, f_name, l_name, email, address, telephone, DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate FROM customer ORDER BY l_name;";
            break;
        case "insertCustomer":
            query = "INSERT INTO customer (f_name, l_name, email, address, telephone, birthdate) VALUES (?,?,?,?,?,?);";
            break;
        case "updateCustomer":
            query = "UPDATE customer SET f_name=?,l_name=?,email=?,address=?,telephone=?,birthdate=? WHERE customer_id=?;";
            break;
    }
    return query;
};


module.exports = router;
