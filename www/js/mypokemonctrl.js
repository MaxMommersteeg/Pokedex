// MyPokemon Controller
angular.module('starter').controller('MyPokemonCtrl', function($scope, $http, $window, $ionicPopup,
    userPreferenceKey, mypokemonsPreferenceKey, baseUrlExternalInformationWebsite) {
    $scope.user = {};
    $scope.mypokemons = [];

    $scope.initialize = function() {
        console.log("Initialize MyPokemonCtrl called");
        // Initialize user from preferences
        var u = JSON.parse(window.localStorage.getItem(userPreferenceKey));
        if (u != null) {
            $scope.user = u;
        }
        var mp = JSON.parse(window.localStorage.getItem(mypokemonsPreferenceKey));
        if (mp != null) {
            $scope.mypokemons = mp;
        }
    };

    $scope.showPokemonOnWeb = function(name) {
        if (!name || angular.equals({}, name)) { return; }
        var confirmPopup = $ionicPopup.confirm({
            title: 'Open external app',
            template: 'Ready to open an external app for more information?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                try {
                    cordova.InAppBrowser.open(baseUrlExternalInformationWebsite + name, '_system', 'location=yes');    
                } catch (err) {
                    $ionicPopup.alert({ title: 'Open external app', template: 'Failed to open browser' });
                }
            }
        });
    };

    $scope.showPokemon = function(name) {
        if (!name || angular.equals({}, name)) { return; }
        $window.location.href = "#/tab/pokemon/" + name;
    };

    $scope.$on('$ionicView.enter', function() {
        $scope.initialize();
    });
});