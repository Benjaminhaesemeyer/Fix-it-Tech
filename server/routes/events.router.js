var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var pool = require('../modules/pool.js');
var ADMIN = 1;
var USER = 2;


//Get for all events for that user to show up on the DOM
router.get('/', function(req, res){
  // errorConnecting is bool, db is what we query against,
  // done is a function that we call when we're done
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT id, event_name, event_location, event_description, TO_CHAR(event_date, \'MM/DD/YYYY\') as event_date, TO_CHAR(starting_time, \'HH:MI AM\') as starting_time, TO_CHAR(ending_time, \'HH:MI AM\') as ending_time FROM "events";';
      // errorMakingQuery is a bool, result is an object
      db.query(queryText, function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          var data = {events: result.rows};
          res.send(data);
        }
      }); // end query
    } // end else
  }); // end pool
}); // end of GET

// Create a new event - admin only
router.post('/create/', function(req, res){
  if(req.isAuthenticated() && req.user.role === ADMIN) {
    console.log('user role', req.user.role);
    var ev = req.body;
    console.log('Post route called to event of', ev);
    // errorConnecting is bool, db is what we query against,
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.', req.body);
        res.sendStatus(500);
      } else {
        var queryText = 'INSERT INTO "events" ("event_name", "event_location", "event_description", "starting_time", "ending_time", "event_date")' +
        ' VALUES ($1, $2, $3, $4, $5, $6);';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText,[ev.event_name, ev.event_location, ev.event_description, ev.starting_time,
          ev.ending_time, ev.event_date], function(errorMakingQuery, result){
            done();
            if(errorMakingQuery) {
              console.log('Attempted to query with', queryText);
              console.log('Error making query', errorMakingQuery);
              res.sendStatus(500);
            } else {
              // console.log(result);
              // Send back the results
              var data = {events: result.rows};
              res.send(data);
            }
          }); // end query
        } // end if
      }); // end pool
    } else {
      res.sendStatus(401);
    }
  }); // end of POST - create event admin

  // Edit events table - Admin only
  router.put('/edit/', function(req, res){
    if(req.isAuthenticated()&& req.user.role === ADMIN) {
      var details = req.body;
      console.log('Put route called to event of', details);
      // errorConnecting is bool, db is what we query against,
      // done is a function that we call when we're done
      pool.connect(function(errorConnectingToDatabase, db, done){
        if(errorConnectingToDatabase) {
          console.log('Error connecting to the database.', selectedEvent);
          res.sendStatus(500);
        } else {
          var queryText = 'UPDATE "events" SET "event_name"=$1, "event_location"=$2, "event_description"=$3, ' +
          '"starting_time"=$4, "ending_time"=$5, "event_date"=$6 WHERE "id"= $7' ;
          // errorMakingQuery is a bool, result is an object
          db.query(queryText,[details.event_name, details.event_location, details.event_description, details.starting_time,
            details.ending_time, details.event_date, details.id], function(errorMakingQuery, result){
              done();
              if(errorMakingQuery) {
                console.log('Attempted to query with', queryText);
                console.log('Error making query', errorMakingQuery);
                res.sendStatus(500);
              } else {
                // Send back the results
                var data = {events: result.rows};
                res.send(data);
              }
            }); // end query
          } // end if
        }); // end pool
      } else {
        res.sendStatus(401);
      }
    }); // end of PUT - edit event admin

    // delete route to delect selectedEvent -- Admin
    router.delete('/edit/:id', function(req, res){
      if(req.isAuthenticated()&& req.user.role === ADMIN) {
        var selectedEvent = req.params.id;
        console.log('Delete route called to this id', selectedEvent);
        // errorConnecting is bool, db is what we query against,
        pool.connect(function(errorConnectingToDatabase, db, done){
          if(errorConnectingToDatabase) {
            console.log('Error connecting to the database.');
            res.sendStatus(500);
          } else {
            // We connected to the database!!!
            // Now we're going to GET things from the db
            var queryText = 'DELETE FROM "events" WHERE "id" = $1;' ;
            // errorMakingQuery is a bool, result is an object
            db.query(queryText, [selectedEvent], function(errorMakingQuery, result){
              done();
              if(errorMakingQuery) {
                console.log('Attempted to query with', queryText);
                console.log('Error making query');
                res.sendStatus(500);
              } else {
                // Send back the results
                res.sendStatus(200);
              }
            }); // end query
          } // end else
        });
      } else {
        res.sendStatus(401);
      }
    });// end of DELETE - admin event delete

