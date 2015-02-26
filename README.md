# map-test
Shows an error removing features in a simple.js map, and an angular map

After downloading the files, navigate to simple.html, or angular.html. The angular app has a companion angular.js file. Also, the angular one makes a web service call. You will have to be behind the correct firewall to get the data. The simple.html one has a few vehicles internal in the JSON structure.

Originally it only happened in the Angular app. Then we found that the Angular app had a cluster strategy. Remove it, and the Angular app removes features fine. We added it to the simple.js app and we get the same behaviour. It appears that the cluster strategy is holding onto references to the features, so the landmarkLayer.removeAllFeatures() method is not really removing them. It appears to, as they dissappear off the screen, until you zoom, and they come back.

