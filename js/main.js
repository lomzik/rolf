//networkEnabled- true when internet connection is enabled
var networkEnabled = false;

// Id of authoricated user
var authUser = false;

// Native or Mobile
var PhoneGap = false;
$.getScript('phonegap.js', function() {
    //alert('Load was performed.');
    PhoneGap = true;
});

// Check for support localStorage true/false
var hasLocalStorage = (function () {
    try {
        localStorage.setItem('a', 'a');
        localStorage.removeItem('a');
        return true;
    } catch (e) {
        return false;
    }
} ());

// Curent Date
var date = new Date();
// Number of milliseconds since 01.01.1970.
var currentTime = date.getTime();

// Content time-out's, for read from localStorage or from Internet with API
var newsTimeOut = 3600*1000;
var servicesTimeOut = 3600*12*1000;
var bannersTimeOut = 3600*1000;
var locatorTimeOut = 3600*24*1000;

// Current HTML Template
var Page = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);

var GET = {};

// Redirect when Non-auth user
getUserAuth();
if (authUser == 0) {
//if (Page != "index_noauth.html")
//     document.location = "index_noauth.html";
}

$(document).bind("mobileinit", function () {
    $.mobile.touchOverflowEnabled = true;
});

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    $.mobile.touchOverflowEnabled = true;
}


function parseUrlQuery(getHash) {
    GET = {};

    var url = document.location.href.split("?")[1];
    if (!url)
        return false;
    var pair = url.split('&');
    for (var i = 0; i < pair.length; i++) {
        var param = pair[i].split('=');
        GET[param[0]] = param[1];
    }

    return GET;
}
parseUrlQuery();

function print_r(data) {
    var t = new Array();
    for (var prop in data) {
        t.push('data[' + prop + '] - ' + (data[prop] || 'n/a'));
    }
    alert(t.join('\n'));
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
    return matches ? decodeURIComponent(matches[1]) : undefined
}

// уcтанавливает cookie
function setCookie(name, value, props) {
    props = props || {}
    var exp = props.expires
    if (typeof exp == "number" && exp) {
        var d = new Date()
        d.setTime(d.getTime() + exp * 1000)
        exp = props.expires = d
    }
    if (exp && exp.toUTCString) {
        props.expires = exp.toUTCString()
    }

    value = encodeURIComponent(value)
    var updatedCookie = name + "=" + value
    for (var propName in props) {
        updatedCookie += "; " + propName
        var propValue = props[propName]
        if (propValue !== true) {
            updatedCookie += "=" + propValue
        }
    }
    document.cookie = updatedCookie
}

// удаляет cookie
function deleteCookie(name) {
    setCookie(name, null, {
        expires:-1
    })
}

function dbErrorHandler(err) {
    alert("DB Error: " + err.message + "\nCode=" + err.code);
}

// Set global variable network state
function setNetworkState() {
    var networkType = navigator.network.connection.type;
    networkEnabled = (networkType == 'none' || networkType == 'unknown') ? true : false;
}

function setupTable(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS NEWS (id INTEGER PRIMARY KEY, header TEXT, content TEXT, preview TEXT)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS LOGIN (id INTEGER PRIMARY KEY, isAuth INT)");
}

//
function getUserAuth() {
    if (hasLocalStorage) {
        var userId = window.localStorage.getItem("auth_user");
    }
    else {
        var userId = getCookie('auth_user');
    }
    authUser = userId != undefined ? userId : 0;
}

//
function setUserAuth(state, userId, userName) {
    state = state ? 1 : 0;
    if (hasLocalStorage) {
        window.localStorage.setItem("auth_user", userId);
        window.localStorage.setItem("user_name", userName);
    }
    else {
        setCookie("auth_user", userId);
        setCookie("user_name", userName);
    }
    authUser = userId;
}

function AuthSuccess(userId, userName) {
    setUserAuth(true, userId, userName);
    document.location = "index.html";
}

function AuthFail(error) {
    alert(error);
}

//
function Logout() {
    if (hasLocalStorage) {
        window.localStorage.removeItem("auth_user");
        window.localStorage.removeItem("user_name");
    }
    else {
        deleteCookie("auth_user");
        deleteCookie("user_name");
    }
    document.location = "index.html";
}

function LoadBanners(callback) {
    if(PhoneGap) {

    } else {
        if(hasLocalStorage && currentTime < parseInt(window.localStorage.getItem("bannersWritingTime")) + bannersTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("banners"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?banners&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("banners", JSON.stringify(data));
                    window.localStorage.setItem("bannersWritingTime", currentTime);
                    callback(data);
                }
            });
        }
    }
}

function LoadServices(callback) {
    if(PhoneGap) {

    } else {
        if(hasLocalStorage && currentTime < parseInt(window.localStorage.getItem("servicesWritingTime")) + servicesTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("services"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?services&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("services", JSON.stringify(data));
                    window.localStorage.setItem("servicesWritingTime", currentTime);
                    callback(data);
                }
            });
        }
    }
}

