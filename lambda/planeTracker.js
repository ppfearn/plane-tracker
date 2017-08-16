/**
 Author: Paul Fearn.
*/

'use strict';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);
    var cardTitle = "Plane Tracker"
    var speechOutput = "Find out which planes are around you"
    callback(session.attributes, buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'GetFlights') {
        handleGetFlights(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function handleGetFlights(intent, session, callback) {
    var https = require('https');

    https.get('https://paulfearn.duckdns.org/planes/api/flights', function(resp){
        console.log("resp.statusCode: " +resp.statusCode);
        if (resp.statusCode != '200') {
            callback(session.attributes,
            buildSpeechletResponseWithoutCard("there was a problem with your request", "", "true"));
        } else {
            resp.on('data', function (data) {
              var jsonObject = JSON.parse(data);
              var mapOfPhrases;
              var hex = null;
              var callsign = null;
              var lat = null;
              var lon = null;
              var hed = null;
              var speed = null;
              var reg = null;
              var type = null;
              var airline = null;
              var origin = null;
              var destination = null;
              // build response:

              if (jsonObject.aircraft.type) {
                  type = jsonObject.aircraft.type;
              }
              if (jsonObject.aircraft.airline) {
                  airline = jsonObject.aircraft.airline;
              }
              var speechOutput ="<speak>";
              var repromptSpeech = "<speak>";
              if (matchExact("n/a", type)) {
                  console.log("We have a match: " +type);
              }

              if (!matchExact("n/a", type) && type !== "") {
                  var split_string = type.split(/(\d+)/);
                  var splitOnSpace = type.split(" ");
                  var splits = split_string[1].split(/(\d+)/);
                  console.log("split: " +splits[0] + ": " +splits[1]);
                  console.log("Text:" + split_string[0] + " & Number:" + split_string[1]);
                  speechOutput = speechOutput + "<p>The aircraft is a " +split_string[0] +"<say-as interpret-as='digits'>" + split_string[1] + "</say-as></p>";
              }

              if (!matchExact("n/a", airline) && airline !== "" && airline != 0) {
                  speechOutput = speechOutput + " operated by " +airline +"</speak>";
              } else {
                  speechOutput = speechOutput + "</speak>";
              }

              if (speechOutput.length < 20 ) {
                  speechOutput = "<speak>I can't find any information about that aircraft</speak>";
              } else {
                  repromptSpeech = "would you like to hear more?</speak>"
              }

              console.log(speechOutput);
              callback(session.attributes, buildSpeechletSSMLResponseWithoutCard(speechOutput, repromptSpeech, "true"));
              //callback(session.attributes, buildSpeechletSSMLResponseWithoutCard(speechOutput, repromptSpeech, "false"));
            });
        }

    }).on("error", function(e){
        console.log("Got error: " + e.message);
    });

}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletSSMLResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function matchExact(r, str) {
   var match = str.match(r);
   return match != null && str == match[0];
}
