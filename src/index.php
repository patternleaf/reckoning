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
	<h1>Tag Search</h1>
	<input type="text" name="tag" placeholder="instagram &amp; twitter">
	<button type="submit">Search</button>
</form>

<form id="user-history-search">
	<h1>User History Search</h1>
	@<input type="text" name="username" placeholder="instagram &amp; twitter">
	<button type="submit">Search</button>
</form>


<script id="service-popup-template" type="text/x-handlebars-template">
	<div class="service-popup">
		<div class="service-popup-body">
			<section class="content">

			{{#if hasImage}}
				<div class="main-image-container">
					<a href="{{postUrl}}" style="background-image: url({{imgUrl}})"><img src="{{imgUrl}}"></a>
				</div>
			{{/if}}

				<p class="caption">{{{caption}}}</p>

				<div class="byline">
					<div class="user-avatar service-avatar-pic">
						<a href="{{userUrl}}"><img src="{{userAvatarUrl}}"></a>
					</div>
					<p>By <a href="{{userUrl}}">{{username}}</a> {{locationName}} {{timestamp}}</p>
				</div>
			</section>
			<section class="meta service-meta">
				<a class="view-original-link" href="{{postUrl}}"><i class="fa fa-{{serviceIconName}}"></i> View Original</a>
				<h3>Tagged</h3>
				<ul class="tag-list service-tag-list">
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