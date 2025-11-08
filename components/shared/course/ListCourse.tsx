import { CourseItemType } from "@/src/types/course/course-item.types"
import CourseCard from "./CourseCard"

const ListCourse = ({courses}: {courses: CourseItemType[]}) => {
  return (
    <div className="grid grid-cols-4 gap-5">
      {courses?.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

export default ListCourse