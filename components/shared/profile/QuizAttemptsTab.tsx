'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, Award, Eye, RotateCcw } from 'lucide-react';
import { getMyQuizAttempts, type QuizAttempt } from '@/services/quiz';
import { toast } from 'sonner';

export const QuizAttemptsTab = () => {
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const data = await getMyQuizAttempts();
      // Sort by date, newest first
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      setAttempts(sorted);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      toast.error('Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge variant="outline" className="border-green-600 text-green-600">Đã hoàn thành</Badge>;
    }
    if (status === 'in-progress') {
      return <Badge variant="default">Đang làm</Badge>;
    }
    return <Badge variant="secondary">Đã hủy</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Bạn chưa làm bài kiểm tra nào</p>
          <Button onClick={() => router.push('/quiz')}>
            Xem danh sách bài kiểm tra
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {attempts.map((attempt) => (
        <Card key={attempt.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    {attempt.quiz?.title || 'Bài kiểm tra'}
                  </h3>
                  {getStatusBadge(attempt.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(attempt.startedAt)}</span>
                  </div>
                  
                  {attempt.status === 'completed' && (
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span className={`font-semibold ${getScoreColor(attempt.percentage)}`}>
                        {Math.round(attempt.percentage)}% ({attempt.totalScore}/{attempt.maxScore} điểm)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {attempt.status === 'completed' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/quiz/${attempt.quizId}/result?attemptId=${attempt.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem kết quả
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/quiz/${attempt.quizId}`)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Làm lại
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/quiz/${attempt.quizId}`)}
                  >
                    Tiếp tục làm
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
