(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('services', []);
angular.module('factories', []);
angular.module('mapModule', []);
angular.module('moreModule', []);

require('../common/factories/globalsFactory');
require('../common/factories/geoFactory');
require('../common/factories/busstopsFactory');
require('./map/mapController');
require('./map/mapDirective');
require('./more/moreController');

angular.module('bustleApp', [
	'ionic',
	'services',
	'factories',
	'mapModule',
	'moreModule'
])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	// setup an abstract state for the tabs directive
	.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'app/tabs/tabs.html'
	})

	// Each tab has its own nav history stack:

	.state('tab.map', {
		url: '/map',
		views: {
			'tab-map': {
				templateUrl: 'app/map/views/index.html',
				controller: 'MapController'
			}
		}
	})

	.state('tab.more', {
		url: '/more',
		views: {
			'tab-more': {
				templateUrl: 'app/more/views/index.html',
				controller: 'MoreController'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/map');

});

},{"../common/factories/busstopsFactory":5,"../common/factories/geoFactory":6,"../common/factories/globalsFactory":7,"./map/mapController":2,"./map/mapDirective":3,"./more/moreController":4}],2:[function(require,module,exports){
module.exports = angular.module('mapModule')

.controller('MapController', function($scope) {
	'ngInject';



	$scope.location = 'here i am';


	// {coords: Coordinates, timestamp: 1464474395438 }

	// geoFactory.getCurrentPosition()
	// 	.then(function(position) {
	// 		$scope.position = position;
	// 		console.log($scope.position);
	// 	})
	// 	.catch(function() {
	// 		$scope.error = 'There has been an error.';
	// 	});

	// $scope.refresh = function() {
	// 	geoFactory.getCurrentPosition().then(function(position) {
	// 		var coords = position.coords;

	// 		var mapOptions = {
	// 			center: new google.maps.LatLng(coords.latitude, coords.longitude),
	// 			zoom: 10,
	// 			mapTypeId: google.maps.MapTypeId.ROADMAP,
	// 			scrollwheel: false
	// 		};

	// 		$scope.mapOptions = mapOptions;

	// 		busstopsFactory.getLocal(coords).then(function(response) {
	// 			console.log('Success', response);

	// 			var markers = [];

	// 			angular.forEach(response.data.stops, function(stop) {

	// 				var position = new google.maps.LatLng(stop.latitude, stop.longitude);

	// 				var marker = {
	// 					id: stop.atcocode,
	// 					position: position,
	// 					title: stop.name
	// 				};

	// 				markers.push(marker);
	// 			});

	// 			$scope.markers = markers;

	// 		}, function(error) {
	// 			console.log('Error: ', error);
	// 		});
	// 	});
	// };

	// $scope.refresh();

});
},{}],3:[function(require,module,exports){
module.exports = angular.module('mapModule')

.directive('uiMap', function() {

	return {
		restrict: 'E',
		template: '<div id="gmaps" class="map"></div>',
		replace: true,
		scope: {
			options: '=',
			markers: '='
		},
		link: function (scope, element, attr) {
			var map;
			var infoWindow;
			var markers = [];
			var mapOptions = scope.options;
			var bounds = new google.maps.LatLngBounds();

			(function initMap() {
				if (map === void 0) {
					map = new google.maps.Map(element[0], mapOptions);
				}
			})();

			function setMarkers() {
				angular.forEach(scope.markers, function(marker) {

					var markerOptions = {
						position: marker.position,
						map: map,
						title: marker.title,
						icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
					};

					marker = new google.maps.Marker(markerOptions);
					bounds.extend(marker.position);

					google.maps.event.addListener(marker, 'click', function () {
						var infoWindowOptions;

						if (infoWindow !== void 0) {
							infoWindow.close();
						}

						infoWindowOptions = {
							content: marker.title
						};

						infoWindow = new google.maps.InfoWindow(infoWindowOptions);
						infoWindow.open(map, marker);
					});

				});
			}

			scope.$watch(attr.markers, function() {
				console.log('changed');
				setMarkers();
				map.fitBounds(bounds);
				map.panToBounds(bounds);
			});
		}
	};
});
},{}],4:[function(require,module,exports){
module.exports = angular.module('moreModule')

.controller('MoreController', function($scope) {});
},{}],5:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('busstopsFactory', function($http, $httpParamSerializer, globalsFactory) {
	'ngInject';

	var generateQueryObj = function(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globalsFactory.app_key,
			app_id: globalsFactory.app_id
		};
	};

	return {
		getLocal: function (coords) {
			return $http({
				method: 'GET',
				url: globalsFactory.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
			});
		}
	};
});
},{}],6:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('geoFactory', function($q, $window, $rootScope) {
	'ngInject';

	return {
		getCurrentPosition: function() {
			var deferred = $q.defer();

			$window.navigator.geolocation.getCurrentPosition(function(position) {
				$rootScope.$apply(function() {
					deferred.resolve(position);
				});
			}, function(error) {
				$rootScope.$apply(function() {
					deferred.reject(error);
				});
			});

			return deferred.promise;
		}
	};
});
},{}],7:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('globalsFactory', function() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnkuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9nZW9GYWN0b3J5LmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdzZXJ2aWNlcycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbWFwTW9kdWxlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21vcmVNb2R1bGUnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2VvRmFjdG9yeScpO1xucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4vbWFwL21hcENvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vbWFwL21hcERpcmVjdGl2ZScpO1xucmVxdWlyZSgnLi9tb3JlL21vcmVDb250cm9sbGVyJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAnLCBbXG5cdCdpb25pYycsXG5cdCdzZXJ2aWNlcycsXG5cdCdmYWN0b3JpZXMnLFxuXHQnbWFwTW9kdWxlJyxcblx0J21vcmVNb2R1bGUnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG5cdCRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRcdGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuXHRcdH1cblx0XHRpZiAod2luZG93LlN0YXR1c0Jhcikge1xuXHRcdFx0Ly8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuXHRcdFx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRcdH1cblx0fSk7XG59KVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuXHQvLyBJb25pYyB1c2VzIEFuZ3VsYXJVSSBSb3V0ZXIgd2hpY2ggdXNlcyB0aGUgY29uY2VwdCBvZiBzdGF0ZXNcblx0Ly8gTGVhcm4gbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXJcblx0Ly8gU2V0IHVwIHRoZSB2YXJpb3VzIHN0YXRlcyB3aGljaCB0aGUgYXBwIGNhbiBiZSBpbi5cblx0Ly8gRWFjaCBzdGF0ZSdzIGNvbnRyb2xsZXIgY2FuIGJlIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG5cdCRzdGF0ZVByb3ZpZGVyXG5cblx0Ly8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuXHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90YWJzL3RhYnMuaHRtbCdcblx0fSlcblxuXHQvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcblxuXHQuc3RhdGUoJ3RhYi5tYXAnLCB7XG5cdFx0dXJsOiAnL21hcCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbWFwJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tYXAvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScpXG5cbi5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7XG5cdCduZ0luamVjdCc7XG5cblxuXG5cdCRzY29wZS5sb2NhdGlvbiA9ICdoZXJlIGkgYW0nO1xuXG5cblx0Ly8ge2Nvb3JkczogQ29vcmRpbmF0ZXMsIHRpbWVzdGFtcDogMTQ2NDQ3NDM5NTQzOCB9XG5cblx0Ly8gZ2VvRmFjdG9yeS5nZXRDdXJyZW50UG9zaXRpb24oKVxuXHQvLyBcdC50aGVuKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdC8vIFx0XHQkc2NvcGUucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0Ly8gXHRcdGNvbnNvbGUubG9nKCRzY29wZS5wb3NpdGlvbik7XG5cdC8vIFx0fSlcblx0Ly8gXHQuY2F0Y2goZnVuY3Rpb24oKSB7XG5cdC8vIFx0XHQkc2NvcGUuZXJyb3IgPSAnVGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IuJztcblx0Ly8gXHR9KTtcblxuXHQvLyAkc2NvcGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuXHQvLyBcdGdlb0ZhY3RvcnkuZ2V0Q3VycmVudFBvc2l0aW9uKCkudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHQvLyBcdFx0dmFyIGNvb3JkcyA9IHBvc2l0aW9uLmNvb3JkcztcblxuXHQvLyBcdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdC8vIFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGUpLFxuXHQvLyBcdFx0XHR6b29tOiAxMCxcblx0Ly8gXHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcblx0Ly8gXHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXG5cdC8vIFx0XHR9O1xuXG5cdC8vIFx0XHQkc2NvcGUubWFwT3B0aW9ucyA9IG1hcE9wdGlvbnM7XG5cblx0Ly8gXHRcdGJ1c3N0b3BzRmFjdG9yeS5nZXRMb2NhbChjb29yZHMpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0Ly8gXHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MnLCByZXNwb25zZSk7XG5cblx0Ly8gXHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcblxuXHQvLyBcdFx0XHRhbmd1bGFyLmZvckVhY2gocmVzcG9uc2UuZGF0YS5zdG9wcywgZnVuY3Rpb24oc3RvcCkge1xuXG5cdC8vIFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhzdG9wLmxhdGl0dWRlLCBzdG9wLmxvbmdpdHVkZSk7XG5cblx0Ly8gXHRcdFx0XHR2YXIgbWFya2VyID0ge1xuXHQvLyBcdFx0XHRcdFx0aWQ6IHN0b3AuYXRjb2NvZGUsXG5cdC8vIFx0XHRcdFx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdC8vIFx0XHRcdFx0XHR0aXRsZTogc3RvcC5uYW1lXG5cdC8vIFx0XHRcdFx0fTtcblxuXHQvLyBcdFx0XHRcdG1hcmtlcnMucHVzaChtYXJrZXIpO1xuXHQvLyBcdFx0XHR9KTtcblxuXHQvLyBcdFx0XHQkc2NvcGUubWFya2VycyA9IG1hcmtlcnM7XG5cblx0Ly8gXHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdC8vIFx0XHRcdGNvbnNvbGUubG9nKCdFcnJvcjogJywgZXJyb3IpO1xuXHQvLyBcdFx0fSk7XG5cdC8vIFx0fSk7XG5cdC8vIH07XG5cblx0Ly8gJHNjb3BlLnJlZnJlc2goKTtcblxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwTW9kdWxlJylcblxuLmRpcmVjdGl2ZSgndWlNYXAnLCBmdW5jdGlvbigpIHtcblxuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IGlkPVwiZ21hcHNcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PicsXG5cdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRzY29wZToge1xuXHRcdFx0b3B0aW9uczogJz0nLFxuXHRcdFx0bWFya2VyczogJz0nXG5cdFx0fSxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHIpIHtcblx0XHRcdHZhciBtYXA7XG5cdFx0XHR2YXIgaW5mb1dpbmRvdztcblx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cdFx0XHR2YXIgbWFwT3B0aW9ucyA9IHNjb3BlLm9wdGlvbnM7XG5cdFx0XHR2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuXG5cdFx0XHQoZnVuY3Rpb24gaW5pdE1hcCgpIHtcblx0XHRcdFx0aWYgKG1hcCA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0bWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChlbGVtZW50WzBdLCBtYXBPcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoKTtcblxuXHRcdFx0ZnVuY3Rpb24gc2V0TWFya2VycygpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHNjb3BlLm1hcmtlcnMsIGZ1bmN0aW9uKG1hcmtlcikge1xuXG5cdFx0XHRcdFx0dmFyIG1hcmtlck9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogbWFya2VyLnBvc2l0aW9uLFxuXHRcdFx0XHRcdFx0bWFwOiBtYXAsXG5cdFx0XHRcdFx0XHR0aXRsZTogbWFya2VyLnRpdGxlLFxuXHRcdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cdFx0XHRcdFx0Ym91bmRzLmV4dGVuZChtYXJrZXIucG9zaXRpb24pO1xuXG5cdFx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHR2YXIgaW5mb1dpbmRvd09wdGlvbnM7XG5cblx0XHRcdFx0XHRcdGlmIChpbmZvV2luZG93ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdFx0aW5mb1dpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpbmZvV2luZG93T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0Y29udGVudDogbWFya2VyLnRpdGxlXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coaW5mb1dpbmRvd09wdGlvbnMpO1xuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0c2NvcGUuJHdhdGNoKGF0dHIubWFya2VycywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdjaGFuZ2VkJyk7XG5cdFx0XHRcdHNldE1hcmtlcnMoKTtcblx0XHRcdFx0bWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuXHRcdFx0XHRtYXAucGFuVG9Cb3VuZHMoYm91bmRzKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21vcmVNb2R1bGUnKVxuXG4uY29udHJvbGxlcignTW9yZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHt9KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnKVxuXG4uZmFjdG9yeSgnYnVzc3RvcHNGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRodHRwUGFyYW1TZXJpYWxpemVyLCBnbG9iYWxzRmFjdG9yeSkge1xuXHQnbmdJbmplY3QnO1xuXG5cdHZhciBnZW5lcmF0ZVF1ZXJ5T2JqID0gZnVuY3Rpb24oY29vcmRzKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxhdDogY29vcmRzLmxhdGl0dWRlLFxuXHRcdFx0bG9uOiBjb29yZHMubG9uZ2l0dWRlLFxuXHRcdFx0YXBwX2tleTogZ2xvYmFsc0ZhY3RvcnkuYXBwX2tleSxcblx0XHRcdGFwcF9pZDogZ2xvYmFsc0ZhY3RvcnkuYXBwX2lkXG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGdldExvY2FsOiBmdW5jdGlvbiAoY29vcmRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHR1cmw6IGdsb2JhbHNGYWN0b3J5LmFwaV91cmxfbmVhciArICc/JyArICRodHRwUGFyYW1TZXJpYWxpemVyKGdlbmVyYXRlUXVlcnlPYmooY29vcmRzKSlcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycpXG5cbi5mYWN0b3J5KCdnZW9GYWN0b3J5JywgZnVuY3Rpb24oJHEsICR3aW5kb3csICRyb290U2NvcGUpIHtcblx0J25nSW5qZWN0JztcblxuXHRyZXR1cm4ge1xuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdFx0JHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwb3NpdGlvbik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0JHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdFx0fVxuXHR9O1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJylcblxuLmZhY3RvcnkoJ2dsb2JhbHNGYWN0b3J5JywgZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0YXBwX2lkOiAnODc5OTA5NjYnLFxuXHRcdGFwcF9rZXk6ICczM2E1Y2Y5ZTU0ZmE3Mjc1MzdlNDk0MWNiMDRkODFjNCcsXG5cdFx0YXBpX3VybF9uZWFyOiAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbidcblx0fTtcbn0pOyJdfQ==
