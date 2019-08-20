import $ from "jquery";
window.jQuery = $;
window.$ = $;
global.jQuery = $;

import angular from 'angular';
import "popper.js";
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

import "./scss/main.scss";

var campaign_id = "1300";
var campaign_name = "Honour Your Soul";
var stage = 1;
var entitled = null; 
if (document.location.hostname == "localhost") {
    var theLink = 'http://localhost:15080';
    // var omoappid = "5ca5e5e7cf8d1f01ea696ca9";
    var omoappid = "586ba5e946e83100526d6ca8";
    // var theLink='https://deluxeclub-212804.appspot.com/';
} else {
    var theLink = 'https://deluxeclub-212804.appspot.com/';

    // var omoappid = "5ca5e5e7cf8d1f01ea696ca9";
    var omoappid = "5ca5e618a4fd410187e6d206";
}

var deluxeclubApp = angular.module('deluxeclub', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
deluxeclubApp.controller('deluxeclubController', function deluxeclubController($scope, $timeout) {

    $scope.stage = 1;
    $scope.loading = false;
    $scope.workshopselected = "";
    var accessToken = "";
    var OMOSDK = null;
    var platform = "";
    var OMO_USER_TYPE = {FREE:0, MEMBER_ONLY:1, SUBSCRIBER:2} ;
    var omoUserType = OMO_USER_TYPE.FREE; 
    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    function validateName(name) { 
        var re = /^[a-zA-Z]+(?:[\s.]+[a-zA-Z]+)*$/;
        return re.test(name);
    }
    function validatePhone(phone) { 
        var re = /^1[0-9]{10}$|^[56789][0-9]{7}$/;
        return re.test(phone);
    }
    function searchOmoUser(omoid) {

        var payload = {};
        payload['campaignid'] = campaign_id;
        payload['omoid'] = omoid;
        if (window.console) {
            console.log(payload);
        }
        if(omoUserType==0){
            console.log('Free');
            $timeout(function () {
                $scope.stage = 5;
                $scope.$apply();
            }, 0);
        }
          
        if(omoUserType==1){
            console.log('Member only');
            $timeout(function () {
                $scope.stage = 5;
                $scope.$apply();
            }, 0);
        }
    
        if(omoUserType==2){
            console.log('Subscriber');
            $.post(theLink + '/GetEventOMO', payload, function (response) {
                if (window.console) {
                    console.log(response)
                }
                if (response.detail == "have record") {
                    //to stage 3 - user have record
                    $timeout(function () {
                        // to stage 4 when production
                        $scope.stage = 2;
                        $scope.$apply();
                    }, 0);
    
                } else if (response.detail == "no record") {
                    //to stage 2 - Register Deluxe evnet
                    $timeout(function () {
                        $scope.stage = 2;
                        $scope.$apply();
                    }, 0);
                } else {
    
                }
    
            }, "json").fail(function () {
                if (window.console) {
                    console.log("Server Error")
                }
            }, "json");
        }
        
    }


    function getuserinfo(currentUser) {
       console.log(currentUser);
        if (currentUser.isLoggedIn) {
            var appID = OMOSDK.auth().currentAppId;
            omoUserType = OMO_USER_TYPE.MEMBER_ONLY; 
           
        } else {
            console.log("fail to login")
        }
        entitled = OMOSDK.auth().isUserEntitled()
            .then(function (info) {
                 console.log(info);
                if(info){
                    omoUserType = OMO_USER_TYPE.SUBSCRIBER; 
                    // console.log(omoUserType);
                }
            }).then(function(){
                searchOmoUser(currentUser.currentAccount.accountId);
            })
            .catch(function () {
                console.log("Get entitlement error \n");
            });
    }
    function gopaypal() {
       
        $('#paypalsubmit').click();
        
    }

    function checkquota() {
    
    
        $.post(theLink + '/getQuota', function (response) {
            if (window.console) {
                console.log(response.quota)
            }
            if(response.status == "SUCCESS"){
                if ((response.quota[15].quota<=0) && (response.quota[16].quota<=0) ){
                    $timeout(function () {
                        // to stage 4 when production
                        $scope.stage = 6;
                        $scope.$apply();
                    }, 0);
                }else{
                    var workshopQuota = response.quota;
                    $.each(workshopQuota,function(key, x){
                        if(x.quota <=0 ){
                            $('#stage2-extra option[value="'+ x.workshop_id +'"]').attr('disabled', 'disabled');
                            $('#stage2-extra option[value="'+ x.workshop_id +'"]').append(' (名额已滿)');
                        }
                        // console.log($('#stage2-extra option[value="'+ x.workshop_id +'"]'));

                    });    
                }
            }else{
                console.log('Quota fail');
            }
        
    
        }, "json").fail(function () {
            if (window.console) {
                console.log("Server Error")
            }
        }, "json");
    }
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    function checkcurrentlogin(currentUser){
        if (currentUser.isLoggedIn) {
            OMOSDK.auth().logoutCurrentUser();
        }
    }
    $scope.$watch('$viewContentLoaded',
        function () {
            //5ca5e5e7cf8d1f01ea696ca9 UAT
            // /5ca5e618a4fd410187e6d206 prodcution
            $timeout(function () {
                OMOSDK = new OMO({
                    appId: omoappid,
                    language: 'zh_hk',
                    region: 'HK',
                    authenticationServerUrl: "https://auth.nextdigital.com.hk/",
                    redirectUrl: ''
                });

                OMOSDK.logger().extraUTMParams({
                    utm_source: 'hkdeluxe_web',
                    utm_medium: 'internal',
                    utm_campaign: 'hkdeluxe_workshop',
                    utm_term: 'term',
                    utm_content: 'Honour Your Soul'
                });
                // OMOSDK.auth().globalLogout();
               
                // getuserinfo(OMOSDK.auth().getUserInfo());
                OMOSDK.on(OMOSDK.events.SUCCESS, function (data) {
                    console.log('Successful Login or Registration opened');
                    OMOSDK.auth().subscribe(function (user) {
                        console.log('subscribe called');
                        accessToken = OMOSDK.auth().getAccessToken();
                        getuserinfo(OMOSDK.auth().getUserInfo());
                       
                        if (accessToken != "") {
                            console.log(user);
                            if (/^\+/.test(user.currentAccount.phone)){
                                var original_mobile = user.currentAccount.phone; 
                                var trimed_mobile = original_mobile.slice(4);
                            }
                            else{
                                var trimed_mobile = user.currentAccount.phone;
                            }
                            $scope.mobile = trimed_mobile ;
                            $scope.email = user.currentAccount.email;
                            $scope.omoid = user.currentAccount.accountId;
                        }
                    });
                });   
               
                checkquota() ;
                console.log('Load OMOSDK');
            }, 0);
        });
       
    $scope.omologin = function () {
        OMOSDK.auth().redirectLogin();
    };
   
    $scope.saketimeselect = function() {
        if($scope.Sake == 16){
            $('#Sake_time').html('12:00-13:00') ;
            $('#Sake_time_mob').html('12:00-13:00') ;
        }
        if($scope.Sake == 17){
            $('#Sake_time').html('14:00-15:00') ;
            $('#Sake_time_mob').html('14:00-15:00') ;
        }
       
    }
    $scope.workshopselect = function() {
        if($scope.workshop == "workshopA"){
            $('#Workshop_name').html('專貴帽飾製作體驗') ;
            $('#Workshop_name_mob').html('專貴帽飾製作體驗') ;
        }
        if($scope.workshop == "workshopB"){
            $('#Workshop_name').html('樹脂藝術木盤工作坊') ;
            $('#Workshop_name_mob').html('樹脂藝術木盤工作坊') ;
        }
        if($scope.workshop == "workshopC"){
            $('#Workshop_name').html('日式花藝工作坊') ;
            $('#Workshop_name_mob').html('日式花藝工作坊') ;
        }
        $timeout(function () {
            $scope.workshopselected = $scope.workshop ; 
            $scope.$apply();
        }, 0);  
    }

    $scope.workshoptimeselect1 = function() {
        console.log($scope.workshopTime1);
        if($scope.workshopTime1 == 1){
            $('#Workshop_time').html('11:00-11:30') ;
            $('#Workshop_time_mob').html('11:00-11:30') ;
        }
        if($scope.workshopTime1 == 2){
            $('#Workshop_time').html('11:30-12:00') ;
            $('#Workshop_time_mob').html('11:30-12:00') ;
        }
        if($scope.workshopTime1 == 3){
            $('#Workshop_time').html('13:00-13:30') ;
            $('#Workshop_time_mob').html('13:00-13:30') ;
        }
        if($scope.workshopTime1 == 4){
            $('#Workshop_time').html('13:30-14:00') ;
            $('#Workshop_time_mob').html('13:30-14:00') ;
        }
        if($scope.workshopTime1 == 5){
            $('#Workshop_time').html('15:00-15:30') ;
            $('#Workshop_time_mob').html('15:00-15:30') ;
        }
        if($scope.workshopTime1 == 6){
            $('#Workshop_time').html('15:30-16:00') ;
            $('#Workshop_time_mob').html('15:30-16:00') ;
        }
        $timeout(function () {
            $scope.workshopselected = $scope.workshop ; 
            $scope.$apply();
        }, 0);  
    }

    $scope.workshoptimeselect2 = function() {

        console.log($scope.workshopTime2);
        if($scope.workshopTime2 == 7){
            $('#Workshop_time').html('11:00-12:00') ;
            $('#Workshop_time_mob').html('11:00-12:00') ;
        }
        if($scope.workshopTime2 == 8){
            $('#Workshop_time').html('13:00-14:00') ;
            $('#Workshop_time_mob').html('13:00-14:00') ;
        }
        if($scope.workshopTime2 == 9){
            $('#Workshop_time').html('15:00-16:00') ;
            $('#Workshop_time_mob').html('15:00-16:00') ;
        }
        $timeout(function () {
            $scope.workshopselected = $scope.workshop ; 
            $scope.$apply();
        }, 0);  
    }

    $scope.workshoptimeselect3 = function() {

        console.log($scope.workshopTime3);
        if($scope.workshopTime3 == 10){
            $('#Workshop_time').html('11:00-11:30') ;
            $('#Workshop_time_mob').html('11:00-11:30') ;
        }
        if($scope.workshopTime3 == 11){
            $('#Workshop_time').html('11:30-12:00') ;
            $('#Workshop_time_mob').html('11:30-12:00') ;
        }
        if($scope.workshopTime3 == 12){
            $('#Workshop_time').html('13:00-13:30') ;
            $('#Workshop_time_mob').html('13:00-13:30') ;
        }
        if($scope.workshopTime3 == 13){
            $('#Workshop_time').html('13:30-14:00') ;
            $('#Workshop_time_mob').html('13:30-14:00') ;
        }
        if($scope.workshopTime3 == 14){
            $('#Workshop_time').html('15:00-15:30') ;
            $('#Workshop_time_mob').html('15:00-15:30') ;
        }
        if($scope.workshopTime3 == 15){
            $('#Workshop_time').html('15:30-16:00') ;
            $('#Workshop_time_mob').html('15:30-16:00') ;
        }
        $timeout(function () {
            $scope.workshopselected = $scope.workshop ; 
            $scope.$apply();
        }, 0);  
    }
    $scope.tostage3 = function () {
        var errormsg = ""; 
        if(!$scope.Sake || $scope.Sake==""){
            errormsg = errormsg + "請選擇 Sake & Food Pairing 時間\n"; 
        }
        if(!$scope.workshop){
            errormsg = errormsg + "請選擇Premium Workshop\n"; 
        }else{
            if($scope.workshop=="workshopA"){
                if(!$scope.workshopTime1 || $scope.workshopTime1==""){
                    errormsg = errormsg + "請選擇請選擇Premium Workshop時間\n"; 
                }
            }
            if($scope.workshop=="workshopB"){
                if(!$scope.workshopTime2 || $scope.workshopTime2==""){
                    errormsg = errormsg + "請選擇請選擇Premium Workshop時間\n"; 
                }
            }
            if($scope.workshop=="workshopC"){
                if(!$scope.workshopTime3 || $scope.workshopTime3==""){
                    errormsg = errormsg + "請選擇請選擇Premium Workshop時間\n"; 
                }
            }
        }
        if (errormsg !=""){
            alert(errormsg);
        }else{
            $timeout(function () {
                $scope.stage = 3;
                $scope.$apply();
            }, 0);
        }
        
    };
    $scope.submitToServer = function () {
        var errormsg = ""; 
        $scope.regFormError = {} ;
        $timeout(function () {
            $scope.loading = true;
            $scope.$apply();
        }, 0);
        if (!$scope.name || $scope.name==""){
            errormsg = errormsg + "請輸入英文姓名\n"; 
        }else{
            if (! validateName($scope.name)){
                errormsg = errormsg + "請輸入正確英文姓名\n"; 
            }
        }
        if (!$scope.mobile || $scope.mobile==""){
            errormsg = errormsg + "請輸入聯絡手提電話\n"; 
         }else{
            if(! validatePhone($scope.mobile)){
                errormsg = errormsg + "請輸入正確聯絡手提電話\n"; 
            }
         }
         if (!$scope.email || $scope.email==""){
            errormsg = errormsg + "請輸入電郵\n"; 
         }else{
             if(! validateEmail($scope.email)){
                errormsg = errormsg + "請輸入正確電郵\n"; 
             }
         }
         if (!$scope.gender || $scope.gender==""){
            errormsg = errormsg + "請選擇姓別\n"; 
         }
         if (!$scope.age || $scope.age==""){
            errormsg = errormsg + "請選擇年齡\n"; 
         }
        
         if (!$scope.tnc){
            errormsg = errormsg + "請同意條款及細則\n";  
         }
         
        console.log($scope.regForm);
        // if (incorrectInput()) {
        //     console.log('incorrect');
        //     return;
        // }
        if (!$scope.regForm.$invalid && errormsg =="") {
            
            var payload = {};
            var extrafield = {}; 
            extrafield.name = $scope.name;
            extrafield.age = $scope.age;
            payload['workshop1'] = $scope.Sake;
            if($scope.workshop == "workshopA"){
                payload['workshop2'] =  $scope.workshopTime1;
            }
            if($scope.workshop == "workshopB"){
                payload['workshop2'] =  $scope.workshopTime2;
            }
            if($scope.workshop == "workshopC"){
                payload['workshop2'] =  $scope.workshopTime3;
            }
            payload['campaignId'] = campaign_id;
            payload['campaignName'] = campaign_name;
            payload['mobile'] = $scope.mobile ;
            payload['email'] = $scope.email ;
            payload['gender'] = $scope.gender ;
            payload['extra'] = JSON.stringify(extrafield);
            payload['omoid'] = $scope.omoid ;
            payload['interest'] = "";
            payload['promotion'] = "";

            //
            if (window.console) {
                console.log(payload);
            }


            $.post(theLink + '/submiteventomo', payload, function (response) {
                if (window.console) {
                    console.log(response)
                }
                if (response.status == "SUCCESS") {

                    $('#custom').val(response.key);
                    $timeout(function () {
                        console.log($('#custom').val());
                        gopaypal();
                       // $scope.stage = 4;
                    }, 0);
                } else if (response.status == "OUTOFSTOCK") {
                    $timeout(function () {
                        checkquota() ;
                        $scope.stage = 1;
                        $scope.$apply();
                    }, 0);
                } else if (response.status == "REGISTER-FAIL") {

                } else if (response.status == "QUOTA-FULL") {

                } else {

                }

            }, "json").fail(function () {

                if (window.console) {
                    console.log("Server Error")
                }
            }, "json");
        }else{
            $timeout(function () {
                $scope.loading = false;
                alert(errormsg);
                $scope.$apply();
            }, 0);
        }
    }

});



function init() {

    $(".interest_check").on("click", function () {
        $(".interest_check").removeClass("incorrect_checkbox");
    })

    $(".tnc_check").on("click", function () {
        $(".tnc_check").removeClass("incorrect_checkbox");
    })
}

function scrolltobottom() {
    $("html, body").animate({
        scrollTop: $(document).height()
    }, "slow");
    return false;
};



$(document).ready(function () {
    init();
});