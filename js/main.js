//networkEnabled- true when internet connection is enabled
var networkEnabled = false;

// Id of authoricated user
var authUser = false;

// Native or Mobile
var PhoneGap = false;

// Current HTML Template
var Page = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);

var GET = {};

// Redirect when Non-auth user
getUserAuth();
if (authUser == 0) {
    //if (Page != "index_noauth.html")
    //     document.location = "index_noauth.html";
}

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

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
    setCookie(name, null, { expires:-1 })
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

function getUserAuth() {
    if (PhoneGap) {
        dbShell.transaction(function (tx) {
            tx.executeSql("select id from LOGIN ", [], function (tx, result) {
                authUser = result.rows.length ? result.rows.item(0) : 0;
            }, dbErrorHandler);
        }, dbErrorHandler);
    }
    else {
        var userId = getCookie('auth_user');
        authUser = userId != undefined ? userId : 0;
    }
}

function setUserAuth(state, userId, userName) {
    state = state ? 1 : 0;
    if (PhoneGap) {
        dbShell.transaction(function (tx) {
            tx.executeSql("DELETE FROM LOGIN WHERE id=(?)", [userId]);
            tx.executeSql("INSERT INTO LOGIN (id) VALUES ((?))", [userId]);
        }, dbErrorHandler);
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

function Logout() {
    deleteCookie("auth_user");
    document.location = "index.html";
}

function LoadBanners(callback) {
    $.ajax({
        url:'http://phonegap.qulix.com/content/export/feed_id/18?callback=?',
        dataType:'json',
        async:false,
        success:callback
    });
}

function LoadServices(callback) {
    $.ajax({
        url:'http://phonegap.qulix.com/content/export/feed_id/17?callback=?',
        dataType:'json',
        async:false,
        success:callback
    });
}

function LoadNews(callback) {
    $.ajax({
        url:'http://phonegap.qulix.com/content/export/feed_id/16?callback=?',
        dataType:'json',
        async:false,
        success:callback
    });
}


function InitHeaderEvents(page) {
    $(page).find('#toggle_auth').click(function () {
        $(page).find('#auth_block').toggle();
    });

    $(page).find('#auth_form').submit(function () {

        var login = $(page).find('#login').val();
        var password = $(page).find('#password').val();

        $.getJSON("http://phonegap.qulix.com/login.php?callback=?",
            { user_login:login, user_password:password },
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

$('#index_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $(this).html('');
    $.get(authUser != 0 ? 'html/index.html' : 'html/index_noauth.html', function (data) {
        $('#index_page').html(data);
        $('#index_page').trigger("create");
        $('#content').hide();

        InitHeaderEvents($('#index_page'));

        $.mobile.showPageLoadingMsg();

        LoadServices(function (data) {
            $('#index_page #services_block .service').not('.example').remove();
            for (var ind in data) {
                if (data[ind].on_main == 0) continue;

                var item = $('#index_page #services_block .service.example:first').clone();
                $(item).removeClass('example');
                $(item).find('span').html(data[ind].header);
                $(item).find('p').html(data[ind].content);
                $(item).find('img').attr('src', data[ind].image);
                $(item).appendTo('#index_page #services_block').show();
            }
            LoadBanners(function (data) {
                    $('#index_page #news_block .news .news_item').not('.example').remove();
                    for (var ind in data) {
                        var item = $('#index_page .news-item.example').clone();
                        $(item).removeClass('example');
                        $(item).find('span').html(data[ind].header);
                        $(item).find('p').html(data[ind].content);
                        $(item).find('img').attr('src', data[ind].image);
                        $(item).appendTo('#index_page #news_block .news').show();
                    }
                    $.mobile.hidePageLoadingMsg();
                    $('#content').show();
                }
            );
        });


    });
});

$('#news_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $('.news-item').not('.example').remove();
    $(this).html('');
    $.get(authUser != 0 ? 'html/news.html' : 'html/news_noauth.html', function (data) {
        $('#news_page').html(data);
        $('#news_page').trigger("create");
        $('#content').hide();

        InitHeaderEvents($('#news_page'));

        $.mobile.showPageLoadingMsg();
        LoadNews(function (data) {

            for (var ind in data) {
                var item = $('#news_page .news-item.example').clone();
                $(item).removeClass('example');
                $(item).find('p').html(data[ind].content);
                $(item).find('img').attr('src', data[ind].image);
                $(item).appendTo('#news_page #news_block').show();
            }
            $.mobile.hidePageLoadingMsg();
            $('#content').show();
        });
    });

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

            for (var ind in data) {
                var item = $('#services_page .service.example').clone();
                $(item).removeClass('example');
                $(item).find('p').html(data[ind].content);
                $(item).find('span').html(data[ind].header);
                $(item).find('img').attr('src', data[ind].image);
                $(item).find('a').attr('rel', data[ind].id).attr('href', 'service_item.html?id=' + data[ind].id).click(function () {
                    link = this;
                    if (authUser != 0) {
                        $('#services_page').empty().load("html/service_item.html", function () {
                            $.ajax({
                                url:'http://phonegap.qulix.com/content/exportItem/id/' + $(link).attr('rel') + '?callback=?',
                                dataType:'json',
                                async:false,
                                success:function (data) {
                                    $('.service-header').html(data.header);
                                    $('.service-content').html(data.content);
                                    $('.service-image').attr('src', data.image);

                                    $('#content').show();
                                    $.mobile.hidePageLoadingMsg();
                                }
                            });
                            $('#services_page').trigger('create');
                        });
                    }
                    else {
                        $('#services_page').empty().load("html/service_item_noauth.html", function () {
                            $('#services_page').trigger('create');
                        });
                    }


                    return false;
                });
                $(item).appendTo('#services_page #services_block').show();
            }
            $.mobile.hidePageLoadingMsg();
            $('#content').show();
        });
    });
});

$('#serviceitem_page').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
    $(this).html('');
    $.get(authUser != 0 ? 'html/service_item.html' : 'html/service_item_noauth.html', function (data) {
        $('#serviceitem_page').html(data);
        $('#serviceitem_page').trigger("create");
        $('#content').hide();
        $.mobile.hidePageLoadingMsg();

        InitHeaderEvents($('#serviceitem_page'));

        if (authUser == 0) {
            $('#content').show();
            return true;
        }

        if (GET.id == undefined)
            return false;

    });
});

$(document).ready(function () {
    onDeviceReady();
});