
module.exports.controller = function(app) {

/**
 * Stubs controller
 */
  app.get('/api/data', function(req, res) {

    //console.log("Before get request");
    var jsonTestNoTooBadData = "[{\"hex\": \"4caada\",\"flight\": \"EI3390\",\"lat\": 53.722353,\"lon\": -1.555777,\"altitude\": 3375,\"track\": 63,\"speed\": 244},{\"hex\": \"aae6d5\",\"flight\": \"DAL48 \",\"lat\": 53.481125,\"lon\": -1.631156,\"altitude\": 39025,\"track\": 106,\"speed\": 531}]";
    var jsonGoodData = "[{\"hex\": \"aae6d5\",\"flight\": \"DAL48 \",\"lat\": 53.722353,\"lon\": -1.555777,\"altitude\": 39025,\"track\": 106,\"speed\": 531},{\"hex\": \"4caada\",\"flight\": \"EI3390\",\"lat\": 53.481125,\"lon\": -1.631156,\"altitude\": 3375,\"track\": 63,\"speed\": 244}]";
    var jsonSecondAircraftIsClosestData = "[{\"hex\": \"4caada\",\"flight\": \"EI3390\",\"lat\": 53.481125,\"lon\": -1.631156,\"altitude\": 3375,\"track\": 63,\"speed\": 244},{\"hex\": \"aae6d5\",\"flight\": \"DAL48 \",\"lat\": 53.722353,\"lon\": -1.555777,\"altitude\": 39025,\"track\": 106,\"speed\": 531}]";
    var jsonTestMissingLatLonData = "[{\"hex\": \"4caada\",\"flight\": \"EI3390\",\"lat\": \"\",\"lon\": \"\",\"altitude\": 3375,\"track\": 63,\"speed\": 244},{\"hex\": \"aae6d5\",\"flight\": \"DAL48 \",\"lat\": 53.481125,\"lon\": -1.631156,\"altitude\": 39025,\"track\": 106,\"speed\": 531}]";
    var jsonTestNoResultData = "[{\"hex\": \"4caada\",\"flight\": \"\",\"lat\": \"\",\"lon\": \"\",\"altitude\": \"\",\"track\": \"\",\"speed\": \"\"},{\"hex\": \"aae6d5\",\"flight\": \"\",\"lat\": \"\",\"lon\": \"\",\"altitude\": \"\",\"track\": \"\",\"speed\": \"\"}]";
    res.setHeader('Content-Type', 'Application/Json');
    //res.send(jsonTestNotTooBadData);
    res.send(jsonGoodData);
    //res.send(jsonSecondAircraftIsClosestData);
    //res.send(jsonTestMissingLatLonData);
    //res.send(jsonTestNoResultData);
    //console.log("After get request");

  });
}
