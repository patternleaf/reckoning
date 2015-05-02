<!doctype html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF8">
	<title></title>
	<link rel="stylesheet" type="text/css" href="css/app.css">
</head>
<body>

<div id="map"></div>

<form id="tag-search">
	<input type="text" name="tag" placeholder="instagram">
	<button type="submit">Search</button>
</form>

<script id="instagram-popup-template" type="text/x-handlebars-template">
	<div class="instagram-popup">
		<div class="instagram-popup-body">
			<section class="content instagram-content">
				<div class="main-image-container">
					<a href="{{postUrl}}" style="background-image: url({{imgUrl}})"><img src="{{imgUrl}}"></a>
				</div>
				<p class="caption"><a href="{{postUrl}}">{{{caption}}}</a></p>
				<div class="user-avatar instagram-avatar-pic">
					<a href="{{userUrl}}"><img src="{{userAvatarUrl}}"></a>
				</div>
				<p>By <a href="{{userUrl}}">{{username}}</a> {{locationName}} {{timestamp}}</p>
			</section>
			<section class="meta instagram-meta">
				<h3>Tagged</h3>
				<ul class="tag-list instagram-tag-list">
				{{#each tags}}
					<li>{{this}}</li>
				{{/each}}
				</ul>
			</section>
		</div>
	</div>
</script>

<script type="text/javascript" src="/js/vendor.js"></script>
<script type="text/javascript" src="/js/app.js"></script>

</body>
</html>