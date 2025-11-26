"use client";

import ListBestSellerCourseCard from "@/components/shared/course/ListBestSellerCourseCard";
import ListCourse from "@/components/shared/course/ListCourse";
import { useCourseList, useCoursesOnSale } from "@/components/shared/course/useCourse";
import { CourseItemType } from "@/types/course/course-item.types";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HotCourseSection = () => {
    const [activeTab, setActiveTab] = useState<"new" | "sale">("new");
    
    // Fetch 8 khóa học mới nhất
    const { data: latestCoursesData } = useCourseList({
        limit: 8,
        status: true
    });

    // Fetch 8 khóa học đang giảm giá từ API riêng
    const { data: saleCoursesData } = useCoursesOnSale(8);

    const latestCourses: CourseItemType[] = (latestCoursesData?.data || [])
        .map((course) => ({
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
        reviewCount: course.reviewCount || 0,
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
        creator: course.creator ? {
            passwordModified: false,
            id: course.creator.id,
            email: course.creator.email || "",
            fullName: course.creator.fullName || "Giảng viên"
        } : {
            passwordModified: false,
            id: course.createdBy || "",
            email: "",
            fullName: "Giảng viên"
        },
        chapters: []
    }));

    // Map khóa học giảm giá từ API
    const coursesOnSale: CourseItemType[] = useMemo(() => {
        return (saleCoursesData?.data || []).map((course) => ({
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
            reviewCount: course.reviewCount || 0,
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
            creator: course.creator ? {
                passwordModified: false,
                id: course.creator.id,
                email: course.creator.email || "",
                fullName: course.creator.fullName || "Giảng viên"
            } : {
                passwordModified: false,
                id: course.createdBy || "",
                email: "",
                fullName: "Giảng viên"
            },
            chapters: []
        }));
    }, [saleCoursesData]);

    const displayedCourses = activeTab === "sale" ? coursesOnSale : latestCourses;

    return (
        <section className="w-full bg-background">
            <div className="mb-8 max-w-[1300px] mx-auto px-4 ">
                <h2 className="text-3xl font-bold mb-2">Khóa học hot nhất</h2>
                <p className="text-muted-foreground">
                    Khám phá những khóa học hot mới được cập nhật
                </p>
            </div>

            <ListBestSellerCourseCard />

            <div className="max-w-[1300px] mx-auto px-4 mt-8">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "new" | "sale")} className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="new">
                            Mới ({latestCourses.length})
                        </TabsTrigger>
                        <TabsTrigger value="sale">
                            Giảm giá ({coursesOnSale.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {displayedCourses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {activeTab === "sale" ? "Chưa có khóa học giảm giá nào" : "Chưa có khóa học nào"}
                    </div>
                ) : (
                    <ListCourse courses={displayedCourses} />
                )}
            </div>
        </section>
    );
};

export default HotCourseSection;
