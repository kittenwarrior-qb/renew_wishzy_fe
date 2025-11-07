import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../stores/useAppStore';

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

// Mock API functions - replace with actual API calls
const fetchCourses = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.",
      instructor: "John Smith",
      duration: "8 weeks",
      students: 1250,
      rating: 4.8,
      image: "/course-1.jpg",
      price: "$99"
    },
    {
      id: 2,
      title: "React.js Masterclass",
      description: "Master React.js from basics to advanced concepts including hooks, context, and state management.",
      instructor: "Sarah Johnson",
      duration: "12 weeks",
      students: 890,
      rating: 4.9,
      image: "/course-2.jpg",
      price: "$149"
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      description: "Build scalable backend applications with Node.js, Express, and MongoDB.",
      instructor: "Mike Chen",
      duration: "10 weeks",
      students: 675,
      rating: 4.7,
      image: "/course-3.jpg",
      price: "$129"
    },
    {
      id: 4,
      title: "UI/UX Design Fundamentals",
      description: "Learn design principles, user research, and create beautiful user interfaces.",
      instructor: "Emily Davis",
      duration: "6 weeks",
      students: 1100,
      rating: 4.8,
      image: "/course-4.jpg",
      price: "$89"
    }
  ];
};

const enrollInCourse = async (courseId: number) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, courseId };
};

// Custom hooks
export const useCourses = () => {
  const setCourses = useAppStore(state => state.setCourses);
  
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    onSuccess: (data) => {
      setCourses(data);
    },
  });
};

export const useEnrollMutation = () => {
  const queryClient = useQueryClient();
  const enrollInCourseStore = useAppStore(state => state.enrollInCourse);
  
  return useMutation({
    mutationFn: enrollInCourse,
    onSuccess: (data) => {
      // Update the courses query cache
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      // Update Zustand store
      const courses = queryClient.getQueryData(['courses']) as Course[];
      const course = courses?.find(c => c.id === data.courseId);
      if (course) {
        enrollInCourseStore(course);
      }
    },
  });
};
