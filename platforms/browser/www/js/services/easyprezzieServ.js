/**
 * Created by Cosmin on 4/3/2016.
 */

angular.module('easyprezzieApp')
    .factory("authenticationSvc", function($http, $q, $window, $timeout) {
        var userInfo;
        var stampCard;
        var fidelityCard;
        var _this = this;

        function login(email, password, keepMeLogIn) {
            var deferred = $q.defer();

            console.log(email);
            console.log(password);
            console.log(keepMeLogIn);

            $http.post("http://easyprezzie.com/api/authenticate", {
                email: email,
                password: password
            }).then(function(result) {
                console.log('login result');
                console.log(result);
                userInfo = {
                    keepMeLogIn: keepMeLogIn,
                    accessToken: result.data.token,
                    user: result.data.user,
                    profile: result.data.profile,
                    subscribersCount: result.data.subscribersCount,
                    giftsCount: result.data.giftsCount,
                    paidSubscribersCount: result.data.paidSubscribersCount
                };
                if(keepMeLogIn){
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));
                } else {
                    $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                }

                deferred.resolve(userInfo);
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function logout() {
            var deferred = $q.defer();

            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            localStorage.removeItem("userInfo");
            deferred.resolve('logout');

            return deferred.promise;
        }

        function getUserInfo() {

            return userInfo;
        }

        function getStampCard(code) {
            var deferred = $q.defer();

            console.log(code);

            $http.get("http://easyprezzie.com/stampAPI/card/get/"+code+"?token="+userInfo.accessToken).then(function(result) {
                console.log(result);
                if (typeof result.data.error !== 'undefined' && result.data.error == true) {
                    alert(result.data.message);
                    deferred.reject(result);
                } else {
                    stampCard =  result.data.data;
                    $window.sessionStorage["stampCard"] = JSON.stringify(stampCard);
                    deferred.resolve(stampCard);
                }


            }, function(error) {
                // todo: get new token then call getStampCard
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function update(_item) {
            var deferred = $q.defer();

            console.log(_item);

            $http.get("http://easyprezzie.com/stampAPI/card/update/"+_item.id+"?token="+userInfo.accessToken+"&sc_complete='"+_item.stamps+"'").then(function(result) {
                console.log(result);
                stampCard =  result.data.data;
                $window.sessionStorage["stampCard"] = JSON.stringify(stampCard);
                deferred.resolve(stampCard);
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function getFidelityCard(code) {
            var deferred = $q.defer();

            console.log(code);

            $http.get("http://easyprezzie.com/fidelityAPI/card/get/"+code+"?token="+userInfo.accessToken).then(function(result) {
                console.log(result);
                if (typeof result.data.error !== 'undefined' && result.data.error == true) {
                    alert(result.data.message);
                    deferred.reject(result);
                } else {
                    fidelityCard =  result.data.data;
                    $window.sessionStorage["fidelityCard"] = JSON.stringify(fidelityCard);
                    deferred.resolve(fidelityCard);
                }

            }, function(error) {
                // todo: get new token then call fidelityCard
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        }


        function updateFidelityCard(_item) {
            var deferred = $q.defer();

            console.log(_item);

            $http.get("http://easyprezzie.com/fidelityAPI/card/update/"+_item.id+"?token="+userInfo.accessToken+"&amount='"+_item.amount+"'").then(function(result) {
                console.log(result);
                fidelityCard =  result.data.data;
                $window.sessionStorage["fidelityCard"] = JSON.stringify(fidelityCard);
                deferred.resolve(fidelityCard);
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function redeem() {
            var deferred = $q.defer();

            $http.get("http://easyprezzie.com/stampAPI/card/redeem/"+stampCard.card.id+"?token="+userInfo.accessToken).then(function(result) {
                console.log(result);
                stampCard =  result.data.data;
                $window.sessionStorage["stampCard"] = JSON.stringify(stampCard);
                deferred.resolve(stampCard);
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function init() {
            if(localStorage.getItem("userInfo")) {
                userInfo = JSON.parse(localStorage.getItem("userInfo"));
            } else if ($window.sessionStorage["userInfo"]) {
                userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            }
        }
        init();

        return {
            login: login,
            logout: logout,
            getUserInfo: getUserInfo,
            getStampCard: getStampCard,
            getFidelityCard: getFidelityCard,
            updateFidelityCard: updateFidelityCard,
            update: update,
            redeem: redeem
        };
    });