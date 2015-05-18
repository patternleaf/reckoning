(function() {
	var gCurrentMarkers = [];
	var gMap, gOMS, gPopup;
	var gSVGOverlayPane, gTimelineGroup;
	var gTransform, gPathFactory, gLineFactory;

	var gTimelineEventsSelection, gTimelineEvents = [];

	var gInstagramRequestTemplate = Handlebars.compile('https://api.instagram.com/v1/tags/{{tag}}/media/recent?client_id=59356ed94b0d4da79bb8b00545067fb7&callback=handleInstagramResponse');
	var gTwitterLinkTemplate = Handlebars.compile('https://twitter.com/{{username}}/status/{{statusId}}');
	var gPopupTemplate = Handlebars.compile($('#service-popup-template').html());

	var setupMap = function() {
		var mapBoxAccessToken = 'pk.eyJ1IjoicGF0dGVybmxlYWYiLCJhIjoic0Rva0IwSSJ9.DU7YPPl3BQVwv7wN2f-IUg';
		var mapUrl = 'https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}{resolution}.{format}?access_token={token}';

		gMap = L.map('map').setView([0, 0], 2);
		gOMS = new OverlappingMarkerSpiderfier(gMap);
		gOMS.addListener('click', handleOMSClick);

		gPopup = L.popup({
			minWidth: 250,
			maxWidth: 250
		});

		L.Icon.Default.imagePath = '/css/images/';

		L.tileLayer(mapUrl, {
			attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
			maxZoom: 18,
			mapId: 'patternleaf.bf4e8fce',
			token: mapBoxAccessToken,
			format: 'png',
			resolution: '@2x',
		}).addTo(gMap);

		gSVGOverlayPane = d3.select(gMap.getPanes().overlayPane).append('svg');
		gTimelineGroup = gSVGOverlayPane.append('g').attr('class', 'timeline-overlay');

		gTransform = d3.geo.transform({
			point: function(x, y) {
				var point = gMap.latLngToLayerPoint(new L.LatLng(y, x));
				// console.log('transform', x, y, point);
				this.stream.point(point.x, point.y);
			}
		});
		gPathFactory = d3.geo.path().projection(gTransform);

		var applyLatLngToLayer = function(d) {
			return gMap.latLngToLayerPoint(L.latLng(d.coordinates[1], d.coordinates[0]));
		};
		gLineFactory = d3.svg.line()
			.interpolate('linear')
			.x(function(d) {
				return applyLatLngToLayer(d).x
			})
			.y(function(d) {
				return applyLatLngToLayer(d).y
			});

		gMap.on('viewreset', updatePanes);
	};

	var updatePanes = function() {
		if (gTimelineEvents.length) {

			var bounds = gPathFactory.bounds({
					"type":"Feature",
					"geometry":{
						"type":"LineString",
						"coordinates": _.map(gTimelineEvents, function(d) { return d.coordinates; })
					},
					"properties": {}
				}),
				topLeft = bounds[0],
				bottomRight = bounds[1];

			gSVGOverlayPane.attr('width', bottomRight[0] - topLeft[0] + 120)
				.attr('height', bottomRight[1] - topLeft[1] + 120)
				.style('left', topLeft[0] - 50 + 'px')
				.style('top', topLeft[1] - 50 + 'px');

			gTimelineGroup.selectAll('.event-path').remove();
			gTimelineGroup.append('path').datum({
				events: gTimelineEvents
			})
			.attr('class', 'event-path')
			.attr('d', function(d) {
				return gLineFactory(d.events);
			});

			gTimelineGroup.attr('transform', 'translate(' + (-topLeft[0] + 50) + ',' + (-topLeft[1] + 50) + ')');
		}
	};

	var handleInstagramResponse = window.handleInstagramResponse = function(response) {
		// console.log(response);

		_.forEach(response.data, function(gram, index) {
			if (gram.location && _.isNumber(gram.location.latitude) && _.isNumber(gram.location.longitude)) {
				var markerIcon = L.AwesomeMarkers.icon({
					icon: 'instagram',
					prefix: 'fa',
					markerColor: 'darkgreen'
				});

				var marker = L.marker([gram.location.latitude, gram.location.longitude], { icon: markerIcon }).addTo(gMap);
				var captionText = Handlebars.Utils.escapeExpression(gram.caption.text);
				if (captionText.length > 200) {
					captionText = captionText.substring(0, 200) + ' &hellip;';
				}
				// marker.bindPopup(gPopup);
				marker.popupContent = gPopupTemplate({
					postUrl: gram.link,
					imgUrl: gram.images.standard_resolution.url,
					hasImage: true,
					serviceIconName: 'instagram',
					username: gram.user.full_name.length ? gram.user.full_name : gram.user.username,
					userAvatarUrl: gram.user.profile_picture,
					userUrl: 'http://instagram.com/' + gram.user.username,
					locationName: gram.location && gram.location.name ? 'at ' + gram.location.name : '',
					caption: captionText,
					timestamp: moment(gram.created_time * 1000).fromNow(),
					tags: gram.tags
				});
				gCurrentMarkers.push(marker);
				gOMS.addMarker(marker);
			}
			
		});
	};

	var markerForTweet = function(status) {
		// console.log('tweet with geo', status);
		var markerIcon = L.AwesomeMarkers.icon({
				icon: 'twitter',
				prefix: 'fa',
				markerColor: 'orange'
			});
		// console.log(status);
		var marker = L.marker([status.geo.coordinates[0], status.geo.coordinates[1]], { icon: markerIcon }).addTo(gMap);
		var captionText = status.text;
		var imageUrl = _.has(status.entities, 'media') ? status.entities.media[0].media_url : '';

		// apparently lots of people post instagram photos via twitter ... ? pssh. kids these days.
		if (!imageUrl.length && _.has(status.entities, 'urls')) {
			_.forEach(status.entities.urls, function(urlInfo) {
				if (urlInfo.expanded_url.indexOf('instagram.com') != -1) {
					imageUrl = urlInfo.expanded_url + 'media';
				}
			});
		}

		marker.popupContent = gPopupTemplate({
			postUrl: gTwitterLinkTemplate({ username: status.user.screen_name, statusId: status.id_str }),
			imgUrl: imageUrl,
			hasImage: !!(imageUrl.length),
			serviceIconName: 'twitter',
			username: status.user.name.length ? status.user.name : status.user.screen_name,
			userAvatarUrl: status.user.profile_image_url,
			userUrl: 'https://twitter.com/' + status.user.screen_name,
			locationName: '',
			caption: captionText,
			timestamp: moment(new Date(status.created_at)).fromNow(),
			tags: _.pluck(status.entities.hashtags, 'text')
		});
		return marker;
	};

	var handleTwitterSearchResponse = function(response) {
		console.log('twitter', response);
		var geoTweets = _.filter(response.statuses, function(status) { return !!status.geo; });
		
		_.forEach(geoTweets, function(status) {
			var marker = markerForTweet(status);
			gCurrentMarkers.push(marker);
			gOMS.addMarker(marker);
		});
	};

	var handleTwitterUserTimelineResponse = function(response) {
		// console.log('twitter user timeline response:', response);
		var geoTweets = _.filter(response, function(status) { return !!status.geo; });
		gTimelineEvents = [];
		console.log(geoTweets.length, 'tweets with geo info');
		_.forEach(geoTweets, function(status) {
			var marker = markerForTweet(status);
			gTimelineEvents.push({
				coordinates: [status.geo.coordinates[1], status.geo.coordinates[0]],
				marker: marker,
				timestamp: moment(new Date(status.created_at))
			});
			gCurrentMarkers.push(marker);
			gOMS.addMarker(marker);
		});
/*
		gTimelineEventsSelection = gTimelineGroup.selectAll('.timeline-event').data(gTimelineEvents).enter()
			.append('circle')
			.attr('class', 'timeline-event')
			.attr('r', 3)
			.attr('x', function(d) {
				return projection(d.coordinates).x;
			})
			.attr('y'), function(d) {
				return projection(d.coordinates).y;
			}
			.attr('data-timestamp', function(d) {
				return d.timestamp;
			});
*/
		updatePanes();
	};

	var handleOMSClick = function(marker) {
		// var markerPt = gMap.latLngToLayerPoint(marker.getLatLng());

		gPopup.setContent(marker.popupContent);
		// gPopup.setLatLng(gMap.layerPointToLatLng([markerPt.x, markerPt.y - 60]));
		gPopup.setLatLng(marker.getLatLng());

		gMap.openPopup(gPopup);
	};

	var clearMap = function() {
		_.forEach(gCurrentMarkers, function(marker) {
			gMap.removeLayer(marker);
		});
		gOMS.clearMarkers();
		gCurrentMarkers = [];
		gMap.closePopup();
	};


	$(document).on('ready', function() {
		
		setupMap();
		
		$('form#tag-search').on('submit', function(event) {
			var tag = encodeURIComponent($(this).find('input[name=tag]').val());
			if (tag.length) {
				clearMap();

				var instagramTunnel = $('<script id="instagram-tunnel">');
				$('script#instagram-tunnel').remove();
				instagramTunnel.attr('src', gInstagramRequestTemplate({ tag: tag }));
				$('body').append(instagramTunnel);

				$.getJSON('/api/twitter', $.param({ 
					endpoint: 'search/tweets',
					q: tag, 
					count: 100 
				}), handleTwitterSearchResponse);
			}
			event.preventDefault();
		});

		$('form#user-history-search').on('submit', function(event) {
			var username = encodeURIComponent($(this).find('input[name=username]').val());
			if (username.length) {
				$.getJSON('/api/twitter', $.param({ 
					endpoint: 'statuses/user_timeline',
					screen_name: username, 
					count: 200,
					exclude_replies: true
				}), handleTwitterUserTimelineResponse);
			}
			event.preventDefault();
		});

	});

})();
