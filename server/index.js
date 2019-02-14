const express = require('express');
const cardRoutes = require('./routes/cards');
const userRoutes = require('./routes/users');
const swig = require('swig')
const app = express();
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const models = require('./database/models');
const passportConfig = require('./passport/config');
const PORT = 1337;
const seed = require('./database/seed');

// Sync models to database and seed data for development
// models.sequelize.sync({ force: true })
// .then(() => {
//     console.log('Database models are fine');
// }).then(() => {
//     return Promise.all(seed.userData.map(data => models.user.create(data))); // Seed user data
// }).then(() => {
//     return Promise.all(seed.cardData.map((data) => models.card.create(data))); // Seed card data
// }).then(() => {
//     return Promise.all(seed.userCardData.map(data => models.userCard.create(data))); // Seed wishlist data
// }).catch((error) => {
//     console.log(error);
// });

app.set('view engine', 'html');
app.set('view options', { layout: false });

app.set('views', __dirname + "/views"); // Public file service
app.engine('html', swig.renderFile);
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true })); // Attaches parsed incoming request body to req.body
app.use(bodyParser.json()); // Parses body to JSON

app.use(session({
    secret: 'Qd4p!jk23$601#',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/', express.static(__dirname + '/public'));

app.listen(PORT, () => {
    console.log('Server is listening on port ' + PORT);
});

// Passport configuration
passport.serializeUser(passportConfig.serialize);
passport.deserializeUser(passportConfig.deserialize);

const LocalStrategy = require('passport-local').Strategy;

// Configure strategies
passport.use('signup-local', new LocalStrategy({ passReqToCallback: true }, passportConfig.signupLocal));
passport.use('login-local', new LocalStrategy({ passReqToCallback: true }, passportConfig.loginLocal));

const authRoutes = require('./routes/auth')(passport);

// Assign routes
app.use('/auth', authRoutes);
app.use('/cards', cardRoutes);
app.use('/users', userRoutes);

// GET request for the home page
app.get('/', (req, res) => {
    res.render('index.html');
});

// Catches routes not found in previous code and sets status 404
// Also forwards this error to the next error handling middleware
app.use('/', (req, res, next) => {
    const err = new Error('404 Not Found');
    err.status = 404;
    next(err);
});

// Error handling middleware
// Takes in error objects thrown and passed with next()
// and renders an error page
app.use((error, req, res, next) => {
    console.log('Inside error middleware');
    // If the status is not previously set, make it 500
    res.status(error.status || 500);
    res.send(error.message)
    // Do I need to call next() here?
    // next();
});