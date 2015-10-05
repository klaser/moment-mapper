var jsonData = "";
		var sessionData = [];
		var map;

		

		function mergeByProperty(arr1, arr2, prop) {
		    _.each(arr2, function(arr2obj) {
		        var arr1obj = _.find(arr1, function(arr1obj) {
		            return arr1obj[prop] === arr2obj[prop];
		        });

		        arr1obj ? _.extend(arr1obj, arr2obj) : arr1.push(arr2obj);
		    });
		}

		function googleMapsSetup(){
			console.log(sessionData[0]);
			var mapOptions = {
				zoom:5,
				mapTypeId:google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

			// Register resize event
			google.maps.event.trigger(map, 'resize');
		}

		function bindInfoWindow(marker, map, infowindow, content){
			google.maps.event.addListener(marker, 'click', function(){
				infowindow.setContent(content);
				infowindow.open(map, marker);
			});
		}

		jQuery(document).ready(function(){
			// Hide the content frame
			jQuery('#mainContent').hide();

			// Hide the list
			jQuery('#momentContent').hide();

			// Setup upload button
			jQuery('#upload-button').click(function(){
				// Check for the various File API support.
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					
				} else {
				 	// Show the frame, but replace the contents with a message saying they can't upload the file.
				 	jQuery('#upload-frame').html('<p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>');
				 	jQuery('#upload-frame').show();
				}
			});	

			// Setup file listener
			jQuery('#files').change(function(event){
				var files = event.target.files; // FileList object
				var file = files[0];

				var reader = new FileReader();
				reader.readAsText(file);

				reader.onload = function(){

					// Pre-flight - Setup Google Maps
					googleMapsSetup();

					// Parse the loaded Json file
					jsonData = JSON.parse(reader.result);
					console.log(jsonData);
					var a = [];

					for (day = 0; day < jsonData.days.length; day++){
						a.push.apply(a, jsonData.days[day].sessions);
					}

					var infoWindow = new google.maps.InfoWindow({
						content: ""
					});
					

					// Reconstruct the session data
					var b = [];
					for (session = 0; session < a.length; session++){
						

						// // Create a coordinates object
						var coordinates = {
							lat: a[session].latitude,
							lng: a[session].longitude
						};

						// Now create a map marker out of it
						var marker = new google.maps.Marker({
							position: coordinates,
							map: map,
							title: moment(a[session].date).format('llll')
						});

						bTemp = [{
							id: session,
							date: moment(a[session].date).format('llll'),
							duration: a[session].lengthInMinutes,
							coordinates: "" + a[session].latitude + "" + a[session].longitude + "",
							marker: marker
						}];
						b.push.apply(b, bTemp);

						bindInfoWindow(marker, map, infoWindow, moment(a[session].date).format('llll'));

					}
					

					var sessions = a;
					sessionData = a;
					var sessionsReadable = b;
					console.log(sessions);


					// 1 - Show the loading icon
					jQuery('#mainContent').show();

					// 2 - Generate the HTML/Google Maps
					jQuery('#momentDataTable').bootstrapTable({
						columns: [{
							field: 'id',
							title: 'Session #'
						} , {
							field: 'date',
							title: 'Date/Time',
							sortable: true
						} , {
							field: 'duration',
							title: 'Duration (minutes)'
						} , {
							field: 'coordinates',
							title: 'GPS Coordinates'
						}],
						data: sessionsReadable
					});

					// 3 - Hide the loader
					jQuery('#loader').hide();

					// 4 - Show the content
					jQuery('#momentContent').show();

					// 5 - Enable tabs (pills)
					jQuery('#mainNav a').click(function (e) {
						e.preventDefault();
					 	jQuery(this).tab('show');
						google.maps.event.trigger(map, 'resize');
						map.setCenter(new google.maps.LatLng(sessionData[0].latitude, sessionData[0].longitude));
						map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
					});

					// 6 - Enable clicking on all rows
					jQuery('#momentDataTable tr').click(function(e) {
						e.preventDefault();
					 	jQuery('#mainNav a:last').tab('show');
						google.maps.event.trigger(map, 'resize');
						map.setCenter(sessionsReadable[jQuery(this).data('index')].marker.getPosition());
						map.setZoom(18);
						map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
					});


				}
			});

			

			

		document.getElementById("uploadBtn").onchange = function () {
			document.getElementById("uploadFile").value = this.value;
		};

		});