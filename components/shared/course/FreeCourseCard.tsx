import CourseCard from "./CourseCard";
import { CourseItemType } from "@/src/types/course/course-item.types";

interface FreeCourseCardProps {
  course: CourseItemType;
}

const FreeCourseCard = ({ course }: FreeCourseCardProps) => {
  return <CourseCard course={course} />;
};

export default FreeCourseCard;
