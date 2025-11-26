'use client';

import { useEffect, useState, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { Course, useCourseList, useInstructorSearch, Instructor } from '@/components/shared/course/useCourse';
import { Loader2, BookOpen, User, FileText, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';


interface Exam {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
}


interface SearchHeaderDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SearchHeaderDropdown = ({ query, isOpen, onClose }: SearchHeaderDropdownProps) => {
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [exams, setExams] = useState<Exam[]>([]);
  
  useEffect(() => {
    if (debouncedQuery.length > 2 && isOpen) {
      const mockExams: Exam[] = [
        { id: '1', title: 'Kiểm tra giữa kỳ JavaScript', duration: 60, questionCount: 30 },
        { id: '2', title: 'Bài kiểm tra React Hooks', duration: 45, questionCount: 20 },
        { id: '3', title: 'Lập giá cuối kỳ TypeScript', duration: 90, questionCount: 40 }
      ];
      
      const filteredExams = mockExams
        .filter(exam => exam.title.toLowerCase().includes(debouncedQuery.toLowerCase()))
        .slice(0, 5);
      
      setExams(filteredExams);
    } else {
      setExams([]);
    }
  }, [debouncedQuery, isOpen]);

  const { data: courseResults, isLoading: isLoadingCourses } = useCourseList({
    name: debouncedQuery,
    limit: 5,
    page: 1
  }, {
    enabled: debouncedQuery.length > 2 && isOpen
  });

  const { data: instructorResults, isLoading: isLoadingInstructors } = useInstructorSearch({
    fullName: debouncedQuery,
    limit: 5,
    page: 1
  }, {
    enabled: debouncedQuery.length > 2 && isOpen
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  // Only use the results when the query is valid
  const courses = debouncedQuery.length > 2 ? (courseResults?.data || []) : [];
  const instructors = debouncedQuery.length > 2 ? (instructorResults?.data || []) : [];
  const isLoading = (debouncedQuery.length > 2) && (isLoadingCourses || isLoadingInstructors);
  const noResults = debouncedQuery.length > 2 && !isLoading && courses.length === 0 && instructors.length === 0 && exams.length === 0;
  
  const totalResults = courses.length + instructors.length + exams.length;
  
  const handleViewAllResults = () => {
    // Get current locale from URL path
    const pathSegments = window.location.pathname.split('/');
    const locale = pathSegments[1] === 'vi' || pathSegments[1] === 'en' ? pathSegments[1] : 'vi';
    
    // Navigate to search page with query
    router.push(`/${locale}/search?search=${encodeURIComponent(debouncedQuery.trim())}`);
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {debouncedQuery.length <= 2 && (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          Nhập ít nhất 3 ký tự để tìm kiếm
        </div>
      )}

      {isLoading && debouncedQuery.length > 2 && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Đang tìm kiếm...</span>
        </div>
      )}

      {noResults && (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          Không tìm thấy kết quả cho "{debouncedQuery}"
        </div>
      )}

      {courses.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
            Khóa học ({courses.length})
          </div>
          <ul>
            {courses.map((course: Course) => (
              <li key={course.id}>
                <Link 
                  href={`/course-detail/${course.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  <div className="shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-600">
                    {course.thumbnail ? (
                      <Image 
                        src={course.thumbnail} 
                        alt={course.name} 
                        width={40} 
                        height={40} 
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className='flex justify-between items-center flex-1'>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{course.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {course.creator?.fullName || 'Giảng viên'}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">{formatPrice(Number(course.saleInfo?.salePrice || course.price))}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {instructors.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
            Giảng viên ({instructors.length})
          </div>
          <ul>
            {instructors.map((instructor: Instructor) => (
              <li key={instructor.id}>
                <Link 
                  href={`/instructors/${instructor.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                    {instructor.avatar ? (
                      <Image 
                        src={instructor.avatar} 
                        alt={instructor.fullName} 
                        width={40} 
                        height={40} 
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{instructor.fullName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Giảng viên • {instructor.courses || 0} khóa học
                    </p>
                    {instructor.specialties && instructor.specialties.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {instructor.specialties.slice(0, 2).map((specialty, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          >
                            {specialty}
                          </span>
                        ))}
                        {instructor.specialties.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{instructor.specialties.length - 2}</span>
                        )}
                      </div>
                    )}
                    {instructor.rating !== undefined && (
                      <div className="mt-1 flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(Math.floor(instructor.rating))].map((_, i) => (
                            <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                          {instructor.rating % 1 > 0 && (
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
                            </svg>
                          )}
                        </div>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{instructor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {exams.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
            Bài kiểm tra ({exams.length})
          </div>
          <ul>
            {exams.map((exam) => (
              <li key={exam.id}>
                <Link 
                  href={`/exams/${exam.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  <div className="shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-600">
                    <div className="flex items-center justify-center h-full w-full">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{exam.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {exam.duration} phút • {exam.questionCount} câu hỏi
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* View all results button */}
      {totalResults > 0 && debouncedQuery.length > 2 && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewAllResults}
            className="flex items-center justify-center w-full gap-2 py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Xem tất cả kết quả ({totalResults})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchHeaderDropdown;
