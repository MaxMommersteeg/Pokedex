// PokemonDetail Controller
angular.module('starter').controller('PokemonDetailCtrl', function($scope, $state, $stateParams, $http, $timeout, $window, $ionicPopup,
    positionPreferenceKey, mapPreferenceKey, mypokemonsPreferenceKey, baseUrlGetPokemon,
    defaultUpdateDistanceTimerDelay, defaultUpdatePokemonPositionTimerDelay, defaultUpdateCheckGpsTimerDelay) {
    $scope.pokemon = {};
    $scope.userposition = {};
    $scope.watchId = {};
    $scope.map = {};
    $scope.distanceToPokemon = 0;
    $scope.showNavigation = false;
    $scope.pokemonAlreadyCatched = false;
    $scope.catchButtonEnabled = false;
    $scope.gpsMessageShownToUser = false;
    $scope.mypokemons = [];

    var updateDistanceTimeout = null;
    var updatePokemonPositionTimeout = null;
    var updateCheckGpsTimeout = null;

    $scope.$on('$ionicView.enter', function() {
        console.log("Detail enter");
        $scope.gpsMessageShownToUser = false;
        var m = JSON.parse(window.localStorage.getItem(mapPreferenceKey));
        if (m != null) {
            $scope.map = m;
        }
        var mp = JSON.parse(window.localStorage.getItem(mypokemonsPreferenceKey));
        if (mp != null) {
            $scope.mypokemons = mp;    
        }
        safeApply($scope, function() {
            $scope.pokemonAlreadyCatched = $scope.alreadyCatched($stateParams.name);    
        });
        $scope.getPokemon($stateParams.name);
        if (!$scope.pokemonAlreadyCatched) {
            $scope.startLocationWatch();
            $scope.startUpdateCheckGpsTimer();
            $scope.startUpdatePokemonPositionTimer();
            $scope.startUpdateDistanceTimer();    
                $scope.showNavigation = true;
        } else {
                $scope.showNavigation = false;
        }
    });

    $scope.$on('$ionicView.beforeLeave', function() {
        console.log("Detail leave");
        $scope.stopUpdateDistanceTimer();
        $scope.stopUpdatePokemonPositionTimer();
        $scope.stopUpdateCheckGpsTimer();
        navigator.geolocation.clearWatch($scope.watchId);
    });

    // Timer for updating the distance between trainer and pokemon   
    $scope.updateDistanceTimer = function() {
        console.log("updateDistanceTimer called");
        if ($scope.userposition != null && $scope.pokemon.position != null) {
            safeApply($scope, function() {
                $scope.distanceToPokemon = Math.round(
                    getDistanceBetweenPositions(
                        $scope.userposition.latitude, $scope.userposition.longitude,
                        $scope.pokemon.position.latitude, $scope.pokemon.position.longitude
                    )
                );
            });
        }
        $scope.catchButtonEnabled = $scope.distanceToPokemon <= $scope.map.catchradius ? true : false;
        updateDistanceTimeout = $timeout($scope.updateDistanceTimer, defaultUpdateDistanceTimerDelay);
    };
    $scope.startUpdateDistanceTimer = function() { updateDistanceTimeout = $timeout($scope.updateDistanceTimer, defaultUpdateDistanceTimerDelay); };
    $scope.stopUpdateDistanceTimer = function() { $timeout.cancel(updateDistanceTimeout); };

    // Timer for setting pokemon position
    $scope.updatePokemonPositionTimer = function() {
        console.log("updatePokemonPositionTimer called");
        if ($scope.pokemon != null && $scope.userposition != null && ($scope.pokemon.position == null || isNaN($scope.distanceToPokemon))) {
            console.log("Resetting random pokémon position");
            safeApply($scope, function() {
                $scope.pokemon.position = getRandomPosition($scope.userposition.latitude, $scope.userposition.longitude, $scope.map.maximumradius);
            });
        }
        updatePokemonPositionTimeout = $timeout($scope.updatePokemonPositionTimer, defaultUpdatePokemonPositionTimerDelay);
    };
    $scope.startUpdatePokemonPositionTimer = function() { updatePokemonPositionTimeout = $timeout($scope.updatePokemonPositionTimer, defaultUpdatePokemonPositionTimerDelay); };
    $scope.stopUpdatePokemonPositionTimer = function() { $timeout.cancel(updatePokemonPositionTimeout); };

    $scope.updateCheckGpsTimer = function() {
        console.log("updateCheckGpsTimer called");
        try {
            cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
                safeApply($scope, function() {
                    $scope.showNavigation = enabled;    
                });    
                if (!sn && !$scope.gpsMessageShownToUser) {
                    $ionicPopup.alert({ title: 'Enable GPS', template: 'Real trainers always enable their GPS while hunting' });
                    $scope.gpsMessageShownToUser = true;
                }
            },
                function(error) {
                    console.error("The following error occurred: " + error);
                    safeApply($scope, function() {
                        $scope.showNavigation = false;
                    });
                });
        } catch (err) {
            safeApply($scope, function() {
                $scope.showNavigation = false;
            });
        }
        updateCheckGpsTimeout = $timeout($scope.updateCheckGpsTimer, defaultUpdateCheckGpsTimerDelay);
    };
    $scope.startUpdateCheckGpsTimer = function() { updateCheckGpsTimeout = $timeout($scope.updateCheckGpsTimer, defaultUpdateCheckGpsTimerDelay); };
    $scope.stopUpdateCheckGpsTimer = function() { $timeout.cancel(updateCheckGpsTimeout); };

    // Get pokemon by name
    $scope.getPokemon = function(name) {
        // Check if name parameter is valid
        if (!name || angular.equals({}, name)) { return; }
        // Assemble base url and Id (name)
        var url = baseUrlGetPokemon + String(name);
        $http.get(url).then(function(resp) {
            console.log("Success: GetPokemon: " + url);
            // Set pokemon
            $scope.pokemon = resp.data;
        }, function(err) {
            console.error("Failed: getPokemon: ", err);
        });
    };

    $scope.startLocationWatch = function() {
        $scope.watchId = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 5000, enableHighAccuracy: true });
        function onSuccess(position) {
            console.log("Success: watchPosition");
            // updating ng-bind
            safeApply($scope, function() {
                $scope.userposition = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            });
        }
        function onError() {
            console.log("GPS Error");
        }
    };

    // Start navigation to a pok�mons coordinates (lon/lat)
    $scope.navigateToPokemon = function() {
        try {
            launchnavigator.navigate([$scope.pokemon.position.latitude, $scope.pokemon.position.longitude]);
        } catch (err) {
            $ionicPopup.alert({ title: 'Navigation', template: 'Failed to start navigation' });
        }
    };

    // Function for checking wether the pokemon was already catched by the player
    $scope.alreadyCatched = function(name) {
        $scope.mypokemons = JSON.parse(window.localStorage.getItem(mypokemonsPreferenceKey));
        if ($scope.mypokemons == null)
            return false;
        for (i = 0; i < $scope.mypokemons.length; i++) {
            if ($scope.mypokemons[i].name != name)
                continue;
            return true;
        }
        return false;
    }

    $scope.catchPokemon = function() {
        if ($scope.alreadyCatched($scope.pokemon.name)) {
            $ionicPopup.alert({ title: 'Catch', template: "You already own a" + $scope.pokemon.name + " don't be greedy!" });
            return;
        }

        if ($scope.mypokemons == null) {
            $scope.mypokemons = [];
        }

        $scope.mypokemons.push({ name: $scope.pokemon.name, catchdate: new Date().toLocaleString() });
        window.localStorage.setItem(mypokemonsPreferenceKey, JSON.stringify($scope.mypokemons));    

        $scope.showCatchButton = false;
        $ionicPopup.alert({ title: 'Catch', template: "You catched a " + $scope.pokemon.name + "!" });
        $window.location.href = "#/tab/my-pokemons";
    };

    // Random Position calculations from the top of ours heads ;): 
    function getRandomPosition(latitude, longitude, radius) {
        var getRandomCoordinates = function(radius, uniform) {
            var a = Math.random(), b = Math.random();
            if (uniform) {
                if (b < a) {
                    var c = b;
                    b = a;
                    a = c;
                }
            }
            return [b * radius * Math.cos(2 * Math.PI * a / b), b * radius * Math.sin(2 * Math.PI * a / b)];
        };
        var randomCoordinates = getRandomCoordinates(radius, true);
        var earth = 6378137;
        var northOffset = randomCoordinates[0], eastOffset = randomCoordinates[1];
        var offsetLatitude = northOffset / earth, offsetLongitude = eastOffset / (earth * Math.cos(Math.PI * (latitude / 180)));
        return { latitude: latitude + (offsetLatitude * (180 / Math.PI)), longitude: longitude + (offsetLongitude * (180 / Math.PI)) }
    }

    function getDistanceBetweenPositions(lat1, lon1, lat2, lon2) {
        var R = 6371000; // Radius of the earth in m
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return Number(d);
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function safeApply(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
    }
});