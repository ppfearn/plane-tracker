
module.exports.controller = function(app) {

/**
 * flights API controller
 */
  app.get('/api/flights', function(req, res) {

    // TODO work out how to put this in it's own POJO file and add it to ./model/flight.js
    var Aircraft = {
      hex: null,
      callSign: null,
      lat: null,
      lon: null,
      alt: null,
      hed: null,
      speed: null,
      reg: null,
      type: null,
      airline: null,
      origin: null,
      originDescription: null,
      destination: null,
      destinationDescription: null,
      printAircraft: function() {
        console.log("-----current aircraft-----");
        console.log("hex: " +this.hex);
        console.log("call sign: " +this.callSign);
        console.log("lat: " +this.lat);
        console.log("lon: " +this.lon);
        console.log("alt: " +this.alt);
        console.log("hed: " +this.hed);
        console.log("speed: " +this.speed);
        console.log("reg: " +this.reg);
        console.log("type: " +this.type);
        console.log("airline: " +this.airline);
        console.log("origin: " +this.origin);
        console.log("originDescription: " +this.originDescription);
        console.log("destination: " +this.destination);
        console.log("destinationDescription: " +this.destinationDescription);
        console.log("--------------------------");
      }
    };

    var async = require('async');
    const request = require('request-promise');
    var MY_LAT = <your-lat>;
    var MY_LONG = <your-long>;
    aircraft = Object.create(Aircraft);
    var closestDistance;
    var geolib = require('geolib');

    // get the correct aircraft using request(ify)
    var requestify = require('requestify');
    // --- begin 1090 data request
    requestify.get('http://localhost:3005/api/data').then(function(response, err) {

      if (err) {
        console.log("ERROR");
      }

      // comes back from geolib in meters
      var closestDistance;
      var geolib = require('geolib');

      // Get the response body and parse it:
      var json = response.getBody();

      // iterate through each object to get the closest aircraft
      for (var i in json) {
        // if closest is empty
        if (closestDistance == null) {
          aircraft.hex = json[i].hex;
          aircraft.callSign = json[i].flight;
          aircraft.lat = json[i].lat;
          aircraft.lon = json[i].lon;
          aircraft.alt = json[i].altitude;
          aircraft.hed = json[i].track;
          aircraft.speed = json[i].speed;

          if ( aircraft.lat && aircraft.lon ) {
            closestDistance = geolib.getDistance({latitude: MY_LAT, longitude: MY_LONG},{latitude: aircraft.lat, longitude: aircraft.lon});
          }
          continue;
        }

        // test to see if this is closer than the current lat long
        var testDistance;
        // if lat lon is not empty null undefined etc etc check distance, else skip this record as we have no location data to test
        if ( aircraft.lat && aircraft.lon ) {
          testDistance = geolib.getDistance({latitude: MY_LAT, longitude: MY_LONG},{latitude: aircraft.lat, longitude: aircraft.lon});
        } else {
          continue;
        }
        // if the new distance is closer, replace the current closest
        if (testDistance < closestDistance) {
          closestDistance = testDistance;
          aircraft.hex = json[i].hex;
          aircraft.callSign = json[i].flight;
          aircraft.lat = json[i].lat;
          aircraft.lon = json[i].lon;
          aircraft.alt = json[i].altitude;
          aircraft.hed = json[i].track;
          aircraft.speed = json[i].speed;
        }
      }

      console.log("closestHex: " +aircraft.hex);
      console.log("closestCallSign: " +aircraft.callSign);

      // set up a map of requests as below:
      var requests = [{
        url: "https://ae.roplan.es/api/hex-reg.php?hex="+aircraft.hex,
      }, {
        url: "https://ae.roplan.es/api/hex-type.php?hex="+aircraft.hex,
      }, {
        url: "https://ae.roplan.es/api/hex-airline.php?hex="+aircraft.hex,
      }, {
        url: "https://ae.roplan.es/api/callsign-route.php?callsign="+aircraft.callSign,
      }];

      async.map(requests, function(obj, callback) {
        // iterator function
        request(obj, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            // transform data here or pass it on
            callback(null, body);
          } else {
            callback(error || response.statusCode);
          }
        });
      }, function(err, results) {
        // all requests have been made
        if (err) {
          // handle your error
        } else {
          console.log(results);
          if (results[0] != null) {
            aircraft.reg = results[0];
          }
          if (results[1] != null) {
            aircraft.type = results[1];
          }
          if (results[2] != null) {
            aircraft.airline = results[2];
          }
          if (results[3] != null) {
            //aircraft.route = results[3];
            var airports = results[3].split("-");
            var airportOrigin = airports[0];
            console.log("Origin: " +airportOrigin);
            aircraft.origin = airportOrigin;
            var airportDestination = airports[1];
            console.log("Destination: " +airportDestination);
            aircraft.destination = airportDestination;

            // new map of requests for the airports:
            var airportDescriptionRequests = [{
              url: "https://ae.roplan.es/api/IATA-airport.php?iata="+airportOrigin,
            }, {
              url: "https://ae.roplan.es/api/IATA-airport.php?iata="+airportDestination,
            }];

            async.map(airportDescriptionRequests, function(obj, callback) {
              // iterator function
              request(obj, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  // transform data here or pass it on
                  callback(null, body);
                } else {
                  callback(error || response.statusCode);
                }
              });
            }, function(err, results) {
              // all requests have been made
              if (err) {
                // handle your error
              } else {
                console.log(results);
                if (results[0] != null) {
                  aircraft.originDescription = results[0];
                }
                if (results[1] != null) {
                  aircraft.destinationDescription = results[1];
                }

                aircraft.printAircraft();
                res.send(aircraft);
                // send response here

              }
            });

          } // --- end results from first async.map block

        }
      }); // --- end first async.map results block

    }); // -- end 1090 data request

  }); // --- end api.get
}
