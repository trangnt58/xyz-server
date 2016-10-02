// Set up
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {

    // ejs render automatically looks in the views folder
    res.render('index');
});

// Configuration
//mongoose.connect('mongodb://localhost/reviewking');
mongoose.connect('mongodb://xyz:xyz@ds059644.mlab.com:59644/xyz');
 
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());
 
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
 
var wordSchema = new mongoose.Schema({
    id: String,
    content: String,
    meaning: String,
    sound_us: String,
    sound_uk: String,
    images: Object,
    unit_id: String,
    category_id: String
 },{collection: 'word'})
// Models
var Word = mongoose.model('Word', wordSchema);

var recordSchema = new mongoose.Schema({
    //id: Number,
    user_id: Number,
    word_id: String,
    url: String
}, {collection: 'records'})

var Record = mongoose.model('Record', recordSchema);


//Category Schema
var categorySchema = new mongoose.Schema({
    id: String,
    name: String,
    image: String
}, {collection: 'category'});
var Category = mongoose.model('Category',categorySchema);
 
// Routes

 // Get all category
    app.get('/api/category', function(req, res) {
        // use mongoose to get all words in the database
        Category.find(function(err, words) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(words); // return all reviews in JSON format
        });
    });
    
    // Get all words
    app.get('/api/words', function(req, res) {
        // use mongoose to get all words in the database
        Word.find(function(err, words) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
            res.json(words); // return all reviews in JSON format
        });
    });

     app.get('/api/category/:category_id', function(req, res) {     
        var query = Word.find({ 'category_id': req.params.category_id });
           query.exec(function (err, category) {
              if (err) return handleError(err);
              res.send(category) // Space Ghost is a talk show host.
            })
    });

    
    //Get records
    app.get('/api/records', function(req, res) {
        Record.find(function(err, records) {
            if (err)
                res.send(err)
            res.json(records); 
        });
    });

     // create new records
    app.post('/api/records', function(req, res) { 
        Record.create({
            user_id : 1,
            word_id : req.body.word_id,
            url: req.body.url,
        }, function(err, record) {
            if (err)
                res.send(err);
             Record.find(function(err, records) {
                if (err)
                    res.send(err)
                res.json(records);
            });
        });
 
    });


 
    // create review and send back all reviews after creation
    app.post('/api/reviews', function(req, res) {
 
        console.log("creating review");
 
        // create a review, information comes from AJAX request from Ionic
        Review.create({
            title : req.body.title,
            description : req.body.description,
            rating: req.body.rating,
            done : false
        }, function(err, review) {
            if (err)
                res.send(err);
 
            // get and return all the reviews after you create another
            Review.find(function(err, reviews) {
                if (err)
                    res.send(err)
                res.json(reviews);
            });
        });
 
    });
 
    // delete a review
    app.delete('/api/reviews/:review_id', function(req, res) {
        Review.remove({
            _id : req.params.review_id
        }, function(err, review) {
 
        });
    });
 

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});