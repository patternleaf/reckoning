var flickr = new Flickr({
    api_key: "4e881df747ca537f07e963f265402d3e"
});

var urlForPhoto = function(photo) {
    return "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_n.jpg";
};

var gCurrentRange = {
    start: moment().startOf("month").toDate(),
    end: moment().startOf("day").toDate()
};

var gDataRange = {
    start: gCurrentRange.start,
    end: gCurrentRange.end
};

var gHeatmapDecay = 0;

var gColors = [ "#4E7290", "#69D8BA", "#82C4DC", "#293C40", "#5798DB", "#598476", "#BFD0C2" ];

$(document).on("ready", function() {
    $("#slider").dateRangeSlider({
        range: {
            min: {
                days: 1
            }
        },
        bounds: {
            min: gCurrentRange.start,
            max: gCurrentRange.end
        },
        defaultValues: {
            min: gCurrentRange.start,
            max: gCurrentRange.end
        }
    });
    $("#slider").on("valuesChanging", function(e, data) {
        gCurrentRange.start = data.values.min;
        gCurrentRange.end = data.values.max;
        updateImageBarImages();
        updateHeatmapPoints(true);
    });
    var gData = [];
    try {
        var gHeatmap = window.heatmap = createWebGLHeatmap({
            canvas: $("#heatmap").get(0)
        });
    } catch (error) {
        console.error(error);
    }
    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var zoomGroup = d3.select("#map g.zoom");
    var countyGroup = d3.select("#map g.counties");
    var eventGroup = d3.select("#map g.events");
    var projection = window.projection = d3.geo.albersUsa().scale(800).translate([ 800 / 2, 600 / 2 ]);
    var pathFactory = d3.geo.path().projection(projection);
    var handleZoom = function() {
        var z = d3.select("#map g.zoom-group");
        z.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        z.select(".counties").style("stroke-width", 1 / d3.event.scale + "px");
        updateHeatmapPoints(true);
        updateImageCallouts();
    };
    var zoomBehavior = d3.behavior.zoom().scaleExtent([ .01, 800 ]).on("zoom", handleZoom);
    d3.select("#map g.zoom-group").call(zoomBehavior);
    countyGroup.selectAll("path").data(topojson.feature(gCountyTopojson, gCountyTopojson.objects.districts).features).enter().append("path").attr("data-fips", function(d) {
        return d.id;
    }).attr("class", "district").attr("d", pathFactory).attr("fill", "#efefef");
    $("form#query").on("submit", function(event) {
        flickr.photos.search({
            tags: $("#query #query-text").val().split(" ").join(","),
            bbox: "-124.892578,24.846565,-67.060547,47.872144",
            accuracy: "5",
            extras: "date_taken,geo",
            min_taken_date: $("#query #start-date").val(),
            max_taken_date: $("#query #end-date").val()
        }, function(err, result) {
            if (err) {
                throw new Error(err);
            }
            gData = [];
            var dateMin = Number.MAX_VALUE;
            var dateMax = 0;
            result.photos.photo.forEach(function(photo) {
                var date = Date.parse(photo.datetaken);
                if (date < dateMin) {
                    dateMin = date;
                }
                if (date > dateMax) {
                    dateMax = date;
                }
                gData.push({
                    date: date,
                    lat: parseFloat(photo.latitude),
                    lng: parseFloat(photo.longitude),
                    url: urlForPhoto(photo)
                });
            });
            gDataRange.start = new Date(dateMin);
            gDataRange.end = new Date(dateMax);
            $("#slider").dateRangeSlider("option", "bounds", {
                min: new Date($("#query #start-date").val()),
                max: new Date($("#query #end-date").val())
            });
            $("#slider").dateRangeSlider("values", gDataRange.start, gDataRange.end);
            updateHeatmapPoints(true);
            updateImageBarImages();
        });
        event.preventDefault();
    });
    var updateImageBarImages = function() {
        var start = gCurrentRange.start, end = gCurrentRange.end;
        $("#images img").remove();
        var nShowing = 0;
        gData.forEach(function(point) {
            var timestamp = point.date.valueOf();
            if (timestamp >= start.valueOf() && timestamp <= end.valueOf()) {
                var img = $("<img>").attr("src", point.url).data("geo", {
                    lng: point.lng,
                    lat: point.lat
                });
                $("#images").append(img);
                nShowing++;
            }
        });
        $("#n-results").text("Showing " + nShowing + " of " + gData.length);
        updateImageCallouts();
    };
    var handleImageBarScrolled = function() {
        updateImageBarImages();
    };
    var updateHeatmapPoints = function(clear) {
        var start = gCurrentRange.start, end = gCurrentRange.end;
        if (clear) {
            heatmap.multiply(0);
        }
        gData.forEach(function(point) {
            var projected = projectWithZoom(point.lng, point.lat);
            var timestamp = point.date.valueOf();
            if (timestamp > start.valueOf() && timestamp < end.valueOf()) {
                gHeatmap.addPoint(projected.x, projected.y, 20, .4);
            }
        });
    };
    var updateImageCallouts = function() {
        var $canvas = $("#overlay");
        var ctx = $canvas.get(0).getContext("2d");
        var imgs = [];
        $("#images img").each(function() {
            var $img = $(this);
            imgs.push({
                geo: $img.data("geo"),
                y: $img.position().top + $img.height() / 2
            });
        });
        ctx.clearRect(0, 0, 800, 600);
        imgs.forEach(function(img) {
            var pt = projectWithZoom(img.geo.lng, img.geo.lat);
            var slope = Math.abs(img.y - pt.y) / Math.abs(800 - pt.x);
            ctx.beginPath();
            ctx.moveTo(800, img.y);
            ctx.lineTo(pt.x, pt.y);
            ctx.strokeStyle = "rgba(0, 0, 0, " + Math.min(1, Math.max(1 - slope, .1)) + ")";
            ctx.stroke();
        });
    };
    var projectWithZoom = function(lng, lat) {
        var projected = projection([ lng, lat ]);
        var scale = zoomBehavior.scale(), translate = zoomBehavior.translate();
        var result = {
            x: projected[0],
            y: projected[1]
        };
        result.x *= scale;
        result.y *= scale;
        result.x += translate[0];
        result.y += translate[1];
        return result;
    };
    var animateHeatmap = function() {
        heatmap.update();
        heatmap.display();
        raf(animateHeatmap);
    };
    raf(animateHeatmap);
    $("#images").on("scroll", handleImageBarScrolled);
    $("#start-date").val(moment().startOf("month").format("YYYY-MM-DD"));
    $("#end-date").val(moment().startOf("day").format("YYYY-MM-DD"));
});