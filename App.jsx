import React, { useEffect, useRef, useState } from 'react'
import { ZIM, zim } from 'zego-zim-web';

function App() {



  const [ziminstance, setZiminstance] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState('Kanav')

  const appID = 794030728;
  const tokenA = "04AAAAAGi1QHAADMdNW5BrmXalpw4ZSACvCQWwj3ppGrPdJ7QBH8bYj0qSvhAWUJsQWTRVvcdJQZazuvzLqGm34JY/pWCx3sepCiLYSHUa6weSIF4JWLY9/bvEXQ9v1w+n8urC8Te2Ir4TiF5LMfmyeQNYurSr8PZWTGa7al9SeWWD8JHtz4uozch/ajcS7g4XB0IR1Plo2mz16DdjGKE+vhIQrhiDJ8+ORRJ8pZh1FIV8kL5UzhbwMjdKfCPVyabsissHHO3+oQE=";
  const tokenB = "04AAAAAGi1QKgADHGmQaKnxcyFyktfkwCufNnZhD/XrLtbTsOYicga6507UF10K4pQyhzLRlMqgQsh7t63Ht3W8q7+iw7xYp7ITSLgrd5IXNm/PYEMe1dkqfV0B1Uv2O5x4IjZdReEReTk8p2b9gzmsYq0GwKnRT5YLWD8lzPY9f0nBF68/D4XDR2jE3ge0OcdoIVJxPWTmpmJR2ADT4fmZ5cSrtO7QrF+9DFKJD4gd5PSC7MN0pju8ZNmAKBJ9vGp3/rzEKT/AQ==";

  const messagesEndRef = useRef(null);
  useEffect(() => {
    const instance = ZIM.create({ appID });
    setZiminstance(instance);
    instance.on('error', (zim, errorInfo) => {
      console.log('Error:', errorInfo.code, errorInfo.message);
    });

    instance.on('connectionStatechanged', (zim, { state, event }) => {
      console.log('connection State:', state, event);
    });

    instance.on('peerMessageReceived', (zim, { messageList }) => {
      setMessages(prevMessages => [...prevMessages, ...messageList]);
    });

    instance.on('tokenWillExpire', (zim, { second }) => {
      console.log('Token expiring in:', second);

      zim.renewToken(selectedUser == 'Kanav' ? tokenA : tokenB)
        .then(() => console.log('token renewed'))
        .catch(err => console.log('Token Renewed Failed', err))
    });

    return () => {
      instance.destroy();
    }

  }, {});


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current, scrollIntoView({ behaviour: 'smooth' });
    }
  }, { messages });


  const handleLogin = () => {
    const info = { userID: selectedUser, userName: selectedUser === 'Kanav' ? 'client A' : 'client B' };
    setUserInfo(info);
    const loginToken = selectedUser === "Kanav" ? tokenA : tokenB;
    if (ziminstance) {
      ziminstance.login(info, loginToken)
        .then(() => {
          setIsLoggedIn(true);
          console.log(`${info.userName} Login Successful`);

        })

        .catch(err => {
          console.log('Login Failed', err);

        })

    } else {
      console.warn("zim instance not ready yet")

    }
  }

  const handleSendMessage = () => {
    if (!isLoggedIn) {
      console.log('User is not LoggedIn');
      return;
    }

    const toconversationID = selectedUser === 'Kanav' ? 'Anuj' : "Kanav";

    const conversationType = 0;

    const messageTextObj = {
      type: 1,
      message: messageText,
      extendedData: ''
    };

    const config = { priority: 1 };
    if (!ziminstance) return;
    ziminstance.sendMessage(messageTextObj, toconversationID, conversationType, config)
      .then(({ message }) => {
        setMessages(prevMessages => [...prevMessages, message])
      })
      .catch(err => {
        console.log('Message Failed', err);

      });

    setMessageText('');


  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    })
  };
  return (<div className='bg-orange-200 h-full w-full'>
    <div className='chat-app' style={{ padding: '20px', fontFamily: 'fantasy', height: 'screen', width: 'screen' }} >
      <h1 className='text-7xl , font-medium , font-stretch-150% ml-120'> The <br />Guftgu <br /> Chatting APP</h1>
      {!isLoggedIn ? (
        <div>
          <h1 className='ml-120 , font-medium ,mt-6'>Select User</h1>
          <div className='ml-120 , mt-7'>
            <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
              <option value="Kanav">Kanav</option>
              <option value="Anuj">Anuj</option>
            </select>
          </div>
          <button onClick={handleLogin} style={{ marginLeft: '700px', padding: '10px 20px', borderRadius: '10px', border: '2px solid black', marginTop: '1px' }}>LOG IN</button>
        </div>
      ) : (
        <div>
          <h2>
            Chatting as {userInfo.userName} with {selectedUser === "Kanav" ? 'Client B' : 'Client A'}
          </h2>
          <div className='messages' style={{ marginTop: '20px', maxHeight: '400px', overflow: 'auto', border: '1px solid #CCC', padding: '10px', background: 'skyblue', borderRadius: '8px' }}>
            {messages.map((msg, i) => {
              const isOwnMessage = msg.senderUserID === userInfo.userID;
              return (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginBottom: '10px',
                }}>
                  <div style={{
                    background: isOwnMessage ? '#dcf8c6' : '#fff',
                    color: 'black',
                    padding: '10px 14px',
                    borderRadius: '15px',
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',

                  }}>

                    {msg.message}
                    <div style={{
                      fontSize: '10px',
                      color: '#555',
                      textAlign: 'right',
                      marginTop: '4px'
                    }}>
                      {formatTime(msg.timestamp)}

                    </div>

                  </div>

                </div>
              );
            })}
            <div ref={messagesEndRef}></div>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
              <input type="text" placeholder='type a message...' valur={messageText} onChange={(e) => setMessageText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '16px',
                  borderRadius: '30px',
                  width: '100px',
                  border: '4px solid #CCC',
                  background: '#fff',
                  marginRight: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'

                }} />
              <button onClick={handleSendMessage} style={{
                padding: '10px 10px',
                fontSize: '16px',
                borderRadius: '30px',
                backgroundColor: '#25D366',
                color: '#fff',
                border: '1px solid black',
                width: '150px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'pointer'
              }}>Send</button>

            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  )
}

export default App