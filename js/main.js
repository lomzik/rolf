//networkEnabled- true when internet connection is enabled
var networkEnabled = false;

// Id of authoricated user
var authUser = false;

// Native or Mobile
var PhoneGap = false;

// Current HTML Template
var Page = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);


var News = {};

// Redirect when Non-auth user
getUserAuth();
if (authUser == 0) {
    if (Page != "index_noauth.html")
        document.location = "index_noauth.html";
}

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

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

function LoadNews(callback) {
    $.ajax({
        url:'http://rolf-back/management/feedsmanager/feeds/export/feed_id/16?callback=?',
        dataType:'json',
        async:false,
        success:callback
    });
}


$('#index_page').live('pageshow', function () {

    $('#toggle_auth').click(function () {
        $('#auth_block').toggle();
    });

    $('#auth_form').submit(function () {

        var login = $('#login').val();
        var password = $('#password').val();

        $.getJSON("http://rolf-back/login.php?callback=?",
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

    $('#toggle_profile').click(function () {
        $('#profile_block').toggle();
    });

    $('#danger-button').click(function () {
        $('#services_additional').toggle();
        $('#services_block').toggle();
        $(this).toggleClass('active');
    });

    $('#logout').click(function () {
        Logout();
        return false;
    });

    $('#profile_name').html(getCookie('user_name'));

    $.mobile.showPageLoadingMsg();
    LoadNews(function (data) {
            for (var ind in data) {
                var item = $('.news-item.example').clone();
                $(item).removeClass('example');
                $(item).find('span').html(data[ind].header);
                $(item).find('p').html(data[ind].content);
                $(item).find('img').attr('src', data[ind].image);
                $(item).appendTo('#news_block .news').show();
            }
            $.mobile.hidePageLoadingMsg();

        }
    );


});


$(document).ready(function () {
    onDeviceReady();
});