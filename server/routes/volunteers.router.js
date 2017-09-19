var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var pool = require('../modules/pool.js');
var ADMIN = 1;
var USER = 2;

//Get for all events for that user to show up on the DOM
router.get('/', function(req, res){
  if(req.isAuthenticated() && ((req.user.role === USER) || (req.user.role === ADMIN))) {
    console.log('authentication succeeded');
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.');
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'SELECT * FROM "volunteers"';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query');
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results
            var data = {volunteers: result.rows};
            res.send(data);
          }
        }); // end query

      } // end else
    }); // end pool
  } else {
    console.log('authentication failed');
    res.sendStatus(401);
  }
}); // end of GET

router.get('/getSkills', function(req, res){
  // if(req.isAuthenticated()) {
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.');
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'SELECT * FROM "skills"';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query');
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results
            var data = {skills: result.rows};
            res.send(data);
          }
        }); // end query

      } // end else
    }); // end pool
  // } else {
  //   res.sendStatus(401);
  // }
}); // end of GET

router.get('/getSkills/:id', function(req, res){
  if(req.isAuthenticated()) {
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    var userId = req.params.id;
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.');
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'SELECT "skillsprofile"."volunteer_id", "skillsprofile"."skill_id", "skillsprofile"."proficiency_id", "skillsprofile"."id", "skills"."skill" FROM "skillsprofile" ' +
        'JOIN "skills" ON "skillsprofile"."skill_id" = "skills"."id" ' +
        'JOIN "proficiency" ON "skillsprofile"."proficiency_id" = "proficiency"."id" ' +
        'WHERE "skillsprofile"."volunteer_id" = $1';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, [userId], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query', errorMakingQuery);
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results
            var data = {skills: result.rows};
            res.send(data);
          }
        }); // end query

      } // end else
    }); // end pool
  } else {
    res.sendStatus(401);
  }
}); // end of GET


router.put('/edit/', function(req, res){
  if(req.isAuthenticated()) {
  var volunteer = req.body;
  console.log('Put route called to event of', volunteer);
  // errorConnecting is bool, db is what we query against,
  // done is a function that we call when we're done
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.', people);
      res.sendStatus(500);
    } else {
      var queryText = 'UPDATE "volunteers" SET "first_name"=$1, "last_name"=$2, "email"=$3, ' +
      '"phone"=$4, "organization"=$5, "role"=$6, "status"=$7, "heard_about"=$8, "follow_up"=$9,' +
       '"why_volunteer"=$10, "previous_experience"=$11 WHERE "id"= $12' ;
      // errorMakingQuery is a bool, result is an object
      db.query(queryText,[volunteer.first_name, volunteer.last_name, volunteer.email, volunteer.phone,
        volunteer.organization, volunteer.role, volunteer.status, volunteer.heard_about,
        volunteer.follow_up, volunteer.why_volunteer, volunteer.previous_experience, volunteer.id], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query', errorMakingQuery);
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results at this point
            var data = {volunteers: result.rows};
            res.send(data);
          }
        }); // end query
        } // end if
    }); // end pool
  } else {
      res.sendStatus(401);
    }
  }); // end of PUT - edit event admin

//Post for the admin to add a new volunteer to the database
router.post('/add', function(req, res){
  var av = req.body;
  console.log('Post route called to', av);
  if(req.isAuthenticated()&& req.user.role === ADMIN) {
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.', req.body);
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'INSERT INTO "volunteers" ("first_name", "last_name", ' +
         '"phone", "organization", "role", "status")' +
            ' VALUES ($1, $2, $3, $4, $5, $6, $7);';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, [av.first_name, av.last_name, av.phone, av.organization, av.role, av.status], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query');
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results
            var data = {volunteer: result.rows};
            res.send(data);
          }
        }); // end query
      } // end else
    }); // end pool
  } else {
    res.sendStatus(401);
  }
}); // end of POST

//post route for volunteer to add their own profile
router.post('/newVolunteer', function(req, res){
  if(req.isAuthenticated()&& req.user.role === USER) {
  var newVolunteer = req.body;
  console.log('Post route called to', newVolunteer);
  console.log('req.user:', req.user);

    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.', req.body);
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'UPDATE "volunteers" SET "first_name" = $1, "last_name" = $2, ' +
        '"phone" = $3, "organization" = $4, "status" = $5, "heard_about" = $6, "follow_up" = $7, "why_volunteer" = $8, "previous_experience" = $9' +
            ' WHERE "id" = $10 RETURNING id;';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, [newVolunteer.firstName, newVolunteer.lastName, newVolunteer.phone, newVolunteer.organization, newVolunteer.status, newVolunteer.heard_about, newVolunteer.follow_up, newVolunteer.why_volunteer, newVolunteer.previous_experience, req.user.id], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query:', errorMakingQuery);
            res.sendStatus(500);
          } else {
            console.log('result:', result);
            // console.log(result);
            // Send back the results
            var data = {newVolunteer: result.rows};
            res.send(data);
          }
        }); // end query
      } // end else
    }); // end pool
  } else {
    res.sendStatus(401);
  }
}); // end of POST

