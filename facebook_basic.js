//非同步初使fb

$(function () {
    //console.log('FB.init1');
    window.fbAsyncInit = function () {
        //console.log('FB.init2');
        FB.init({
            appId: fb_app_id,
            status: true,
            cookie: true,
            xfbml: true,
            oauth: true
        });

        //console.log('FB.init');

        //FB相關操作進入點
        if (fb_auth_immediate) {
            //alert('fb_auth_immediate');
            FB.getLoginStatus(checkLoginStatus);
        } else {
            fb_content_has_show = true;
        }

        window.setTimeout(function () {
            FB.Canvas.setAutoGrow();
             $('.step_1').fadeIn();
        }, 250);
    };


    // Load the SDK asynchronously
    (function (d) {
        var js, id = 'facebook-jssdk',
            ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/zh_TW/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));

});



var tellContentAuthOkDo;
var tellContentAuthFailDo;

function loginUser() {
    /*
		auth_url = 'https://www.facebook.com/dialog/oauth?client_id='+fb_app_id+'&redirect_uri='+base_path;
		login_url = 'http://www.facebook.com/login.php?next='+base_path;
		top.location.href=login_url;*/
    top.location.href = encodeURI("https://www.facebook.com/dialog/oauth?client_id=" + fb_app_id + "&redirect_uri=http:" + base_path + "&response_type=token");
}

function authUser(okDo, noOkDo) {
    tellContentAuthOkDo = okDo;
    tellContentAuthFailDo = noOkDo;
    if (fb_permission_scope == '') {
        console.log('fb_permission_scope no');
        fb_check_allpass = true;
        FB.login(checkLoginStatus);
    } else {
        console.log('fb_permission_scope yes');
        FB.login(checkLoginStatus, {
            scope: fb_permission_scope
        });
    }

}


function authUserRedirect(okDo, noOkDo) {
    tellContentAuthOkDo = okDo;
    tellContentAuthFailDo = noOkDo;
    top.location.href = encodeURI("https://www.facebook.com/dialog/oauth?client_id=" + fb_app_id + "&redirect_uri=http:" + base_path + "m/game.html" + "&response_type=token&scope=" + fb_permission_scope);
}


function logoutUser() {
    FB.logout(function (response) {
        // user is now logged out
        location.reload();
    });
}

// Check the result of the user status and display login button if necessary

function checkLoginStatus(response) {
    console.log(JSON.stringify(response));
    //alert('checkLoginStatus');
    if (response && response.status === 'connected') {
        //使用者已登入FB
        fb_accessToken = response.authResponse.accessToken;
        if (fb_permission_scope != '') {
            checkAppPermission();
        }else{
            getUserData();
        }
    } else if (response && response.status === 'not_authorized') {
        //fb_accessToken = response.authResponse.accessToken;
        //alert('需要允許授權');
        showContent();
        //checkAppPermission();
    } else {
        //使用者未登入FB
        loginUser()
    }
}

function checkAppPermission() {
    var _scopes = fb_permission_scope.split(',');
    var _total_scopes = 0;
    if (fb_permission_scope != '') {
        FB.api('/me/permissions', function (response) {
            //check all permission
            for (_i = 0; _i < _scopes.length; _i++) {
                if (response['data'][0][_scopes[_i]]) {
                    _total_scopes++;
                } else {
                    //console.log('need permission "' + _scopes[_i] + '" but hasnt');
                }
            }

            if (_total_scopes >= _scopes.length) {
                //success and go get some user data
                //console.log('have all permission and go ahead:' + _total_scopes);
                fb_check_allpass = true;
                getUserData();
            } else {
                //fail
                //console.log('permission need :' + _scopes.length + ' have:' + _total_scopes);
                showContent();
            }
        });
    } else {
        fb_check_allpass = true;
        getUserData();
    }
}

function getUserData() {
    FB.api('/me', function (response) {
        fb_user_data = response;
        //console.log(fb_user_data);
        showContent();
    });
}

function showContent() {
    if (fb_content_has_show) {
        if (fb_check_allpass) {
            tellContentAuthOk();
        } else {
            tellContentAuthFail();
        }
    } else {
        fb_content_has_show = true;
        if (fb_check_allpass) {
            showContentAuthOk();
        } else {
            showContentAuthFail();
        }
    }
}

