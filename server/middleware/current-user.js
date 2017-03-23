module.exports = function() {
	return function tracker(req, res, next) {
		//if there is no token, then we won't be able to find a user. Skip
		if (!req.accessToken) return next();

		//lookup the user by token on request
		req.app.models.CustomUser.findById(req.accessToken.userId).then(user =>{
			//if we couldn't find the user for the token, throw an error
			if (!user) {
				return next(
					new Error('No user with this access token was found.')
				);
			}

			//if we found the user, set it in places that can be accessed throughout the request
			res.locals.currentUser = user;
			next();
		}).catch(err => next(err));
	};
};
