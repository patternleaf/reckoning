<?php

require_once('TwitterAPIExchange.php');

$credentials = array();

require_once('../../credentials/twitter.php');

$url = 'https://api.twitter.com/1.1/'.$_GET['endpoint'].'.json';
$requestMethod = 'GET';

$query = array();
foreach ($_GET as $key => $value) {
	if ($key != 'endpoint') {
		$query[$key] = $value;
	}
}
// echo '<pre>';print_r($credentials['twitter']); echo '</pre>';

$twitter = new TwitterAPIExchange($credentials['twitter']);

echo $twitter
	->setGetfield('?'.http_build_query($query))
	->buildOauth($url, 'GET')
	->performRequest();