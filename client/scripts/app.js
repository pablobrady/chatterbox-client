var app = {
	username: '<anonymous>',
	server: 'https://api.parse.com/1/classes/chatterbox',
	friendsList: {},
	init: function() {
		//initialize function to start timers, get initial messages
		// fix:  $('#username').text(app.username);
		getMessages();
	},
	send: function(message) {
		// Send an AJAX Post request.
		postMessage(message);
	},
	fetch: function() {
		// Send an AJAX get request.
		getMessages();
	},
	clearMessages: function() {
		// Remove all children from #chats.
		$('#chats').children().remove();
	},
	addMessage: function(message) {
		//append HTML element to chats
		$('#chats').append(message);
		// formatting
	},
	addRoom: function(roomName) {
		$('#roomSelect').append('<div class=roomTitle>' + roomName + '</div>');
		// formatting
	}
};

var createMessage = function() {
	app.username = $("#username").val() || '<anonymous>';
	var msg = {
		'text': $('.messageInputText').val(),
		'username': app.username
	};
	console.log("msg = ", msg);
	app.send(msg);
	$('.messageInputText').val("");
}

// $("#messageInput").on("submit", function(event) {
// 	event.preventDefault();

// })

var postMessage = function(message) {
	// post a message (as an object) to the server
	$.ajax({
	  // This is the url you should use to communicate with the parse API server.
	  url: app.server,
	  type: 'POST', // to create a new resource
	  data: JSON.stringify(message),
	  contentType: 'application/json',
	  success: function (data) {
	    console.log('chatterbox: Message sent');
	    console.log('post data:');
	    console.log(data);
	    getMessages(data);
	  	// call update method to update the display
	  },
	  error: function (data) {
	    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
	    console.error('chatterbox: Failed to send message');
	  }
	});
};

var getMessages = function() {
	//send AJAX request to get messages from the server
	  //on success, add to the document message area
	$.ajax({
	  // This is the url you should use to communicate with the parse API server.
	  url: app.server,
	  type: 'GET', // to create a new resource
	  data: {
	  	order: '-createdAt'
	  	// where: {'roomname': 'lobby', 'username': 'matt_david'}
	  },
	  success: function (data) {
	    console.log(data);
	    // Interate over all of data results.
	    // To prevent a blink, we should cache the messages on screen and only update the newest msgs.
	      // Store the last time a get request was done.  Only read the message that have appeared since then.

	    // to fix: ordering of messages
	    for(var i=0; i<20; i++) {
	    	var $message = $('<div><div>');
	    	var $username = $('<a href="#"></a>').text(data.results[i].username);
	    	var $messageText = $('<span class="messageText">' + ': ' + data.results[i].text + '</span>');
        
        $username.addClass('user');
	    	if (app.friendsList[data.results[i].username] === true) {
	    		$username.addClass('friend'); // if friend, class="user friend"
	    	}
        // add user to friends list
        $username.on('click',function(event) {
          console.log(this.text);
          app.friendsList[this.text] = true;
          console.log(app.friendsList);
          return false;
        });

        $message.append($username);
        $message.append($messageText);
	    	
	    	app.addMessage($message);
	    }

	    // Build a string that contains the message, username (, time?)
	    // For each member, call addMessage(text)


	  	// call update method to update the display
	  	// app.addMesages();
	  },
	  // error: function (data) {
	  //   // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
	  //   console.error('chatterbox: Failed to send message');
	  // }
	});
};

//periodic message refreshing via getMessages function
app.init();

