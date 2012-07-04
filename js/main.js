//networkEnabled- true when internet connection is enabled
var networkEnabled = false;

// Id of authoricated user
var authUser = false;

// Native or Mobile
var PhoneGap = false;
//$.getScript('phonegap.js', function() {
//alert('Load was performed.');
//    PhoneGap = true;
//});

// DataBase
var dbShell;
var DB = false;

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

//
var newsWritingTime = 0;
var servicesWritingTime = 0;
var bannersWritingTime = 0;
var locatorWritingTime = 0;


// Current HTML Template
var Page = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);

var GET = {};

// Redirect when Non-auth user
getUserAuth();
if (authUser == 0) {
//if (Page != "index_noauth.html")
//     document.location = "index_noauth.html";
}

// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

$(document).bind("mobileinit", function () {
    $.mobile.touchOverflowEnabled = true;
});

function isObjectDB(x) {
    if (x == null) return false;
    return {}.toString.call(x) == "[object Database]" ? true : false;
}

function onDeviceReady() {
    PhoneGap = true;

    //First, open our db
    dbShell = window.openDatabase("rolfDB", "1.0", "Rolf demo DB", 200000);
    DB = isObjectDB(dbShell);

    if(DB) {
        //run transaction to create initial tables
        //dbShell.transaction(setupTable, dbErrorHandler, getEntries);
        dbShell.transaction(setupTable, dbErrorHandler);
    } else if(!DB && hasLocalStorage) {
        newsWritingTime = parseInt(window.localStorage.getItem("newsWritingTime"));
        servicesWritingTime = parseInt(window.localStorage.getItem("servicesWritingTime"));
        bannersWritingTime = parseInt(window.localStorage.getItem("bannersWritingTime"));
        locatorWritingTime = parseInt(window.localStorage.getItem("locatorWritingTime"));
    }
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

/*
function print_r(data) {
    var t = new Array();
    for (var prop in data) {
        t.push('data[' + prop + '] - ' + (data[prop] || 'n/a'));
    }
    alert(t.join('\n'));
}
*/

function print_r(arr, level) {
    var print_red_text = "";
    if(!level) level = 0;
    var level_padding = "";
    for(var j=0; j<level+1; j++) level_padding += "    ";
    if(typeof(arr) == 'object') {
        for(var item in arr) {
            var value = arr[item];
            if(typeof(value) == 'object') {
                print_red_text += level_padding + "'" + item + "' :\n";
                print_red_text += print_r(value,level+1);
            }
            else
                print_red_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
        }
    }

    else  print_red_text = "===>"+arr+"<===("+typeof(arr)+")";
    return print_red_text;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
    return matches ? decodeURIComponent(matches[1]) : undefined
}

// СѓcС‚Р°РЅР°РІР»РёРІР°РµС‚ cookie
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

// СѓРґР°Р»СЏРµС‚ cookie
function deleteCookie(name) {
    setCookie(name, null, {
        expires:-1
    })
}

// create table if not exists
function setupTable(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS WRITINGTIME');
    //tx.executeSql('DROP TABLE IF EXISTS NEWS');
    //tx.executeSql('DROP TABLE IF EXISTS SERVICES');
    //tx.executeSql('DROP TABLE IF EXISTS BANNERS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS WRITINGTIME (name, created)');
    tx.executeSql('insert into WRITINGTIME (name, created) values("newsWritingTime", 0)');
    tx.executeSql('insert into WRITINGTIME (name, created) values("servicesWritingTime", 0)');
    tx.executeSql('insert into WRITINGTIME (name, created) values("bannersWritingTime", 0)');
    tx.executeSql('insert into WRITINGTIME (name, created) values("locatorWritingTime", 0)');

    tx.executeSql("CREATE TABLE IF NOT EXISTS NEWS (id INTEGER, header, small_content, content, image, created INTEGER)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS BANNERS (id INTEGER, header, small_content, content, image, created INTEGER)");
    tx.executeSql("CREATE TABLE IF NOT EXISTS SERVICES (id INTEGER, header, small_content, content, image, created INTEGER, on_main INTEGER)");

    tx.executeSql("select * from WRITINGTIME", [], function(tx, data){
        var len = data.rows.length;
        if (len > 0 && len < 5) {
            for (var i=0; i<len; i++){
                eval(data.rows.item(i).name + ' = ' + data.rows.item(i).created);
                window[data.rows.item(i).name] = data.rows.item(i).created;
            //alert('wt = ' + data.rows.item(i).name);
            }
        }
    }, dbErrorHandler);

}

// show error alert
function dbErrorHandler(err) {
    alert("DB Error: " + err.message + "\nCode=" + err.code);
}

// Set global variable network state
function setNetworkState() {
    var networkType = navigator.network.connection.type;
    networkEnabled = (networkType == 'none' || networkType == 'unknown') ? true : false;
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
        if (DB && date.getTime() < bannersWritingTime + bannersTimeOut) {
            /**/
            alert('load from db');
            dbShell.transaction(
                function(tx) {
                    tx.executeSql("select * from BANNERS",
                        [],
                        function(tx, results){
                            var data = {};
                            for (var i=0; i<results.rows.length; i++){
                                data[i] = results.rows.item(i);
                            }
                            callback(data);
                        },
                        dbErrorHandler);
                },
                dbErrorHandler);
        /**/
        } else if (hasLocalStorage && date.getTime() < bannersWritingTime + bannersTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("banners"));
            callback(data);
        } else {
            alert('load from API');
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?banners&callback=?',
                dataType: 'json',
                async: false,
                success: function(data){
                    if (DB) {
                        // empty table
                        // and write new data
                        dbShell.transaction(
                            function(tx) {
                                tx.executeSql('delete from BANNERS where id > 0');
                                //var sql = "";
                                for (var ind in data) {
                                    //sql += 'insert into BANNERS (id, header, small_content, content, image, created) values('+ data[ind].id+',"'+data[ind].header+'","'+data[ind].small_content+'","'+data[ind].content+'","'+data[ind].image+'",'+data[ind].created+','+data[ind].on_main+'); ';
                                    //alert(sql);
                                    tx.executeSql('insert into BANNERS (id, header, small_content, content, image, created) values(?, ?, ?, ?, ?, ?)', [data[ind].id, data[ind].header, data[ind].small_content, data[ind].content, data[ind].image, data[ind].created], function(){}, dbErrorHandler);
                                }
                                //tx.executeSql(sql, dbErrorHandler);
                                tx.executeSql(
                                    'update WRITINGTIME set created='+date.getTime()+' where name="bannersWritingTime"',
                                    [],
                                    function() {
                                        bannersWritingTime = date.getTime();
                                    },
                                    dbErrorHandler
                                    );
                            },
                            dbErrorHandler
                            );

                    }
                    else if (hasLocalStorage) {
                        window.localStorage.setItem("banners", JSON.stringify(data));
                        window.localStorage.setItem("bannersWritingTime", date.getTime());
                    }
                    callback(data);
                },
                error: function(){
                    callback({});
                }
            });
        }
    } else {
        if(hasLocalStorage && date.getTime() < bannersWritingTime + bannersTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("banners"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?banners&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("banners", JSON.stringify(data));
                    window.localStorage.setItem("bannersWritingTime", date.getTime());
                    callback(data);
                }
            });
        }
    }
}

