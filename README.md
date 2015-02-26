# map-test
Shows a working simple.js map, and not working angular map

After downloading the files, navigate to simple.html, or angular.html. The angular app has a companion angular.js file. Also, the angular one makes a web service call. You will have to be behind the correct firewall to get the data. The simple.html one has a few vehicles in a internal to the file JSON structure.

Somehow the angular app is holding on to the references to the landmarks, so the landmarkLayer.removeAllFeatures() method is not really removing them. It appears to, until you zoom.

