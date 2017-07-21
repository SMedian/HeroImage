angularApp
    .config(['$routeProvider', '$locationProvider', function AppConfig($routeProvider, $locationProvider) {
        //the routeProvider module helps us configure routes in AngularJS.
        $routeProvider
            //when the user navigates to the root, index of our app
            .when("/", {
                //the url to the template for this view
                templateUrl: "views/tool.html",
                //the controller of this view
                controller: "ToolController",
            })
            //otherwise, default to sending them to the index page
            .otherwise({
                redirectTo: "/"
            });

        //NOT WORKING 042016 0251am $locationProvider.html5Mode({ enabled: true, requireBase: false });
        //# Use html5 mode.
        //$locationProvider.html5Mode(true)

    }])