var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var request = require('request');

var JAVAPORT="8090"
var JAVAIP="10.70.130.234"

var botUrl='http://10.70.133.1:5000/getresponse';
app.use(express.static(__dirname + '/static'));

var JAVAAPIURL="http://10.70.130.234:8090/RESTfulProject/REST/WebService/GetHistory/"

app.get('/', function (req, res) {
     res.sendFile(__dirname +'/public/index.html');
});
app.get('/socketio', function (req, res) {
     res.sendFile(__dirname +'/public/socketio.html');
});

app.get('/cebbotexternal/:searchstring', function (req, res) {
var searchString =encodeURI(req.params.searchstring
)
  var url ="https://www.cebglobal.com/blogs/?s="+searchString+"&submit=Search"
  var Xray = require('x-ray');
  var x = Xray();

  x(url, '#post-navigation', [{
    title: '.post-img',
    info:'.post-info p',
    article:'article'

  }])
  .limit(10)
  .write().pipe(res)


 // var stream = x('http://google.com', 'title').stream();
 //  stream.pipe(res);
  // res.status(500).send({ error: "boo:(" });

  // res.sendFile(__dirname +'/public/socketio.html');
  // x(url, 'wrap', [{
  //   title: '#post-navigation',
  // }])
  //   .paginate('.next_page@href')
    // .limit(3)
     // res.sendFile(__dirname +'/public/socketio.html');
});
app.get('/chatbot', function (req, res) {
     res.sendFile(__dirname +'/public/chatbot.html');
});
app.get('/bot', function (req, res) {
     res.sendFile(__dirname +'/public/bot.html');
});
app.get('/sujayproblem', function (req, res) {
     res.sendFile(__dirname +'/public/problem.html');
});
app.get('/cebwidget', function (req, res) {
     res.sendFile(__dirname +'/public/cebwidget.html');
});
app.get('/redux', function (req, res) {
     res.sendFile(__dirname +'/public/redux.html');
});

app.get('/pagination', function (req, res) {
     res.sendFile(__dirname +'/public/pagination.html');
});


app.get('/jquery', function (req, res) {
    // jsonData={"answer": "query second", "flag": "2", "intro": "intro over", "feedback": "interested"}
    // request.post({
    //   url:     'localhost:3000/topnav',
    //   body:    jsonData
    // }, function(error, response, body){
    //   console.log(body);
    // });
    // request.post('http://localhost:3000/topnav')
    // request.post({url:'http://localhost:3000/topnav', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ })
    jsonData={"val":"no","flag":"1","feedback":"interested","intro":"intro over"};

    request({
        url: botUrl, //URL to hit
        method: 'POST', //Specify the method
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(jsonData)
    }, function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
        }
    });
     // res.sendFile(__dirname +'/public/jquery.html');
});


app.get('/jquerycallback', function (req, res) {
     res.sendFile(__dirname +'/public/jqueryCallBack.html');
});
app.get('/gem', function (req, res) {
     res.sendFile(__dirname +'/public/gemini.html');
});

app.get('/ie11', function (req, res) {
     res.sendFile(__dirname +'/public/ie11.html');
});

app.get('/gem1', function (req, res) {
     res.sendFile(__dirname +'/public/gemini1.html');
});

app.get('/random', function (req, res) {
     res.sendFile(__dirname +'/public/random.html');
});

app.get('/gem2', function (req, res) {
     res.sendFile(__dirname +'/public/gemini2.html');
});

app.post('/topnav', function (req, res) {
     res.sendFile(__dirname +'/public/topnav.json');
});
app.get('/scrollfix', function (req, res) {
     res.sendFile(__dirname +'/public/scrollFix.html');
});
app.post('/bootstrap', function (req, res) {
     res.sendFile(__dirname +'/public/bootstrap.html');
});

app.post('/countries', function (req, res) {
     res.sendFile(__dirname +'/public/data.json');
});

app.get('/autocompletedata', function (req, res) {
     res.sendFile(__dirname +'/public/autocomplet.json');
});

app.get('/autocompletedata2', function (req, res) {
     res.sendFile(__dirname +'/public/autocomplet2.json');
});

