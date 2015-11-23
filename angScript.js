///////////// AngularJS App //////////////
var app = angular.module('angularApp', []);

///////////// Filters //////////////
/**
    Gets the difference between two dates given 
        the input dates are in a string format.
*/
app.filter('dateDifferenceFromString', function() {
    return function(input, param) {
        var t1 = new Date(input);
        var t2 = new Date(param);
        return new Date(t2 - t1);
    };
});