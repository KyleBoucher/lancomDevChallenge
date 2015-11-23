var url = "http://kyuyeol7921.lancom.co.nz";

///////////// Controllers //////////////
app.controller('NewCandidateController', function($scope, $http) {
    $scope.candidate = {name: "", email: ""};
    
    ///////////////// FUNCTIONS ///////////////
    /**
        Creates a new candidate and posts it to the server. 
    */
    $scope.newCandidate = function() {
        var name = $scope.candidate.name;
        var email = $scope.candidate.email;
        httpRequest($http, "POST", "application/json", "/candidates",
            {
                Fullname: name,
                Email: email,
                BirthDay: "1975-11-10T22:11:24Z"
            },
            // Success
            function(response) {
                console.log("POST SUCCESS - " + response.status);
            }, 
            // Fail
            function(response) {
                console.log("POST FAIL - " + response.status);
            });        
        
    };
    /**
        Reset the stored values. 
    */
    $scope.reset = function() {
        $scope.candidate.name = $scope.candidate.email = "";
    };
});

app.controller('examController', ['$scope', '$http', '$interval', '$filter', function($scope, $http, $interval, $filter) {
    $scope.selectedCandidate = null;
    $scope.selectedQuestionair = null;
    $scope.canStartExam = false;
    $scope.examStarted = false;
    $scope.currentAnswer = null;
    
    $scope.testAnswerText = "";
    
    $scope.candidates = [];
    $scope.questionairs = [];
    $scope.questions = [];
    
    $scope.examStartTime = null;
    $scope.examEndTime = null;
    
    $scope.startExam = function() {
        if(!$scope.canStartExam) {return;}
        
        $scope.examStartTime = new Date();
        console.log("Starting Exam: " + $scope.examStartTime);
        $scope.examStarted = true;
        
        $http({ method: "POST",
                url: url + "/exam/addorupdate",
                headers: {"Content-Type": "application/json"},
                data: {
                    "QuestionaireHash": $scope.selectedQuestionair.Hash,
                    "Email": $scope.selectedCandidate.Email,
                    "StartTime": $scope.examStartTime,
                    "EndTime": null
                }
              })
        .then(
            // Success
            function(response) {
                console.log("Exam added for: " + $scope.selectedQuestionair.Hash + ", " + $scope.selectedCandidate.Email);
            }, 
            // Fail
            function(response) {
                console.log("Exam failed to add: " + $scope.selectedQuestionair.Hash + ", " + $scope.selectedCandidate.Email + " -- " + response.status + " (" + response.statusText + ")");
            }
        );
        
    }
    $scope.submitExam = function() {
        if(!$scope.canStartExam) {return;}
        
        $scope.examEndTime = new Date();
        $scope.examStarted = false;
        console.log("Ending Exam: " + $scope.examEndTime);
        // Finalize post? Invalidate choices? Post all questions again?
        

        $http({ method: "POST",
                url: url + "/exam/addorupdate",
                headers: {"Content-Type": "application/json"},
                data: {
                    QuestionaireHash: $scope.selectedQuestionair.Hash,
                    Email: $scope.selectedCandidate.Email,
                    StartTime: $scope.examStartTime,
                    EndTime: $scope.examEndTime
                }
             })
        .then(
            // Success
            function(response) {
                console.log("Exam submitted for: " + $scope.selectedQuestionair.Hash + ", " + $scope.selectedCandidate.Email);
            }, 
            // Fail
            function(response) {
                console.log("Exam failed to submit: " + $scope.selectedQuestionair.Hash + ", " + $scope.selectedCandidate.Email + " -- " + response.status + " (" + response.statusText + ")");
            }
        );
    }
    
    function addUpdateExam() {
        console.log("Adding: " + $scope.selectedCandidate);
        $scope.canStartExam = true;
        $scope.examStarted = false;
        $scope.questions = $scope.selectedQuestionair.Questions;
    }
    function invalidateSelection() {
        console.log("Invalidating");
        $scope.canStartExam = false;
        $scope.examStarted = false;
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
        if(!$scope.currentAnswer) {
            $scope.currentAnswer = {
                "ExamKey": "" + $scope.selectedQuestionair.Hash + "/" + $scope.selectedCandidate.Email,
                "QuestionHash": q.Hash,
                "AnswerText": $event.target.value,
                "StartTime": new Date(),
                "EndTime": null
            };
        } 
        
        // start timer for snapshotting
        // in timer do snapshott at interval
    }
    $scope.unfocus = function(q, $event) {
        console.log("unfocus Q: " + q.Hash);
        if($scope.currentAnswer) {
            $scope.currentAnswer.AnswerText = $event.target.value;
            $scope.currentAnswer.EndTime = new Date();
            
            console.log("Sending answer update: " + $scope.currentAnswer.QuestionHash);
            // post update to $http
            $http({ method: "POST",
                    url: url + "/exam/updateanswer",
                    headers: {"Content-Type": "application/json"},
                    data: $scope.currentAnswer
                })
            .then(
                // Success
                function(response) {
                    console.log("Answer updated.");
                }, 
                // Fail
                function(response) {
                    console.log("Answer update failed: " + response.statusCode);
                }
            );
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
            $scope.candidates = [{Fullname: response.statusText, code: response.status}];
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
            $scope.questionairs = [{Name: response.statusText, code: response.status}];
        }
    );
}]);

