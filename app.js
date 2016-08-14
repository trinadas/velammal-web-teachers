var app = angular.module("sampleApp", ['firebase','ngRoute','ngCookies','angular.filter','angular.morris-chart']);

// let's create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://tai-school.firebaseio.com");
    return $firebaseAuth(ref);
  }
]);
app.factory("aray", ["$firebaseArray",
  function($firebaseArray) {
    // create a reference to the database where we will store our data
   
    var ref = new Firebase("https://tai-school.firebaseio.com/af/array/full/");

    return $firebaseArray(ref);
  }
]);


app.filter('orderStudents', function(){
 return function(input) {
      //console.log("fjklvgfjkldfhdfkghdfjkg"+ "                  "+ attribute);
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }
   /* array.sort(function(a, b){
        return (a.profile[attribute] > b.profile[attribute]);
    });
    
    if(reverse1){
       array = array.reverse();
    }*/
      return array;
 }
});

app.run(function ($browser) {
    $browser.baseHref = function () { return "/" };
  });
app.config(['$routeProvider','$locationProvider',function($routeProvider, $locationProvider) {
   $routeProvider
            .when('/',{
                controller : 'mainController',
                templateUrl : 'login.html'
            })
            .when('/students', {
                controller : 'mainController',
                templateUrl : 'students.html'
            })
            .when('/sessions', {
                controller : 'mainController',
                templateUrl : 'sessions.html'
            })
            .when('/attendance', {
                controller : 'mainController',
                templateUrl : 'attendance.html'
            })
            .when('/tasks', {
                controller : 'mainController',
                templateUrl : 'tasks.html'
            })
            .when('/profile', {
                controller : 'mainController',
                templateUrl : 'profile.html'
            })
            .when('/dashboard', {
                controller : 'mainController',
                templateUrl : 'dashboard.html'
            })
            .when('/forgot', {
                controller : 'mainController',
                templateUrl : 'forgot.html'
            })
            .when('/calender', {
                controller : 'mainController',
                templateUrl : 'calender.html'
            })
            .when('/velammal', {
                controller : 'mainController',
                templateUrl : 'velammal.html'
            })
            .when('/pages-error-404', {
                controller : 'mainController',
                templateUrl : 'pages-error-404.html'
            })
            .when('/faq', {
                controller : 'mainController',
                templateUrl : 'faq.html'
            })
            .otherwise({
                redirectTo: '/'
            });

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }]);

// and use it in our controller