function LoadNews(callback) {
    if(PhoneGap) {

    } else {
        if(hasLocalStorage && currentTime < parseInt(window.localStorage.getItem("newsWritingTime")) + newsTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("news"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?news&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("news", JSON.stringify(data));
                    window.localStorage.setItem("newsWritingTime", currentTime);
                    callback(data);
                }
            });
        }
    }
}

function LoadLocator(callback) {
    if(PhoneGap) {

    } else {
        if(hasLocalStorage && currentTime < parseInt(window.localStorage.getItem("locatorWritingTime")) + locatorTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("locator"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?locator&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("locator", JSON.stringify(data));
                    window.localStorage.setItem("locatorWritingTime", currentTime);
                    callback(data);
                }
            });
        }
    }
}


function InitHeaderEvents(page) {
    $(page).find('#toggle_auth').click(function () {
        $(page).find('#auth_block').toggle();
    });

    $(page).find('#auth_form').submit(function () {

        var login = $(page).find('#login').val();
        var password = $(page).find('#password').val();

        $.getJSON("http://phonegap.qulix.com/login.php?callback=?",
        {
            user_login:login,
            user_password:password
        },
        function (data) {
            if (data.error.length != 0)
                AuthFail(data.error);
            else {
                AuthSuccess(data.userId, data.name);
            }
        });

        return false;
    });

    $(page).find('#toggle_profile').click(function () {
        $(page).find('#profile_block').toggle();
    });

    $(page).find('#logout').click(function () {
        Logout();
        return false;
    });

    $(page).find('#profile_name').html(getCookie('user_name'));
}

$('#index_page').live('pagebeforeshow', function () {
    $(this).find('#content').hide();
});

$('#index_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $(this).html('');
    $.get(authUser != 0 ? 'html/index.html' : 'html/index_noauth.html', function (data) {
        $('#index_page').html(data);
        $('#index_page').trigger("create");
        $('#index_page #content').hide();

        InitHeaderEvents($('#index_page'));

        $.mobile.showPageLoadingMsg();

        LoadServices(function (data) {
            $('#index_page #services_block .service').not('.example').remove();

            var html = '';
            for (var ind in data) {
                if (data[ind].on_main == 0) continue;

                var item = $('#index_page #services_block .service.example:first').clone();
                $(item).find('span').html(data[ind].header);
                $(item).find('p').html(data[ind].content);
                $(item).find('img').attr('src', data[ind].image);
                $(item).find('a').attr('rel', data[ind].id).attr('href', 'service_item.html?id=' + data[ind].id);
                html += '<div class="service">' + $(item).html() + '</div>';
            }
            $("#index_page #services_block").append(html);

            LoadBanners(function (data) {
                $('#index_page #news_block .news .news-item').not('.example').remove();
                var bannersCount = 0;
                    html = '';
                for (var ind in data) {
                    var item = $('#index_page .news-item.example').clone();
                    $(item).find('span').html(data[ind].header);
                    $(item).find('p').html(data[ind].content);
                    $(item).find('img').attr('src', data[ind].image);
                    if (bannersCount++ == 0)
                        $(item).show();

                    $('#news_position').append('<em>&bull;</em>');
                    html += '<div style="display:' + (bannersCount++ == 0 ? 'block' : 'none') + '">' + $(item).html() + '</div>';
                }

                $('#index_page #news_block .news').append(html);

                $('#news_position').find('em').first().addClass('on');
                $('.news-item.example').remove();

                window.mySwipe = new Swipe(document.getElementById('banner_slider'), {
                    callback:function (e, pos) {
                        var i = $('#news_position em').removeClass('on');
                        $($('#news_position em').get(pos)).addClass('on');

                    }
                });
                $.mobile.hidePageLoadingMsg();
                $('#index_page #content').show();
            }
            );
        });
    });

});

$('#news_page').live('pagebeforeshow', function () {
    $(this).find('#content').hide();
});
$('#news_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $('.news-item').not('.example').remove();
    $(this).html('');
    $.get(authUser != 0 ? 'html/news.html' : 'html/news_noauth.html', function (data) {
        $('#news_page').html(data);
        $('#news_page').trigger("create");
        $('#news_page #content').hide();

        InitHeaderEvents($('#news_page'));

        $.mobile.showPageLoadingMsg();
        var html = '';
        LoadNews(function (data) {

            for (var ind in data) {
                var item = $('#news_page .news-item.example').clone();
                $(item).find('h2').html(data[ind].header);
                $(item).find('p').html(data[ind].content);
                $(item).find('img').attr('src', data[ind].image);
                html += '<div class="news-item">' + $(item).html() + '</div>';
            }
            $('#news_page #news_block').append(html);
            $.mobile.hidePageLoadingMsg();
            $('#news_page #content').show();
        });
    });
});