app.controller('reviewController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
    $scope.selectedCandidate = null;
    $scope.selectedQuestionair = null;
    $scope.selectedExam = null;
    
    $scope.currentExam = null;
    $scope.allExams = null;
    $scope.candidates = [];
    $scope.questionairs = [];
    $scope.qScores = [];
    $scope.totalScore = 0;
    
    $scope.canSelectExam = false;
    $scope.examTime = null;
    $scope.populatingExamList = true;
    
//    $scope.selectQuestionair = function() {
//        $scope.selectedExam = null;
//        
//        $scope.populatingExamList = true;
//        httpRequest($http, "GET", "application/json", "/exams?QuestionairHash=" + ($scope.selectedQuestionair?$scope.selectedQuestionair.Hash:"") + "&Email=" + ($scope.selectedCandidate?$scope.selectedCandidate.Email:""),
//                    null,
//                    function(response) {
//                        $scope.allExams = response.data;
//                        $scope.populatingExamList = false;
//                    },
//                    function(response) {
//                        $scope.allExams = {Questions:[{QuestionText: response.statusText, AnswerText: response.status}]};
//                        $scope.populatingExamList = false;
//                    });
//    }
//    
//    $scope.selectCandidate = function() {
//        $scope.selectedExam = null;
//        $scope.populatingExamList = true;
//        httpRequest($http, "GET", "application/json", "/exams?QuestionairHash=" + ($scope.selectedQuestionair?$scope.selectedQuestionair.Hash:"") + "&Email=" + ($scope.selectedCandidate?$scope.selectedCandidate.Email:""),
//                    null,
//                    function(response) {
//                        $scope.allExams = response.data;
//                        $scope.populatingExamList = false;
//                    },
//                    function(response) {
//                        $scope.allExams = {Questions:[{QuestionText: response.statusText, AnswerText: response.status}]};
//                        $scope.populatingExamList = false;
//                    });
//    }
    
    $scope.selectExam = function() {
        if($scope.selectedQuestionair && $scope.selectedCandidate) {
            getExam($scope.selectedQuestionair.Hash, $scope.selectedCandidate.Email);
        } else if($scope.selectedExam) {
            var key  = $scope.selectedExam.Key;
            var sp = key.split('/');
            getExam(sp[0], sp[1]);
        }
    }
    
    $scope.addScore = function(index, inc) {
        if($scope.qScores[index]) {
            $scope.qScores[index] += inc;
        } else {
            $scope.qScores[index] = inc;
        }
        updateTotalScore();
    }
    
    var updateTotalScore = function() {
        $scope.totalScore = 0;
        angular.forEach($scope.qScores, function(e) {
            $scope.totalScore += e;
        });
    }
    
    var getExam = function(examHash, candEmail) {
        httpRequest($http, "GET", "application/json", "/exam/" + examHash + "?email=" + candEmail, null,
                    function(response) {
                        $scope.currentExam = response.data;
                        $scope.examTime = $filter('dateDifferenceFromString')($scope.currentExam.StartTime, $scope.currentExam.EndTime);
                        console.log("DIF: " + $scope.examTime);
                        //TODO: update variables: Exam Time, Each question Time, etc
                    },
                    function(response) {
                        $scope.currentExam = {Questions:[{QuestionText: response.statusText, AnswerText: response.status}]};
                    });
    }
    
    httpRequest($http, "GET", "application/json", "/candidates/", null,
                function(response) {
                    $scope.candidates = response.data;
                }, 
                function(response) {
                    $scope.candidates = [{Fullname:response.status, Email:response.statusText}];
                });
    
    httpRequest($http, "GET", "application/json", "/questionaires", null,
                function(response) {
                    $scope.questionairs = response.data;
                },  
                function(response) {
                    $scope.questionairs = [{Name:response.statusText, Hash: response.status}];
                });
    
    httpRequest($http, "GET", "application/json", "/exams", null,
                function(response) {
                    $scope.allExams = response.data;
                    $scope.populatingExamList = false;
                }, 
                function(response) {
                    $scope.allExams = [{Questions:[{QuestionText: response.statusText, AnswerText: response.status}]}];
                    $scope.populatingExamList = false;
                });
}]);

var httpRequest = function($http, method, headerType, appendUrl, dat, cbSuccess, cbFail) {
    $http({ method: method,
            headers: {"Content-Type": headerType},
            url: url + appendUrl,
            data: dat
          })
    .then(
        // Success
        function(response) {
            if(cbSuccess) {cbSuccess.call(this, response);}
        }, 
        // Fail
        function(response) {
            if(cbFail) {cbFail.call(this, response);}
        }
    );
}


