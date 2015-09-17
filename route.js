var bodyParser = require('body-parser');
var User = require('./private/db/user.js');
var Session = require ('./private/session.js');
module.exports = function (app, db, log) {
	var userAuth = new User(db, log);
	var sess = new Session(log);
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(function (req, res, next) {
		var sess_id = req.cookies.session;

		req.username = sess.get(sess_id);

		if (req.username === void 0) {
			if (req.path === '/login' || 
				req.path.split('/')[1] === 'assets' ||
				req.path === '/do/login') {
				return next();
			}
			log('Redirecting to login..');
			res.redirect('/login');
			return;
		}
		next();
	})

	app.get('/', function (req, res) {
		log("\nSending index.html");
		res.sendFile(__dirname + '/public/index.html');
	})

	app.get('/login', function (req, res) {
		log("\nSending login.html");
		res.sendFile(__dirname + '/public/login.html');
	});

	app.get('/assets/:type/:file', function (req, res) {
		var type = req.params.type;
		var file = req.params.file;

		//log("Sending Asset:", type + "/" + file);

		res.sendFile(__dirname + '/public/assets/' + type + "/" + file);
	});

	app.post('/do/login', function (req, res) {
		userAuth.validateLogin(req.body.username, req.body.password, function (err, result) {
			if (err) {
				log(err);
			} else {
				var id = sess.create(res);
				res.cookie("session", id);
				log(result);
			}
			res.redirect('/');
		});
	});

}