function likebox_listener() {
    FB.Event.subscribe('edge.create', function (response) {
        $('#like_box').fadeOut();
    });

    FB.Event.subscribe('edge.remove', function (response) {
        $('#like_box').show();
    });

}

function is_page_fan(page_id, callback) {

    alert('is_page_fan');

    var data = parse_signed_request(signed_request, app_secret);
    ////console.log(JSON.stringify(data));

    if (data["page"]["liked"]) {
        ////console.log('you are fan');
        callback(true);
    } else {
        ////console.log('you are not fan');
        callback(false);
    }

}

function fql_query(fql, callBack) {
    FB.api({
        method: 'fql.query',
        //query: 'SELECT uid, flid FROM friendlist_member WHERE flid = 2397768547438'
        query: fql

    }, callBack);
}

// function to check for an empty object

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}



function showContentAuthOk() {
    ////console.log('showContentAuthOk.');
}

function showContentAuthFail() {
    ////console.log('showContentAuthFail.');
}


function tellContentAuthOk() {
    ////console.log('tellContentAuthOk.');
    tellContentAuthOkDo();
}

function tellContentAuthFail() {
    ////console.log('tellContentAuthFail.');
    alert('需要同意授權才能參加活動!');
    tellContentAuthFailDo();
}


function var2obj(ss) {
    var kk = ss.split('&');
    var oo = {};
    for (var i = 0; i < kk.length; i++) {
        var aa = kk[i].split('=');
        oo[aa[0]] = aa[1];
    }
    return oo;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function postToFeed(obj, callback) {
    /*
var publish = {
  method: 'feed',
  message: 'getting educated about Facebook Connect',
  name: 'Connect',
  caption: 'The Facebook Connect JavaScript SDK',
  description: (
      'A small JavaScript library that allows you to harness ' +
      'the power of Facebook, bringing the user\'s identity, ' +
      'social graph and distribution power to your site.'
  ),
  link: 'http://www.fbrell.com/',
  picture: 'http://www.fbrell.com/public/f8.jpg',
  actions: [
    { name: 'fbrell', link: 'http://www.fbrell.com/' }
  ],
  user_message_prompt: 'Share your thoughts about RELL'
};
*/
    FB.ui(obj, callback);
}

///////////////////////////////////////////////////////////////////////////////////
/*
 * 	pop 分享塗鴉牆
 */
///////////////////////////////////////////////////////////////////////////////////

function popPostToFeed(obj) {

    // calling the API ...
    obj.method = 'feed';



    function callback(response) {
        // document.getElementById('msg').innerHTML = "Post ID: " + response['post_id'];
    }


    FB.ui(obj, callback);
}

///////////////////////////////////////////////////////////////////////////////////
/*
 * 	分享照片
 */
///////////////////////////////////////////////////////////////////////////////////

function sharePic(params, sharePicCallback) {
    ////console.log(path);
    /*
    var params = {};
    params['message'] = message;
    params['url'] = path;
    */
    FB.api('/me/photos', 'POST', params, function (response1) {
        //alert(JSON.stringify(response1));
        if (!response1 || response1.error) {
            ////console.log(response1.error);
            sharePicCallback(0, 0);
        } else {
            ////console.log(response1);
            sharePicCallback(1, response1.post_id);
        }
    });
}


function sharePicFromUpload(_formdata, sharePicCallback) {
_formdata.append("access_token",fb_accessToken);
    try{
   $.ajax({
        url:"https://graph.facebook.com/" + fb_user_data.id + "/photos?access_token=" + fb_accessToken,
        type:"POST",
        data:_formdata,
        processData:false,
        contentType:false,
        cache:false,
        success:function(data){
            //console.log("success " + data);
            //alert(JSON.stringify(data));
            sharePicCallback(1, data.post_id);
        },
        error:function(shr,status,data){
            //console.log("error " + data + " Status " + shr.status);
        },
        complete:function(){
            //console.log("Ajax Complete");
        }
    });

}catch(e){}




    /*
    
    
    FB.api('/me/photos', 'POST', _formdata, function (response1) {
        if (!response1 || response1.error) {
            ////console.log(response1.error);
            sharePicCallback(0, 0);
        } else {
            ////console.log(response1);
            sharePicCallback(1, response1.post_id);
        }
    });
    */
}