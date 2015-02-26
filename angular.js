'use strict';

// defines the alkApp and it's dependencies
var mapApp = angular
	.module('pnMapApp', []);

mapApp.config(
  function($logProvider) {
    $logProvider.debugEnabled(true);
  }
);

angular.module('pnMapApp')
  .controller('landmarkController', ['$scope', '$log', 'landmarkService',
    function ($scope, $log, landmarkService) {

      $scope.getLandmarks = function () {
        $log.debug('LandmarkController: plot landmarks');

          landmarkService.getLandmarkList().then(
            function (data) {
              landmarkService.plotLandmarks(data.landmarks);
            },
            function () {
              $log.debug('Error getting landmarks');
            }
          );

      };

      $scope.hideLandmarks = function () {
        $log.debug('Landmark Controller: hide landmarks');
        landmarkService.removeLandmarks();
      };

      landmarkService.setupMap();
      $scope.getLandmarks();
    }
  ]);

/**
 * This service will fetch and plot landmarks on the map.
 */
angular.module('pnMapApp')
  .factory('landmarkService', ['$log', '$q', '$http',
    function ($log, $q, $http, pfmServices) {

      var alkMap;
      var landmarkLayer;

      var serverType = 'http://';
      var env = '.pfmdcdev.com';
      var landmarkService = 'pfm-landmark-service';
      var landmarkPort = ':8082';
      var landmarkListUrl = serverType + landmarkService + env + landmarkPort + '/landmark/list?userId=1444838&customerId=57';

      var mercLL = function (long, lat) {
        var ll = new ALKMaps.LonLat(long, lat);
        return  ll.transform(new ALKMaps.Projection('EPSG:4326'), alkMap.getProjectionObject());
      };

      var centerMap = function (long, lat, zoom) {
        alkMap.setCenter(mercLL(long, lat), zoom);
      };

      var setupMap = function() {
        ALKMaps.APIKey = 'CC87143E1602274A804BEF2AD8D24653';
        alkMap = new ALKMaps.Map('myMap', {
          displayProjection: new ALKMaps.Projection('EPSG:4326')
        });
        var layer = new ALKMaps.Layer.BaseMap("ALK Maps", {},
          {displayInLayerSwitcher: false, wrapDateLine: true});
        alkMap.addLayer(layer);

        centerMap(-98.5, 40, 5);

        ALKMaps.Renderer.symbol = ALKMaps.Util.extend(ALKMaps.Renderer.symbol, {
          'pin': [15,59, 30,23, 30,21, 31,20, 31,11, 30,10, 30,9, 29,8, 29,7, 28,6, 27,5, 26,4, 25,3, 24,2, 22,1, 20,0, 11,0, 9,1, 7,2, 6,3, 5,4, 4,5, 3,6, 2,7, 2,8, 1,9, 1,10, 0,11, 0,20, 1,21, 1,23, 14,59, 15,59]
        });

        var landmarkPointStyle = new ALKMaps.Style({
          strokeColor: '#808080',
          pointRadius: '${radius}',
          strokeWidth: 1,
          fillColor: '${fill}',
          fontSize: '11px',
          fontColor: '#116666',
          label: '${label}',
          graphicName: '${graphic}',
          graphicYOffset: -10,
          labelYOffset: '${labelOffset}',
          fillOpacity: 0.7,
          cursor: 'hand'
        }, {
          context: {
            fill: function (feature) {
              if (feature.cluster) {
                return '#FFE51E';
              } else {
                return '#FF0000';
              }
            },
            radius: function (feature) {
              if (!feature.cluster) {
                return 8;
              }
              return Math.sqrt(feature.cluster.length / Math.PI) * 8;
            },
            graphic: function (feature) {
              return (feature.cluster) ? 'circle' : 'pin';
            },
            label: function (feature) {
              if (feature.cluster) {
                return feature.cluster.length;
              }
              //TODO: make this configurable
              return ''; //feature.attributes.number;
            },
            labelOffset: function (feature) {
              return (feature.cluster) ? 0 : -12;
            }
          }
        });

        //Add cluster strategy to landmark layer
        var lmClusterStrategy = new ALKMaps.Strategy.Cluster({
          distance: 50,
          threshold: 5
        });

        landmarkLayer = new ALKMaps.Layer.Vector('Landmark Layer', {
          strategies: [lmClusterStrategy],
          styleMap: new ALKMaps.StyleMap({
            default: landmarkPointStyle,
            select: landmarkPointStyle
          })
        });
        alkMap.addLayer(landmarkLayer);
      };

      /**
       * Get the list of landmarks
       * @returns {ng.IPromise<T>}
       */
      var getLandmarkList = function() {
        $log.debug('LandmarkService: getLandmarkList');
        var deferred = $q.defer();
        $http.get(landmarkListUrl)
          .success(function(data) {
            deferred.resolve({
              landmarks: data
            });
          }).error(function(msg, code) {
            deferred.reject(msg);
            logError('LandmarkService.getLandmarkList', msg, code);
          });
        return deferred.promise;
      };

      /**
       * Plot the landmarks on the map.
       * @param landmarks
       */
      var plotLandmarks = function(landmarks) {
        $log.debug('LandmarkService: plotLandmarks.');
        var landmarkFeatures = [];
        var landmark, lonLat, pointFeature;

        for (var i=0; i < landmarks.length; i++) {
          landmark = landmarks[i];
          //throw out likely bad data
          if(Math.abs(landmark.location.longitude) > 0.1 && Math.abs(landmark.location.latitude) > 0.1) {
            lonLat = mercLL(landmark.location.longitude, landmark.location.latitude);
            pointFeature = new ALKMaps.Feature.Vector(
              new ALKMaps.Geometry.Point(lonLat.lon, lonLat.lat)
            );
            pointFeature.attributes = landmark;
            landmarkFeatures.push(pointFeature);
          }
        }
        landmarkLayer.addFeatures(landmarkFeatures);
      };

      /**
       * Remove the landmarks from the map
       */
      var removeLandmarks = function() {
        $log.debug('LandmarkService.removeLandmarks()');
        var landmarks = landmarkLayer.features.length;
        $log.debug('LandmarkService: landmark quantity:'+landmarks);
        if (landmarkLayer.features.length !== 0) {
          landmarkLayer.removeAllFeatures();
          $log.debug('LandmarkService: quantity now:' + landmarkLayer.features.length);
        }
      };

      /**
       * Log error messages that come from the $resource calls.
       *
       * @param errorInText string method error in
       * @param error object from $resource
       */
      var logError = function (errorInText, msg, code) {
        $log.error('Error in ' + errorInText + ', status: ' + code + ', message: ' + msg);
      };

      return {
        plotLandmarks: function(landmarks) {
          plotLandmarks(landmarks);
        },
        getLandmarkList: function() {
          return getLandmarkList();
        },
        removeLandmarks: function() {
          removeLandmarks();
        },
        setupMap: function() {
          setupMap();
        }
      };
    }
  ]);
