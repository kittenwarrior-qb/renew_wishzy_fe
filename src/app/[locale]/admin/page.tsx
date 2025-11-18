"use client"

import * as React from "react"
import { Users, GraduationCap, Layers3, Folder, Image as ImageIcon } from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { useUserList, useInstructorList } from "@/components/shared/user/useUser"
import { useCourseList, useBestSellerCourses } from "@/components/shared/course/useCourse"
import { useCategoryList } from "@/components/shared/category/useCategory"
import { useBannerList } from "@/components/shared/banner/useBanner"
import { useOrderList, type OrderListItem, type OrderList } from "@/components/shared/order/useOrder"
import type { UserList } from "@/components/shared/user/useUser"
import type { CourseListResponse } from "@/components/shared/course/useCourse"
import type { CategoryListResponse } from "@/types/category"
import type { BannerListResponse } from "@/components/shared/banner/useBanner"
import { AdminDashboardHero } from "@/components/shared/admin/AdminDashboardHero"
import { AdminDashboardQuickStats } from "@/components/shared/admin/AdminDashboardQuickStats"
import { AdminDashboardSchedule } from "@/components/shared/admin/AdminDashboardSchedule"
import { AdminDashboardLeaderboards } from "@/components/shared/admin/AdminDashboardLeaderboards"
import { AdminDashboardRevenue } from "@/components/shared/admin/AdminDashboardRevenue"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function Page() {
  const { data: usersRes, isPending: loadingUsers, isFetching: fetchingUsers } = useUserList({ page: 1, limit: 20, role: 'user' })
  const { data: instrRes, isPending: loadingInstr, isFetching: fetchingInstr } = useInstructorList({ page: 1, limit: 1, role: 'instructor' })
  const { data: coursesRes, isPending: loadingCourses, isFetching: fetchingCourses } = useCourseList({ page: 1, limit: 1 })
  const { data: categoriesRes, isPending: loadingCats, isFetching: fetchingCats } = useCategoryList({ page: 1, limit: 1 })
  const { data: bannersRes, isPending: loadingBanners, isFetching: fetchingBanners } = useBannerList({ page: 1, limit: 1 })
  const { data: bestSellerCoursesRes } = useBestSellerCourses(5)
  const { data: ordersRes, isPending: loadingOrders, isFetching: fetchingOrders } = useOrderList({ page: 1, limit: 100 })

  const showLoading = (
    loadingUsers || fetchingUsers ||
    loadingInstr || fetchingInstr ||
    loadingCourses || fetchingCourses ||
    loadingCats || fetchingCats ||
    loadingBanners || fetchingBanners ||
    loadingOrders || fetchingOrders
  )

  const totalUsers = (usersRes as UserList | undefined)?.total ?? 0
  const totalInstructors = (instrRes as UserList | undefined)?.total ?? 0
  const totalCourses = (coursesRes as CourseListResponse | undefined)?.total ?? 0
  const totalCategories = (categoriesRes as CategoryListResponse | undefined)?.total ?? 0
  const totalBanners = (bannersRes as BannerListResponse | undefined)?.total ?? 0

  const cards: Array<{ title: string; value: number; icon: React.ReactNode; hint?: string }> = [
    { title: "Người dùng", value: totalUsers, icon: <Users className="h-5 w-5" /> },
    { title: "Giảng viên", value: totalInstructors, icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Khoá học", value: totalCourses, icon: <Layers3 className="h-5 w-5" /> },
    { title: "Danh mục", value: totalCategories, icon: <Folder className="h-5 w-5" /> },
    { title: "Banner", value: totalBanners, icon: <ImageIcon className="h-5 w-5" /> },
  ]

  const featuredCourse = (coursesRes as CourseListResponse | undefined)?.data?.[0]
  const courses = (coursesRes as CourseListResponse | undefined)?.data ?? []
  const latestUsers = (usersRes as UserList | undefined)?.data ?? []
  const bestSellerCourses = (bestSellerCoursesRes ?? [])
  const orders = ((ordersRes as OrderList | undefined)?.data ?? []) as OrderListItem[]

  const { fullName, email } = useCurrentUser()

  return (
    <div className="relative space-y-6 p-4 md:p-6">
      <LoadingOverlay show={showLoading} />
      {/* Below: 2-column layout */}
      <div className="grid gap-6 grid-cols-[2.1fr_1fr]">
        <div className="space-y-6">
          <AdminDashboardHero
            fullName={fullName}
            email={email}
            totalUsers={totalUsers}
            totalCourses={totalCourses}
            totalInstructors={totalInstructors}
          />
          <AdminDashboardRevenue orders={orders} />
        </div>

        <div className="space-y-4">
          <AdminDashboardLeaderboards bestSellerCourses={bestSellerCourses} orders={orders} />
        </div>
      </div>
    </div>
  )
}