$('#locator_page').live('pagebeforeshow', function () {
    $(this).find('#content').hide();
});
$('#locator_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $('.news-item').not('.example').remove();
    $(this).html('');
    $.get(authUser != 0 ? 'html/locator.html' : 'html/locator_noauth.html', function (data) {
        $('#locator_page').html(data);
        $('#locator_page').trigger("create");
        $('#locator_page #content').hide();

        InitHeaderEvents($('#locator_page'));

        $.mobile.showPageLoadingMsg();
        LoadLocator(function (data) {

            $('#map').gmap({
                'disableDefaultUI':true,
                'callback':function () {
                    var self = this;
                    self.getCurrentPosition(function (position, status) {
                        if (status === 'OK') {
                            self.set('clientPosition', new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                            self.addMarker({
                                'position':self.get('clientPosition'),
                                'bounds':true
                            });
                            self.addShape('Circle', {
                                'strokeWeight':0,
                                'fillColor':"#008595",
                                'fillOpacity':0.25,
                                'center':self.get('clientPosition'),
                                'radius':5,
                                clickable:false
                            });

                            $.each(data, function (i, marker) {
                                self.addMarker({
                                    'position':new google.maps.LatLng(marker.latitude, marker.longitude),
                                    'bounds':true
                                }).click(function () {
                                    $('#map').gmap('openInfoWindow', {
                                        'content':marker.content
                                    }, this);
                                });
                            });

                        }
                    });


                }
            });


            $.mobile.hidePageLoadingMsg();
            $('#locator_page #content').show();
        });
    });
});

$(document).bind("pagebeforechange", function (e, data) {
    if (typeof data.toPage === "string") {
        var u = $.mobile.path.parseUrl(data.toPage);
    /*  if ( u.pathname.search("service_item.html") !== -1 ) {
         var id = u.search.substr(4);
         ShowService( id, data.options );
         e.preventDefault();
         }*/
    }
});

/*
 function ShowService(id, options)
 {
 $.mobile.showPageLoadingMsg();
 var page = $('#services_page');

 $.get(authUser != 0 ? 'html/service_item.html' : 'html/service_item_noauth.html', function (data) {
 $(page).html(data);
 $(page).find('#content').hide();
 $(page).page().trigger('create');
 $.ajax({
 url:'http://phonegap.qulix.com/content/exportItem/id/' + id + '?callback=?',
 dataType:'json',
 async:false,
 success:function (data) {
 $(page).find('.service-header').html(data.header);
 $(page).find('.service-content').html(data.content);
 $(page).find('.service-image').attr('src', data.image);

 $(page).find('.services.footer-button').click(function(){
 document.location = $(this).attr('href');
 });

 InitHeaderEvents($('#services_page'));

 $.mobile.hidePageLoadingMsg();

 $(page).attr('data-url', '/service_item.html?id=' + id);
 $(page).find('#content').show();
 $.mobile.changePage(page, options);
 }
 });
 });
 }

 */

$('#services_page').live('pagebeforeshow', function () {
    $(this).find('#content').hide();
});
$('#services_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $('.service').not('.example').remove();
    $(this).html('');
    $.get(authUser != 0 ? 'html/services.html' : 'html/services_noauth.html', function (data) {
        $('#services_page').html(data);
        $('#services_page').trigger("create");
        $('#content').hide();

        InitHeaderEvents($('#services_page'));

        $.mobile.showPageLoadingMsg();
        LoadServices(function (data) {
            var html = '';
            for (var ind in data) {
                var item = $('#services_page .service.example').clone();
                $(item).find('p').html(data[ind].content);
                $(item).find('span').html(data[ind].header);
                $(item).find('img').attr('src', data[ind].image);
                $(item).find('a').attr('rel', data[ind].id).attr('href', 'service_item.html?id=' + data[ind].id);
                $(item).click(function () {
                    $(this).find('a').click();
                });
                html += '<div class="service">' + $(item).html() + '</div>';
            }
            $('#services_page #services_block').html(html);
            $.mobile.hidePageLoadingMsg();
            $('#content').show();
        });
    });
});

$('#serviceitem_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    var page = this;
    $.get(authUser != 0 ? 'html/service_item.html' : 'html/service_item_noauth.html', function (data) {
        $(page).html(data);
        $(page).trigger("create");
        $('#content').hide();

        parseUrlQuery();
        if (GET.id == undefined)
            return false;

        InitHeaderEvents($('div:visible').filter('#serviceitem_page'));

        if (authUser == 0) {
            $(page).find('#content').show();
            $.mobile.hidePageLoadingMsg();
        }
        else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?services&item=' + GET.id + '&callback=?',
                dataType:'json',
                async:false,
                success:function (data) {
                    $(page).find('.service-header').html(data.header);
                    $(page).find('.service-content').html(data.content);
                    $(page).find('.service-image').attr('src', data.image);

                    $(page).find('#content').show();
                    $.mobile.hidePageLoadingMsg();
                }
            });
        }
    });
});

$(document).ready(function () {
    onDeviceReady();
});