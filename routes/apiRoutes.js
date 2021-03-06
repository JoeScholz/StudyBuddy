var db = require("../models");
var passport = require("../config/passport");

// Use CRUD function to add, read, update, and delete class options
module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    db.User.findOne({
      where: {
        email: req.body.email
      }
    }).then(function(result) {
      res.json("/members/" + result.id);
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    db.User.create({
      email: req.body.email,
      password: req.body.password
    })
      .then(function(result) {
        res.json("/");
      })
      .catch(function(err) {
        console.log(err);
        res.json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });
  // Survey Post
  // POST route for saving a new survey
  app.post("/api/survey", function(req, res) {
    var userData = {
      name: req.body.name,
      email: req.body.email,
      html: parseInt(req.body.html, 10),
      css: parseInt(req.body.css, 10),
      javascript: parseInt(req.body.javascript, 10),
      UserId: parseInt(req.body.UserId, 10)
    };
    db.Survey.findAll({
      where: {
        html: userData.html,
        css: userData.css,
        javascript: userData.javascript
      }
    }).then(function(result) {
      const match = result.pop();
      userData.matchId = parseInt(match.id, 10);
      db.Survey.create(userData).then(function() {
        res.redirect(`/members/${userData.UserId}`);
      });
    });
  });

  // FindOne
  app.get("/api/survey/:id", function(req, res) {
    db.Survey.findOne({
      where: {
        UserId: req.params.id
      }
    }).then(function(dbSurvey) {
      res.json(dbSurvey);
    });
  });
};
