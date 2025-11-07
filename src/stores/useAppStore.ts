import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  image: string;
  price: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  dob?: string | null;
  gender?: string | null;
  verified: boolean;
  isEmailVerified?: boolean;
  address?: string | null;
  avatar?: string | null;
  age?: number | null;
  phone?: string | null;
  loginType: string;
  role: string;
  isInstructorActive: boolean;
  passwordModified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Course state
  courses: Course[];
  selectedCourse: Course | null;
  enrolledCourses: Course[];
  
  // UI state
  isLoading: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setCourses: (courses: Course[]) => void;
  selectCourse: (course: Course) => void;
  enrollInCourse: (course: Course) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        courses: [],
        selectedCourse: null,
        enrolledCourses: [],
        isLoading: false,
        theme: 'light',

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        
        login: (user) => set({ 
          user, 
          isAuthenticated: true 
        }),
        
        logout: () => set({ 
          user: null, 
          isAuthenticated: false,
          enrolledCourses: []
        }),
        
        setCourses: (courses) => set({ courses }),
        
        selectCourse: (course) => set({ selectedCourse: course }),
        
        enrollInCourse: (course) => {
          const { enrolledCourses } = get();
          const isAlreadyEnrolled = enrolledCourses.some(c => c.id === course.id);
          
          if (!isAlreadyEnrolled) {
            set({ 
              enrolledCourses: [...enrolledCourses, course] 
            });
          }
        },
        
        setLoading: (isLoading) => set({ isLoading }),
        
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          enrolledCourses: state.enrolledCourses,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'marshallms-store',
    }
  )
);
