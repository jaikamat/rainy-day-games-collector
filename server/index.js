const express = require('express');
const cardRoutes = require('./routes/cards')
const swig = require('swig')
const app = express();
const morgan = require('morgan');
const PORT = 1337;

// server code
app.set('view engine', 'html');

app.set('view options', {
    layout: false
});

app.set('views', __dirname + "/views");
app.engine('html', swig.renderFile);
app.use('/', express.static(__dirname + '/public'));
app.use(morgan('combined'));


app.listen(PORT, () => {
    console.log('Server is listening on port ' + PORT);
})

app.use('/cards', cardRoutes);

// GET request for the home page
app.get('/', (req, res) => {
    res.render('index.html');
})

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
app.use((err, req, res, next) => {
    // If the status is not previously set, make it 500
    res.status(err.status || 500);
    res.render('error.html');
    // Do I need to call next() here?
    // next();
});