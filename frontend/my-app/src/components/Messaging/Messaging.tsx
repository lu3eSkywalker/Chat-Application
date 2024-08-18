import { userInfo } from 'os';
import React, { useEffect, useState, useMemo, useRef, ChangeEvent } from 'react';
import { io } from "socket.io-client";

interface FriendsName {
  name: string;
  profilePicture: string;
  id: number;
}

interface Message {
  chatId: string;
  senderId: number;
  content: string;
  imageUrl: string;
  id: number;
}

const Messaging = () => {
  const user_Id = localStorage.getItem("userId") ?? '';
  const userId = parseInt(user_Id);

  const [chatContent, setChatContent] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string>('');
  const [friendsName, setFriendsName] = useState<FriendsName[]>([]);
  const [chatMessage, setChatMessage] = useState({ message: "" });
  const [selectedFriend, setSelectedFriend] = useState<FriendsName | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<Map<number, string>>(new Map());
  const [activeTab, setActiveTab] = useState('All'); // State to keep track of the active tab

  const [unreadMessagesFriendsName, setUnreadMessagesFriendsName] = useState<FriendsName[]>([]);

  const [istypingtest, setIsTypingTest] = useState(false);

  const [typing, setTyping] = useState<Map<number, boolean>>(new Map());
  const [isTyping, setIsTyping] = useState(false);

  const socket = useMemo(() => io("http://localhost:5000"), []);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
      socket.emit("user-online", userId); // Notify server that this user is online
    });

    socket.on("message", (data: Message) => {
      setChatContent((prevMessages) => [...prevMessages, data]);
      console.log("By UserId: ", data.senderId, "Messages: ", data.content);
    });

    socket.on("online-status", (data: { userId: number; status: string }) => {
      setOnlineStatus((prevStatus) => {
        const newStatus = new Map(prevStatus);
        newStatus.set(data.userId, data.status);
        return newStatus;
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);


  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", chatId);

      setIsTypingTest(true);
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChatMessage((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
    handleTyping();
  };

  const getChatId = async (friend: FriendsName) => {
    try {
      setChatContent([]);
      const savedUserResponse = await fetch(
        `http://localhost:5000/api/v1/fetchchatidbyuserids/${userId}/${friend.id}`,
        { method: "GET" }
      );
      const response = await savedUserResponse.json();
      const id = response.data.id;
      console.log("This is the id that you are looking for: ", id);
      setChatId(id);
      setSelectedFriend(friend);  // Update selected friend
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const getFriendId = async () => {
    try {
      const savedUserResponse = await fetch(
        'http://localhost:5000/api/v1/getallusers',
        { method: 'GET' }
      );
      const response = await savedUserResponse.json();
      const userArray = response.data;

      const flattenedArray = userArray.flat();
      const filteredArray = flattenedArray.filter((user: FriendsName) => user.id !== userId);

      setFriendsName(filteredArray);
      console.log('Filtered Friends:', filteredArray);
    } catch (error) {
      console.log('Error: ', error);
    }
  };


  const getConversation = async (chatId: string) => {
    try {
      const chatUrl = await fetch(
        `http://localhost:5000/api/v1/getmessagebychatid/${chatId}`,
        { method: "GET" }
      );
      const postChatUrl = await chatUrl.json();
      setChatContent(postChatUrl.data);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      // Fetch unread message chat IDs
      const chatResponse = await fetch(
        `http://localhost:5000/api/v1/fetchunreadmessagechatid`,
        { method: "GET" }
      );
      const chatData = await chatResponse.json();
  
      // Map over the user IDs and fetch user info
      const userPromises: Promise<FriendsName | null>[] = chatData.data2.map(async (userId: any) => {
        try {
          const userResponse = await fetch(
            `http://localhost:5000/api/v1/getuserinfo/${userId.senderId}`,
            { method: 'GET' }
          );
          const userData = await userResponse.json();
          return userData.data as FriendsName; // Type assertion here
        } catch (error) {
          console.error(`Error fetching user info for ${userId.senderId}:`, error);
          return null; // Return null or handle as needed
        }
      });
  
      // Wait for all user info fetches to complete
      const userInfos: FriendsName[] = (await Promise.all(userPromises)).filter(
        (info): info is FriendsName => info !== null
      );

      console.log(userInfos)
  
      // Set the state with the fetched user info
      setUnreadMessagesFriendsName(userInfos);
  
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  const sendMessage = async (chatId: string) => {
    const messageContent = {
      chatId: parseInt(chatId),
      senderId: userId,
      content: chatMessage.message,
    };

    console.log(messageContent)
    
    try {
      socket.emit("message", messageContent);
      setChatMessage({ message: "" });
    } catch (error) {
      console.log("Error: ", error);
    }
  };


  const fileInputRef = useRef<HTMLInputElement>(null);
    const sendPhoto = async (event: ChangeEvent<HTMLInputElement>, chatId: any): Promise<void> => {
      event.preventDefault();
      const files = event.target.files;
      if(!files) return;

      const file = files[0];

      const user_Id = localStorage.getItem('userId');

      const imageData = new FormData();

      imageData.append('image', file);
      imageData.append('chatIds', chatId);
      imageData.append('senderIds', user_Id?.toString() || '');

      console.log(imageData);

      try {
        const savedResponse = await fetch(`http://localhost:5000/messages`, {
          method: "POST",
          body: imageData
        })

        const res = await savedResponse.json();
        console.log(res);
      }
      catch(error) {
        console.log("Error: ", error)
      }
    }

    const handleButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

  useEffect(() => {
    getFriendId();
  }, []);

  useEffect(() => {
    if (chatId) {
      getConversation(chatId);
    }
  }, [chatId]);

  const typingStatus = typing.get(parseInt(chatId));



  return (
    <div>
      <div className="flex h-[955px]">

<div className="w-2/5 bg-gray-100 border-r border-gray-300">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-300">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Thin line and buttons */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-white">
        <div className="flex items-center space-x-2">
          <button
            className={`text-sm font-medium ${activeTab === 'All' ? 'bg-red-500 text-white' : 'text-gray-700 hover:text-gray-900'} px-4 py-2 rounded-md`}
            onClick={() => setActiveTab('All')}
          >
            All
          </button>

          <button
            className={`text-sm font-medium ${activeTab === 'Unread' ? 'bg-red-500 text-white' : 'text-gray-700 hover:text-gray-900'} px-4 py-2 rounded-md`}
            onClick={() => {
              fetchUnreadMessages();
              setActiveTab('Unread');
            }}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-80px)]">
        {(activeTab === 'All' ? friendsName : unreadMessagesFriendsName).map((friend, index) => (
          <div 
            key={index} 
            className="p-7 flex items-center hover:bg-gray-200 cursor-pointer border border-gray-300 rounded-md"
            onClick={() => getChatId(friend)}
          >
            <img
              src={friend.profilePicture}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-4">
              <button className="font-semibold text-xl">
                {friend.name}
                <span className={`ml-2 ${onlineStatus.get(friend.id) === "online" ? "text-green-500" : "text-gray-500"}`}>
                  {onlineStatus.get(friend.id) === "online" ? "Online" : "Offline"}
                </span>
              </button>
              <p className="text-sm text-gray-500">Last message preview...</p>
            </div>
          </div>
        ))}
      </div>
    </div>


        <div className="w-3/5">
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <h1 className="text-2xl font-bold">

              {selectedFriend ? selectedFriend.name : "Select a Chat"}
            </h1>
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100%-136px)]">

      {chatContent.length > 0 && chatContent.map((message, index) => (
        <div key={index} className={`mb-4 ${message.senderId === userId ? "text-right" : "text-left"}`}>
          <div className={`inline-block p-4 rounded-lg ${message.senderId === userId ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            {message.content && <p>{message.content}</p>}
            {message.imageUrl && <img src={message.imageUrl} alt="Sent Image" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />}
          </div>
        </div>
          ))}


            {/* {istypingtest ? (<div>Typing the shit</div>) : (<div></div>)} */}
          </div>


<div className="p-4 border-t border-gray-300">
  <div className="flex items-center">
    <input
      type="text"
      name="message"
      placeholder="Type your message"
      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      onChange={changeHandler}
      value={chatMessage.message}
    />

    <button
      onClick={() => sendMessage(chatId)}
      className="bg-red-400 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-2"
    >
      <img 
        src="https://cdn-icons-png.flaticon.com/512/149/149446.png"
        alt="Send"
        className="w-4 h-4" 
      />
    </button>

    <input
      type="file"
      ref={fileInputRef}
      style={{ display: 'none' }}
      onChange={(event) => sendPhoto(event, chatId)}
    />

    <button
      className="bg-red-400 hover:bg-blue-400 text-white px-4 py-2 rounded-md ml-2"
      onClick={handleButtonClick}
    >
            <img 
        src="https://cdn-icons-png.flaticon.com/512/103/103460.png" 
        alt="Send"
        className="w-4 h-4" 
      />
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default Messaging;