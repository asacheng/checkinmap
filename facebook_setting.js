/*start facebook func*/
var urlstring = window.location.href;
var urlarray = urlstring.split('/');
var urlcorrect = urlarray.slice(2, urlarray.length - 1);
var base_path = '//' + urlcorrect.join('/') + '/';

var fb_app_id = '1503385066560677';




var fb_permission_scope = '';
var fb_auth_immediate = false;
var fb_user_data = {};
var fb_check_allpass = false;
var fb_content_has_show = false;
var fb_accessToken = '';