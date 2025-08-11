import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { getUserSemesters, addUserSemester as addSemesterAPI, updateUserSemester as updateSemesterAPI, deleteUserSemester as deleteSemesterAPI } from '../services/semester';

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
  addSemester: (semester: string) => Promise<void>;
  removeSemester: (semester: string) => Promise<void>;
  updateSemester: (oldSemester: string, newSemester: string) => Promise<void>;
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
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [semestersLoaded, setSemestersLoaded] = useState(false);

  // Load semesters from server when user is authenticated
  useEffect(() => {
    if (token && user && !semestersLoaded) {
      const loadSemesters = async () => {
        try {
          const serverSemesters = await getUserSemesters();
          setAllSemesters(serverSemesters);
          setSemestersLoaded(true);
        } catch (error) {
          console.error('Failed to load semesters:', error);
          setSemestersLoaded(true); // Mark as loaded even if failed to prevent infinite retries
        }
      };
      loadSemesters();
    }
  }, [token, user, semestersLoaded]);

  const login = (newToken: string, newUser: User) => {
    // Check if this is a different user logging in
    const currentUser = localStorage.getItem('user');
    const isNewUser = !currentUser || (currentUser && JSON.parse(currentUser).id !== newUser.id);
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // If this is a new user, reset semester state
    if (isNewUser) {
      setSelectedSemester('');
      setAllSemesters([]);
      setSemestersLoaded(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAllSemesters([]);
    setSelectedSemester('');
    setSemestersLoaded(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedSemester');
  };

  const updateSelectedSemester = (semester: string) => {
    setSelectedSemester(semester);
    localStorage.setItem('selectedSemester', semester);
  };

  const addSemester = async (semester: string) => {
    if (!allSemesters.includes(semester)) {
      try {
        await addSemesterAPI(semester);
        const updatedSemesters = [...allSemesters, semester];
        setAllSemesters(updatedSemesters);
      } catch (error) {
        console.error('Failed to add semester:', error);
        throw error;
      }
    }
  };

  const removeSemester = async (semester: string) => {
    try {
      await deleteSemesterAPI(semester);
      const updatedSemesters = allSemesters.filter(s => s !== semester);
      setAllSemesters(updatedSemesters);
      
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
    } catch (error) {
      console.error('Failed to remove semester:', error);
      throw error;
    }
  };

  const updateSemester = async (oldSemester: string, newSemester: string) => {
    if (oldSemester === newSemester) return;
    
    try {
      await updateSemesterAPI(oldSemester, newSemester);
      const updatedSemesters = allSemesters.map(s => s === oldSemester ? newSemester : s);
      setAllSemesters(updatedSemesters);
      
      // If the updated semester was selected, update the selection
      if (selectedSemester === oldSemester) {
        updateSelectedSemester(newSemester);
      }
    } catch (error) {
      console.error('Failed to update semester:', error);
      throw error;
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
