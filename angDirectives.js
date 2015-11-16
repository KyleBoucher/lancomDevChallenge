///////////// Directives //////////////
app.directive('kbNavBar', function() {
    return {
        restrict: 'A',
        templateUrl: "./navBar.html"
    };
});

app.directive('kbQaRow', function() {
    return {
        restrict: 'A',
        templateUrl: "./QARow.html",
        controller: function($scope) {
            
        }
    };
});

app.directive('kbSnapshot', function() {
    return {
        restrict: 'EA',
        scope: {
            question: '='
        },
        controller: function($scope) {
            
        }
    };
});

