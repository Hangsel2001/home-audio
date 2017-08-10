(function () {
    var RotelViewModel =  function() {
       var self = this;
       self.volume= ko.observable(40);
       self.source= ko.observable("optical");
       self.display= ko.observable("");       
       var socket = io();
       self.volume.subscribe(function(newValue) {
            socket.emit("volume", newValue);
       })
       self.source.subscribe(function(newValue) {
            socket.emit("source", newValue);
       })
       socket.on('volume', function (vol) {
        self.volume(vol);
    });
       socket.on('source', function (source) {
        self.source(source);
    });
       socket.on('display', function(display) {

        self.display(display.substring(0,20) + "\n" + display.substring(20));
    })
   };
   ko.applyBindings(new RotelViewModel());

})();