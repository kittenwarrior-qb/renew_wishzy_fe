import { CategoryList } from '@/components/category/category-list';
import { CourseList } from '@/components/course/course-list';

const page = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <CategoryList />
      <CourseList />
    </div>
  );
};

export default page;
