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

    'BookRoomIntent': function() {

      // if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
      //             this.context.succeed({
      //                 "response": {
      //                     "directives": [
      //                         {
      //                             "type": "Dialog.Delegate"
      //                         }
      //                     ],
      //                     "shouldEndSession": false
      //                 },
      //                 "sessionAttributes": {}
      //             });
      //         }
      // else {
      //   var say = ''
      //   var date = this.event.request.intent.slots.date.value;
      //   var time = this.event.request.intent.slots.time.value;
      //   var room = this.event.request.intent.slots.room.value;
      //   var endtime = this.event.request.intent.slots.endtime.value;



        say = "Your Booking is Done. please check your email and confirm the booking. Have a Nice day!"



        //say the results
        this.response.speak(say);
        this.emit(":responseReady");


    //  }


    },

    'FindRoomIntent': function () {
        // call the Fact Service
        console.log("entered FindRoomIntent")
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
          var end = this.event.request.intent.slots.endtime.value;
          // console.log("end object is "+end)
          //endtime = "";
          // if (end != undefined){
          //   endtime=end.value;
          // }
          if(end == undefined)
          {
            end = ""
          }
          console.log("available date is "+date+" and time is "+time+" end time is "+end);

            var libraries = ['4490', '14133', '206','272' ]
            var libnames = {'East Asian':'Doheny Library',  '3rd Floor':'Leavy library','2nd Floor':'Leavy library'}
            var count=0;
            // "2017-09-27", "206", "14:00"
            for(var i=0; i<libraries.length; i++){
                httpLibPost(date, libraries[i], time, end, Result  => {

                        var say = '';
                        console.log(Result)
                        try {
                          r = JSON.parse(Result)
                          console.log(r)
                          count = count+1;
                          if (r.status === true) {
                            var library = "Leavy library"
                            for(var key in libnames) {
                              if (r.slot1.room.indexOf(key) !== -1){
                                library = libnames[key]
                              }
                            }
                            console.log("entered status is true")

                            say = 'You are lucky! in '+library+', room '+r.slot1.room+' is available from '+r.slot1.start
                            +' to '+r.slot1.end; //What about Booking the room?

                              //this.event.request.intent.slots.room.value=r.response.room;
                              if(r.slot2.start != undefined) {
                                  if(r.slot2.room == r.slot1.room) {
                                    if(r.slot1.start < r.slot2.start ){
                                    say = 'You are lucky! in '+library+', room '+r.slot1.room+' is available from '+r.slot1.start
                                    +' to '+r.slot2.end; //What about Booking the room?
                                    console.log("rooms are equal")
                                  } else {
                                    say = 'You are lucky! in '+library+', room '+r.slot1.room+' is available from '+r.slot2.start
                                    +' to '+r.slot1.end; //What about Booking the room?
                                    console.log("rooms are equal but slot 1 is greater")

                                  }

                                } else {
                                  if(r.slot1.start < r.slot2.start ){
                                  say = 'You are lucky! in '+library+', room '+r.slot1.room+' is available from '+r.slot1.start
                                  +' to '+r.slot1.end+' and room '+r.slot2.room+' is available from '+r.slot2.start+' to '+r.slot2.end; //What about Booking the room?
                                  console.log("rooms are not equal,")
                                } else {
                                  say = 'You are lucky! in '+library+', room '+r.slot2.room+' is available from '+r.slot2.start
                                  +' to '+r.slot2.end+' and room '+r.slot1.room+' is available from '+r.slot1.start+' to '+r.slot1.end; //What about Booking the room?
                                  console.log("rooms are not equal, but slot 1 is greater")
                                }
                              }
                              }
                              say += " Please say Book a Room or Cancel";
                              console.log("saying "+say)
                              this.response.speak(say).listen('Please say Book a Room or Cancel'); //.listen("Say Book a room or Cancel");
                              this.emit(':responseReady');

                          }
                          else {
                              if(count == libraries.length) {
                                  say = "Sorry! there is no room available during that time. Say find a room again or cancel";
                                  this.response.speak(say).listen(say);
                                  this.emit(':responseReady');
                              }
                          }
                      }catch (e) {
                          say = "Sorry! There is a problem. Please try again";
                          this.response.speak(say).listen(say);//.listen("Do you want to search other timing?");
                          this.emit(':responseReady');
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

function httpScrapePost(Data, Time, endTime, callback) {

    //var post_data = '{"html": "abc", "time":"14:00"}';
    var post_data = {"html" : Data,"start_time" : Time, "end_time": endTime}
    var data = JSON.stringify(post_data)
    var options = {
        host: 'alexa-skill-pentyala.c9users.io',
        port: 80,
        path: '/test',
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


function httpLibPost(date, gid, time, endtime, callback) {

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
            httpScrapePost(returnData, time, endtime, function(ScrapeResult) {
              callback(ScrapeResult)
            });

        });

    });

    req.write(JSON.stringify(post_data));
    req.end();
}

// function httpScrapePost(Data, Time, callback) {
//
//     //var post_data = '{"html": "abc", "time":"14:00"}';
//     var post_data = {"html" : Data,"time" : Time}
//     var data = JSON.stringify(post_data)
//     var options = {
//         host: 'alexa-skill-pentyala.c9users.io',
//         port: 80,
//         path: '/',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Content-Length': Buffer.byteLength(data),
//           // 'Accept':'*/*',
//           // 'Accept-Encoding': 'gzip, deflate',
//           // 'Origin':"abcd"
//         }
//     };
//
//     var req = http.request(options, res => {
//         res.setEncoding('utf8');
//         var returnData = "";
//
//         res.on('data', chunk => {
//             returnData = returnData + chunk;
//         });
//
//         res.on('end', () => {
//             callback(returnData);  // this will execute whatever function the caller defined, with one argument
//
//         });
//
//     });
//     console.log(post_data)
//     req.write(data);
//     req.end();
// }
//

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
