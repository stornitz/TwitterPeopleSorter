exports.twitterOauthKeys = {
	consumer_key:		'',
	consumer_secret:	'',
	access_token:		'',
	access_token_secret:''
}

// Twitter @
exports.screenName = '';

exports.scores = {
	too_many_followings: 3,
	not_enough_followings: 1,

	too_many_followers: 0,
	not_enough_followers: 1,

	exceeded_ratio: 1,
	under_ratio: 1,

	blacklisted_words_in_desc: 2,
	empty_desc: 1,

	too_many_tweets: 1,
	not_enough_tweets: 3,

	last_tweet_too_old: 2
}

// -1 to disable
exports.settings = {
	score_unfollow: 10,
	score_check: 5,

	max_followings: 500,
	min_followings: 5,

	max_followers: -1,
	min_followers: 1,

	max_ratio_followings_followers: 5/1,
	min_ratio_followings_followers: -1,

	blacklisted_words: [],
	empty_desc: 1, // empty if less (or equal) than x characters...

	max_tweets: -1,
	min_tweets: 5,

	last_tweet: 60*60*24*30, // in second. Ex: 1 day old => 60*60*24
}