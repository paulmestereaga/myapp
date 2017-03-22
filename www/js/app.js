/*global angular */

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
angular.module('easyprezzieApp', ['ngRoute'])
	.config(function ($routeProvider) {
		'use strict';

		$routeProvider.when("/", {
			templateUrl: "template/home.html",
			controller: "HomeController",
			resolve: {
				auth: function ($q, authenticationSvc) {
					var userInfo = authenticationSvc.getUserInfo();
					if (userInfo) {
						return $q.when(userInfo);
					} else {
						return $q.reject({ authenticated: false });
					}
				}
			}
		}).when("/stampcard/:cod",{
			templateUrl: "template/stampcard.html",
			controller: "StampcardController",
			resolve: {
				auth: function ($q, authenticationSvc) {
					var userInfo = authenticationSvc.getUserInfo();
					if (userInfo) {
						return $q.when(userInfo);
					} else {
						return $q.reject({ authenticated: false });
					}
				}
			}
		}).when("/fidelitycard/:cod",{
			templateUrl: "template/fidelitycard.html",
			controller: "FidelitycardController",
			resolve: {
				auth: function ($q, authenticationSvc) {
					var userInfo = authenticationSvc.getUserInfo();
					if (userInfo) {
						return $q.when(userInfo);
					} else {
						return $q.reject({ authenticated: false });
					}
				}
			}
		}).when("/login", {
			templateUrl: "template/login.html",
			controller: "LoginController"
		}).otherwise({
			redirectTo: '/'
		});
	})
	.run(["$rootScope", "$location", function ($rootScope, $location) {

		$rootScope.$on("$routeChangeSuccess", function (userInfo) {
			console.log(userInfo);
		});

		$rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {
			if (eventObj.authenticated === false) {
				$location.path("/login");
			}
		});
	}])
	//.run(function($rootScope){
	//	document.addEventListener("online", onOnline, false);
	//	document.addEventListener("offline", onOffline, false);
    //
	//	function onOnline() {
	//		$rootScope.$apply(function(){
	//			console.log("just got online event");
	//			$rootScope.noNetwork = false;
	//		});
	//	}
    //
	//	function onOffline() {
	//		$rootScope.$apply(function(){
	//			console.log("just got offline event");
	//			$rootScope.noNetwork = true;
	//		});
	//	}
	//});

	.run(function($window, $rootScope) {
		$rootScope.online = navigator.onLine;
		$window.addEventListener("offline", function() {
			$rootScope.$apply(function() {
				$rootScope.online = false;
			});
		}, false);

		$window.addEventListener("online", function() {
			$rootScope.$apply(function() {
				$rootScope.online = true;
			});
		}, false);
	});


function init() {

	//listen for changes
	document.addEventListener("offline", disableForm, false);
	document.addEventListener("online", enableForm, false);

}



