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
        rctl.powerOn((err, response) => {
            if (!err) {
                rctl.optical1();
            }
        });
        

    } 
    if (data.status === "pause") {
        isPlaying = false;
    }
    console.log(data);
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

    rctl.getVolume((vol) => {
        io.emit("volume", vol.value);        
    });
    rctl.getCurrentSource((source) => {
        var toSend = "";
        switch (source) {
            case "usb":
                toSend = "bluetooth";
                break;
            case "optical1":
                toSend = "optical";
                break;
        }
        io.emit("source", toSend);

    });
    console.log("Socket user Connected");
});


rctl.open();