app.get('/india', function (req, res) {
     res.sendFile(__dirname +'/public/india.html');
});
app.get('/name', function (req, res) {
     res.sendFile(__dirname +'/public/name.json');
});
app.get('/autocompletewidget', function (req, res) {
     res.sendFile(__dirname +'/public/autocompletewidget.html');
});
app.get('/autocompletnew', function (req, res) {
     res.sendFile(__dirname +'/public/autocompletnew.html');
});


app.get('/highmaps', function (req, res) {
     res.sendFile(__dirname +'/public/highmaps.html');
});

app.get('/worldmaps', function (req, res) {
     res.sendFile(__dirname +'/public/worldmaps.html');
});
app.get('/usmaps', function (req, res) {
     res.sendFile(__dirname +'/public/usMaps.html');
});
app.get('/city', function (req, res) {
     res.sendFile(__dirname +'/public/cityMaps.html');
});
app.get('/highmapsdata', function (req, res) {
     res.sendFile(__dirname +'/public/maps.json');
});

app.get('/draggable', function (req, res) {
     res.sendFile(__dirname +'/public/draggable.html');
});
var socketListion=app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
var io = require('socket.io')(socketListion);

var numUsers = 0;
var obj;
// io.on('connection', function(socket){
//      console.log('socket', socket.id);
//      socket.on('event', function(data){
//           console.log('event');
//      });

//   socket.on('disconnect', function(){
//        io.emit('user disconnected');
//   });
//     socket.once('disconnect', function(){
//        console.log('once disconnect');
//        // io.emit('user disconnected');
//   });
// });
// 
// 


io.on('connection', function (socket) {
  console.log('socket id ', socket.id);
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
      console.log('data new message', data);

  

    // request('http://'+JAVAIP+JAVAPORT+'/RESTfulProject/REST/WebService/GetHistory/jasmine', function (error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     body=JSON.parse(body)[0]
    //     console.log('body', body);
    //     email=JSON.parse(body)[0]['email'];

      // }
    // })
    // jsonData={"val":"no","flag":"1","feedback":"interested","intro":"intro over"};

    request({
        url: botUrl, //URL to hit
        method: 'POST', //Specify the method
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }, function(error, response, body){
        // console.log('response', response);

              // io.sockets.emit ('botReply', {
              //   username: "CEB BoT",
              //   message: "email",
              // });
              var obj =JSON.parse(body);
              console.log('res', body);
          // io.sockets.emit ('botReply', {
          //     username: "BOT",
          //     message: res,
          //     objectNew:obj
          //   });
                          message =obj.answer;
                delete obj.answer;

                io.sockets.emit ('botReply', {
                    username: "BOT",
                    message: message,
                    objectNew:obj
                });
        // if(error) {
        //     console.log(error);
        // } else {
        //     console.log(response.statusCode, body);
        // }
    });

  });
  

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    
    //TODO Call API Server and get the data
    var name,message;
    var serverMessage,role;
    // todo Api call Get The data about user GOLU
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    // botAPi
 

    var url =JAVAAPIURL+username



    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body=JSON.parse(body)[0]
        console.log('java response', body);

      
        socket.emit('login', {
          numUsers: numUsers,
          message:message,
          username:body.username,
          role:body.role
        });

        jsonData={"message":'name_'+body.username+',role_'+body.role,"flag":"0","feedback":"interested","intro":"intro over"}
          request({
              url: botUrl, //URL to hit
              method: 'POST', //Specify the method
              headers: { 'Content-Type': 'application/json'},
              body: JSON.stringify(jsonData)
          }, function(error, response, body){
              var obj =JSON.parse(body);
              console.log('bot replay res', obj);
              
              if(error) {
                  console.log(error);
              } else {
                message =obj.answer;
                delete obj.answer;

                io.sockets.emit ('botReply', {
                    username: "BOT",
                    message: message,
                    objectNew:obj
                });
              }
          });
      }
    })


    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
      console.log('user is typing');
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    console.log('stop typing');
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    console.log('when the user disconnects');
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
