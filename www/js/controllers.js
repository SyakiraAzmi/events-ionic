angular.module('app.controllers', [])
  
.run(function($rootScope, $ionicLoading, LocalStorage, userServices, EventsAPI, bookmarksServices, $ionicPopup, $state, $q){

	//$rootScope.checkins = LocalStorage.get('checkins', []);
	$rootScope.users=[];
	// $rootScope.events;
	$rootScope.bookmarks;
	$rootScope.userbookmarks=[];
	$rootScope.isLoggedIn=false;

	EventsAPI.loadEvents().then(function(response) {
		$rootScope.events = response.events_list; //dapat event array
		console.log("PLSPLSPLS:Events loaded");
	})

	$rootScope.showLoading = function() { //msg
    	$ionicLoading.show();
    }
  	$rootScope.hideLoading = function(){
		$ionicLoading.hide();
  	};

	$rootScope.checkToken = function() {
		// amik usertoken dari localstorage
		var usertoken = LocalStorage.get("usertoken");

		// kalau ada usertoken
		if(usertoken != null) {
			$rootScope.showLoading();

			// amik userdetails dari usertoken
			userServices.getUserFromTokenService(usertoken).then(function(data){
				/*
					bila dah dapat userdetails,
					set isLoggedIn state kepada true
					set userdetails daripada dari database guna token
				*/
				$rootScope.isLoggedIn = true;
	            $rootScope.user = data.users_list[0];	
	        	$rootScope.hideLoading();
				console.log("ISLOGIN TRUE WOI!");	 

				$rootScope.loadBookmarks(); //load and generate userbookmarks
			});

		} else {
			console.log("ISLOGIN FALSE WOI!");
		}
	}  	

	$rootScope.loadBookmarks=function(){
  		console.log("AKU DAH MASUK. SO?");
  		console.log($rootScope.user);
  		bookmarksServices.showBookmarks($rootScope.user).then(function(response) {

			console.log("Berjaya show bookmarks");
			$rootScope.bookmarks = response.bookmarks_list;

			$rootScope.bookmarks.filter(function(bookmark){
				$rootScope.events.filter(function(event){
					if(bookmark.eventid==event.eventID){
						$rootScope.userbookmarks.push(event);
					}
				})
			})
		})
  	}

  	$rootScope.checkBookmarked=function(eventID){
  		$rootScope.isBookmarked=false;

  		$rootScope.userbookmarks.filter(function(userbookmark){
			if(userbookmark.eventID==eventID){
				$rootScope.isBookmarked=true;
			}
		})
		console.log("dah dalam checkBookmarked "+$rootScope.isBookmarked);
  	}

  	$rootScope.createBookmark = function (event) {
		console.log("dalam createBookmark");
		console.log($rootScope.user);
		console.log(event.eventID);
		bookmarksServices.createBookmarks($rootScope.user, event).then(function(){

			$ionicPopup.alert({
            	title: 'Bookmark',
            	content: event.eventName+' added to bookmark'
        	})
        	$rootScope.isBookmarked=true;
        	$state.go($state.current, {}, {reload:true});
		})
	}//end $scope.bookmark

	$rootScope.deleteBookmark = function (event) {
		console.log(event);
		bookmarksServices.deleteBookmarks($rootScope.user, event).then(function(){

			$ionicPopup.alert({
            	title: 'Bookmark',
            	content: event.eventName+' deleted from bookmark'
        	})
			$rootScope.isBookmarked=false;
			$state.go($state.current, {}, {reload:true});
		})
	}//end $scope.bookmark

})//end run 



