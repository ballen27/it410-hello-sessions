// include modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var localstrategy = require('passport-local').Strategy;
var passport = require('passport');
var session = require('express-session');

// initialize express app
var app = express();
var users = [];

// var database = {};

// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new LocalStrategy(function(username, password, done) {
    if (!users.hasOwnProperty(username)) {
        users[username] = {
            username: username,
            password:password,
            pairs:{}
        };
        return done(null, { username: username, pairs: users[username] });
    }
    return done(null,users[username]);
}));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
    done(null, user);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// tell the express app what middleware to use
app.use(cookieParser());
app.use(session({secret: 'poots', resave: false, saveUninitialized: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());


// health check
app.get('/health', function(req, res) {
        return res.sendStatus(200);
    }
);

// home page
app.get('/', function(req, res) {
        if (req.user) {
            return res.send(req.user.keys);
        }
        return res.sendStatus(401);
    }
);

app.put('/', function(req, res) {
        if (!req.user) {
            return res.sendStatus(401);
        }

        // save in the session
        Object.assign(req.user.keys, req.query);

        // save in the "database"
        for (var i = 0; i < users.length; i++) {
            if (users[i].username == req.user.username) {
                Object.assign(users[i].keys, req.query);
            }
        }

        return res.send(req.user.keys);
    }
);

app.delete('/',
    function(req, res) {
        if (!req.user) {
            return res.sendStatus(401);
        }
        delete req.user.keys[Object.keys(req.params.key)[0]];
        return res.send(req.user.keys);
    }
);

// specify the login url
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        res.status(200).send(req.user.keys);
    }
);

// log the user out
app.get('/logout',
    function(req, res) {
        req.logout();
        res.send('You have logged out.');
    }
);

// start the server listening
app.listen(3000, function() {
    console.log('Server listening on port 3000.');
});