/**
 * 
 */

 var app = angular.module('cvCreator',[]);

 app.controller('mainController',['$scope',($scope)=>{

 }]);


 app.directive('a4',()=>{
     return {
         templateUrl:'templates/a4.html'
     };
 });

 app.directive('left',()=>{
    return {
        templateUrl:'templates/a4_left.html'
    };
});