.controller('homeCtrl', function($scope, $state, $cordovaGeolocation) {
/*
	$cordovaGeolocation.getCurrentPosition({

		timeout: 10000,
		enableHighAccuracy: true

	}).then(function(position){

		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;

		var latLng = new google.maps.LatLng(latitude,longitude);
		var mapOptions = {
			center: latLng,
			zoom: 17,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};		

		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

		google.maps.event.addListenerOnce($scope.map, 'idle', function(){

			var marker = new google.maps.Marker({
				map: $scope.map,
				animation: google.maps.Animation.DROP,
				position: latLng,
			});			

			var infoWindow = new google.maps.InfoWindow({
				content: 'UIA Gombak'
			});

			google.maps.event.addListener(marker, 'click', function(){
				infoWindow.open($scope.map, marker);
			})

			google.maps.event.addListener($scope.map, 'click', function(event){

				var marker = new google.maps.Marker({
					position: event.latLng,
					map: $scope.map,
					animation: google.maps.Animation.DROP,
					draggable: true
				})

				console.log(event.latLng.lat() + " " + event.latLng.lng());
			})			
		})

	}, function(error){
		console.log("could not get location");
	});

//check username, if not anonymous, then display name and display checkins
	/*$scope.name    = '';
	$scope.username    = '';
	$scope.password   = '';

	$scope.login = function() {
		console.log($scope);
		// check login data, username and password
*/
	$cordovaGeolocation.getCurrentPosition({
		timeout: 10000,
		enableHighAccuracy: true
	}).then(function(position){
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;

		var latLng = new google.maps.LatLng(latitude,longitude);
		var mapOptions = {
			center: latLng,
			zoom: 17,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};		

		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

		google.maps.event.addListenerOnce($scope.map, 'idle', function(){
			var marker = new google.maps.Marker({
				map: $scope.map,
				animation: google.maps.Animation.DROP,
				position: latLng,
			});			

			var infoWindow = new google.maps.InfoWindow({
				content: 'UIA Gombak'
			});

			google.maps.event.addListener(marker, 'click', function(){
				infoWindow.open($scope.map, marker);
			})

			google.maps.event.addListener($scope.map, 'click', function(event){
				var marker = new google.maps.Marker({
					position: event.latLng,
					map: $scope.map,
					animation: google.maps.Animation.DROP,
					draggable: true
				})

				console.log(event.latLng.lat() + " " + event.latLng.lng());
			})			
		})

	}, function(error){
		console.log("could not get location");
	});
})//end homeCtrl



//To manage user registration
.controller('userCtrl', function($scope, $rootScope, userServices, $ionicPopup, $state, $ionicHistory, LocalStorage){
    
    $scope.addUser = function(user){

        userServices.addService(user).success(function(data){
            $scope.user = data;
            console.log("Data " + data);

        	if (data == 1) {

            	$ionicPopup.alert({
                	title: 'Successfully registered!',
                	content: 'Thank you for your registration '+ $scope.user.name+ '. Please login to enter the system :)' 
            	})

            	//masuk dlm system      
            	$state.go('menu.login');
        	} 

        	else if (data == 3) {

            	$ionicPopup.alert({
                	title: 'Error',
                	content: 'Hi '+  $scope.user.name+ '! Sorry, the email or username already exist!'
            	})
       		}
        
        	else { 
            
            	$ionicPopup.alert({
                	title: 'Error',
                	content: 'Sorry. Error happen'
            	})
        	}

        });//end function data
    };//end addUser

    $scope.loginUser = function(user){

    	$rootScope.showLoading();

        userServices.loginService(user).then(function(data){ //data is from echo value in signIn.php
        	$rootScope.hideLoading();
            $rootScope.user = data.users_list[0];		

        if (data!=0) {

        			/*
                    LocalStorage.set("loggedIn", 1);
                    LocalStorage.set("userId", $rootScope.users.id);//from db
                    LocalStorage.set("username", $rootScope.users.name);
					*/

                    // console.log(data);
                    console.log("userId : ");
                    console.log($rootScope.user.id);
                    console.log("username : ");
                    console.log($rootScope.user.name);

                    $rootScope.isLoggedIn=true;

                    $ionicPopup.alert({
                      	title: 'Successfully logged in!',
                      	content: 'Hi '+ $rootScope.user.name+ '! Welcome :) '
                    })

        			$ionicHistory.nextViewOptions({
        				disableBack:true
        			});

        			$rootScope.loadBookmarks(); //load and generate userbookmarks

		            // generate random number as usertoken
		            var usertoken = Math.random();
		            // update token at database
		            userServices.setTokenService(usertoken, $rootScope.user);        			
        			//set usertoken kat localstorage lepas login
        			LocalStorage.set("usertoken", usertoken);

                    //masuk dlm system      
                    $state.go('menu.home');

                    }

        else        //if data==0
            {
                    $ionicPopup.alert({
                      title: 'Tak boleh login',
                      content: 'Hi '+  user.name+ '!'
                    })                      
            }
            
        });//function data
    };//userlogin

    $scope.logoutUser = function(user) { 
        $rootScope.isLoggedIn=false;

        $ionicPopup.alert({
            title: 'Successfully logged out!',
            content: 'Bye :)'
        })

	    //LocalStorage.remove("userId");
        //LocalStorage.remove("username");
        //LocalStorage.set("loggedIn", 0);
		$ionicHistory.nextViewOptions({
			disableBack:true
		});        

        //clear usertoken & userdetails dari localstorage lepas logout
        LocalStorage.set("usertoken", null);

        //keluar dari system      
        $state.go('menu.home');
    }; //end logout
})//end userCtrl



