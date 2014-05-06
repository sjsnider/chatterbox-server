var app = {

  selectedRoom: $(":selected").val(),
  friends: [],
  url: "http://127.0.0.1:3000/classes/messages",
  postMessage: function() {
    var chatPost = {
      username: window.location.search.slice( 10 ),
      text: $("#message").val(),
      roomname: ""
    };

    if(app.selectedRoom !== "All chats") {
      chatPost.roomname = app.selectedRoom;
    }

    $.ajax({
      // always use this url
      url: app.url,
      type: "POST",
      data: JSON.stringify(chatPost),
      contentType: "application/json",
      success: function (data) {
      },
      error: function (data) {
        console.error("chatterbox: Failed to send message");
        console.log(data);
      }
    });
  },
  writeChats: function( data ) {
    $(".list-group").empty();
    var messages = data.results;
    _.each( messages, function( message ) {
      var lastLi = $("<li></li>").appendTo(".list-group").addClass("list-group-item");
      $("<span></span>").appendTo(lastLi).text(message.username).addClass("username");
      $("<span></span>").appendTo(lastLi).text(message.text).addClass("message");
      if ( _.contains(app.friends, message.username) ) {
        lastLi.addClass("list-group-item-info");
      }
    });
  },
  getMessages: function() {
    var dataParams = {
      order:"-createdAt",
      limit:20
    };
    if(app.selectedRoom !== "All chats") {
      dataParams["where"] = {roomname: app.selectedRoom};
    }
    $.ajax( {
      // always use this url
      url: app.url,
      type: "GET",
      //data: dataParams,
      contentType: "application/json",
      success: function (data) {
        app.writeChats(data);
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error("chatterbox: Failed to send message");
      }
    });
  },
  buildRooms: function( data ) {
    var messages = data.results;
    var roomNames = [];
    _.each( messages, function( message ) {
      if ( message.roomname && message.roomname !== "" ) {
        roomNames.push( message.roomname );
      }
    });
    roomNames = _.uniq( roomNames );
    $("#rooms").empty();
    $("<option></option>").appendTo("#rooms").text( "--- Select Room ---" ).val( "All chats" );
    $("<option></option>").appendTo("#rooms").text( "All chats" ).val( "All chats" );
    _.each(roomNames, function( roomName ) {
      $("<option></option>").appendTo("#rooms").text( roomName ).val( roomName );
    });
  },
  getRooms: function() {
    $.ajax( {
      // always use this url
      url: app.url,
      type: "GET",
      //data: {order:"-createdAt", limit:300},
      contentType: "application/json",
      success: function (data) {
        app.buildRooms(data);
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error("chatterbox: Failed to send message");
      }
    });
  },
  init: function() {
    $( function() {

      $("#send").on("click", function() {
        app.postMessage();
        $("#message").val("");
      });

      $("#newRoom").on("click", function() {
        var newRoom = prompt("New room name:");
        app.selectedRoom = newRoom;
        $("<option></option>").appendTo("#rooms").text( newRoom ).val( newRoom );
        $("#currentRoom").text( newRoom );
      });

      $("#rooms").on("change", function() {
        app.selectedRoom = $(":selected").val();
        if ( app.selectedRoom !== "All chats" ) {
          $("#currentRoom").text( app.selectedRoom );
        } else {
          $("#currentRoom").text( "" );
        }
        app.getRooms();
        app.getMessages();
      });

      $(".container").on("click", "span.username", function() {
        var clickedFriend = $(this).text();
        var index = _.indexOf(app.friends, clickedFriend);

        if ( index === -1 ) {
          app.friends.push( $(this).text() );
        } else {
          app.friends.splice( index, 1 );
        }
      });

    });
    app.getMessages();
    app.getRooms();
    setInterval( app.getMessages, 1000 );
  }
};

app.init();