function LoadServices(callback) {
    if (PhoneGap) {
        if (DB && date.getTime() < servicesWritingTime + servicesTimeOut) {
            /**/
            alert('load from db');
            dbShell.transaction(
                function(tx) {
                    tx.executeSql("select * from SERVICES",
                        [],
                        function(tx, results){
                            var data = {};
                            for (var i=0; i<results.rows.length; i++){
                                data[i] = results.rows.item(i);
                            }
                            callback(data);
                        },
                        dbErrorHandler);
                },
                dbErrorHandler);
        /**/
        } else if (hasLocalStorage && date.getTime() < servicesWritingTime + servicesTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("services"));
            callback(data);
        } else {
            alert('load from API');
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?services&callback=?',
                dataType: 'json',
                async: false,
                success: function(data){
                    if (DB) {
                        // empty table
                        // and write new data
                        dbShell.transaction(
                            function(tx) {
                                tx.executeSql('delete from SERVICES where id > 0');
                                //var sql = "";
                                for (var ind in data) {
                                    //sql += 'insert into SERVICES (id, header, small_content, content, image, created) values('+ data[ind].id+',"'+data[ind].header+'","'+data[ind].small_content+'","'+data[ind].content+'","'+data[ind].image+'",'+data[ind].created+','+data[ind].on_main+'); ';
                                    //alert(sql);
                                    tx.executeSql('insert into SERVICES (id, header, small_content, content, image, created, on_main) values(?, ?, ?, ?, ?, ?, ?)', [data[ind].id, data[ind].header, data[ind].small_content, data[ind].content, data[ind].image, data[ind].created, data[ind].on_main], function(){}, dbErrorHandler);
                                }
                                //tx.executeSql(sql, dbErrorHandler);
                                tx.executeSql(
                                    'update WRITINGTIME set created='+date.getTime()+' where name="servicesWritingTime"',
                                    [],
                                    function() {
                                        servicesWritingTime = date.getTime();
                                    //alert('servicesWritingTime = ' + currentTime);
                                    },
                                    dbErrorHandler
                                    );
                            },
                            dbErrorHandler
                            );

                    }
                    else if (hasLocalStorage) {
                        window.localStorage.setItem("services", JSON.stringify(data));
                        window.localStorage.setItem("servicesWritingTime", date.getTime());
                    }
                    callback(data);
                },
                error: function(){
                    callback({});
                }
            });
        }
    } else {
        if(hasLocalStorage && date.getTime() < servicesWritingTime + servicesTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("services"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?services&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("services", JSON.stringify(data));
                    window.localStorage.setItem("servicesWritingTime", date.getTime());
                    callback(data);
                }
            });
        }
    }
}

