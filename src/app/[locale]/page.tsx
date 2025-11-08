'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, TrendingUp, MessageCircle } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";
import { useQueryHook } from "@/src/hooks/useQueryHook";
import { courseService } from "@/src/services/course";
import { CourseItemType } from "@/src/types/course/course-item.types";
import { PaginationResponse } from "@/src/types/pagination/pagination.type";
import ListCourse from "@/components/shared/course/ListCourse";


export default function Home() {
  const { data: courses } = useQueryHook<PaginationResponse<CourseItemType>>(
    ['courses'],
    () => courseService.getCourses(),
  );

  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      
      <main className="container mx-auto py-20">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-primary text-sm font-medium mb-4 tracking-wide">
            {t('appName')}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('welcome')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button size="lg" className="bg-primary text-primary-foreground px-8 py-3 text-lg">
              {t('getStarted')}
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground px-8 py-3 text-lg">
              {t('learnMore')}
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="bg-card border-border text-card-foreground">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">{t('features.interactiveLearning')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground text-center">
                {t('features.interactiveLearningDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-card-foreground">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">{t('features.expertInstructors')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground text-center">
                {t('features.expertInstructorsDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-card-foreground">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-lg">{t('features.progressTracking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground text-center">
                {t('features.progressTrackingDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-card-foreground">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">{t('features.communitySupport')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground text-center">
                {t('features.communitySupportDesc')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Courses */}
        <div>
          <h2>Danh sách khoá học</h2>
          <ListCourse courses={courses?.items || []} />
        </div>
      </main>
      </div>
  );
}