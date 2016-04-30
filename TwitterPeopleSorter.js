/**
 * Dependencies
 */
var Twit = require('twit');
var Config = require('./config.js'),
	scores = Config.scores,
	settings = Config.settings;

var T = new Twit(Config.twitterOauthKeys);

var nbFollowers = 0,
	toUnfollow = [],
	toCheck = [],
	nbOk = 0;


/**
 * Init function
 */
function init() {
	getFollowersId();
}


/**
 * Functions
 */
function getFollowersId() {
	//T.get('followers/ids', { screen_name: 'Stornitz', count: 50},  function (err, data, response) {	 // FOLLOWERS
	T.get('friends/ids', { screen_name: Config.screenName},  function (err, data, response) {			// FOLLOWINGS
		if(err) {
			throw err;
		}

		nbFollowers = data.ids.length;
		console.log("\x1b[35m" + '======== Début de l\'analyse de ' + nbFollowers + ' followers ========');
		getFollowersObjects(data.ids);

		setTimeout(function() {
			recap();
		}, 10*1000);
	});
}

function getFollowersObjects(ids) {
	var nbPage = Math.ceil(ids.length/100);

	for(var i = 0; i < nbPage; i++) {
		T.get('users/lookup', { user_id: ids.slice(100*i, 100*(i+1)).join()},  function (err, data, response) {
			if(err) {
				throw err;
			}

			analyzeUsers(data);
		});
	}
}

var resultType = {
	ok: "\x1b[32m" + '[OK]',
	unfollow: "\x1b[31m" + '[UNFOLLOW]',
	check: "\x1b[33m" + '[TO CHECK]'
}

function analyzeUsers(users) {
	for(index in users) {
		var user = users[index];
		var score = 0;

		// ### CHECK
		// Trop de followings
		if(~settings.max_followings && user.friends_count > settings.max_followings) {
			score += scores.too_many_followings;
			console.log('too_many_followings')
		}
		// Pas assez de followings
		if(~settings.min_followings && user.friends_count < settings.min_followings) {
			score += scores.not_enough_followings;
			console.log('not_enough_followings')
		}
		// Trop de followers
		if(~settings.max_followers && user.followers_count > settings.max_followers) {
			score += scores.too_many_followers;
			console.log('too_many_followers')
		}
		// Pas assez de followers
		if(~settings.min_followers && user.followers_count < settings.min_followers) {
			score += scores.not_enough_followers;
			console.log('not_enough_followers')
		}
		// Trop de followings par rapport au nombre de followers
		if(~settings.max_ratio_followings_followers && user.friends_count/user.followers_count+0.1 > settings.max_ratio_followings_followers) {
			score += scores.exceeded_ratio;
			console.log('exceeded_ratio')
		}
		// Pas assez de followings par rapport au nombre de followers
		if(~settings.min_ratio_followings_followers && user.friends_count/user.followers_count+0.1 < settings.min_ratio_followings_followers) {
			score += scores.under_ratio;
			console.log('under_ratio')
		}
		// Si la description contient des mots blacklistés
		if(~settings.blacklisted_words && settings.blacklisted_words.length > 0) {
			var description = user.description.split(" ");

			for(wordId in description) {
				if(description[wordId].toLowerCase() in settings.blacklisted_words.indexOf) {
					score += scores.blacklisted_words_in_desc;
					console.log('blacklisted_words_in_desc')
				}
			}
		}
		// Si la description est vide
		if(~settings.empty_desc && user.description.length <= settings.empty_desc) {
			score += scores.empty_desc;
			console.log('empty_desc')
		}
		// Trop de tweets
		if(~settings.max_tweets && user.statuses_count > settings.max_tweets) {
			score += scores.too_many_tweets;
			console.log('too_many_tweets')
		}
		// Pas assez de tweets
		if(~settings.min_tweets && user.statuses_count < settings.min_tweets) {
			score += scores.not_enough_tweets;
			console.log('not_enough_tweets')
		}
		// Dernier tweet trop vieux (ou inexistant)
		if(~settings.last_tweet && (!('status' in user) || new Date(user.status.created_at).getTime() < (new Date().getTime() - settings.last_tweet*1000))) {
			score += scores.last_tweet_too_old;
			console.log('last_tweet_too_old')
		}

		// ### SCORE
		if(score > settings.score_unfollow) {
			result = resultType.unfollow;
			toUnfollow.push(user.screen_name);
			// todo unfollow
		} else if(score > settings.score_check) {
			result = resultType.check;
			toCheck.push(user.screen_name);
			// todo log
		} else {
			result = resultType.ok;
			nbOk++;
		}

		console.log(result + " \x1b[37m" + score + " \x1b[36m" + ' @' + user.screen_name);
	}
}

function recap() {
	console.log("\x1b[35m" + '======== Récapitulatif ========' + "\x1b[0m");
	console.log('Nombre initial de followers: ' + nbFollowers)
	console.log(resultType.unfollow + "\x1b[0m" + ' : ' + toUnfollow.length);
	console.log(resultType.check + "\x1b[0m" + ' : ' + toCheck.length);
	console.log(resultType.ok + "\x1b[0m" + ' : ' + nbOk);

	console.log("\x1b[35m" + '======== ' + resultType.unfollow + "\x1b[35m" + ' ========' + "\x1b[0m");
	console.log(toUnfollow.join(', '));

	console.log("\x1b[35m" + '======== ' + resultType.check + "\x1b[35m" + ' ========' + "\x1b[0m");
	console.log(toCheck.join(', '));
}

/**
 * Init
 */
init();
