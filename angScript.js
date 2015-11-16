///////////// AngularJS App //////////////
var app = angular.module('angularApp', []);

///////////// Filters //////////////
app.filter('secondsToDate', [function() {
    return function(seconds) {
        var d = new Date();
        d.setHours(0,0,0,0);
        d.setSeconds(seconds);
        return d;
    };
}]);

app.filter('isSame', function() {
    return function(input, param) {
        return input === param;
    };
});

app.filter('getByHash', function() {
    return function(input, hash) {
        return $('filter')(input, hash);
    }
});