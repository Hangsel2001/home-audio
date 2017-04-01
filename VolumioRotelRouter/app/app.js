(function () {
    var volume = 40;
    var input = "";

    var elements = {};
    elements.range = $("#volume");
    elements.volumeText = $("#volume-text");

    var setVolume = function (vol, skipRange) {
        if (vol !== volume) {
            volume = vol;
            socket.emit("volume", vol);
            if (!skipRange) {
                elements.range.val(vol);
            };
            elements.volumeText.html(vol);
        }
    };

    var setSource = function (source) {
        $('input:radio[name=source]').val(source);
    }

    var socket = io();
    socket.on('volume', function (vol) {
        setVolume(vol);
    });

    elements.range.on('input change', function () {
        setVolume(elements.range.val(), true);
    });

    $('input[type=radio]').on('change', function () {
        socket.emit("source",$('input[name=source]:checked').val())
    });




    //io.on('input', function (input) {

    //});
})();