//Admins to take check-in Volunteers at selected event
    router.post('/attendance', function(req, res) {
      if(req.isAuthenticated()&& req.user.role === ADMIN) {
        var attendanceObject = req.body;
        console.log('recieved object on attendance route:', attendanceObject);
        pool.connect(function(errorConnectingToDatabase, db, done){
          if(errorConnectingToDatabase) {
            console.log('Error connecting to the database.', req.body);
            res.sendStatus(500);
          } else {
            // We connected to the database!!!
            // Now we're going to GET things from the db
            var queryText = 'INSERT INTO "attendance" ("volunteer_id", "event_id")' +
            ' VALUES ($1, $2);';
            // errorMakingQuery is a bool, result is an object
            db.query(queryText,[attendanceObject.volunteer.id, attendanceObject.event.id],
              function(errorMakingQuery, result){
                done();
                if(errorMakingQuery) {
                  console.log('Attempted to query with', queryText);
                  console.log('Error making query', errorMakingQuery);
                  res.sendStatus(500);
                } else {
                  // console.log(result);
                  // Send back the results
                  console.log('result from the db:', result);
                  var data = {attendance: result.rows};
                  res.send(data);
                }
              }); // end query
            }
          }); // end pool
        } else{
          res.sendStatus(401);
        }
      }); //end of post route

