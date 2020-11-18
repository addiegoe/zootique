var express = require("express");
var router = express.Router();
var mysql = require("../dbconfig");

router.route("/")
    .get(function(req, res) {
        var append  = "";
        if (!req.query.filter) {
            append += ";";
        } else if (req.query.filter == "open") {
            append += " WHERE r.is_completed = 0;";
        } else if (req.query.filter == "closed") {
            append += " WHERE r.is_completed = 1;";
        }
        var query = getQuery("allReservations", true) + append;
        query += getQuery("allAccessories");
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                console.log('here')
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var data = [
            req.body["rental_id"],
            req.body["date"],
            req.body["is_completed"],
            req.body["animal"],
            req.body["time"],
            req.body["staff_id"],
            req.body["cost"],
            req.body["customer_id"]
        ];

        var query = getQuery("insertReservation");
        if (!Number(req.body["is_completed"])) {
            data.push(1);
            data.push(req.body["animal"]);
            query += getQuery("updateAnimalById");
        }
        query += getQuery("allReservations");
        query += getQuery("allAccessories");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            var results = [];
            if (!Number(req.body["is_completed"])) {
                results.push(rows[2]);
                results.push(rows[3]);
            } else {
                results.push(rows[1]);
                results.push(rows[2]);
            }
            res.json({"payload": results});
        });
    })
    .put(function(req, res) {
        var data = [
            Number(req.body["is_completed"]),
            req.body["id"],
            Number(req.body["is_completed"]) == 1 ? 0 : 1,
            req.body["animal_name"]
        ];
        var query = getQuery("updateReservation");
        query += getQuery("updateAnimalByName");
        query += getQuery("allReservations");
        query += getQuery("allAccessories");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            var results = [];
            results.push(rows[2]);
            results.push(rows[3]);
            res.json({"payload": results});
        });
    })

router.route("/rental")
    .get(function(req, res) {
        var query = getQuery("allRentalTypes");
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                console.log(err)
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var data = [
            req.body.type
        ];
        var query = getQuery("insertRentalType");
        query += getQuery("allRentalTypes");
        mysql.pool.query(query, data, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows[1]});
        });
    })

function getQuery(type, noSemiColon) {
    var query = "";
    switch(type) {
        case "allReservations":
            query = "SELECT r.reservation_id AS id, rt.type AS type, DATE_FORMAT(date, '%Y-%m-%d') AS date, a.name AS animal, r.time, r.cost, r.is_completed, c.f_name AS c_fname, c.l_name AS c_lname, s.f_name AS s_fname, s.l_name AS s_lname FROM reservation r INNER JOIN customer c ON r.customer_id = c.customer_id INNER JOIN staff s ON r.staff_id = s.staff_id INNER JOIN animal a ON r.animal_id = a.animal_id INNER JOIN rental_type rt ON r.rental_id = rt.rental_id";
            break;
        case "allAccessories":
            query = "SELECT r.reservation_id,a.animal_id,acc.name FROM reservation r INNER JOIN animal a ON r.animal_id = a.animal_id INNER JOIN animal_accessory ON a.animal_id = animal_accessory.animal_id JOIN accessory acc ON acc.accessory_id = animal_accessory.accessory_id ORDER BY r.reservation_id";
            break;
        case "insertReservation":
            query = "INSERT INTO reservation (rental_id,date,is_completed,animal_id,time,staff_id,cost,customer_id) VALUES (?,?,?,?,?,?,?,?)";
            break;
        case "insertRentalType":
            query = "INSERT INTO rental_type (type) VALUES (?)";
            break;
        case "allRentalTypes":
            query = "SELECT * FROM rental_type ORDER BY type";
            break;
        case "updateReservation":
            query = "UPDATE reservation SET is_completed=? WHERE reservation_id=?";
            break;
        case "updateAnimalByName":
            query = "UPDATE animal SET is_rented=? WHERE name=?";
            break;
        case "updateAnimalById":
            query = "UPDATE animal SET is_rented=? WHERE animal_id=?";
            break;
    }

    if (!noSemiColon) {
        query += ";";
    }
    return query;
}
module.exports = router;
