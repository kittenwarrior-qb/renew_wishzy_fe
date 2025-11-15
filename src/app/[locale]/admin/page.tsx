"use client"

import * as React from "react"
import { Users, GraduationCap, Layers3, Folder, Image as ImageIcon } from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { useUserList, useInstructorList } from "@/components/shared/user/useUser"
import { useCourseList } from "@/components/shared/course/useCourse"
import { useCategoryList } from "@/components/shared/category/useCategory"
import { useBannerList } from "@/components/shared/banner/useBanner"
import type { UserList } from "@/components/shared/user/useUser"
import type { CourseListResponse } from "@/components/shared/course/useCourse"
import type { CategoryListResponse } from "@/types/category"
import type { BannerListResponse } from "@/components/shared/banner/useBanner"

export default function Page() {
  const { data: usersRes, isPending: loadingUsers, isFetching: fetchingUsers } = useUserList({ page: 1, limit: 1, role: 'user' })
  const { data: instrRes, isPending: loadingInstr, isFetching: fetchingInstr } = useInstructorList({ page: 1, limit: 1, role: 'instructor' })
  const { data: coursesRes, isPending: loadingCourses, isFetching: fetchingCourses } = useCourseList({ page: 1, limit: 1 })
  const { data: categoriesRes, isPending: loadingCats, isFetching: fetchingCats } = useCategoryList({ page: 1, limit: 1 })
  const { data: bannersRes, isPending: loadingBanners, isFetching: fetchingBanners } = useBannerList({ page: 1, limit: 1 })

  const showLoading = (
    loadingUsers || fetchingUsers ||
    loadingInstr || fetchingInstr ||
    loadingCourses || fetchingCourses ||
    loadingCats || fetchingCats ||
    loadingBanners || fetchingBanners
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

  return (
    <div className="relative p-4 md:p-6">
      <LoadingOverlay show={showLoading} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground mt-1">Số liệu nhanh của hệ thống</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.title} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">{c.title}</div>
                <div className="text-2xl font-semibold tabular-nums">{c.value}</div>
                {c.hint ? <div className="text-xs text-muted-foreground">{c.hint}</div> : null}
              </div>
              <div className="h-10 w-10 inline-flex items-center justify-center rounded-md bg-primary/10 text-primary">
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