//
      router.get('/attendance/:id', function(req, res) {
        if(req.isAuthenticated()&& req.user.role === ADMIN) {
          var eventId = req.params.id;
          console.log('getting attendance:', eventId);
          pool.connect(function(errorConnectingToDatabase, db, done){
            if(errorConnectingToDatabase) {
              console.log('Error connecting to the database.');
              res.sendStatus(500);
            } else {
              var queryText = 'SELECT "attendance"."id" as id, "volunteer_id",' +
              '"event_id", "first_name", "last_name", "email" ' +
              'FROM "attendance" JOIN "volunteers" ' +
              'ON "attendance"."volunteer_id" = "volunteers"."id" ' +
              'WHERE "event_id" = $1;';
              // errorMakingQuery is a bool, result is an object
              db.query(queryText, [eventId], function(errorMakingQuery, result){
                done();
                if(errorMakingQuery) {
                  console.log('Attempted to query with', queryText);
                  console.log('Error making query:', errorMakingQuery);
                  res.sendStatus(500);
                } else {
                  // console.log(result);
                  // Send back the results
                  var data = {events: result.rows};
                  res.send(data);
                }
              }); // end query
            } // end else
          }); // end pool
        } else{
          res.sendStatus(401);
        }
      });

      // delete route to delect selectedEvent -- Admin
      router.delete('/attendance/:id', function(req, res){
        if(req.isAuthenticated()&& req.user.role === ADMIN) {
          var selectedEventAttendance = req.params.id;
          console.log('Delete route called to this id', selectedEventAttendance);
          pool.connect(function(errorConnectingToDatabase, db, done){
            if(errorConnectingToDatabase) {
              console.log('Error connecting to the database.');
              res.sendStatus(500);
            } else {
              var queryText = 'DELETE FROM "attendance" WHERE "id" = $1;' ;
              // errorMakingQuery is a bool, result is an object
              db.query(queryText, [selectedEventAttendance], function(errorMakingQuery, result){
                done();
                if(errorMakingQuery) {
                  console.log('Attempted to query with', queryText);
                  console.log('Error making query');
                  res.sendStatus(500);
                } else {
                  // console.log(result);
                  // Send back the results
                  res.sendStatus(200);
                }
              }); // end query
            } // end if
          }); // end of DELETE - admin event delete
        } else{
          res.sendStatus(401);
        }
      });

      // The get route the shows admins the skills of volunteers that have rsvp'd to
      // a specific event
      router.get('/rsvp/manage/:eventid', function(req, res) {
        if(req.isAuthenticated()&& req.user.role === ADMIN) {
          var eventId = req.params.eventid;
          console.log('getting attendance:', eventId);
          pool.connect(function(errorConnectingToDatabase, db, done){
            if(errorConnectingToDatabase) {
              console.log('Error connecting to the database.');
              res.sendStatus(500);
            } else {
              var queryText = 'SELECT "skillsprofile"."skill_id", "skills"."skill", "skillsprofile"."proficiency_id", ' +
              'count("skillsprofile"."volunteer_id") FROM "rsvp" JOIN "skillsprofile" ' +
              'ON "rsvp"."volunteer_id" = "skillsprofile"."volunteer_id" JOIN "skills" ON "skills"."id" = "skillsprofile"."skill_id" ' +
              'WHERE "rsvp"."event_id" = $1 GROUP BY "skillsprofile"."skill_id", ' +
              '"skillsprofile"."proficiency_id", "skills"."skill";';
              // errorMakingQuery is a bool, result is an object
              db.query(queryText, [eventId], function(errorMakingQuery, result){
                done();
                if(errorMakingQuery) {
                  console.log('Attempted to query with', queryText);
                  console.log('Error making query:', errorMakingQuery);
                  res.sendStatus(500);
                } else {
                  // console.log(result);
                  // Send back the results
                  var data = {events: result.rows};
                  var newArray = [];
                  for (var i = 0; i < 16; i++) {
                    newArray.push({skill_id : (i + 1)});
                  }
                  for (var j = 0; j < data.events.length; j++) {
                    if (data.events[j].proficiency_id == 1) {
                      newArray[data.events[j].skill_id - 1].one = data.events[j].count;
                    } else if (data.events[j].proficiency_id == 2) {
                      newArray[data.events[j].skill_id - 1].two = data.events[j].count;
                    } else if (data.events[j].proficiency_id == 3) {
                      newArray[data.events[j].skill_id - 1].three = data.events[j].count;
                    } else if (data.events[j].proficiency_id == 4) {
                      newArray[data.events[j].skill_id - 1].four = data.events[j].count;
                    } else if (data.events[j].proficiency_id == 5) {
                      newArray[data.events[j].skill_id - 1].five = data.events[j].count;
                    }
                    newArray[data.events[j].skill_id - 1].skill = data.events[j].skill;
                  }
                  console.log('newArray:', newArray);
                  res.send(newArray);
                }
              }); // end query

            } // end else
          }); // end pool
        } else{
          res.sendStatus(401);
        }
      });

      // This gets the attendance for the selected event - admin only
      router.get('/rsvp/:id', function(req, res) {
        if(req.isAuthenticated()&& req.user.role === ADMIN) {
          var eventId = req.params.id;
          console.log('getting rsvp attendance:', eventId);
          pool.connect(function(errorConnectingToDatabase, db, done){
            if(errorConnectingToDatabase) {
              console.log('Error connecting to the database.');
              res.sendStatus(500);
            } else {
              var queryText = 'SELECT "rsvp"."id" as id, "volunteer_id",' +
              '"event_id", "first_name", "last_name", "email", "phone", "organization", "role", "status" ' +
              'FROM "rsvp" JOIN "volunteers" ' +
              'ON "rsvp"."volunteer_id" = "volunteers"."id" ' +
              'WHERE "event_id" = $1;';
              // errorMakingQuery is a bool, result is an object
              db.query(queryText, [eventId], function(errorMakingQuery, result){
                done();
                if(errorMakingQuery) {
                  console.log('Attempted to query with', queryText);
                  console.log('Error making query:', errorMakingQuery);
                  res.sendStatus(500);
                } else {
                  // console.log(result);
                  // Send back the results
                  var data = {events: result.rows};
                  res.send(data);
                }
              }); // end query
            } // end else
          }); // end pool
        } else{
          res.sendStatus(401);
        }
      });


      module.exports = router;
