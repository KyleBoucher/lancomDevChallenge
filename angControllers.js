var url = "http://kyuyeol7921.lancom.co.nz";

///////////// Controllers //////////////
app.controller('NewCandidateController', function($scope, $http) {
    $scope.candidate = {name: "", email: ""};
    $scope.newCandidate = function() {
        var name = $scope.candidate.name;
        var email = $scope.candidate.email;
        $http({ method: "POST",
                url: url + "/candidates/",
                headers: {"Content-Type": "application/json"},
                data: {
                    Fullname: name,
                    Email: email,
                    BirthDay: "1975-11-10T22:11:24Z"
                }
              })
        .then(
            // Success
            function(response) {
                console.log("POST SUCCESS - " + response.status);
            }, 
            // Fail
            function(response) {
                console.log("POST FAIL - " + response.status);
            }
        );
    };
    $scope.reset = function() {
        $scope.candidate.name = $scope.candidate.email = "";
    };
});

app.controller('examController', ['$scope', '$http', '$interval', '$filter', function($scope, $http, $interval, $filter) {
    $scope.selectedCandidate = null;
    $scope.selectedQuestionair = null;
    $scope.canStartExam = false;
    $scope.totalTimer = null;
    
    $scope.exam = null;
    $scope.candidates = [];
    $scope.questionairs = [];
    $scope.questions = [];
    $scope.answers = [];
    
    $scope.examStartTime = null;
    $scope.examEndTime = null;
    
    $scope.startExam = function() {
        if(!$scope.canStartExam) {return;}
        
        $scope.examStartTime = new Date();
        console.log("Starting Exam: " + $scope.examStartTime);
    }
    $scope.submitExam = function() {
        if(!$scope.canStartExam) {return;}
        
        $scope.examEndTime = new Date();
        console.log("Ending Exam: " + $scope.examEndTime);
        // Finalize post? Invalidate choices? Post all questions again?
        
//        $http({ method: "POST",
//            url: url + "/exam/addorupdate"})
//        .then(
//            // Success
//            function(response) {
//            }, 
//            // Fail
//            function(response) {
//            }
//        );
    }
    
    function addUpdateExam() {
        console.log("Adding: " + $scope.selectedCandidate);
        $scope.canStartExam = true;
        $scope.questions = $scope.selectedQuestionair.Questions;
        
        // send $http request add or update exam
    }
    function invalidateSelection() {
        console.log("Invalidating");
        $scope.canStartExam = false;
        $scope.questions = null;
    }
    
    $scope.selectQuestionair = function() {
        if($scope.selectedQuestionair != null && angular.isDefined($scope.selectedCandidate) && $scope.selectedCandidate != null && $scope.selectedCandidate != "") {
            // candidate and questionaire selected
            //  Add/Update Exam on server
            addUpdateExam();
        } else {
            invalidateSelection();
        }
    }
    
    $scope.selectCandidate = function() {
        if($scope.selectedCandidate != null && angular.isDefined($scope.selectedQuestionair) && $scope.selectedQuestionair != null && $scope.selectedQuestionair != "") {
            // candidate and questionaire selected
            //  Add/Update Exam on server
            addUpdateExam();
        } else {
            invalidateSelection();
        }
    }
    
    $scope.focus = function(q, $event) {
        console.log("Focus: " + q.Hash);
        var a = $filter('filter')($scope.answers, q.Hash);
        if(a=="") {
            $scope.answers.push({
                "ExamKey": "" + $scope.selectedQuestionair.Hash + "/" + $scope.selectedCandidate.Email,
                "QuestionHash": q.Hash,
                "AnswerText": $event.target.value,
                "StartTime": new Date(),
                "EndTime": null
            });
        } 
        
        // start timer for snapshotting?
            // in timer do snapshott at 1min intervals or something?
    }
    $scope.unfocus = function(q) {
        console.log("unfocus Q: " + q.Hash);
        var a = $filter('filter')($scope.answers, q.Hash);
        if(a=="") {
            a.EndTime = new Date();
            
            // post update to $http
        }
    }
    
    
    $http({ method: "GET",
            url: url + "/candidates/"})
    .then(
        // Success
        function(response) {
            $scope.candidates = response.data;
        }, 
        // Fail
        function(response) {
            $scope.candidates = [{Fullname: response.data, code: response.status}];
        }
    );
    
    $http({ method: "GET",
            url: url + "/questionaires/"})
    .then(
        // Success
        function(response) {
            $scope.questionairs = response.data;
        }, 
        // Fail
        function(response) {
            $scope.questionairs = [{Name: response.data, code: response.status}];
        }
    );
}]);