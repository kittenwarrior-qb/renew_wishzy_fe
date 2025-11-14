"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader,
    SidebarSeparator,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    BarChart3,
    Home,
    Users,
    BookOpen,
    ChevronDown,
    ArrowLeftToLine,
    ArrowRightToLine,
} from "lucide-react"

export default function InstructorAppSidebar() {
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => { setHydrated(true) }, [])

    const pathname = usePathname()
    const { state, toggleSidebar } = useSidebar()
    const [open, setOpen] = useState<{ [k: string]: boolean }>({})
    const parts = (pathname || '').split('/').filter(Boolean)
    const locale = parts[0] || 'vi'
    const base = `/${locale}/instructor`
    const isActive = (sub: string) => {
        if (sub === ".") return (pathname || "").replace(/\/$/, '') === base
        return (pathname || "").startsWith(`${base}/${sub}`)
    }

    useEffect(() => {
        setOpen({
            dashboard: isActive('.'),
            users: isActive('user/'),
            courses: isActive('courses'),
        })
    }, [pathname])

    const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

    return (
        <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="[&_[data-slot=sidebar-inner]]:bg-transparent [&_[data-slot=sidebar-container]]:border-0 [&_[data-mobile=true][data-slot=sidebar]]:w-screen [&_[data-mobile=true][data-slot=sidebar]]:max-w-none"
        >
            <SidebarHeader>
                <div className="px-2 py-2 text-sm font-semibold grid grid-cols-3 items-center">
                    <div />
                    <div className="flex justify-center">
                        {state === 'collapsed' ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                title="Mở sidebar"
                                aria-label="Mở sidebar"
                                className="hidden md:inline-flex h-14 w-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                            >
                                <ArrowRightToLine className="h-7 w-7" />
                            </Button>
                        ) : (
                            <Link href={base}>
                                <NextImage src="/images/black-logo.png" alt="Wishzy" width={120} height={24} priority />
                            </Link>
                        )}
                    </div>
                    <div className="flex justify-end">
                        {state !== 'collapsed' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                title="Thu gọn sidebar"
                                aria-label="Thu gọn sidebar"
                                className="hidden md:inline-flex h-14 w-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                            >
                                <ArrowLeftToLine className="h-7 w-7" />
                            </Button>
                        )}
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="scrollbar-thin py-1 overflow-x-hidden">
                {hydrated && (
                    <>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <BarChart3 className="mr-2 inline h-4 w-4" /> Thống kê & báo cáo
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={state === 'collapsed' ? '' : 'pl-6'}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('.')} tooltip="Tổng quan">
                                            <Link href={base}><Home className="h-[18px] w-[18px]" />{state !== 'collapsed' && <span>Tổng quan</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('users')} className="w-full flex items-center gap-2">
                                    <Users className="mr-2 h-4 w-4" />Quản lý người dùng
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.users ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.users || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('user/students')} tooltip="Học viên">
                                            <Link href={`${base}/user/students`}><Users className="h-[18px] w-[18px]" />{state !== 'collapsed' && <span>Học viên</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('courses')} className="w-full flex items-center gap-2">
                                    <BookOpen className="mr-2 h-4 w-4" />Quản lý khoá học
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.courses ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.courses || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('courses')} tooltip="Khoá học">
                                            <Link href={`${base}/courses`}><BookOpen className="h-[18px] w-[18px]" />{state !== 'collapsed' && <span>Khoá học</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}