//login
app.controller("mainController", ['$rootScope', 'Auth','$location','$http','$cookies',
  


  function($rootScope, Auth, $location ,$http,$cookies) {
    

    var ref = new Firebase("https://tai-school.firebaseio.com");
    $rootScope.sort = function(keyname){
      $rootScope.sortKey = keyname;   //set the sortKey to the param passed
      $rootScope.reverse = !$rootScope.reverse; //if true make it false and vice versa
    };


    //loadfunction
    $rootScope.loader=false;
    $rootScope.loadfun = function(){
      $rootScope.loader=true;
      if ($rootScope.loader) {
        $(window).load(function() {
          $(".loader").fadeOut("slow");
        });
      };
    };    
    //loadfunction
    $rootScope.loggedin = false;


    $rootScope.loginUser = function(details) {
      details.email ="skranthi@tai.school";
      details.password = "123456";      
      console.log(details);
      if($cookies.getObject('auth')){
          $location.path("/students");
      }
      else{
          ref.authWithPassword({
              email    : details.email,
              password : details.password
          }, authHandler);
          function authHandler(error, authData) {
            if (error) {
              alert("Login Failed!"+ error);
            } 
            else {
              //alert(authData.uid);
              console.log("Authenticated successfully with payload:", authData);
              $cookies.putObject('auth',authData);
              //$cookies.auth=authData;
              //alert($cookies.getObject('auth').uid);
              $rootScope.$digest();
                //alert("signed in");
              swal(
                'Welcome!',
                'Successfully loggedin.',
                'success'
              );
              //alert("$rootScope.loggedin"+$rootScope.loggedin);
              //alert($rootScope.user);

                $location.path("/students");
             
              $rootScope.$apply();
              //console.log(authData.uid);
             // alert($location.path());
              var ref = new Firebase("https://tai-school.firebaseio.com/teachers/"+authData.uid);
              
              // Attach an asynchronous callback to read the data at our posts reference
              ref.on("value", function(snapshot) {
                  //console.log(snapshot.val());
                  $rootScope.user = snapshot.val();
                  //$cookies.user=$rootScope.user;
                  $cookies.putObject('user',$rootScope.user);
                  //console.log($cookies.user);
                  $rootScope.teacherDetail();
                  //$rootScope.$digest();
                }, function (errorObject) {
                //console.log("The read failed: " + errorObject.code);
              });

            }
          };

        }
    };

    $rootScope.logoutUser = function(){ 
      var ref = new Firebase("https://tai-school.firebaseio.com");
          ref.unauth();
          $cookies.remove('auth');
          $cookies.remove('user');
          $scope.user = null;
          //$window.location("http://127.0.0.1:8080/");
          $location.path("/login");
          ref.unauth();
          $cookies.remove('auth');
          $cookies.remove('user');
    };

    $rootScope.message ="";
    $rootScope.stud_message ="Please Select a Class and Section";
    $rootScope.forgot = function(details){
      var ref = new Firebase("https://tai-school.firebaseio.com");
        ref.resetPassword({
        email: details.email
        }, function(error) {
          if (error) {
        switch (error.code) {
          case "INVALID_USER":
                alert("The specified user account does not exist.");
                break;
          default:
                alert("Error resetting password:", error);
        }
        } else {
          $rootScope.message ="check your email";
            //console.log("Password reset email sent successfully!");
            alert('Password reset email sent successfully!')
        }
      });
    };
      $rootScope.studentProfile = function(val){
        console.log($rootScope.students);
        $rootScope.array = [];
        
        for(var objectKey in $rootScope.students) {
            $rootScope.array.push($rootScope.students[objectKey]);
        }
        $rootScope.max=$rootScope.array.length;
        $rootScope.student_prof = $rootScope.array[val];
        $rootScope.studentindex = val; 
      };

      $rootScope.teacherDetail = function(){
        console.log($cookies.getObject('user'));
        var teacherRef = new Firebase("https://tai-school.firebaseio.com/schools/"+$cookies.getObject('user').schoolId+"/teachers/"+$cookies.getObject('user').teacherId);
        teacherRef.on("value", function(snapshot) {
            $rootScope.teacher = snapshot.val();
            $cookies.putObject('teacher',$rootScope.teacher);
           }, function (errorObject) {
          //console.log("The read failed: " + errorObject.code);
        });
      };

      $rootScope.sessions_msg = "Please Select a Class and Subject";
      $rootScope.subj = ["Physics","Chemistry","Biology","Mathematics","History","Civics","Geography","Sanskrit"]
      $rootScope.subjectDisplay = "Choose Subject";
      $rootScope.student_class = function(val1){
        $rootScope.class=val1;
      };
      $rootScope.student_section = function(val2){
        $rootScope.section=val2;
      };
      $rootScope.student_subject = function(val3){
        $rootScope.subject=val3;
        $rootScope.subjectDisplay=$rootScope.subj[val3 - 1];
      };


      $rootScope.studentDisplay = function(){
        console.log($rootScope.teacher.schoolId);
        console.log($rootScope.class);
        console.log($rootScope.section);
        var studRef = new Firebase("https://tai-school.firebaseio.com/schools/"+$rootScope.teacher.schoolId+"/students/"+$rootScope.class+"/"+$rootScope.section); 
        studRef.on("value", function(snapshot) {
            //console.log(snapshot.val());
            //console.log("entered in studs");
            $rootScope.students = snapshot.val();
            if(!$rootScope.students){
               $rootScope.stud_message = "No Student has been registered in this class !!";
            }
            //$cookies.putObject('user',$rootScope.user);
            //console.log($rootScope.students);
            //$rootScope.$digest();
          }, function (errorObject) {
          //console.log("The read failed: " + errorObject.code);
        });
      };
      $rootScope.lessonsDisplay = function(){
        if($rootScope.subject!=4||$rootScope.class!=9){
          $rootScope.sessions_msg = "No Content Available ..!";
        }
        else{
          $rootScope.sessions_msg = ""; 
        }
        $rootScope.$apply();
      };

    $rootScope.editInfo = function(info) {
      swal({
          title: 'Are you sure?',
          text: "",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes!'
        }).then(function() {

        //$scope.uploadFile();
        var ref = new Firebase("https://tai-school.firebaseio.com");
        console.log($rootScope.user);
              $rootScope.scId = $rootScope.user.schoolId;
              var usersRef = ref.child("schools").child($rootScope.scId).child("Info");
              usersRef.update({
                 name     : info.Name,
                 phone : info.Phone,
              });

              swal(
                'Successfull!',
                '',
                'success'
              );
       });
    };

    function resetting(emailExec){
      ref.resetPassword({
           email: emailExec
           }, function(error) {
             if (error) {
           switch (error.code) {
             case "INVALID_USER":
                   alert("The specified user account does not exist.");
                   break;
             default:
                   alert("Error resetting password:", error);
         }
         } else {/*
             //console.log("Password reset email sent successfully!");*/
             //alert('Created Executive successfully!');
             swal(
                'Mail Has Been Sent To The Executive!',
                '',
                'success'
              );

              emailExec = "";   
       $rootScope.emailExec = ""; 
         }
      });
    };

    function genPassword(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };
  }
]);


