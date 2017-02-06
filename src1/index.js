var APP_ID = undefined;

var AlexaSkill = require('./AlexaSkill');

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
    response.tell("Welcome to the Body Mass Index calculator");
};


BMICalculatorSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};


BMICalculatorSkill.prototype.intentHandlers = {
    "BmiCalculatorIntent": function(intent, session, reponse){
        handleBMIResponse(intent, session, response);
    },
    
    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With BMI calculator, you can calculate your body mass index.  " +
            "For example, if your weight is 180 lbs and height 5 ft 10 inches, your BMI is 25.8";
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
    }
}

function handleBMIResponse(intent, session, response){
    var BMI = BMICalculation(intent.slots.Weight.value, intent.slots.WeightType.value, intent.slots.HeightFeet.value, intent.slots.HeightInches.value);
    var speechOutput = {
        speech: "According to the nhi.gov your BMU is " + BMI,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.tell(speechOutput);
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
    return BMI;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the BMICalculator Skill.
    var skill = new BMICalculatorSkill();
    skill.execute(event, context);
};