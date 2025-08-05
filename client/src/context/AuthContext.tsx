import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  motto?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedSemester, setSelectedSemester] = useState<string>(() => {
    return localStorage.getItem('selectedSemester') || 'Fall 2024';
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateSelectedSemester = (semester: string) => {
    setSelectedSemester(semester);
    localStorage.setItem('selectedSemester', semester);
  };

  return (
    <AuthContext.Provider value={useMemo(() => ({
      token,
      user,
      loading: false, // Removed loading state
      login,
      logout,
      selectedSemester,
      setSelectedSemester: updateSelectedSemester,
    }), [token, user, selectedSemester])}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
