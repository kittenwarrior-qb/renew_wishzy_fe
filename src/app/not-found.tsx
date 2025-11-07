import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotFoundAnimation } from '@/components/animations/NotFoundAnimation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader className="text-center pb-4">
            <NotFoundAnimation width={400} height={300} />
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <CardTitle className="text-3xl font-bold text-foreground">
              Trang không tìm thấy
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/">
                <Button size="lg" className="bg-primary text-primary-foreground px-8">
                  Về trang chủ
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-border text-foreground px-8">
                  Xem khóa học
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
