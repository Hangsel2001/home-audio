'use strict';

var config = require('./config');
var volumio = require("socket.io-client")(config.volumioUrl);
var express = require('express')

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var RotelCtl = require('rotelctl').RotelCtl;
var rctl = new RotelCtl(config.comPort);

var isPlaying = undefined;

app.use(express.static('app'))

app.get(config.expressPort, function () {
    console.log('Example app listening');
})

server.listen(config.expressPort, () => {
    console.log('listening to ' + config.expressPort);
});

volumio.on('connect', () => {
    console.log("Connected");
    volumio.emit("getState");    
});

volumio.on('pushState', (data) => {
    if (data.status === "play" && isPlaying !== true) {
        isPlaying = true;
        console.log("Trying to power on");
        rctl.getCurrentPower((err, response) => {
            console.log(response);
            if (!err) {
                if (response !== "on") {
                    rctl.powerOn();  
                                    
                };
                rctl.optical1();
            }
        });
        

    } 
    if (data.status !== "play") {
        isPlaying = false;
    }
    console.log(data.status);
});

rctl.on('data', function(data) {
  
  if (data.name === "source") {
      var toSend = "";
        switch (data.value) {
            case "usb":
                toSend = "bluetooth";
                volumio.emit("pause", "pause");
                break;
            case "opt1":
                toSend = "optical";
                break;
        }
        emit("source", toSend);
    } else if (data.name === "volume") {
        emit("volume", data.value);
    } else {
        emit(data.name, data.value);
    }
});

io.on("connection", (socket) => {
    socket.on("volume", (vol) => {
        console.log(vol);
        rctl.volume(vol);
    });

    socket.on("source", (source) => {
        if (source === "optical") {
            rctl.optical1();
            console.log("Optical 1");
        } else if (source === "bluetooth") {
            rctl.usb();
            console.log("USB");
        }
    });

        rctl.getVolume();
        rctl.getCurrentSource(); 
        rctl.getDisplay();       
    console.log("Socket user Connected");
});

function emit(key, value) {
    io.emit(key, value);
    console.log(key + " : " + value);
}

rctl.open();