(function() {

	angular.module('bustleApp.mapModule')
		.directive('uiMap', uiMap);

	/* ngInject */
	function uiMap() {
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

							if (!infoWindow) {
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

				function resetBounds() {
					map.fitBounds(bounds);
					map.panToBounds(bounds);
				}

				scope.$on('refresh-map', function() {
					resetBounds();
				});

				scope.$watch(attr.markers, function() {
					setMarkers();
					resetBounds();
				});
			}
		};
	}

})();