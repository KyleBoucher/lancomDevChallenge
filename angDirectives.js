///////////// Directives //////////////
/**
    Template to place same Nav Bar on all pages
*/
app.directive('kbNavBar', function() {
    return {
        restrict: 'A',
        templateUrl: "./navBar.html"
    };
});

/**
    Template for each Question/Answer Row for taking an Exam.
*/
app.directive('kbQaRow', function() {
    return {
        restrict: 'A',
        templateUrl: "./QARow.html",
        controller: function($scope) {
            
        }
    };
});

/**
    Template for each Question/Answer Row for reviewing an Exam.
*/
app.directive('kbQaRowReview', function() {
    return {
        restrict: 'A',
        templateUrl: "./QARowReview.html",
        controller: function($scope) {
            
        }
    };
});

/**
    TODO: implement snapshotting...
*/
app.directive('kbSnapshot', ['$interval', '$http', function($interval, $http) {
    return {
        restrict: 'EA',
        scope: {
            interval: '=',
            question: '=',
            answer: '=',
            atext: '='
        },
        link: function($scope, $element, $attrs) {
            if(!$scope.question.LogSnapshot) { return; }// Don't snapshot if it's not required
            var t = null;
            
            // Update function
            var tick = function() {
                // log snapshot
                httpRequest($http, "POST", "application/json", "/exam/snapshots/add", 
                    {
                        ExamKey: $scope.answer.ExamKey,
                        QuestionHash: $scope.question.Hash,
                        QuestionText: $scope.question.QuestionText,
                        LogSnapshot: $scope.question.LogSnapshot,
                        AnswerText: $scope.atext,
                        Time: new Date()
                    },
                    function(response) {
                        console.log("Snapshot added");
                    }, 
                    function(response) {
                        console.log("Snapshot failed to add");
                    });
            }
            
            $element.bind('focus', function($event) {
                console.log("Snapshot timer (" + $scope.interval + "ms) starting for: " + $scope.answer.ExamKey + "/" + $scope.question.Hash);
                t = $interval(function() {
                    tick();
                }, $scope.interval);
                
                tick(); // Initial tick
            });
            
            $element.bind('blur', function($event) {
                console.log("Snapshot timer stopping for: " + $scope.answer.ExamKey + "/" + $scope.question.Hash);
                $interval.cancel(t);
            });
            
            $scope.$on('$destroy', function() {
                $interval.cancel(t);
            });
        }
    };
}]);

/**
    Acts as a timer, updating $scope.examTime every second. 
        - Used for taking an Exam.
*/
app.directive('examTimer', ['$interval', '$filter', function($interval, $filter) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var t = null;
            $scope.examTime = null;
            
            // Update function
            var tick = function() {
                var curTime = new Date();
                //console.log("Exam timer update: " + curTime + "\n" + $scope.examStartTime + "\nDif: " + (curTime - $scope.examStartTime));
                var dif = new Date();
                dif.setHours(0,0,0,0);
                dif.setMilliseconds(curTime - $scope.examStartTime);
                $scope.examTime = $filter('date')(dif, 'HH:mm:ss');
            }
            
            $scope.startExamTimer = function() {
                console.log("Exam timer starting...");
                t = $interval(function() {
                    tick();
                }, 1000);
                
                tick(); // Initial tick to avoid blank displays
            }
            
            $scope.stopExamTimer = function() {
                console.log("Exam timer stopping...");
                tick();
                $interval.cancel(t);
            }
            
            $scope.$on('$destroy', function() {
                $interval.cancel(t);
            });
        }
    };
}]);