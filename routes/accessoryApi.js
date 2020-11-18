var express = require("express");
var router = express.Router();
var mysql = require("../dbconfig");

router.route("/")
    .get(function(req, res) {
        var query = getQuery("getAccessories");
        query += getQuery("getAnimalAccessories");
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var data = [
            req.body.name
        ];
        var query = getQuery("insertAccessory");
        query += getQuery("getAccessories");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows[1]});
        });
    })
    .delete(function(req, res) {
        var results = [];
        var query = getQuery("deleteAccessoryFromAnimalId");
        query += getQuery("deleteAccessory");
        query += getQuery("getAccessories");
        query += getQuery("getAnimalAccessories");
        mysql.pool.query(query, [req.body.id, req.body.id], function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            results.push(rows[2]);
            results.push(rows[3]);
            res.json({"payload": results});
        });
    })
    .put(function(req, res) {
        var data = [
            req.body["name"],
            req.body["id"]
        ];
        var query = getQuery("updateAccessory");
        query += getQuery("getAccessories");
        query += getQuery("getAnimalAccessories");
        mysql.pool.query(query, data, function(err, rows) {
            var results = [];
            if (err) {
                res.status(400).json({"error": err});
            }
            results.push(rows[1]);
            results.push(rows[2]);
            res.json({"payload": results});
        })
    });

router.route("/animal")
    .get(function(req, res) {
        var query = getQuery("getAnimalAccessories");
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }

            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var data = [
            req.body["animal-id"],
            req.body["accessory-id"]
        ];
        var query = getQuery("insertAnimalAccessory");
        query += getQuery("getAnimalAccessories");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows[1]});
        });
    })
    .delete(function(req, res) {
        var data = [
            req.body["accessory_id"],
            req.body["animal_id"]
        ];
        var query = getQuery("deleteAccessoryFromAnimal");
        query += getQuery("getAnimalAccessories");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows[1]});
        });
    })

router.route("/diff")
    .get(function(req, res) {
        var data = [
            req.query.id || ""
        ];
        var query = getQuery("getNotApplicableAcc");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        })
    })

function getQuery(type) {
    var query = "";
    switch(type) {
        case "getAnimalAccessories":
            query = "SELECT a.animal_id AS animal_id, a.name AS animal_name, acc.accessory_id AS accessory_id, acc.name AS accessory_name FROM animal a INNER JOIN animal_accessory aa ON a.animal_id = aa.animal_id INNER JOIN accessory acc ON aa.accessory_id = acc.accessory_id ORDER BY a.animal_id;";
            break;
        case "getAccessories":
            query = "SELECT * FROM accessory;";
            break;
        case "deleteAccessoryFromAnimal":
            query = "DELETE FROM animal_accessory WHERE accessory_id=? AND animal_id=?;";
            break;
        case "deleteAccessoryFromAnimalId":
            query = "DELETE FROM animal_accessory WHERE accessory_id=?;";
            break;
        case "deleteAccessory":
            query = "DELETE FROM accessory WHERE accessory_id=?;";
            break;
        case "getNotApplicableAcc":
            query = "SELECT acc.accessory_id, acc.name FROM accessory acc WHERE acc.accessory_id NOT IN (SELECT an.accessory_id FROM animal_accessory an WHERE an.animal_id = ?);";
            break;
        case "insertAnimalAccessory":
            query = "INSERT INTO animal_accessory (animal_id, accessory_id) VALUES (?,?);"
            break;
        case "insertAccessory":
            query = "INSERT INTO accessory (name) VALUES (?);";
            break;
        case "updateAccessory":
            query = "UPDATE accessory SET name=? WHERE accessory_id=?;";
            break;
    }
    return query;
}

module.exports = router;
