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
  allSemesters: string[];
  addSemester: (semester: string) => void;
  removeSemester: (semester: string) => void;
  updateSemester: (oldSemester: string, newSemester: string) => void;
  setLatestSemester: (availableSemesters: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedSemester, setSelectedSemester] = useState<string>(() => {
    return localStorage.getItem('selectedSemester') || '';
  });
  const [allSemesters, setAllSemesters] = useState<string[]>(() => {
    const savedSemesters = localStorage.getItem('allSemesters');
    return savedSemesters ? JSON.parse(savedSemesters) : [];
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

  const addSemester = (semester: string) => {
    if (!allSemesters.includes(semester)) {
      const updatedSemesters = [...allSemesters, semester];
      setAllSemesters(updatedSemesters);
      localStorage.setItem('allSemesters', JSON.stringify(updatedSemesters));
    }
  };

  const removeSemester = (semester: string) => {
    const updatedSemesters = allSemesters.filter(s => s !== semester);
    setAllSemesters(updatedSemesters);
    localStorage.setItem('allSemesters', JSON.stringify(updatedSemesters));
    
    // If the removed semester was selected, set to latest available
    if (selectedSemester === semester && updatedSemesters.length > 0) {
      const sortedSemesters = [...updatedSemesters].sort((a, b) => {
        const yearA = /\d{4}/.exec(a)?.[0] || '0';
        const yearB = /\d{4}/.exec(b)?.[0] || '0';
        
        if (yearA !== yearB) {
          return parseInt(yearB) - parseInt(yearA);
        }
        
        const seasonOrder = { 'Spring': 4, 'Summer': 3, 'Fall': 2, 'Autumn': 2, 'Winter': 1 };
        const seasonA = seasonOrder[a.split(' ')[0] as keyof typeof seasonOrder] || 0;
        const seasonB = seasonOrder[b.split(' ')[0] as keyof typeof seasonOrder] || 0;
        
        return seasonB - seasonA;
      });
      
      updateSelectedSemester(sortedSemesters[0]);
    }
  };

  const updateSemester = (oldSemester: string, newSemester: string) => {
    if (oldSemester === newSemester) return;
    
    const updatedSemesters = allSemesters.map(s => s === oldSemester ? newSemester : s);
    setAllSemesters(updatedSemesters);
    localStorage.setItem('allSemesters', JSON.stringify(updatedSemesters));
    
    // If the updated semester was selected, update the selection
    if (selectedSemester === oldSemester) {
      updateSelectedSemester(newSemester);
    }
  };

  const setLatestSemester = (availableSemesters: string[]) => {
    // If no semester is selected or the selected semester doesn't exist in available data
    if (!selectedSemester || !availableSemesters.includes(selectedSemester)) {
      if (availableSemesters.length > 0) {
        // Sort semesters to find the latest one (assuming format like "Fall 2024", "Spring 2025")
        const sortedSemesters = [...availableSemesters].sort((a, b) => {
          // Extract year from semester name (e.g., "Fall 2024" -> "2024")
          const yearA = /\d{4}/.exec(a)?.[0] || '0';
          const yearB = /\d{4}/.exec(b)?.[0] || '0';
          
          if (yearA !== yearB) {
            return parseInt(yearB) - parseInt(yearA); // Descending order (latest first)
          }
          
          // If same year, sort by season (Spring > Fall > Summer > Winter)
          const seasonOrder = { 'Spring': 4, 'Summer': 3, 'Fall': 2, 'Autumn': 2, 'Winter': 1 };
          const seasonA = seasonOrder[a.split(' ')[0] as keyof typeof seasonOrder] || 0;
          const seasonB = seasonOrder[b.split(' ')[0] as keyof typeof seasonOrder] || 0;
          
          return seasonB - seasonA;
        });
        
        const latestSemester = sortedSemesters[0];
        updateSelectedSemester(latestSemester);
      }
    }
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
      allSemesters,
      addSemester,
      removeSemester,
      updateSemester,
      setLatestSemester,
    }), [token, user, selectedSemester, allSemesters])}>
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
