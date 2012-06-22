/*�������� ����������� ��� ��� ��������� ������� swipe
  �� ������ ����� ��� �� jquery.mobile.event.js, ������� ������ + ��������� ������ �������� �� supportTouch
*/

(function ($, window, undefined) {

    // add new event shortcuts
    $.each(("touchstart touchmove touchend swipe swipeleft swiperight").split(" "), function (i, name) {

    $.fn[name] = function (fn) {
        return fn ? this.bind(name, fn) : this.trigger(name);
    };

    $.attrFn[name] = true;
});

    var supportTouch = 'ontouchstart' in document.documentElement,
    
    touchStartEvent = supportTouch ? "touchstart" : "mousedown",
    touchStopEvent = supportTouch ? "touchend" : "mouseup",
    touchMoveEvent = supportTouch ? "touchmove" : "mousemove";

    // also handles swipeleft, swiperight
    $.event.special.swipe = {
        scrollSupressionThreshold: 10, // More than this horizontal displacement, and we will suppress scrolling.

        durationThreshold: 1000, // More time than this, and it isn't a swipe.

        horizontalDistanceThreshold: 30, // Swipe horizontal displacement must be more than this.

        verticalDistanceThreshold: 75, // Swipe vertical displacement must be less than this.

        setup: function () {
            var thisObject = this, $this = $(thisObject);

            $this.bind(touchStartEvent, function (event) {
                var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event,
                    start = {
                        time: (new Date()).getTime(),
                        coords: [data.pageX, data.pageY],
                        origin: $(event.target)
                    },
stop;

                function moveHandler(event) {

                    if (!start) {
                        return;
                    }

                    var data = event.originalEvent.touches ?
event.originalEvent.touches[0] : event;

                    stop = {
                        time: (new Date()).getTime(),
                        coords: [data.pageX, data.pageY]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.swipe.scrollSupressionThreshold) {
                        event.preventDefault();
                    }
                }

                $this.bind(touchMoveEvent, moveHandler)
.one(touchStopEvent, function (event) {
    $this.unbind(touchMoveEvent, moveHandler);

    if (start && stop) {
        if (stop.time - start.time < $.event.special.swipe.durationThreshold &&
Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.swipe.horizontalDistanceThreshold &&
Math.abs(start.coords[1] - stop.coords[1]) < $.event.special.swipe.verticalDistanceThreshold) {

            start.origin.trigger("swipe")
.trigger(start.coords[0] > stop.coords[0] ? "swipeleft" : "swiperight");
        }
    }
    start = stop = undefined;
});
            });
        }
    };

    $.each({
        swipeleft: "swipe",
        swiperight: "swipe"
    }, function (event, sourceEvent) {

        $.event.special[event] = {
            setup: function () {
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });

})(jQuery, this);