function LoadNews(callback) {
    if(PhoneGap) {
        if (DB && date.getTime() < newsWritingTime + newsTimeOut) {
            /**/
            alert('load from db');
            dbShell.transaction(
                function(tx) {
                    tx.executeSql("select * from NEWS",
                        [],
                        function(tx, results){
                            var data = {};
                            for (var i=0; i<results.rows.length; i++){
                                data[i] = results.rows.item(i);
                            }
                            callback(data);
                        },
                        dbErrorHandler);
                },
                dbErrorHandler);
        /**/
        } else if (hasLocalStorage && date.getTime() < newsWritingTime + newsTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("news"));
            callback(data);
        } else {
            alert('load from API');
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?news&callback=?',
                dataType: 'json',
                async: false,
                success: function(data){
                    if (DB) {
                        // empty table
                        // and write new data
                        dbShell.transaction(
                            function(tx) {
                                tx.executeSql('delete from NEWS where id > 0');
                                //var sql = "";
                                for (var ind in data) {
                                    //sql += 'insert into NEWS (id, header, small_content, content, image, created) values('+ data[ind].id+',"'+data[ind].header+'","'+data[ind].small_content+'","'+data[ind].content+'","'+data[ind].image+'",'+data[ind].created+','+data[ind].on_main+'); ';
                                    //alert(sql);
                                    tx.executeSql('insert into NEWS (id, header, small_content, content, image, created) values(?, ?, ?, ?, ?, ?)', [data[ind].id, data[ind].header, data[ind].small_content, data[ind].content, data[ind].image, data[ind].created], function(){}, dbErrorHandler);
                                }
                                //tx.executeSql(sql, dbErrorHandler);
                                tx.executeSql(
                                    'update WRITINGTIME set created='+date.getTime()+' where name="newsWritingTime"',
                                    [],
                                    function() {
                                        newsWritingTime = date.getTime();
                                    },
                                    dbErrorHandler
                                    );
                            },
                            dbErrorHandler
                            );

                    }
                    else if (hasLocalStorage) {
                        window.localStorage.setItem("news", JSON.stringify(data));
                        window.localStorage.setItem("newsWritingTime", date.getTime());
                    }
                    callback(data);
                },
                error: function(){
                    callback({});
                }
            });
        }
    } else {
        if(hasLocalStorage && date.getTime() < newsWritingTime + newsTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("news"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?news&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("news", JSON.stringify(data));
                    window.localStorage.setItem("newsWritingTime", date.getTime());
                    callback(data);
                }
            });
        }
    }
}

function LoadLocator(callback) {
    if(PhoneGap) {

    } else {
        if(hasLocalStorage && date.getTime() < locatorWritingTime + locatorTimeOut) {
            var data = JSON.parse(window.localStorage.getItem("locator"));
            callback(data);
        } else {
            $.ajax({
                url:'http://phonegap.qulix.com/api/php/feeds.php?locator&callback=?',
                dataType:'json',
                async:false,
                success: function(data){
                    window.localStorage.setItem("locator", JSON.stringify(data));
                    window.localStorage.setItem("locatorWritingTime", date.getTime());
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
            //alert(print_r(data));
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
        });

/**/
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
        });
/**/
        $.mobile.hidePageLoadingMsg();
        $('#index_page #content').show();
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
    //
    });
