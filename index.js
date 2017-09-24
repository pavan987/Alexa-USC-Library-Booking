// //  Skill Code =======================================================================================================

var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        var say = 'Welcome to USC library booking. How can I help you?';
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

            var libraries = ['4490', '14133', '206']
            // "2017-09-27", "206", "14:00"
            for(var i=0; i<libraries.length; i++){
                httpLibPost(date, libraries[i], time, Result => {
                        console.log(Result);

                        var say = '';
                        r = JSON.parse(Result)
                        if (r.status === true) {
                            say = 'You are lucky! room '+r.response.room+' in leavey library is available from '+r.response.start
                            +' to '+r.response.end;
                            this.response.speak(say);
                            this.emit(':responseReady');

                        }
                        else {
                            if(i == libraries.length -1) {
                                say = "Sorry! there is no room available during that time";
                                this.response.speak(say);
                                this.emit(':responseReady');
                            }
                        }

                });
            }

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
//
// //    END of Intent Handlers {} ========================================================================================
// // Helper Functions  =================================================================================================



function mycallback(result){

}
var http = require('http');

function httpScrapePost(Data, Time, callback) {

    //var post_data = '{"html": "abc", "time":"14:00"}';
    var post_data = {"html" : Data,"time" : Time}
    var data = JSON.stringify(post_data)
    var options = {
        host: 'alexa-skill-pentyala.c9users.io',
        port: 80,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          // 'Accept':'*/*',
          // 'Accept-Encoding': 'gzip, deflate',
          // 'Origin':"abcd"
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
    console.log(post_data)
    req.write(data);
    req.end();
}


function httpLibPost(date, gid, time, callback) {

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
            var abc = {}
            httpScrapePost(returnData, time, function(ScrapeResult) {
              callback(ScrapeResult)
            });

        });

    });

    req.write(JSON.stringify(post_data));
    req.end();
}
// httpPost("2017-09-27","206",mycallback);
// httpLibPost("2017-09-27", "206", "14:00", Result => {
//         console.log(Result)
//         // var say = '';
//         // r = JSON.parse(Result)
//         // if (r.status == "yes") {
//         //   say = 'You are lucky! room '+r.result.room+' is available from '+r.result.startTime
//         //   +' to '+r.result.endTime;
//         // }
//         // else{
//         //   say = "Sorry! there is no room available during that time"
//         // }
//         // console.log(say)
// });
//
