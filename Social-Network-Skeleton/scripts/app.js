'use strict';

(function() {

	$(function() {
		registerEventHandlers();

		var currentUser = userSession.getCurrentUser();
		if (currentUser) {
			showLogedinUserView();
		} else {
			showHomeView();
		}
	});

	function registerEventHandlers() {
		// login section
		$('#guestHomeViewLogin').on('click', showLoginView);
		$('#registerLink').on('click', showRegisterView);
		$('#loginClicked').on('click', loginClicked);

		//register section		
		$('#guestHomeViewRegister').on('click', showRegisterView);
		$('#loginLink').on('click', showLoginView);
		$('#registerClicked').on('click', registerClicked);
		$('#upload-file-button').on('click', function() {
			$('#picture').click();
		});

		//loged user section		
		$('#home').on('click', showLogedinUserView);
		$('#editProfile').on('click', showEditMenu);
		// editProfile
		$('#post').on('click', showPostMenu);

		//edit profile		
		$('#saveEditProfile').on('click', saveEditProfile);
		$('#cancelEditProfile').on('click', showLogedinUserView);
		$('#edit-upload-file-button').on('click', function() {
			$('#picture').click();
		});

		//make post
		$('#makePostClicked').on('click', makePost);

		//logout section
		$('#logout').on('click', logoutClicked);
	}

	function showHomeView() {
		$('#header > *').hide();
		$('#main > *').hide();
		$('#guestHomeView').show();
	}

	// ---- Loigin ----
	function showLoginView() {
		$('#header > *').hide();
		$('#main > *').hide();
		$('#showLoginView').show();

		$('#login-username').val('');
		$('#login-password').val('');
	}

	function loginClicked() {
		var username = $('#login-username').val(),
			password = $('#login-password').val();

		var data = {
			'username': username,
			'password': password
		};

		sessionStorage['userInformation'] = password;

		ajaxRequester.login(data, loginSuccess, loginError);
	}

	function loginSuccess(data) {
		showSuccessMessage('Loigin successful.');
		console.log(data);
		userSession.login(data);
		showLogedinUserView();
	}

	function loginError(error) {
		showErrorMessage('Error login user.');
		console.log(error);
	}

	// ---- Register ----
	function showRegisterView() {
		$('#header > *').hide();
		$('#main > *').hide();
		$('#showRegisterView').show();

		$('#reg-username').val('');
		$('#reg-password').val('');
		$('#reg-name').val('');
		$('#reg-about').val('');
		$('.radio input[type="radio"]:checked').attr('checked', false); //repair clear value
		$('.picture-preview').removeAttr('src');
		$('.picture-name').html('');

		fileReader();
	}

	function registerClicked() {
		var username = $('#reg-username').val(),
			password = $('#reg-password').val(),
			name = $('#reg-name').val(),
			about = $('#reg-about').val(),
			gender = $('.radio input[type="radio"]:checked').val(),
			image = $('.picture-preview').attr('src');

		var data = {
			'username': username,
			'password': password,
			'name': name,
			'about': about,
			'gender': gender,
			'image': image
		};

		

		userSession.login(data);
		sessionStorage['userInformation'] = password;

		ajaxRequester.register(data, registerSuccess, registerError);
	}

	function registerSuccess(data) {
		showSuccessMessage('Registration successful.');
		var currentUser = JSON.parse(sessionStorage['currentUser']);
		currentUser.sessionToken = data.sessionToken;
		currentUser.objectId = data.objectId;
		userSession.login(currentUser);
		console.log(data);
		showLogedinUserView();
	}

	function registerError(error) {
		var errorText = JSON.parse(error.responseText);

		showErrorMessage('Registration error! --> ' + errorText.error);
	}

	// ---- Loged user section ----
	function showLogedinUserView() {
		var user = JSON.parse(sessionStorage['currentUser']),
			sessionToken = user.sessionToken,
			currentUserName = '';

		if (user != null) {
			currentUserName = user.username;
		} else {
			currentUserName = name;
		}

		$('#main > *').hide();
		$('#header > *').show();
		$('#postsPage').show();

		$('#headerUserName').text(currentUserName);
		$('.thumbnail').attr('src', function() {
			return user.image || $('.thumbnail').removeAttr('src');
		});
		$('.navbar-brand').html(user.username);

		ajaxRequester.getPosts(sessionToken, listPostsSuccess, listPostsError);
	}

	function listPostsSuccess(data) {
		var article = '';

		for (var d in data.results) {
			var item = data.results[d],
				imageData = item.image,
				image = '<img src="' + imageData + '" class="mini-thumbnail" />';

			if (!imageData) {
				image = '';
			}

			article = '<article class="post well">' +
				'<header class="post-header">' +
				'<div class="post-image">' +
				image +
				'</div>' +
				'<div class="post-info">' +
				'<p><a href="#" class="profile-link">' + item.name + '</a> made a post</p>' +
				'<p>on <time>' + formatDateTime(item.createdAt) + '</time></p>' +
				'</div>' +
				'</header>' +
				'<section class="post-content">' +
				item.post +
				'</section>' +
				'</article>';			

			$('#main').append(article);
		}
	}

	function listPostsError(error) {
		showErrorMessage('Can not read from data-base.');
	}

	function showEditMenu() {
		$('#main > *').hide();
		$('#header > *').show();
		$('#editProfileMenu').show();

		$('#username').val('');
		$('#password').val('');
		$('#name').val('');
		$('#about').val('');
		// $('.radio input[type="radio"]:checked').attr('checked', false);
		$('.radio input[name="gender-radio"]').val(['']);
		$('.picture-preview').removeAttr('src');

		fileReader();

		var user = JSON.parse(sessionStorage['currentUser']),
			sessionToken = user.sessionToken,
			userId = user.objectId;

		ajaxRequester.getUserInformation(sessionToken, userId, getUserInormationSuccess, getUserInormationError);
	}

	function getUserInormationSuccess(data) {
		console.log(data);
		var gender = data.gender,
			password = sessionStorage['userInformation'];

		if (gender) {
			$('.radio input[name="gender-radio"]').val([gender]);
		}

		$('#username').val(data.username || '');
		$('#password').val(password || '');
		$('#name').val(data.name || '');
		$('#about').val(data.about || '');
		$('.thumbnail').attr('src', function() {
			return data.image;
		})
	}

	function getUserInormationError(error) {
		showErrorMessage('Error reading user profile.');
	}

	function saveEditProfile() {
		var username = $('#username').val(),
			password = $('#password').val(),
			name = $('#name').val(),
			about = $('#about').val(),
			gender = $('.radio input[type="radio"][name="gender-radio"]:checked').val(), //error getting value
			image = $('.picture-preview').attr('src');

		alert(gender);

		var data = {
			'username': username,
			'password': password,
			'name': name,
			'about': about,
			'gender': gender,
			'image': image
		};

		var user = JSON.parse(sessionStorage['currentUser']),
			sessionToken = user.sessionToken,
			userId = user.objectId;

		user.image = image;
		userSession.login(user);

		ajaxRequester.editUserInformation(sessionToken, userId, data, editProfileSuccess, editProfileError);
	}

	function editProfileSuccess(data) {
		showSuccessMessage('Profile edited successfully');
		showLogedinUserView();
	}

	function editProfileError(error) {
		showErrorMessage('Error editing profile');
	}

	function showPostMenu() {
		showLogedinUserView();
		$('#post-container').show();
		$('#post-content').val('');
	}

	function makePost() {
		var postContent = $('#post-content').val(),
			user = JSON.parse(sessionStorage['currentUser']),
			userName = user.name,
			userImage = user.image,
			userId = user.objectId;

		var data = {
			'post': postContent,
			'createdBy': {
				'__type': 'Pointer',
				'className': '_User',
				'objectId': userId
			},
			'name': userName,
			'image': userImage
		}

		// var data = {
		// 	'name': userName,
		// 	'image': userImage,
		// 	'postText': postContent
		// }

		ajaxRequester.makePost(data, success, error);
	}

	function success(data) {
		showSuccessMessage('Post message published');
		showLogedinUserView();
	}

	function error(error) {
		showErrorMessage('Error publishing message');
	}

	// ---- Logout ----
	function logoutClicked() {
		userSession.logout();
		showSuccessMessage('Logout success.');
		showHomeView();
	}

	// ---- File reader ----
	function fileReader() {
		$('#picture').on('change', function() {
			var file = this.files[0],
				reader;

			if (file.size > 131072) {
				$('.picture-preview').removeAttr('src');
				$('.picture-name').html('<p>Picture too big!!</p>');
			} else {
				if (file.type.match(/image\/.*/)) {
					reader = new FileReader();
					reader.onload = function() {
						$('.picture-name').html(file.name);
						$('.picture-preview').attr('src', function() {
							return reader.result
						});
					};
					reader.readAsDataURL(file);
				} else {
					$('.picture-preview').removeAttr('src');
					$('.picture-name').html('');
					$('.picture-preview').html('<p>Not an image!!</p>');
				}
			}
		});
	}

	// ---- Format date ----
	function formatDateTime(dateTime) {
		var mounthNames = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
			dateParts = dateTime.split(/([-:\.TZ\s]+)/g),
			day = dateParts[4],
			month = mounthNames[dateParts[2] - 1],
			year = dateParts[0],
			hours = dateParts[6],
			minutes = dateParts[8],
			dateString = day + '-' + month + '-' + year + ' ' + hours + ':' + minutes;

		return dateString;
	}

	// ---- Notifications ----
	function showSuccessMessage(msg) {
		noty({
			text: msg,
			type: 'success',
			layout: 'topCenter',
			timeout: 5000
		});
	}

	function showErrorMessage(msg) {
		noty({
			text: msg,
			type: 'error',
			layout: 'topCenter',
			timeout: 5000
		});
	}
}());