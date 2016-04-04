angular.module('starter', ['ionic'])

// Global constants
.constant('mapPreferenceKey', 'MAP_PREFERENCE')
.constant('userPreferenceKey', 'USER_PREFERENCE')
.constant('pokemonListPreferenceKey', 'POKEMON_LIST_SIZE_PREFERENCE')
.constant('baseUrlGetPokemons', 'http://pokeapi.co/api/v2/pokemon?limit=')
.constant('positionPreferenceKey', 'POSITION_PREFERENCE')
.constant('mypokemonsPreferenceKey', 'MY_POKEMONS_PREFERENCE')
.constant('baseUrlGetPokemon', 'http://pokeapi.co/api/v2/pokemon/')
.constant('baseUrlExternalInformationWebsite', 'http://www.pokemon.com/nl/pokedex/')
.constant('apiWebsite', 'http://pokeapi.co/')

// Global constant defaults
.constant('defaultMaximumRadius', 300)
.constant('defaultPokemonListSize', 30)
.constant('defaultUser', { firstname: 'Ash', lastname: 'Ketchum'})
.constant('defaultCatchRadius', 15)
.constant('defaultUpdateDistanceTimerDelay', 1000)
.constant('defaultUpdatePokemonPositionTimerDelay', 1000)
.constant('defaultUpdateCheckGpsTimerDelay', 1000)

.config(function($stateProvider, $urlRouterProvider) {
    
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    .state('tab.pokemon-index', {
      url: '/pokemons',
      views: {
        'pokemons-tab': {
            templateUrl: 'templates/pokemon-index.html',
            controller: 'PokemonIndexCtrl'
        }
      }
    })

    .state('tab.pokemon-detail', {
      url: '/pokemon/:name',
      views: {
        'pokemons-tab': {
            templateUrl: 'templates/pokemon-detail.html',
            controller: 'PokemonDetailCtrl'
        }
      }
    })
    
    .state('tab.pokemon-detail-stats', {
        url: '/pokemon/:name/stats',
        views: {
            'pokemons-tab': {
                templateUrl: 'templates/pokemon-detail-stats.html',
                controller: 'PokemonDetailCtrl'               
            }
        }
    })

    .state('tab.my-pokemons', {
      url: '/my-pokemons',
      views: {
        'my-pokemons-tab': {
          templateUrl: 'templates/my-pokemons.html',
          controller: 'MyPokemonCtrl'
        }
      }
    })
    
    .state('tab.settings', {
        url: '/settings',
        views: {
            'settings-tab': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        }
    });
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/pokemons');
});