//  Skill Code =======================================================================================================
//
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        var say = 'Welcome to USC library booking';
    console.log(say)
        this.response.speak(say).listen(say);
        this.emit(':responseReady');
    },

    'FindRoomIntent': function () {
        // call the Fact Service
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
                    this.context.succeed({
                        "response": {
                            "directives": [
                                {
                                    "type": "Dialog.Delegate"
                                }
                            ],
                            "shouldEndSession": false
                        },
                        "sessionAttributes": {}
                    });
                }
        else {
          var date = this.event.request.intent.slots.date.value;
          var time = this.event.request.intent.slots.time.value;
          console.log("available date is "+date+" and time is "+time);

        httpPost(date, "206", myResult => {
            var say = '';
            say = 'here is your availability, ' ; // array
            this.response.speak(say);
            this.emit(':responseReady');
        });
        }
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak('just say, tell me a fact').listen('try again');
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('Goodbye!')
        this.emit(':responseReady');
    }
};

//    END of Intent Handlers {} ========================================================================================
// Helper Functions  =================================================================================================



function mycallback(result){

}
var http = require('http');

function httpPost(date, gid, callback) {

    var post_data = {};
    var options = {
        host: 'libcal.usc.edu',
        port: '80',
        path: '/process_roombookings.php?m=calscroll&gid='+gid+'&date='+date,
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'http://libcal.usc.edu',
            'Referer': 'http://libcal.usc.edu/booking/lvl2'
        }

    };

    var req = http.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            callback(returnData);  // this will execute whatever function the caller defined, with one argument

        });

    });

    req.write(JSON.stringify(post_data));
    req.end();
}
// httpPost("2017-09-27","206",mycallback);
