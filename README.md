# map-test
Shows an error removing features in a simple.js map, and an angular map

After downloading the files, navigate to simple.html, or angular.html. The angular app has a companion angular.js file. Also, the angular one makes a web service call. You will have to be behind the correct firewall to get the data. The simple.html one has a few vehicles internal in the JSON structure.

It appears that the cluster strategy is holding onto references to the features, so the landmarkLayer.removeAllFeatures() method is not really removing them. It appears to, as the dissappear off the screen, until you zoom, and they come back.

