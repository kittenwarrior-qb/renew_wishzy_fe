import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CourseItemType } from '@/src/types/course/course-item.types';

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
  courses: CourseItemType[];
  selectedCourse: CourseItemType | null;
  enrolledCourses: CourseItemType[];
  
  // UI state
  isLoading: boolean;
  theme: 'light' | 'dark';

  // cart state
  cart: CourseItemType[];
  orderListCourse: CourseItemType[];
  
  // wishlist state
  wishlist: CourseItemType[];
  
  // Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setCourses: (courses: CourseItemType[]) => void;
  selectCourse: (course: CourseItemType) => void;
  enrollInCourse: (course: CourseItemType) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  addToCart: (course: CourseItemType) => void;
  removeFromCart: (course: CourseItemType) => void;
  removeCart: () => void;
  addToOrderList: (course: CourseItemType) => void;
  removeFromOrderList: (course: CourseItemType) => void;
  clearOrderList: () => void;
  setOrderList: (courses: CourseItemType[]) => void;
  addToWishlist: (course: CourseItemType) => void;
  removeFromWishlist: (course: CourseItemType) => void;
  setWishlist: (courses: CourseItemType[]) => void;
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
        cart: [],
        orderListCourse: [],
        wishlist: [],

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
          const isAlreadyEnrolled = enrolledCourses.some(c => String(c.id) === String(course.id));
          
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

        addToCart: (course) => {
          const { cart } = get();
          const isAlreadyInCart = cart.some(c => c.id === course.id);
          
          if (!isAlreadyInCart) {
            set({ 
              cart: [...cart, course] 
            });
          }
        },

        removeFromCart: (course) => {
          const { cart } = get();
          const updatedCart = cart.filter(c => c.id !== course.id);
          set({ cart: updatedCart });
        },

        removeCart: () => set({ cart: [] }),

        addToOrderList: (course) => {
          const { orderListCourse } = get();
          const isAlreadyInOrder = orderListCourse.some(c => c.id === course.id);
          
          if (!isAlreadyInOrder) {
            set({ 
              orderListCourse: [...orderListCourse, course] 
            });
          }
        },

        removeFromOrderList: (course) => {
          const { orderListCourse } = get();
          const updatedOrderList = orderListCourse.filter(c => c.id !== course.id);
          set({ orderListCourse: updatedOrderList });
        },

        clearOrderList: () => set({ orderListCourse: [] }),

        setOrderList: (courses) => set({ orderListCourse: courses }),

        addToWishlist: (course) => {
          const { wishlist } = get();
          const isAlreadyInWishlist = wishlist.some(c => c.id === course.id);
          
          if (!isAlreadyInWishlist) {
            set({ 
              wishlist: [...wishlist, course] 
            });
          }
        },

        removeFromWishlist: (course) => {
          const { wishlist } = get();
          const updatedWishlist = wishlist.filter(c => c.id !== course.id);
          set({ wishlist: updatedWishlist });
        },

        setWishlist: (courses) => set({ wishlist: courses }),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          enrolledCourses: state.enrolledCourses,
          theme: state.theme,
          cart: state.cart,
          orderListCourse: state.orderListCourse,
          wishlist: state.wishlist,
        }),
      }
    ),
    {
      name: 'wishzy-store',
    }
  )
);