.controller('eventsListCtrl', function($scope, $rootScope, $ionicLoading, $ionicFilterBar, EventsAPI, $state) {
	// $rootScope.showLoading();

	//load events from db
	// EventsAPI.loadEvents().then(function(response) {
	// 	$rootScope.hideLoading();
	console.log("Yay berjaya show events");

    /* ion-filter-bar begins */
    var filterBarInstance;
	//$rootScope.events = response.events_list; //dapat event array

	//filter events
	$scope.showFilterBar = function () {
		filterBarInstance = $ionicFilterBar.show({
      		/*
			- do not change 'items' attribute's name. 
			- the name is fixed with the plugin.
			*/
			items: $rootScope.events,
			update: function (filteredEvents, filterText) {

				$rootScope.events = filteredEvents;
				if (filterText) {
					console.log(filterText);
				}

			}
		});
	};
    /* ion-filter-bar ends */

    $scope.doRefresh = function(){
    	$rootScope.events=[];

		EventsAPI.loadEvents()
		.then(function(response) {
			$rootScope.events = response.events_list; //dapat event array
			console.log("PLSPLSPLS:Events loaded");

			$rootScope.$broadcast('scroll.refreshComplete');

			$state.go($state.current, {}, {reload:true});
		})//end .then
	}//end doRefresh
})//end eventsListCtrl
      

.controller('eventDetailsCtrl', function($scope, $rootScope, $stateParams, bookmarksServices, $ionicPopup, $state) {

	console.log("dah dalam eventDetails");

	$rootScope.checkBookmarked($stateParams.eventID);

	// $rootScope.createBookmark(event);
	// $rootScope.deleteBookmark(event);
	// $scope.createBookmark = function (event) {
	// 	console.log("dalam createBookmark");
	// 	console.log($rootScope.user);
	// 	console.log(event.eventID);
	// 	bookmarksServices.createBookmarks($rootScope.user, event).then(function(){

	// 		$ionicPopup.alert({
 //            	title: 'Bookmark',
 //            	content: event.eventName+' added to bookmark'
 //        	})
 //        	$rootScope.isBookmarked=true;
 //        	$state.go($state.current, {}, {reload:true});
	// 	})
	// }//end $scope.bookmark

	// $scope.deleteBookmark = function (event) {
	// 	bookmarksServices.deleteBookmarks($rootScope.user, event).then(function(){

	// 		$ionicPopup.alert({
 //            	title: 'Bookmark',
 //            	content: event.eventName+' deleted from bookmark'
 //        	})
	// 		$rootScope.isBookmarked=false;
	// 		$state.go($state.current, {}, {reload:true});
	// 	})
	// }//end $scope.bookmark

	$scope.event = $rootScope.events.filter(function(event){ //scope saves an event object which id==parameter id
		return event.eventID == $stateParams.eventID; //filter by id from rootScope.events
	}).pop();
	
	//console.log($scope.event); //display details based on id in console
	//console.log($stateParams); //display id in console

})//end eventDetailsCtrl



