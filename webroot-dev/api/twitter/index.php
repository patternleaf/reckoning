<?php

require_once('TwitterAPIExchange.php');

$credentials = array();

require_once('../../credentials/twitter.php');

$url = 'https://api.twitter.com/1.1/search/tweets.json';
$requestMethod = 'GET';

// echo '<pre>';print_r($credentials['twitter']); echo '</pre>';

$twitter = new TwitterAPIExchange($credentials['twitter']);

echo $twitter
	->setGetfield('?'.http_build_query($_GET))
	->buildOauth($url, 'GET')
	->performRequest();