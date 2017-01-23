var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');

var app = module.exports = loopback();

// configure view handler
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.start = function() {
	// start the web server
	return app.listen(function() {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath;
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
		}
	});
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
	if (err) throw err;

  // start the server if `$ node server.js`
	if (require.main === module) {
		const application = app.start();

		app.io = require('socket.io')(application);
		app.io.on('connection', socket => {
			app.io.emit('stuff', 'message');

			console.log('a user connected');

			socket.on('disconnect', () => {
				console.log('user disconnected');
			});
			socket.on('join-channel', room => {
				socket.join(room);
			});
			socket.on('leave-channel', room => {
				socket.leave(room);
			});
		});
	}
});
