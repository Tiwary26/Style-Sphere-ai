import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Establish Socket.io connection to backend
    // Since vite dev server proxies /socket.io, we connect to root path
    const socketConnection = io(window.location.origin, {
      transports: ['websocket'],
    });

    socketConnection.on('connect', () => {
      console.log('Connected to socket gateway');
      // Register current user on socket
      socketConnection.emit('register', user.id);
    });

    // Listen for laundry updates
    socketConnection.on('laundry_update', (data) => {
      toast.info(`👕 Laundry Update: "${data.name}" status is now ${data.status}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    });

    // Listen for general notifications
    socketConnection.on('notification', (data) => {
      toast.success(`🔔 ${data.title}: ${data.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
