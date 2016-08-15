var app = angular.module("sampleApp", ['firebase','ngRoute','ngCookies','angular.filter','angular.morris-chart','720kb.datepicker']);

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
      ////console.log("fjklvgfjkldfhdfkghdfjkg"+ "                  "+ attribute);
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

    //clock
    function formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    };
    $rootScope.clock={
      now : formatAMPM(new Date())
    };
    var updateClock = function(){
      $rootScope.clock.now =  formatAMPM(new Date());
    };
    setInterval(function(){
      $rootScope.$apply(updateClock);
    },1000);
    updateClock();
    
    //date
    function GetFormattedDate(todayTime ) {
        var date_str = String(todayTime);
        date_str = date_str.split(" ");
        date_str =  Number(date_str[1])+" "+date_str[0][0]+date_str[0][1]+date_str[0][2] ;
      return date_str;        
    }
    $rootScope.date = new Date();
    //clock

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

    $rootScope.login_message = "";
    $rootScope.loginUser = function(details) {
      $rootScope.login_message = "Logging In...";
      details.email ="skranthi@tai.school";
      details.password = "123456";      
      //console.log(details);
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
              $rootScope.login_message = "";
            } 
            else {
              $rootScope.login_message = "";
              //alert(authData.uid);
              //console.log("Authenticated successfully with payload:", authData);
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
              ////console.log(authData.uid);
             // alert($location.path());
              var ref = new Firebase("https://tai-school.firebaseio.com/teachers/"+authData.uid);
              
              // Attach an asynchronous callback to read the data at our posts reference
              ref.on("value", function(snapshot) {
                  ////console.log(snapshot.val());
                  $rootScope.user = snapshot.val();
                  //$cookies.user=$rootScope.user;
                  $cookies.putObject('user',$rootScope.user);
                  ////console.log($cookies.user);
                  $rootScope.teacherDetail();
                  //$rootScope.$digest();
                }, function (errorObject) {
                ////console.log("The read failed: " + errorObject.code);
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
          $cookies.remove('teacher');
          $rootScope.user = null;
          //console.log("logout");
          //$window.location("http://127.0.0.1:8080/");
          $location.path("/");
          ref.unauth();
          $cookies.remove('auth');
          $cookies.remove('user');
          $cookies.remove('teacher');
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
            ////console.log("Password reset email sent successfully!");
            alert('Password reset email sent successfully!')
        }
      });
    };
      $rootScope.studentProfile = function(val){
        //console.log($rootScope.students);
        $rootScope.array = [];
        
        for(var objectKey in $rootScope.students) {
            $rootScope.array.push($rootScope.students[objectKey]);
        }
        $rootScope.max=$rootScope.array.length;
        $rootScope.student_prof = $rootScope.array[val];
        $rootScope.studentindex = val; 
      };

      $rootScope.teacherDetail = function(){
        //console.log($cookies.getObject('user'));
        var teacherRef = new Firebase("https://tai-school.firebaseio.com/schools/"+$cookies.getObject('user').schoolId+"/teachers/"+$cookies.getObject('user').teacherId);
        teacherRef.on("value", function(snapshot) {
            $rootScope.teacher = snapshot.val();
            $cookies.putObject('teacher',$rootScope.teacher);
           }, function (errorObject) {
          ////console.log("The read failed: " + errorObject.code);
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


      $rootScope.students_loading = "";
      $rootScope.studentDisplay = function(){
        //console.log($rootScope.teacher.schoolId);
        //console.log($rootScope.class);
        //console.log($rootScope.section);
        $rootScope.students_loading = "Loading...";
        var studRef = new Firebase("https://tai-school.firebaseio.com/schools/"+$rootScope.teacher.schoolId+"/students/"+$rootScope.class+"/"+$rootScope.section); 
        studRef.on("value", function(snapshot) {
            ////console.log(snapshot.val());
            ////console.log("entered in studs");
            $rootScope.students = snapshot.val();
               $rootScope.students_loading = "";
            $rootScope.Att();
            if(!$rootScope.students){
               $rootScope.stud_message = "No Student has been registered in this class !!";
            }
            //$cookies.putObject('user',$rootScope.user);
            ////console.log($rootScope.students);
            //$rootScope.$digest();
          }, function (errorObject) {
          ////console.log("The read failed: " + errorObject.code);
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
        //attendance
        $rootScope.Att =function(){
          $rootScope.array = [];
          for(var objectKey in $rootScope.students) {
              $rootScope.array.push($rootScope.students[objectKey]);
          }
          $rootScope.max=$rootScope.array.length;
          //Initialization
          var i =0;
          $rootScope.attendanceArray=[];
          for (i = 0; i < $rootScope.max; i++) {
            $rootScope.attendanceArray.push(1);
            //console.log($rootScope.attendanceArray[i]+",");
          }
            $rootScope.date = new Date();
            $rootScope.date_str = $rootScope.date.toDateString();
            $rootScope.date_str = $rootScope.date_str.split(" ");
            $rootScope.date_str = $rootScope.date_str[2]+" "+$rootScope.date_str[1];
        };
          
        //ToggleAttendance
        /*$rootScope.attendanceSelectAll = function(){
          var i =0;
          for (var i = 0; i < $rootScope.max; i++) {
            $rootScope.attendanceArray[i] = 2;
            //console.log($rootScope.attendanceArray[i]+",");
          }

        }       */ 
        $rootScope.allpresent = 0;
        $rootScope.holiday = 0;
        $rootScope.MarkHoliday = function(holiday){
          if(holiday ==1){
            for (var i = 0; i < $rootScope.max; i++) {
              $rootScope.attendanceArray[i] = 0;
              ////console.log($rootScope.attendanceArray[i]+",");
            }
            $rootScope.allpresent = 0;
            //$rootScope.$digest();
          }
          $rootScope.MarkAll($rootScope.allpresent);
        }       
        $rootScope.MarkAll = function(allpresent){
          if(allpresent ==1){
            for (var i = 0; i < $rootScope.max; i++) {
              $rootScope.attendanceArray[i] = 2;
              ////console.log($rootScope.attendanceArray[i]+",");
            }
            $rootScope.holiday =0;
            //$rootScope.$digest();
          }
        }
        //ToggleAttendance
        /*$rootScope.attendanceHoliday = function(){
          var i =0;
          for (var i = 0; i < $rootScope.max; i++) {
            $rootScope.attendanceArray[i] = 0;
            ////console.log($rootScope.attendanceArray[i]+",");
            ////console.log("evry thng holiday");
          }
          $rootScope.holiday = 1;
          if($rootScope.holiday){
            $rootScope.holiday = 0;
            for (var i = 0; i < $rootScope.max; i++) {
              $rootScope.attendanceArray[i] = 1;
              ////console.log($rootScope.attendanceArray[i]+",");
              ////console.log("evry thng holiday");
            }
          }

        }       */ 
        $rootScope.toggle = function(ind){
            if($rootScope.attendanceArray[ind] ==2 ){
              $rootScope.attendanceArray[ind] = 1;
            } 
            else if ($rootScope.attendanceArray[ind] ==1) {
              $rootScope.attendanceArray[ind] = 2;
            } 
            ////console.log("toggled value");
            //$rootScope.$digest();
        }        
        $rootScope.attendance = function(ind){
            return $rootScope.attendanceArray[ind];
        }

        $rootScope.attendanceUpdate = function(Array,dated){
          var i =0;
          $rootScope.date = GetFormattedDate(new Date());
          if(dated > $rootScope.date){
            alert("Invalid Date");
          }
          else{
            console.log(dated);
            $rootScope.date_str = GetFormattedDate(dated);
            /*$rootScope.date_str = $rootScope.date_str.split(" ");

            $rootScope.date_str =  Number($rootScope.date_str[2])+" "+$rootScope.date_str[1];
            */////console.logdate;

            var datex = $rootScope.date_str;
            ////console.log("func "+datex);
            
            var Ref = new Firebase("https://tai-school.firebaseio.com/schools/"+$rootScope.teacher.schoolId+"/students/"+$rootScope.class+"/"+$rootScope.section); 
            for(var objectKey in $rootScope.students) {
                var studRef = Ref.child(objectKey);
                if($rootScope.students[objectKey][datex]==2){
                  if(Array[i]==1){
                    var con = Number($rootScope.students[objectKey]["absent"]) + 1;
                    var con2 = Number($rootScope.students[objectKey]["attendance"]) - 1;
                    studRef.update({
                      absent : con,
                      attendance : con2
                    });
                  }
                  else if (Array[i]==0) {
                    var con = Number($rootScope.students[objectKey]["attendance"]) - 1;
                    studRef.update({
                      attendance : con
                    });
                  }
                }
                else if($rootScope.students[objectKey][datex]==1){
                  if(Array[i]==2){
                    //alert('Im absent to present');
                    var con = Number($rootScope.students[objectKey]["absent"]) - 1;
                    var con2 = Number($rootScope.students[objectKey]["attendance"]) + 1;
                    studRef.update({
                      absent : con,
                      attendance : con2
                    });
                  }
                  else if (Array[i]==0) {
                    var con = Number($rootScope.students[objectKey]["absent"]) - 1;
                    studRef.update({
                      absent : con
                    });
                  }
                }
                else if($rootScope.students[objectKey][datex]==0){
                  if(Array[i]==2){
                    var con2 = Number($rootScope.students[objectKey]["attendance"]) + 1;
                    studRef.update({
                      attendance : con2
                    });
                  }
                  else if (Array[i]==1) {
                    var con = Number($rootScope.students[objectKey]["absent"]) + 1;
                    studRef.update({
                      absent : con
                    });
                  }
                }
                var foo = {}; 
                foo[datex] = Array[i]; 
                studRef.update(foo);
                
                i = i+1;
                //$rootScope.$digest();
            } 
            //console.log("done");
          }
        }
      //attendance

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
             ////console.log("Password reset email sent successfully!");*/
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