.controller('bookmarksListCtrl', function($scope, $rootScope, $ionicLoading, $ionicFilterBar, bookmarksServices, $state) {
	    
	console.log($rootScope.userbookmarks);

    /* ion-filter-bar begins */
    var filterBarInstance;

	//filter bookmarks
	$scope.showFilterBar = function () {
		filterBarInstance = $ionicFilterBar.show({
      		/*
			- do not change 'items' attribute's name. 
			- the name is fixed with the plugin.
			*/
			items: $rootScope.userbookmarks,
			update: function (filteredUserBookmarks, filterText) {

				$rootScope.userbookmarks = filteredUserBookmarks;
				if (filterText) {
					console.log(filterText);
				}

			}
		});
	};
    /* ion-filter-bar ends */

    $scope.doRefresh = function(){

		$rootScope.userbookmarks=[];
		bookmarksServices.showBookmarks($rootScope.user)
		.then(function(response) {

			console.log("Berjaya show bookmarks");
			$rootScope.bookmarks = response.bookmarks_list;

			$rootScope.bookmarks.filter(function(bookmark){
				$rootScope.events.filter(function(event){
					if(bookmark.eventid==event.eventID){
						$rootScope.userbookmarks.push(event);
					}
				})
			})//end bookmarks filter
				$rootScope.$broadcast('scroll.refreshComplete');
				$state.go($state.current, {}, {reload:true});
		})//end .then
	}//end doRefresh
})//end bookmarksListCtrl




.controller('bookmarkDetailsCtrl', function($scope, $rootScope,$stateParams, bookmarksServices, $ionicPopup, $state) {

	console.log("dah dalam bookmarkDetails");

	$rootScope.checkBookmarked($stateParams.eventID);

	// $rootScope.createBookmark(event);
	// $rootScope.deleteBookmark(event);

	// $scope.createBookmark = function (event) {
	// 	console.log("dalam createBookmark");
	// 	console.log($rootScope.user);
	// 	console.log(event.eventID);
	// 	bookmarksServices.createBookmarks($rootScope.user, event).then(function(){

	// 		$ionicPopup.alert({
 //            	title: 'Bookmark',
 //            	content: event.eventName+' added to bookmark'
 //        	})
 //        	$state.go($state.current, {}, {reload:true});
	// 	})
	// }//end $scope.bookmark

	// $scope.deleteBookmark = function (event) {
	// 	bookmarksServices.deleteBookmarks($rootScope.user, event).then(function(){

	// 		$ionicPopup.alert({
 //            	title: 'Bookmark',
 //            	content: event.eventName+' deleted from bookmark'
 //        	})
	// 		$rootScope.isBookmarked=false;
	// 		$state.go($state.current, {}, {reload:true});
	// 	})
	// }//end $scope.bookmark

	//$rootScope.checkBookmarked($stateParams.eventid);

	$scope.userbookmark = $rootScope.userbookmarks.filter(function(userbookmark){ //scope saves an event object which id==parameter id
		return userbookmark.eventID == $stateParams.eventID; //filter by id from rootScope.events
	}).pop();
})//end eventDetailsCtrl



.controller('settingsCtrl', function($scope) {

})
/*
.controller('loginCtrl', function($scope, $rootScope, $ionicPopup, $state, $ionicHistory) {

    $scope.user = 
	{
		id : 1,
		username : "admin",
		password : "admin"
	};
 	
    $scope.login = function() {
    	var validUsername = ($scope.username == $scope.user.username);
 		var validPassword = ($scope.password == $scope.user.password);

        //LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
        if(validUsername && validPassword) {
        	$ionicHistory.nextViewOptions({
        		disableBack:true
        	});
        	$rootScope.username = $scope.user.username;
            $state.go('menu.home');
        }
        /*}).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
		else (function(user) {
			var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
		})
    }
	/*$scope.name     = '';
	$scope.password = ''

	$scope.login;

	if(name==)
})*/
   

