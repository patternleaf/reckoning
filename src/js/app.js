$(document).on('ready', function() {
	var map = L.map('map').setView([0, 0], 2);
	var accessToken = 'pk.eyJ1IjoicGF0dGVybmxlYWYiLCJhIjoic0Rva0IwSSJ9.DU7YPPl3BQVwv7wN2f-IUg';
	var url = 'https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}{resolution}.{format}?access_token={token}';

	L.Icon.Default.imagePath = '/css/images/';

	L.tileLayer(url, {
		attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
		maxZoom: 18,
		mapId: 'patternleaf.bf4e8fce',
		token: accessToken,
		format: 'png',
		resolution: '@2x',
	}).addTo(map);

	// var instagramUrl = 'https://api.instagram.com/v1/tags/climatechange/media/recent?client_id=59356ed94b0d4da79bb8b00545067fb7&callback=handleInstagramResponse';
	var instagramRequestTemplate = Handlebars.compile('https://api.instagram.com/v1/tags/{{tag}}/media/recent?client_id=59356ed94b0d4da79bb8b00545067fb7&callback=handleInstagramResponse')

	var popupTemplate = Handlebars.compile($('#instagram-popup-template').html());
	var currentMarkers = [];
	var handleInstagramResponse = window.handleInstagramResponse = function(response) {
		console.log(response);
		_.forEach(currentMarkers, function(marker) {
			map.removeLayer(marker);
		});
		currentMarkers = [];
		_.forEach(response.data, function(gram, index) {
			if (gram.location && _.isNumber(gram.location.latitude) && _.isNumber(gram.location.longitude)) {
				var marker = L.marker([gram.location.latitude, gram.location.longitude]).addTo(map);
				var captionText = Handlebars.Utils.escapeExpression(gram.caption.text);
				if (captionText.length > 200) {
					captionText = captionText.substring(0, 200) + ' &hellip;';
				}
				var popup = L.popup({
						minWidth: 250,
						maxWidth: 250
					})
					.setContent(popupTemplate({
						postUrl: gram.link,
						imgUrl: gram.images.standard_resolution.url,
						username: gram.user.full_name.length ? gram.user.full_name : gram.user.username,
						userAvatarUrl: gram.user.profile_picture,
						userUrl: 'http://instagram.com/' + gram.user.username,
						locationName: gram.location && gram.location.name ? 'at ' + gram.location.name : '',
						caption: captionText,
						timestamp: moment(gram.created_time * 1000).fromNow(),
						tags: gram.tags
					}));
				marker.bindPopup(popup);
				currentMarkers.push(marker);
			}
			
		});
	};

	
	$('form#tag-search').on('submit', function(event) {
		var tag = encodeURIComponent($(this).find('input[name=tag]').val());
		if (tag.length) {
			var instagramTunnel = $('<script id="instagram-tunnel">');
			$('script#instagram-tunnel').remove();
			instagramTunnel.attr('src', instagramRequestTemplate({ tag: tag }));
			$('body').append(instagramTunnel);
		}
		event.preventDefault();
	});

});


//https://a.tiles.mapbox.com/v4/patternleaf.bf4e8fce/page.html?access_token=pk.eyJ1IjoicGF0dGVybmxlYWYiLCJhIjoic0Rva0IwSSJ9.DU7YPPl3BQVwv7wN2f-IUg#4/39.74/-104.98