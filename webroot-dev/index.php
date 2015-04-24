<!doctype html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF8">
	<title></title>
	<link rel="stylesheet" type="text/css" href="css/app.css">
</head>
<body>

<div id="vis">
	<svg id="map" width="800" height="600">
		<g class="zoom-group">
			<g class="counties">
			</g>
			<g class="events">
			</g>
		</g>
	</svg>
	<canvas id="heatmap" width="800" height="600"></canvas>
	<canvas id="overlay" width="800" height="600"></canvas>
	<div id="images">
	</div>
</div>

<form id="query">
	<h1>Search Flickr for</h1>
	<input type="text" id="query-text"> from
	<input type="date" id="start-date" value="2014-08-01"> to
	<input type="date" id="end-date" value="2015-04-11">
	<input type="submit">
	<span id="n-results"></span>
</form>

<div id="slider"></div>

<script type="text/javascript" src="/js/vendor.js"></script>
<script type="text/javascript" src="/js/app.js"></script>

<!--
<script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.min.js"></script>

<script src="bower_components/jqrangeslider/jQRangeSliderMouseTouch.js"></script>
<script src="bower_components/jqrangeslider/jQRangeSliderDraggable.js"></script>
<script src="bower_components/jqrangeslider/jQRangeSliderHandle.js"></script>
<script src="bower_components/jqrangeslider/jQRangeSliderBar.js"></script>
<script src="bower_components/jqrangeslider/jQRangeSliderLabel.js"></script>
<script src="bower_components/jqrangeslider/jQRangeSlider.js"></script>
<script src="bower_components/jqrangeslider/jQDateRangeSliderHandle.js"></script>
<script src="bower_components/jqrangeslider/jQDateRangeSlider.js"></script>
<script src="bower_components/jqrangeslider/jQEditRangeSliderLabel.js"></script>
<script src="bower_components/jqrangeslider/jQEditRangeSlider.js"></script>

<script type="text/javascript" src="bower_components/d3/d3.js" ></script>
<script type="text/javascript" src="bower_components/topojson/topojson.js"></script>
<script type="text/javascript" src="bower_components/lodash/lodash.js"></script>
<script type="text/javascript" src="test.js"></script>
-->
</body>
</html>