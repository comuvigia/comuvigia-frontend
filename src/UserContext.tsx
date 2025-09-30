import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface User {
  usuario: string;
  rol: number;
  nombre: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  checkingAuth: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  checkingAuth: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/auth/check`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, checkingAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
