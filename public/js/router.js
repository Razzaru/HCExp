var app = angular.module('cashier');

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('cashier', {
            url: '',
            template: '<main-app></main-app>',
            resolve: {
                cashier: function ($state, CashierService) {
                    if(CashierService.checkAuth) {
                        return true;
                    } else {
                        $state.go('/login');
                    }
                }
            }
        })
        .state('login', {
            url: '/login',
            template: '<login></login>'
        })

    $urlRouterProvider.when('', '/login');
});