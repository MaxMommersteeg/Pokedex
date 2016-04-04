// Settings Controller
angular.module('starter').controller('SettingsCtrl', function($scope, $http, $ionicPopup,
    userPreferenceKey, positionPreferenceKey, mapPreferenceKey, pokemonListPreferenceKey, apiWebsite) {
    $scope.user = {};
    $scope.userposition = {};
    $scope.map = {};
    $scope.pokemonlist = {};
    $scope.watchId = {};

    $scope.$on('$ionicView.enter', function() {
        console.log("Settings enter");
        $scope.initialize();

        $scope.startLocationWatch();
    });

    $scope.$on('$ionicView.beforeLeave', function() {
        console.log("Settings leave");
        navigator.geolocation.clearWatch($scope.watchId);
    });


    $scope.startLocationWatch = function() {
        $scope.watchId = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 8000 });
        function onSuccess(position) {
            console.log("Success: watchPosition");
            // updating ng-bind
            safeApply($scope, function() {
                $scope.userposition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            });
            // Update last known position with new one
            window.localStorage.setItem(positionPreferenceKey, JSON.stringify($scope.userposition));
        }
        function onError() {
            console.error("Failed: watchPosition");
        }
    };

    $scope.initialize = function() {
        console.log("Initializing settings");
        // Initialize user from preferences
        var u = JSON.parse(window.localStorage.getItem(userPreferenceKey));
        if (u != null) {
            $scope.user = u;
        }
        // Initialize last position from preferences
        var p = JSON.parse(window.localStorage.getItem(positionPreferenceKey))
        if (p != null) {
            $scope.userposition = p;
        }
        // Initialize map from preferences
        var m = JSON.parse(window.localStorage.getItem(mapPreferenceKey));
        if (m != null) {
            $scope.map = m;
        }
        // Initialize pokemonlist settings from preferences
        var pl = JSON.parse(window.localStorage.getItem(pokemonListPreferenceKey));
        if (pl != null) {
            $scope.pokemonlist = pl;
        }
    };

    $scope.updateSettings = function() {
        console.log("Saving settings");
        if ($scope.user.firstname || $scope.user.lastname) {
            window.localStorage.setItem(userPreferenceKey, JSON.stringify($scope.user));
        }
        if ($scope.map.maximumradius || $scope.map.catchradius) {
            window.localStorage.setItem(mapPreferenceKey, JSON.stringify($scope.map));
        }
        if ($scope.pokemonlist.size) {
            window.localStorage.setItem(pokemonListPreferenceKey, JSON.stringify($scope.pokemonlist));
        }
        $ionicPopup.alert({ title: 'Settings', template: "Settings saved" });
    };

    // Show your position on google maps
    $scope.showOnMap = function() {
        if ($scope.userposition == null) { return; }
        try {
            launchnavigator.navigate([$scope.userposition.latitude, $scope.userposition.longitude]);
        } catch (err) {
            $ionicPopup.alert({ title: 'Settings', template: "Failed to launch Google Maps or an alternative" });
        }
    };

    // Show poke api in external browser
    $scope.showPokedexApiWebsite = function() {
        try {
            cordova.InAppBrowser.open(apiWebsite, '_system', 'location=yes');
        } catch (err) {
            $ionicPopup.alert({ title: 'Open external app', template: 'Failed to open browser' });
        }
    };
    
    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
});