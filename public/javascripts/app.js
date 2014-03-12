// Angular module, defining routes for the app
angular.module('charts', ['chartServices', 'angularCharts']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/charts', { templateUrl: 'partials/list.html', controller: ChartListCtrl }).
           // when('/chart/:chartId', { templateUrl: 'partials/item.html', controller: ChartItemCtrl }).
            when('/chart/:chartId', { templateUrl: 'partials/chart.html', controller: ChartVolumeCtrl }).
            when('/new', { templateUrl: 'partials/new.html', controller: ChartNewCtrl }).
            when('/update', { templateUrl: 'partials/list.html', controller: ChartVolumeCtrl }).
            // If invalid route, just redirect to the main list view
            otherwise({ redirectTo: '/charts' });
    }]);
