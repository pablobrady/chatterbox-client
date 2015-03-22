var app = {
  username: '<anonymous>',
  server: 'https://api.parse.com/1/classes/chatterbox',
  friendsList: {},
  lastGetMsgTime: "",
  defaultChatRoom: "lobby",
  chatRoomsList: [],

  init: function() {
    //initialize function to start timers, get initial messages
    app.fetch();
    setInterval(app.fetch, 3000);
    app.$chatRoom = $('#roomname');
    
    //rooms
    $('#send').on('submit', function(e){
      e.preventDefault();
      app.chatRoomsList.push(app.$chatRoom.val());
    });

    $('#messageInput').on('submit', function(e){
      e.preventDefault();
      app.send($('.messageInputText').val());
      $('.messageInputText').val("");
    })
  },

  send: function(message) {
    // Send an AJAX Post request.
    app.username = $("#username").val() || '<anonymous>';
    var msgObject = {
      'text': $('.messageInputText').val(),
      'username': app.username,
      'roomname': app.$chatRoom.val() || app.defaultChatRoom
    };

    // post a message (as an object) to the server
    $.ajax({
      url: app.server, // This is the url you should use to communicate with the parse API server.
      type: 'POST', // POST to create a new resource
      data: JSON.stringify(msgObject), // message contents passed in as an object
      contentType: 'application/json',
      success: function (data) {
        app.fetch();
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });
  },


  clearMessages: function(numToDelete) {
    // Remove all or a specified number of children from #chats.
    if (numToDelete === undefined){
      numToDelete = $('#chats').children().length;
    }
    $('#chats').children(':first').remove();
  },

  fetch: function() {
    // Send an AJAX get request.
    var dataConstraints = {};
    dataConstraints['order'] = '-createdAt';
    if (app.lastGetMsgTime) {
      dataConstraints['where'] = {
        'updatedAt': {'$gt': app.lastGetMsgTime},
        'roomname': app.$chatRoom.val() || app.defaultChatRoom
      };
    };
    //send AJAX request to get messages from the server
    //on success, add to the document message area
    $.ajax({
      url: app.server,
      type: 'GET', // GET to create a new resource
      data: dataConstraints,
      success: function (data) { 
        if (data.results.length > 0)
          app.lastGetMsgTime = data.results[0].updatedAt;
        for(var i=Math.min(data.results.length - 1,20); i>=0; i--) {
          var message = {
            username: data.results[i].username,
            text: data.results[i].text,
            roomname: data.results[i].roomname
          };
          app.addMessage(message);
        }
      }
    });
  },

  addMessage: function(message) {
    //append HTML element to chats
    var $message = $('<div class=messageOutput><div>');
    var $username = $('<a href="#"></a>').text(message.username).addClass('user');
    var $messageText = $('<span class="messageText"></span>').text(message.text);
    if (app.friendsList[message.username] === true) {
      $username.addClass('friend'); // if friend, set class to "user friend"
    }

    $username.on('click',function(event) {
      app.friendsList[this.text] = true;
      // bold username of all friends in the current chat window
      $('#chats').children().each( function(index, element) {
        var curr = $(this).find('a:first');
        if( app.friendsList[curr.text()] ) {
          curr.addClass("friend");
        }
      });
      // prevent default behavior
      return false;
    });

    $message.append($username);
    $message.append($messageText);
    $('#chats').append($message);

    if($('#chats').children().length > 20) {
      app.clearMessages(1);
    }
  },

  addRoom: function(roomName) {
    $('#roomSelect').append('<div class=roomTitle>' + roomName + '</div>');
  }
};

//initialize the app
$(function(){app.init()});

