// PokemonIndex Controller
angular.module('starter').controller('PokemonIndexCtrl', function($scope, $http,
    mapPreferenceKey, userPreferenceKey, pokemonListPreferenceKey, mypokemonsPreferenceKey,
    baseUrlGetPokemons, defaultMaximumRadius, defaultCatchRadius, defaultPokemonListSize, defaultUser) {
    $scope.pokemons = [];
    $scope.currentCount = {};
    $scope.nextPageUrl = {};
    $scope.nextPageExists = true;
    $scope.map = {};
    $scope.user = {};
    $scope.pokemonlist = {};
    $scope.greeting = "";

    $scope.$on('$ionicView.loaded', function() {
        $scope.initialize();
    });

    $scope.$on('$ionicView.enter', function() {
        var m = JSON.parse(window.localStorage.getItem(mapPreferenceKey));
        if (m != null) {
            $scope.map = m;
        }
        var pl = JSON.parse(window.localStorage.getItem(pokemonListPreferenceKey));
        if (pl != null) {
            $scope.pokemonlist = pl;
        }
        var u = JSON.parse(window.localStorage.getItem(userPreferenceKey));
        if (u != null) {
            $scope.user = u;
        } 
        $scope.calculateGreeting();
    });

    $scope.calculateGreeting = function() {
        var d = new Date();
        var time = d.getHours();
        if(time >= 6 && time < 12) {
            $scope.greeting = "Good morning";
        } else if (time >= 12 && time < 18) {
            $scope.greeting = "Good afternoon";
        } else if (time >= 18 && time < 24){
            $scope.greeting = "Good evening";
        } else {
            $scope.greeting = "Good night";
        }
        $scope.greeting = $scope.greeting + " " + $scope.user.firstname + "!";
    }

    $scope.initialize = function() {
        // Check if application has a mapPreference, if not: create it and set default:
        var m = JSON.parse(window.localStorage.getItem(mapPreferenceKey));
        if (m == null) {
            $scope.map.maximumradius = defaultMaximumRadius;
            $scope.map.catchradius = defaultCatchRadius;
            window.localStorage.setItem(mapPreferenceKey, JSON.stringify($scope.map));
        }
        // Check if application has a pokemonlistPreference, if not: create it and set default:
        var pl = JSON.parse(window.localStorage.getItem(pokemonListPreferenceKey));
        if (pl == null) {
            $scope.pokemonlist.size = defaultPokemonListSize;
            window.localStorage.setItem(pokemonListPreferenceKey, JSON.stringify($scope.pokemonlist));
        } else {
            $scope.pokemonlist = pl;
        }
        var u = JSON.parse(window.localStorage.getItem(userPreferenceKey));
        // Check if application has a userPreference, if not: create it and set default:
        if (u == null) {
            $scope.user = defaultUser;
            console.log($scope.user);
            window.localStorage.setItem(userPreferenceKey, JSON.stringify($scope.user));
        }
        // Load initial pokemons
        $scope.getPokemons();
    }

    $scope.getPokemons = function() {
        console.log("getPokemons called");
        $scope.addPokemonsByUrl(baseUrlGetPokemons + $scope.pokemonlist.size);
    };

    $scope.nextPage = function() {
        console.log("nextPage called");
        $scope.addPokemonsByUrl($scope.nextPageUrl);
        // Disable recalling this method when last item was reached
        if ($scope.nextPageUrl == null) {
            $scope.nextPageExists = false;
        }
    };

    $scope.addPokemonsByUrl = function(url) {
        if (!url || angular.equals({}, url)) return;
        $http.get(url).then(function(resp) {
            console.log("Success: GetPokemons: " + url);
            // Set Global variables for this API call
            $scope.currentCount = resp.data.count;
            $scope.nextPageUrl = resp.data.next;
            $scope.previousPageUrl = resp.data.previous;

            // Concatenate arrays
            $scope.pokemons = $scope.pokemons.concat(resp.data.results);

            // Reload infinite scroll
            $scope.$broadcast('scroll.infiniteScrollComplete');

            // For JSON responses, resp.data contains the result
        }, function(err) {
            console.error("Failed: GetPokemons");
            console.error(err);
        });
    };
});