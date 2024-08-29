import { useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 } from "uuid";

const ENDPOINT = "http://localhost:3000";
let socket;

function App() {
  const [userInput, setUserInput] = useState("");
  const [user, setUser] = useState({
    username: "",
    userId: "",
    roomId: "",
    socketId: "",
  });
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState("");
  const [chat, setChat] = useState([]);

  function joinRoom() {
    setUser({ ...user, username: userInput, userId: v4() });
  }

  function selectRoom(u) {
    console.log(u);
    setRoom(u);
  }

  function sendMessage() {
    socket.emit("send-chat-message", {
      sender: user,
      receiver: room,
      message: input,
    });
    setInput("");
  }

  useEffect(() => {
    if (user.username) {
      socket = io(ENDPOINT, { query: { ...user } });

      socket.on("user-connected", (data) => {
        console.log(data);
        setUsers(data);
      });

      socket.on("user-disconnected", (data) => {
        console.log(data);
        setUsers(data);
      });

      socket.on("chat-message", (data) => {
        // console.log(data);
        setChat((prevChat) => [...prevChat, { ...data }]);
        console.log(chat);
      });
    }

    return () => {
      socket?.off("chat-message");
    };
  }, [user]);

  if (!user.username) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 bg-gray-200 pb-16 pt-4">
          <div className="text-2xl">Register</div>
          <input
            className="text-xl shadow-md rounded-md border p-1"
            type="text"
            placeholder="Enter your awesome username"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button
            onClick={joinRoom}
            className="bg-green-600 text-xl text-white rounded-lg shadow-md p-2"
          >
            Join
          </button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="flex flex-col gap-2 bg-blue-50 shadow-md pt-4 pb-16">
          <div className="text-2xl text-center">
            Welcome to the Chat {user.username}
          </div>
          <div className="flex gap-2 p-2">
            <div className="bg-blue-200 shadow-md rounded-md w-1/4">
              <div className="text-xl text-center py-1">Friends</div>
              {users.map((u, index) => {
                if (u.userId != user.userId) {
                  return (
                    <div
                      onClick={() => selectRoom(u)}
                      key={index}
                      className="mx-1 p-1 rounded-md cursor-pointer text-lg hover:bg-blue-300"
                    >
                      {u?.username}
                    </div>
                  );
                }
              })}
            </div>
            <div className="flex flex-col gap-2 w-3/4">
              <div className="bg-blue-200 h-[350px] rounded-md">
                <div className="text-xl text-center mx-2 p-2 border-b-2">
                  You're chatting with {room.username}
                </div>
                {chat.map((message, index) => {
                  if (
                    message.sender.userId == room.userId ||
                    message.receiver.userId == room.userId
                  ) {
                    return (
                      <div
                        key={index}
                        className="border-black border p-2 m-2 rounded-md bg-white"
                      >
                        {message.sender.username}: {message.message}
                      </div>
                    );
                  }
                })}
              </div>
              <div className="flex gap-2">
                <input
                  className="text-xl shadow-md rounded-md"
                  type="text"
                  placeholder="Enter message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  onClick={sendMessage}
                  className="bg-green-600 text-lg rounded-lg text-white shadow-md p-2"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default App;
