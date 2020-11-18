var express = require("express");
var router = express.Router();
var mysql = require("../dbconfig");

router.route("/")
    .get(function(req, res) {
        var query = getQuery("getStaff", true);
        if (!req.query.filter) {
            query += ";";
        } else if (req.query.filter == "current") {
            query += " WHERE end_date IS NULL;";
        } else if (req.query.filter == "past") {
            query += " WHERE end_date IS NOT NULL;"
        }
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var query = getQuery("insertStaff");
        query += getQuery("getStaff");
        var data = [
            req.body["f_name"],
            req.body["l_name"],
            req.body["start_date"],
            req.body["end_date"] || null
        ];
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows[1]})
        })
    })
    .put(function(req, res) {
        var data = [
            req.body["f_name"],
            req.body["l_name"],
            req.body["start_date"],
            req.body["end_date"] || null,
            req.body["id"]
        ];
        var query = getQuery("updateStaff");
        query += getQuery("getStaff");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows[1]});
        })
    });

function getQuery(type, noSemiColon) {
    var query = "";
    switch(type) {
        case "updateStaff":
            query = "UPDATE staff SET f_name=?,l_name=?,start_date=?,end_date=? WHERE staff_id =?";
            break;
        case "getStaff":
            query = "SELECT staff_id,f_name,l_name,DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date FROM staff";
            break;
        case "insertStaff":
            query = "INSERT INTO staff (f_name,l_name,start_date,end_date) VALUES (?,?,?,?)";
            break;
    }
    if (!noSemiColon) {
        query += ";";
    }
    return query;
}

module.exports = router;
