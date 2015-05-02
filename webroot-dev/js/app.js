(function() {
    var currentMarkers = [];
    var map, oms, popup;
    var mapBoxAccessToken = "pk.eyJ1IjoicGF0dGVybmxlYWYiLCJhIjoic0Rva0IwSSJ9.DU7YPPl3BQVwv7wN2f-IUg";
    var mapUrl = "https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}{resolution}.{format}?access_token={token}";
    var instagramRequestTemplate = Handlebars.compile("https://api.instagram.com/v1/tags/{{tag}}/media/recent?client_id=59356ed94b0d4da79bb8b00545067fb7&callback=handleInstagramResponse");
    var twitterLinkTemplate = Handlebars.compile("https://twitter.com/{{username}}/status/{{statusId}}");
    var popupTemplate = Handlebars.compile($("#service-popup-template").html());
    var setupMap = function() {
        map = L.map("map").setView([ 0, 0 ], 2);
        oms = new OverlappingMarkerSpiderfier(map);
        oms.addListener("click", handleOMSClick);
        popup = L.popup({
            minWidth: 250,
            maxWidth: 250
        });
        L.Icon.Default.imagePath = "/css/images/";
        L.tileLayer(mapUrl, {
            attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
            maxZoom: 18,
            mapId: "patternleaf.bf4e8fce",
            token: mapBoxAccessToken,
            format: "png",
            resolution: "@2x"
        }).addTo(map);
    };
    var handleInstagramResponse = window.handleInstagramResponse = function(response) {
        _.forEach(response.data, function(gram, index) {
            if (gram.location && _.isNumber(gram.location.latitude) && _.isNumber(gram.location.longitude)) {
                var markerIcon = L.AwesomeMarkers.icon({
                    icon: "instagram",
                    prefix: "fa",
                    markerColor: "darkgreen"
                });
                var marker = L.marker([ gram.location.latitude, gram.location.longitude ], {
                    icon: markerIcon
                }).addTo(map);
                var captionText = Handlebars.Utils.escapeExpression(gram.caption.text);
                if (captionText.length > 200) {
                    captionText = captionText.substring(0, 200) + " &hellip;";
                }
                marker.popupContent = popupTemplate({
                    postUrl: gram.link,
                    imgUrl: gram.images.standard_resolution.url,
                    hasImage: true,
                    serviceIconName: "instagram",
                    username: gram.user.full_name.length ? gram.user.full_name : gram.user.username,
                    userAvatarUrl: gram.user.profile_picture,
                    userUrl: "http://instagram.com/" + gram.user.username,
                    locationName: gram.location && gram.location.name ? "at " + gram.location.name : "",
                    caption: captionText,
                    timestamp: moment(gram.created_time * 1e3).fromNow(),
                    tags: gram.tags
                });
                currentMarkers.push(marker);
                oms.addMarker(marker);
            }
        });
    };
    var handleTwitterResponse = function(response) {
        console.log("twitter", response);
        var geoTweets = _.filter(response.statuses, function(status) {
            return !!status.geo;
        });
        _.forEach(geoTweets, function(status) {
            var markerIcon = L.AwesomeMarkers.icon({
                icon: "twitter",
                prefix: "fa",
                markerColor: "orange"
            });
            var marker = L.marker([ status.geo.coordinates[0], status.geo.coordinates[1] ], {
                icon: markerIcon
            }).addTo(map);
            var captionText = status.text;
            var imageUrl = _.has(status.entities, "media") ? status.entities.media[0].media_url : "";
            if (!imageUrl.length && _.has(status.entities, "urls")) {
                _.forEach(status.entities.urls, function(urlInfo) {
                    if (urlInfo.expanded_url.indexOf("instagram.com") != -1) {
                        imageUrl = urlInfo.expanded_url + "media";
                    }
                });
            }
            marker.popupContent = popupTemplate({
                postUrl: twitterLinkTemplate({
                    username: status.user.screen_name,
                    statusId: status.id_str
                }),
                imgUrl: imageUrl,
                hasImage: !!imageUrl.length,
                serviceIconName: "twitter",
                username: status.user.name.length ? status.user.name : status.user.screen_name,
                userAvatarUrl: status.user.profile_image_url,
                userUrl: "https://twitter.com/" + status.user.screen_name,
                locationName: "",
                caption: captionText,
                timestamp: moment(new Date(status.created_at)).fromNow(),
                tags: _.pluck(status.entities.hashtags, "text")
            });
            currentMarkers.push(marker);
            oms.addMarker(marker);
        });
    };
    var handleOMSClick = function(marker) {
        popup.setContent(marker.popupContent);
        popup.setLatLng(marker.getLatLng());
        map.openPopup(popup);
    };
    $(document).on("ready", function() {
        setupMap();
        $("form#tag-search").on("submit", function(event) {
            var tag = encodeURIComponent($(this).find("input[name=tag]").val());
            if (tag.length) {
                _.forEach(currentMarkers, function(marker) {
                    map.removeLayer(marker);
                });
                oms.clearMarkers();
                currentMarkers = [];
                map.closePopup();
                var instagramTunnel = $('<script id="instagram-tunnel">');
                $("script#instagram-tunnel").remove();
                instagramTunnel.attr("src", instagramRequestTemplate({
                    tag: tag
                }));
                $("body").append(instagramTunnel);
                $.getJSON("/api/twitter", $.param({
                    q: tag,
                    count: 100
                }), handleTwitterResponse);
            }
            event.preventDefault();
        });
    });
})();