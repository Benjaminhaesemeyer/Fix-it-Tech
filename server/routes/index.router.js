var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');

// Login Stuff
router.get('/auth/google', passport.authenticate('google', {scope : ['openid', 'email'], prompt: 'select_account'}));

router.get('/auth/google/callback',
  passport.authenticate('google'),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//Landing Page Stuff
//Get for all events for that user to show up on the DOM
router.get('/events', function(req, res){
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
      var queryText = 'SELECT * FROM "events"';
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
          var data = {events: result.rows};
          res.send(data);
        }
      }); // end query

    } // end else
  }); // end pool
  // } else {
  //   res.sendStatus(401);
  // }
}); // end of GET

//Post to add email to database to get the newsletter
//Post for the admin to add a new volunteer to the database
router.post('/newsletter', function(req, res){
  var newsletter = req.body;
  console.log('Post route called to', email);
  // if(req.isAuthenticated()) {
    // errorConnecting is bool, db is what we query against,
    // done is a function that we call when we're done
    pool.connect(function(errorConnectingToDatabase, db, done){
      if(errorConnectingToDatabase) {
        console.log('Error connecting to the database.', req.body);
        res.sendStatus(500);
      } else {
        //method that passport puts on the req object returns T or F
        // Now we're going to GET things from the db
        var queryText = 'INSERT INTO "email" ("first_name", "last_name", ' +
        '"email")' +
            ' VALUES ($1, $2, $3);';
        // errorMakingQuery is a bool, result is an object
        db.query(queryText, [newsletter.first_name, newsletter.last_name, newsletter.email], function(errorMakingQuery, result){
          done();
          if(errorMakingQuery) {
            console.log('Attempted to query with', queryText);
            console.log('Error making query');
            res.sendStatus(500);
          } else {
            // console.log(result);
            // Send back the results
            var data = {newletter: result.rows};
            res.send(data);
          }
        }); // end query

      } // end else
    }); // end pool
  // } else {
  //   res.sendStatus(401);
  // }
}); // end of POST



// Handle index file separately
// Also catches any other request not explicitly matched elsewhere
router.get('/', function(req, res) {
  console.log('request for index');
  res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.get('/*', function(req, res) {
  console.log('404 : ', req.params);
  res.sendStatus(404);
});

module.exports = router;
