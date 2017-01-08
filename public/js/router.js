var app = angular.module('cashier');

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('cashier', {
            url: '',
            template: '<main-app></main-app>',
            resolve: {
                cashier: function ($q, $timeout) {
                    return $q.when($timeout(function () {
                        return true;
                    }, 1000))
                }
            }
        });

    $urlRouterProvider.otherwise('');
});