//post route for volunteer to add their own profile  -- Is this an ADMIN route?
router.post('/newVolunteer/admin', function(req, res){
  if(req.isAuthenticated()&& req.user.role === ADMIN) {
  var newVolunteer = req.body;
  console.log('Post route called to', newVolunteer);
  console.log('req.user:', req.user);
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.', req.body);
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'INSERT INTO "volunteers" ("first_name", "last_name", "phone", "organization", "status", "heard_about", "follow_up", "why_volunteer", "previous_experience", "email") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)' +
            'RETURNING id;';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, [newVolunteer.first_name, newVolunteer.last_name, newVolunteer.phone, newVolunteer.organization, newVolunteer.status, newVolunteer.heard_about, newVolunteer.follow_up, newVolunteer.why_volunteer, newVolunteer.previous_experience, newVolunteer.email], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query:', errorMakingQuery);
            res.sendStatus(500);
          } else {
            console.log('result:', result);
            // console.log(result);
            // Send back the results
            var data = {newVolunteer: result.rows};
            res.send(data);
          }
        }); // end query
      } // end else
    }); // end pool
  } else {
    res.sendStatus(401);
  }
}); // end of POST

//post route for volunteer to add/update their skill levels
router.post('/skill', function(req, res){
  if(req.isAuthenticated()&& req.user.role === USER) {
  var skill = req.body;
  console.log('Post route called to', skill);

    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.', req.body);
        res.sendStatus(500);
      } else {
        for (var i = 0; i < skill.proficiency.length; i++) {
          var queryText = '';
          var queryObjects = [];
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        // var queryText = 'INSERT INTO "skillsprofile" ("skill_id", "volunteer_id", "proficiency_id") VALUES ($1, $2, $3);';

        // INSERT INTO the_table (id, column_1, column_2)
        // VALUES (1, 'A', 'X'), (2, 'B', 'Y'), (3, 'C', 'Z')
        // ON CONFLICT (id) DO UPDATE
        //   SET column_1 = excluded.column_1,
        //       column_2 = excluded.column_2;
        if (skill.proficiency[i].profile_id === undefined) {
          queryText = 'INSERT INTO "skillsprofile" ("skill_id", "volunteer_id", "proficiency_id") VALUES ($1, $2, $3);';
          queryObjects = [skill.proficiency[i].id, skill.volunteerId, skill.proficiency[i].proficiency];
        } else {
          queryText = 'UPDATE "skillsprofile" SET "proficiency_id" = $1 WHERE "id" = $2;';
          queryObjects = [skill.proficiency[i].proficiency, skill.proficiency[i].profile_id];
        }
        // var queryText = 'INSERT INTO "skillsprofile" ("skill_id", "volunteer_id", "proficiency_id") VALUES ($1, $2, $3) ' +
        // 'ON CONFLICT (UPDATE "skillsprofile" ("skill_id", "volunteer_id", "proficiency_id") VALUES ($1, $2, $3);';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, queryObjects, function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query:', errorMakingQuery);
            // res.sendStatus(500);
          } else {
            console.log(result);
            // Send back the results
            // var data = {skill: result.rows};
            // res.send(data);
          }
        });
        } // end query
          res.sendStatus(200);

      } // end else
    }); // end pool
  } else {
    res.sendStatus(401);
  }
}); // end of POST

//Get for all events for that user to show up on the DOM
router.get('/filter/:skill_id', function(req, res){
  if(req.isAuthenticated() && ((req.user.role === USER) || (req.user.role === ADMIN))) {
    console.log('authentication succeeded');
    var skill_id = req.params.skill_id;
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.');
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'SELECT * FROM "skillsprofile" ' +
        'JOIN "volunteers" ON "volunteers"."id" = "skillsprofile"."volunteer_id" ' +
        'WHERE "skillsprofile"."skill_id" = $1 AND "skillsprofile"."proficiency_id" ' +
        'between 1 AND 2;';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, [skill_id], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query');
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results
            var data = {volunteers: result.rows};
            res.send(data);
          }
        }); // end query

      } // end else
    }); // end pool
  } else {
    console.log('authentication failed');
    res.sendStatus(401);
  }
}); // end of GET

module.exports = router;