/*
.controller('checkinsCtrl', function($scope, $timeout) {
	$scope.removeCheckin = function(checkin) {
		console.log(checkin);
		$scope.Session.checkins.splice($scope.Session.checkins.indexOf(checkin), 1);
	}
})
*/

.controller('checkinsCtrl', function($scope, LocalStorage) {
	$scope.removeCheckin = function(checkin) {
		if(confirm('Are you sure you want to delete this?')) {
			var index = $scope.checkins.indexOf(checkin);
			$scope.checkins.splice(index, 1);
			LocalStorage.update('checkins', $scope.checkins);
		}
	}
})



/*
.controller('getLocationCtrl', function(
	$scope,
	$ionicLoading,
	$timeout,
	$cordovaGeolocation,
	$ionicPlatform,
	$http,
	reverseGeocoder,
	$state,
	uuid4
	) {

	$scope.latitude    = '';
	$scope.longitude   = '';
	$scope.address     = '';
	$scope.description = '';
	$scope.map         = '';

	$ionicLoading.show({
		template: "Getting your location..."
	});

	$ionicPlatform.ready(function(){
		console.log("ready");
		$cordovaGeolocation.getCurrentPosition({
			timeout: 20000,
			enableHighAccuracy: false

		}).then(function(position){
			$scope.latitude	= position.coords.latitude.toFixed(5);
			$scope.longitude = position.coords.longitude.toFixed(5);
			console.log($scope.latitude);
			console.log($scope.longitude);
			reverseGeocoder.getAddress($scope.latitude, $scope.longitude)
				.then(function(address){
					$scope.address = address.text;
					$scope.map = address.map;
					$ionicLoading.hide();
				}, function(){
					$ionicLoading.show({
						template: "Error getting address"
					});
					$timeout(function(){
						$ionicLoading.hide();
					}, 1000);
				});
		});
	});

	$scope.save = function() {
		console.log($scope);
		// unshift = add new items to the beginning of an array
		$scope.Session.checkins.unshift({
			id: uuid4.generate(),
			latitude: $scope.latitude,
			longitude: $scope.longitude,
			address: $scope.address,
			description: $scope.description,
			map: $scope.map
		});
		$state.go('checkins');
	};

})

*/

.controller('getLocationCtrl', function(
	$scope,
	$state,
	LocalStorage,
	$cordovaGeolocation,
	ReverseGeoCoder
	) {

	$cordovaGeolocation.getCurrentPosition({
		timeout: 20000,
		maximumAge: 30000,
		enableHighAccuracy: false,
	}).then(function(results){
		console.log(results);
		$scope.latitude = results.coords.latitude;
		$scope.longitude = results.coords.longitude;
		ReverseGeoCoder.get($scope.latitude, $scope.longitude)
		.then(function(results) {
			$scope.address = results.address;
			$scope.maps = results.map;
		})
	}, function(){
		console.log('error');
	})

	$scope.save = function() {
		$scope.checkins.push({
			id: $scope.checkins.length + 1,
			latitude: $scope.latitude,
			longitude: $scope.longitude,
			address: $scope.address,
			descriptions: $scope.descriptions,
			maps: $scope.maps
		});
		LocalStorage.set('checkins', $scope.checkins);
		$state.go('menu.checkins');		
	}
})


   
.controller('checkinDetailsCtrl', function($scope, $stateParams) {
	$scope.checkin = $scope.checkins.filter(function(checkin){
		return checkin.id == $stateParams.id;
	}).pop();
})

.controller('settingsCtrl', function($scope) {

})

/*
.controller('checkinDetailsCtrl', function($scope, $stateParams) {
    $scope.checkin = $scope.Session.checkins.reduce(function(carry, checkin){
		console.group("carry");
		console.log(carry);
		console.groupEnd();

		console.group("checkin");
		console.log(checkin);
		console.groupEnd();

		if (checkin.id == $stateParams.id) {
			carry = checkin;
		}
	return carry;
    }, {});
    console.log($scope.checkin, $stateParams);
})
*/
