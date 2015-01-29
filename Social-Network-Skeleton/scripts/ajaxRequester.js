'use strict';

var ajaxRequester = (function() {
    var baseUrl = 'https://api.parse.com/1/';

    var headers =
    {
        'X-Parse-Application-Id': '4WZ6SaHVqUg9rCt3RuMn4ELm0MqgaKVgw3YrX1KA',
        'X-Parse-REST-API-Key': '6w90WTBtAfRgHwYH9N8bgYbAV9u26E1sm4RAFynw'
    };

    function login(data, success, error) {

        jQuery.ajax({
            method: 'GET',
            headers: headers,
            url: baseUrl + 'login',
            data: data,
            success: success,
            error: error
        });
    }

    function register(data, success, error) {
        jQuery.ajax({
            method: 'POST',
            headers: headers,
            url: baseUrl + 'users',
            data: JSON.stringify(data),
            success: success,
            error: error
        });
    }

    function getHeadersWithSessionToken(sessionToken) {
        var headersWithToken = JSON.parse(JSON.stringify(headers));
        headersWithToken['X-Parse-Session-Token'] = sessionToken;
        return headersWithToken;
    }

    function getPosts(sessionToken, success, error) {
        var headersWithToken = getHeadersWithSessionToken(sessionToken);

        jQuery.ajax({
            method: 'GET',
            headers: headersWithToken,
            url: baseUrl + 'classes/Posts',
            success: success,
            error: error
        });
    }

    function getUserInformation(sessionToken, objectId, success, error) {
        var headersWithToken = getHeadersWithSessionToken(sessionToken);

        jQuery.ajax({
            method: 'GET',
            headers: headersWithToken,
            url: baseUrl + 'users/' + objectId,
            success: success,
            error: error
        });
    }

    function editUserInformation(sessionToken, objectId, data, success, error) {
        var headersWithToken = getHeadersWithSessionToken(sessionToken);

        jQuery.ajax({
            method: 'PUT',
            headers: headersWithToken,
            url: baseUrl + 'users/' + objectId,
            data: JSON.stringify(data),
            success: success,
            error: error
        });
    }

    function makePost(data, success, error) {
        jQuery.ajax({
            method: 'POST',
            headers: headers,
            url: baseUrl + 'classes/Posts',
            data: JSON.stringify(data),
            success: success,
            error: error
        });
    }

    return {
        login: login,
        register: register,
        getPosts: getPosts,
        getUserInformation: getUserInformation,
        editUserInformation: editUserInformation,
        makePost: makePost
    };
})();