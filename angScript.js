///////////// AngularJS App //////////////
var app = angular.module('angularApp', []);

///////////// Controllers //////////////
app.controller('NewCandidateController', function($scope, $http) {
    $scope.candidate = {name: "", email: ""};
    $scope.newCandidate = function() {
        var name = $scope.candidate.name;
        var email = $scope.candidate.email;
        $http({ method: "POST",
                url: "http://kyuyeol7921.lancom.co.nz/candidates/",
                headers: {"Content-Type": "application/json"},
                data: {
                    Fullname: name,
                    Email: email,
                    BirthDay: "1975-11-10T22:11:24Z"
                }
              })
        .then(
            function(response) {
                console.log("POST SUCCESS - " + response.status);
            }, 
            function(response) {
                console.log("POST FAIL - " + response.status);
            }
        );
    };
    $scope.reset = function() {
        $scope.candidate.name = $scope.candidate.email = "";
    };
});

app.controller('examController', function($scope, $http) {
    $scope.selectedCandidate = null;
    $scope.selectedQuestionaire = null;
    
    $scope.candidates = [];
    $scope.questionairs = [];
    
    $http({ method: "GET",
            url: "http://kyuyeol7921.lancom.co.nz/candidates/"})
    .then(
        function(response) {
            $scope.candidates = response.data;
        }, 
        function(response) {
            $scope.candidates = [{Fullname: response.data, code: response.status}];
        }
    );
    
    $http({ method: "GET",
            url: "http://kyuyeol7921.lancom.co.nz/questionaires/"})
    .then(
        function(response) {
            $scope.questionairs = response.data;
        }, 
        function(response) {
            $scope.questionairs = [{Name: response.data, code: response.status}];
        }
    );
});