"use client"

import { useApiQuery, useApiPatch } from "@/hooks/useApi"

export type Enrollment = {
  id: string
  status: string
  progress: number
  lastAccess?: string
  course: {
    id: string
    name: string
    thumbnail?: string | null
    createdAt?: string
  }
  user?: {
    id: string
    email: string
    fullName: string
    avatar?: string | null
  }
  createdAt?: string
  updatedAt?: string
}

export type EnrollmentListResponse = Enrollment[]

export const useUserEnrollments = (userId?: string) => {
  return useApiQuery<EnrollmentListResponse>(
    userId ? `enrollments/user/${userId}` : "",
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000,
      select: (res: any): EnrollmentListResponse => {
        // Try common wrappers: {success, data}, {success, data: { data: [] }}
        const d1 = res?.data?.data
        const d2 = res?.data
        const payload = Array.isArray(d1) ? d1 : (Array.isArray(d2) ? d2 : (Array.isArray(res) ? res : []))
        return payload as EnrollmentListResponse
      },
    }
  )
}

export const useMyEnrollments = () => {
  return useApiQuery<EnrollmentListResponse>(
    "enrollments/my-enrollments",
    {
      staleTime: 5 * 60 * 1000,
      select: (res: any): EnrollmentListResponse => {
        const d1 = res?.data?.data
        const d2 = res?.data
        const payload = Array.isArray(d1) ? d1 : (Array.isArray(d2) ? d2 : (Array.isArray(res) ? res : []))
        return payload as EnrollmentListResponse
      },
    }
  )
}

export const useUpdateEnrollment = () =>
  useApiPatch<Enrollment, { id: string; status?: string; progress?: number }>(
    "enrollments",
    {
      getParams: (v) => ({ id: v.id }),
    }
  )


