/**
 * Created by Cosmin on 4/3/2016.
 */

angular.module('easyprezzieApp')
    .controller("LoginController", ["$scope", "$location", "$window", "authenticationSvc",function ($scope, $location, $window, authenticationSvc) {
        $scope.userInfo = null;
        $scope.isHeader = false;
        $scope.login = function () {
            if(navigator.onLine){
                authenticationSvc.login($scope.email, $scope.password, $scope.keepMeLogIn)
                    .then(function (result) {
                        $scope.userInfo = result;
                        $location.path("/home");
                    }, function (error) {
                        $window.alert("Invalid credentials");
                        //console.log(error);
                    });
            } else {
                alert("Your application is offline !");
            }

        };

        $scope.cancel = function () {
            $scope.email = "";
            $scope.password = "";
        };
    }])
    .controller("HomeController", ["$scope", "$location", "authenticationSvc", "auth",function ($scope, $location, authenticationSvc, auth) {
        $scope.userInfo = auth;
        $scope.isHeader = true;




    }])
    .controller('materialadminCtrl', function($scope, $rootScope, authenticationSvc, $location, $timeout){
        // For Mainmenu Active Class
        //this.$state = $state;

        //this.online = $rootScope.online;
        $rootScope.online = navigator.onLine;

        $scope.isOnline = navigator.onLine;

        $scope.$watch('online', function(newStatus) {
            $scope.isOnline = newStatus;
        });

        this.sidebarToggle = {
            left: false,
            right: false
        }

        //Close sidebar on click
        this.sidebarStat = function(event) {
            if (!angular.element(event.target).parent().hasClass('active')) {
                this.sidebarToggle.left = false;
            }
        }

        this.logout = function () {

            authenticationSvc.logout()
                .then(function (result) {
                    //console.log('logout');
                    $scope.userInfo = null;
                    $location.path("/login");
                }, function (error) {
                  //  console.log(error);
                });
        };

        this.qrRead = function(){
            if(navigator.onLine){
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        var _start      = result.text.indexOf("stampcard/")+"stampcard/".length;
                        var _stop       = result.text.indexOf("/view");
                        var userCode    = result.text.substring(_start, _stop);


                        var _fstart      = result.text.indexOf("fidelityAPI/")+"fidelityAPI/".length;
                        var _fstop       = result.text.indexOf("/view");
                        var fidelityCode    = result.text.substring(_fstart, _fstop);

                        if((result.text.indexOf("stampcard/") != -1) && (_stop != -1)){

                                $timeout(function () {
                                    $location.path("/stampcard/" + userCode);
                                }, 0);

                        } else if((result.text.indexOf("fidelityAPI/") != -1) && (_fstop != -1)){

                                $timeout(function() {
                                    $location.path("/fidelitycard/"+fidelityCode);
                                }, 0);


                        }else {
                            alert("Code format not valid !");
                        }
                    },
                    function (error) {
                        alert("Scanning failed: " + error);
                    }
                );
            } else {
                alert("Your application is offline !");
            }

        };
    })

    .controller('StampcardController', function($scope, $routeParams, authenticationSvc, $window, $location, $timeout, auth){

        $scope.userInfo = auth;
        $scope.isHeader = true;

        //console.log('test c');
        $scope.cardCode = $routeParams.cod;
        $scope.card = "";
        $scope.card_percent = 0;
        $scope.card_stamps = [];
        $scope.complete = 0;
        $scope.redeem = 0;

        $scope.getCard = function () {
            if(navigator.onLine){
                authenticationSvc.getStampCard($scope.cardCode)
                    .then(function (result) {
                        $scope.updateGraphic(result);
                    }, function (error) {
                        if(error.data.error == "token_expired"){
                            $window.alert("Token expired !");
                            $scope.tokenExpired();
                        }
                        $location.path("/materialadmin/");
                        //console.log(error);
                    });
            } else {
                alert("Your application is offline !");
            }

        };

        $scope.addStamps = function(){
            var _id = $scope.card.id;
            var _stamps = parseInt($scope.selectedItem.value);
            var _crt = parseInt($scope.card.stamp_complete);
            var _addMax = parseInt($scope.card.stamp_max - _crt);
            if(_stamps > _addMax)_stamps =_addMax;

            $scope.updateCard({id:_id, stamps: (_crt +_stamps)});
        };

        $scope.redeemCard = function(){
            if(navigator.onLine){
                authenticationSvc.redeem()
                    .then(function (result) {
                        $scope.updateGraphic(result);
                    }, function (error) {
                        if(error.data.error == "token_expired"){
                            $window.alert("Token expired !");
                            $scope.tokenExpired();
                        }
                    });
            } else {
                alert("Your application is offline !");
            }
        };

        $scope.removeStamps = function(){
            var _id = $scope.card.id;
            //console.log($scope.activItem);
            var _stamps = parseInt($scope.selectedItem.value);
            //console.log(_stamps);
            var _crt = parseInt($scope.card.stamp_complete);
            //console.log(_crt);
            if(_stamps > _crt)_stamps =_crt;
           // console.log(_stamps);

            $scope.updateCard({id:_id, stamps: (_crt -_stamps)});
        };



        $scope.updateCard = function(_item){
            if(navigator.onLine){
                authenticationSvc.update(_item)
                    .then(function (result) {
                        $scope.updateGraphic(result);
                    }, function (error) {
                        if(error.data.error == "token_expired"){
                            $window.alert("Token expired !");
                            $scope.tokenExpired();
                        }
                    });
            } else {
                alert("Your application is offline !");
            }
        };

        $scope.updateGraphic = function(result) {
            $scope.card = result.card;
            $scope.profile = result.profile;
            $scope.card_percent = $scope.card.stamp_complete / $scope.card.stamp_max * 100;
            $scope.card_stamps = [];
            for(var i = 1; i<= $scope.card.stamp_max; i++){
                $scope.card_stamps.push({name: i + ' stamp', value: i })
            }
            if($scope.card.stamp_complete == $scope.card.stamp_max){
                $scope.complete = 1;
            } else {
                $scope.complete = 0;
            }
            $scope.selectedItem = $scope.card_stamps[0];
            if($scope.card.stamp_complete > $scope.card.stamp_max){
                $scope.redeem = 1;
            } else {
                $scope.redeem = 0;
            }
            $location.path("/stampcard/"+$scope.cardCode);
        }

        $scope.tokenExpired = function(){
            authenticationSvc.logout()
                .then(function (result) {
                    //console.log('logout');
                    $scope.userInfo = null;
                    $timeout(function() {
                        $location.path("/login");
                    }, 0);
                }, function (error) {
                    //console.log(error);
                });
        }

        $scope.getCard();
    })

    .controller('FidelitycardController', function($scope, $routeParams, authenticationSvc, $window, $location, $timeout, auth){

        $scope.userInfo = auth;
        $scope.isHeader = true;

        $scope.cardCode = $routeParams.cod;
        $scope.card = "";

        $scope.getCard = function () {
            if(navigator.onLine){
                authenticationSvc.getFidelityCard($scope.cardCode)
                    .then(function (result) {
                        $scope.updateGraphic(result);
                    }, function (error) {
                        if(error.data.error == "token_expired"){
                            $window.alert("Token expired !");
                            $scope.tokenExpired();
                        }
                        //console.log(error);
                        $location.path("/materialadmin/");
                    });
            } else {
                alert("Your application is offline !");
            }

        };

        $scope.addPoints = function(){
            var _id = $scope.card.id;
            var _amount = parseInt($scope.selectedamount);

            $scope.updateCard({id:_id, amount: _amount});
        };




        $scope.updateCard = function(_item){
            if(navigator.onLine){
                authenticationSvc.updateFidelityCard(_item)
                    .then(function (result) {
                        $scope.updateGraphic(result);
                    }, function (error) {
                        if(error.data.error == "token_expired"){
                            $window.alert("Token expired !");
                            $scope.tokenExpired();
                        }
                    });
            } else {
                alert("Your application is offline !");
            }
        };

        $scope.tokenExpired = function(){
            authenticationSvc.logout()
                .then(function (result) {
                    //console.log('logout');
                    $scope.userInfo = null;
                    $timeout(function() {
                        $location.path("/login");
                    }, 0);
                }, function (error) {
                    //console.log(error);
                });
        };

        $scope.updateGraphic = function(result) {
            $scope.card = result.card;
            $scope.profile = result.profile;
            $scope.selectedamount = '';
            $location.path("/fidelitycard/"+$scope.card.unique_code);
        }

        $scope.getCard();
    });