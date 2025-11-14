"use client";

import ListBestSellerCourseCard from "@/components/shared/course/ListBestSellerCourseCard";
import ListCourse from "@/components/shared/course/ListCourse";
import { useCourseList } from "@/components/shared/course/useCourse";
import { CourseItemType } from "@/types/course/course-item.types";

const HotCourseSection = () => {
    const { data: latestCoursesData } = useCourseList({
        limit: 8,
        status: true
    });

    const latestCourses: CourseItemType[] = (latestCoursesData?.data || []).map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description || "",
        notes: course.notes || "",
        thumbnail: course.thumbnail || "",
        price: course.price?.toString() || "0",
        saleInfo: course.saleInfo || {},
        rating: course.rating || 0,
        status: course.status,
        averageRating: course.averageRating?.toString() || "0",
        numberOfStudents: course.numberOfStudents || 0,
        level: course.level || "beginner",
        totalDuration: course.totalDuration || 0,
        categoryId: course.categoryId,
        createdBy: course.createdBy,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        deletedAt: course.deletedAt || null,
        category: course.category ? {
            id: course.category.id,
            name: course.category.name,
            notes: null,
            parentId: null,
            createdAt: "",
            updatedAt: "",
            deletedAt: ""
        } : {
            id: "",
            name: "",
            notes: null,
            parentId: null,
            createdAt: "",
            updatedAt: "",
            deletedAt: ""
        },
        creator: {
            passwordModified: false,
            id: course.createdBy || "",
            email: "",
            fullName: ""
        },
        chapters: []
    }));

    return (
        <section className="w-full bg-background">
            <div className="mb-8 max-w-[1300px] mx-auto px-4 ">
                <h2 className="text-3xl font-bold mb-2">Khóa học mới nhất</h2>
                <p className="text-muted-foreground">
                    Khám phá những khóa học mới được cập nhật
                </p>
            </div>

            <ListBestSellerCourseCard />

            <div className="max-w-[1300px] mx-auto px-4 mt-8">
                {latestCourses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Chưa có khóa học nào
                    </div>
                ) : (
                    <ListCourse courses={latestCourses} />
                )}
            </div>
        </section>
    );
};

export default HotCourseSection;
