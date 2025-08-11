import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { getHomeworks, getCourses, getExams } from '../services/index';
import { useAuth } from '../hooks/useAuth';

interface DataContextType {
  homeworks: any[];
  courses: any[];
  exams: any[];
  loading: boolean;
  lastFetch: Date | null;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateLocalHomework: (homeworkId: number, updates: any) => void;
  updateLocalCourse: (courseId: number, updates: any) => void;
  updateLocalExam: (examId: number, updates: any) => void;
  addLocalHomework: (homework: any) => void;
  addLocalCourse: (course: any) => void;
  addLocalExam: (exam: any) => void;
  removeLocalHomework: (homeworkId: number) => void;
  removeLocalCourse: (courseId: number) => void;
  removeLocalExam: (examId: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = async () => {
    if (!token) return;
    
    // Check if data was fetched in the last 30 seconds
    if (lastFetch && Date.now() - lastFetch.getTime() < 30000) {
      return;
    }

    setLoading(true);
    try {
      const [homeworksData, coursesData, examsData] = await Promise.all([
        getHomeworks(),
        getCourses(),
        getExams()
      ]);
      setHomeworks(homeworksData);
      setCourses(coursesData);
      setExams(examsData);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setLastFetch(null); // Reset last fetch to force refresh
    await fetchData();
  };

  // Local update functions to avoid refetching
  const updateLocalHomework = (homeworkId: number, updates: any) => {
    setHomeworks(prev => prev.map(hw => 
      hw.id === homeworkId ? { ...hw, ...updates } : hw
    ));
  };

  const updateLocalCourse = (courseId: number, updates: any) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, ...updates } : course
    ));
  };

  const updateLocalExam = (examId: number, updates: any) => {
    setExams(prev => prev.map(exam => 
      exam.id === examId ? { ...exam, ...updates } : exam
    ));
  };

  const addLocalHomework = (homework: any) => {
    setHomeworks(prev => [...prev, homework]);
  };

  const addLocalCourse = (course: any) => {
    setCourses(prev => [...prev, course]);
  };

  const addLocalExam = (exam: any) => {
    setExams(prev => [...prev, exam]);
  };

  const removeLocalHomework = (homeworkId: number) => {
    setHomeworks(prev => prev.filter(hw => hw.id !== homeworkId));
  };

  const removeLocalCourse = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const removeLocalExam = (examId: number) => {
    setExams(prev => prev.filter(exam => exam.id !== examId));
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const value: DataContextType = useMemo(() => ({
    homeworks,
    courses,
    exams,
    loading,
    lastFetch,
    fetchData,
    refreshData,
    updateLocalHomework,
    updateLocalCourse,
    updateLocalExam,
    addLocalHomework,
    addLocalCourse,
    addLocalExam,
    removeLocalHomework,
    removeLocalCourse,
    removeLocalExam,
  }), [
    homeworks,
    courses,
    exams,
    loading,
    lastFetch,
    fetchData,
    refreshData,
    updateLocalHomework,
    updateLocalCourse,
    updateLocalExam,
    addLocalHomework,
    addLocalCourse,
    addLocalExam,
    removeLocalHomework,
    removeLocalCourse,
    removeLocalExam,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
