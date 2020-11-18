var express = require("express");
var router = express.Router();
var mysql = require("../dbconfig");

router.route("/")
    .get(function(req, res) {
        var append = "";
        if (req.query.filter && req.query.filter == "available") {
            append += " WHERE animal.is_rented = 0";
        } else if (req.query.filter && req.query.filter == "unavailable") {
            append += " WHERE animal.is_rented = 1";
        }
        var query = getQuery("getAnimals", true) + append + " ORDER BY animal_type.name";
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                console.log('here', err)
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var data = [
            req.body.name,
            req.body.type,
            Number(req.body.breed) || null,
            req.body.cost
        ];
        var query = getQuery("insertAnimal"); 
        mysql.pool.query(query, data, function(err) {
            if (err) {
                res.status(400).json({"erorr": err});
            }
            var query2 = getQuery("getAnimals", true) + " ORDER BY animal_type.name";
            mysql.pool.query(query2, function(err, rows) {
                if (err) {
                    res.status(400).json({"error": err});
                }
                res.json({"payload": rows});
            });
        });
    });

router.route("/type")
    .get(function(req, res) {
        mysql.pool.query(getQuery("getTypes"), function(err, rows) {
            if (err) {
                res.status(400).send({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var query = getQuery("insertType");	
        mysql.pool.query(query, [req.body.type_name], function(err) {
            mysql.pool.query(getQuery("getTypes"), function(err, rows) {
                if (err) {
                    res.status(400).json({"error": err});
                }
                res.json({"payload": rows});
            });
        });
    });

router.route("/breed")
    .get(function(req, res) {
        var append = "";
        var query = "";
        if (req.query.filter) {
            var id = req.query.filter;
            append = " WHERE type_id =" + id; 
            query = getQuery("getBreedByCriteria", true) + append;
        } else {
            query = getQuery("getBreedAndType");
        }
        mysql.pool.query(query, function(err, rows) {
            if (err) {
                res.status(400).json({"error": err});
            }
            res.json({"payload": rows});
        });
    })
    .post(function(req, res) {
        var breed = req.body.breed_name;
        var type = [req.body.type_id];
        if (req.body.type_id == 0) {
            type = "NULL";
        }
        var data = [
            breed,
            type
        ];
        var query = getQuery("insertBreed");
        mysql.pool.query(query, data, function(err) {
            mysql.pool.query(getQuery("getBreeds"), function(err, rows) {
                if (err) {
                    res.status(400).json({"error": err});
                }
                res.json({"payload": rows});
            });
        });
    })
    .put(function(req, res) {
        var data = [
            req.body["breed_name"],
	        Number(req.body["type_name"]) || null,
            req.body["id"]
        ];
        var query = getQuery("updateBreed");
        mysql.pool.query(query, data, function(err, rows) {
            var query2 = getQuery("getBreedAndType")
            mysql.pool.query(query2, function(err, rows) {
                if (err) {
                    res.status(400).json({"error": err});
                }
                res.json({"payload": rows});
            });
        });
    });


function getQuery(type, noSemiColon) {
    var query = "";
    switch(type) {
        case "updateBreed":
            query = "UPDATE animal_breed SET name=?,type_id=? WHERE breed_id=?";
            break;
        case "insertBreed":
            query = "INSERT INTO animal_breed (name, type_id) VALUES (?,?)";
            break;
        case "insertAnimal":
            query = "INSERT INTO animal (name, type_id, breed_id, cost_per_hour) VALUES (?,?,?,?)";
            break;
        case "insertType":
            query = "INSERT INTO animal_type (name) VALUES (?)";
            break;
        case "getBreeds":
            query = "SELECT * FROM animal_breed";
            break;
        case "getBreedByCriteria":
            query = "SELECT breed_id, name FROM animal_breed";
            break;
        case "getAnimals":
            query = "SELECT animal.animal_id AS id, animal.name AS name, animal_type.name AS type, animal_breed.name AS breed, animal.cost_per_hour AS cost_per_hour FROM animal INNER JOIN animal_type ON animal_type.type_id = animal.type_id LEFT JOIN animal_breed on animal_breed.breed_id = animal.breed_id";
            break;
        case "getBreedAndType":
            query = "SELECT animal_breed.breed_id AS id, animal_breed.name AS breed_name, animal_type.name AS type_name from animal_breed LEFT JOIN animal_type ON animal_type.type_id = animal_breed.type_id";
            break;
        case "getTypes":
            query = "SELECT type_id, name FROM animal_type";
            break;
    }
    if (!noSemiColon) {
        query += ";";
    }
    return query;
};

module.exports = router;
