'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Star, Loader2 } from "lucide-react";
import { useCourses, useEnrollMutation } from "@/hooks/useCourses";
import { useTranslations } from "@/providers/TranslationProvider";

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

export default function CoursesPage() {
  const t = useTranslations();
  const { data: courses, isLoading, error } = useCourses();
  const enrollMutation = useEnrollMutation();

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{t('courses.loadingCourses')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('courses.errorLoading')}</h2>
            <p className="text-muted-foreground">{t('courses.tryAgainLater')}</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Explore Our Courses
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover a wide range of high-quality courses designed to help you advance your skills and career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="">
              Browse All Courses
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-white">
              Filter Courses
            </Button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(courses as Course[] || []).map((course: Course) => (
            <Card key={course.id} className="bg-card border-border text-card-foreground">
              <CardHeader>
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-500" />
                </div>
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>By {course.instructor}</span>
                    <span className="text-sm text-muted-foreground">{course.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-primary text-primary-foreground"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
