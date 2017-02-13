var APP_ID = undefined;

var express = require('express');
var request = require('request');
var AlexaSkill = require('./AlexaSkill');

var app = express();

var GA_TRACKING_ID = 'UA-YOUR-CODE-HERE';

var BMICalculatorSkill = function(){
    AlexaSkill.call(this, APP_ID);
}; 

BMICalculatorSkill.prototype = Object.create(AlexaSkill.prototype);
BMICalculatorSkill.prototype.constructor = BMICalculatorSkill;

BMICalculatorSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("BMICalculatorSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    
};

BMICalculatorSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("BMICalculatorSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};


BMICalculatorSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};


BMICalculatorSkill.prototype.intentHandlers = {
    "BmiCalculatorIntent": function(intent, session, response){
        handleBMIResponse(intent, session, response);
    },
    
    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With BMI calculator, you can calculate your body mass index.  " +
            "For example, if your weight is 180 lbs and height 5 ft 10 inches, your BMI is 25.82";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },
    
    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
            speech: "Goodbye",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },
    
    "AMAZON.NoIntent": function (intent, session, response) {
        trackEvent('Intent', 'AMAZON.NoIntent', 'na', '100', function(err) {
            if (err) {
                return next(err);
            }
            var speechOutput = "Okay.";
            response.tell(speechOutput);
        });
    }
}

function handleBMIResponse(intent, session, response){
    if(intent.slots.Weight.value && intent.slots.WeightType.value && intent.slots.HeightFeet.value && intent.slots.HeightInches.value){
        var BMI = BMICalculation(intent.slots.Weight.value, intent.slots.WeightType.value, intent.slots.HeightFeet.value, intent.slots.HeightInches.value);
        var speechOutput = {
            speech: "According to the nhi.gov your BMI is " + BMI,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.tell(speechOutput);} else {
        var speechOutput = {
            speech: "BMI Calculator requires valid weight and height to proceed ",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: "Good Bye",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
}

var BMICalculation = function(weight, weightType, heightFeet, heightInches){
    
    if(weightType === "Kilograms" || weightType === "Kilos" || weightType === "Kg" || weightType === "Kgs"){
        var weight = weight * 2.21;
    } else {
        var weight = weight;
    }

    var Ft = Math.floor(heightFeet) * 12;
    var inch = Math.floor(heightInches);
    var inches = Ft + inch;

    var BMI = ((weight * 703) / inches)/inches;
    
    return BMI.toFixed(2);
}

function getWelcomeResponse(response) {
    var repromptText = "With BMI Calculator, you can calculate your body mass index. For example, if your weight is 180 lbs and height 5 ft 10 inches, your BMI is 25.8";
    var speechText = "Welcome to BMI Calculator, please provide your weight and height. ";
    
    var speechOutput = {
        speech: speechText,
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.ask(speechOutput, repromptOutput);
}

function trackEvent(category, action, label, value, callback) {
    var data = {
        v: '1', // API Version.
        tid: GA_TRACKING_ID, // Tracking ID / Property ID.
        // Anonymous Client Identifier. Ideally, this should be a UUID that
        // is associated with particular user, device, or browser instance.
        cid: '555',
        t: 'event', // Event hit type.
        ec: category, // Event category.
        ea: action, // Event action.
        el: label, // Event label.
        ev: value, // Event value.
    };

    request.post( 'http://www.google-analytics.com/collect', { form: data }, function(err, response) {
        if (err) { return callback(err); }
        if (response.statusCode !== 200) {
            return callback(new Error('Tracking failed'));
        }
        callback();
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the BMICalculator Skill.
    var skill = new BMICalculatorSkill();
    skill.execute(event, context);
};