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
    GraduationCap,
    Shield,
    Layers3,
    School,
    BookOpen,
    ListChecks,
    MessageSquare,
    Star,
    MessageCircle,
    FileText,
    Folder,
    Image as ImageIcon,
    TicketPercent,
    Settings,
    ChevronDown,
    ArrowLeftToLine,
    ArrowRightToLine,
    List,
    PlusCircle,
    Trash2,
} from "lucide-react"

export default function AdminAppSidebar() {
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => { setHydrated(true) }, [])

    const pathname = usePathname()
    const { state, toggleSidebar } = useSidebar()
    const [open, setOpen] = useState<{ [k: string]: boolean }>({})
    const parts = (pathname || '').split('/').filter(Boolean)
    const locale = parts[0] || 'vi'
    const base = `/${locale}/admin`
    const isActive = (sub: string) => {
        if (sub === ".") return (pathname || "").replace(/\/$/, '') === base
        return (pathname || "").startsWith(`${base}/${sub}`)
    }

    useEffect(() => {
        setOpen({
            dashboard: isActive('.'),
            users: isActive('users/'),
            classes: isActive('categories') || isActive('categories/create'),
            courses: isActive('courses'),
            exams: isActive('exams'),
            communication: isActive('communication/'),
            posts: isActive('posts/'),
            banners: isActive('banners'),
            vouchers: isActive('vouchers'),
            settings: isActive('settings'),
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
                                <ArrowRightToLine size={28} />
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
                                <ArrowLeftToLine size={28} />
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
                                <BarChart3 className="mr-2 inline" size={16} /> Thống kê & báo cáo
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={state === 'collapsed' ? '' : 'pl-6'}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('.')} tooltip="Tổng quan">
                                            <Link href={base}><Home size={18} />{state !== 'collapsed' && <span>Tổng quan</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('users')} className="w-full flex items-center gap-2">
                                    <Users className="mr-2" size={16} />Quản lý người dùng
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.users ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.users || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('users/students')} tooltip="Học sinh">
                                            <Link href={`${base}/users/students`}><School size={18} />{state !== 'collapsed' && <span>Học sinh</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('users/teachers')} tooltip="Giảng viên">
                                            <Link href={`${base}/users/teachers`}><GraduationCap size={18} />{state !== 'collapsed' && <span>Giảng viên</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('users/admins')} tooltip="Quản trị viên">
                                            <Link href={`${base}/users/admins`}><Shield size={18} />{state !== 'collapsed' && <span>Quản trị viên</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('classes')} className="w-full flex items-center gap-2">
                                    <Layers3 className="mr-2" size={16} />Quản lý danh mục
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.classes ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.classes || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('categories')} tooltip="Danh sách">
                                            <Link href={`${base}/categories`}><List size={18} />{state !== 'collapsed' && <span>Danh sách</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    {/* <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('categories/create')} tooltip="Tạo">
                                            <Link href={`${base}/categories/trash`}><Trash2 size={18} />{state !== 'collapsed' && <span>Thùng rác</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem> */}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('courses')} className="w-full flex items-center gap-2">
                                    <BookOpen className="mr-2" size={16} />Quản lý khoá học
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.courses ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.courses || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('courses')} tooltip="Khoá học">
                                            <Link href={`${base}/courses`}><BookOpen size={18} />{state !== 'collapsed' && <span>Khoá học</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('exams')} className="w-full flex items-center gap-2">
                                    <ListChecks className="mr-2" size={16} />Quản lý bài kiểm tra
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.exams ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.exams || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('exams')} tooltip="Bài kiểm tra">
                                            <Link href={`${base}/exams`}><ListChecks size={18} />{state !== 'collapsed' && <span>Bài kiểm tra</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('communication')} className="w-full flex items-center gap-2">
                                    <MessageSquare className="mr-2" size={16} />Quản lý giao tiếp
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.communication ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.communication || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('communication/reviews')} tooltip="Đánh giá">
                                            <Link href={`${base}/communication/reviews`}><Star size={18} />{state !== 'collapsed' && <span>Đánh giá</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('communication/comments')} tooltip="Bình luận">
                                            <Link href={`${base}/communication/comments`}><MessageCircle size={18} />{state !== 'collapsed' && <span>Bình luận</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('posts')} className="w-full flex items-center gap-2">
                                    <FileText className="mr-2" size={16} />Quản lý bài viết
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.posts ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.posts || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('posts')} tooltip="Danh sách bài viết">
                                            <Link href={`${base}/posts`}><FileText size={18} />{state !== 'collapsed' && <span>Danh sách bài viết</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('posts/categories')} tooltip="Danh mục bài viết">
                                            <Link href={`${base}/posts/categories`}><Folder size={18} />{state !== 'collapsed' && <span>Danh mục bài viết</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('posts/comments')} tooltip="Bình luận">
                                            <Link href={`${base}/posts/comments`}><MessageCircle size={18} />{state !== 'collapsed' && <span>Bình luận</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('banners')} className="w-full flex items-center gap-2">
                                    <ImageIcon className="mr-2" size={16} />Quản lý banner
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.banners ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.banners || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('banners')} tooltip="Banner">
                                            <Link href={`${base}/banners`}><ImageIcon size={18} />{state !== 'collapsed' && <span>Banner</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('vouchers')} className="w-full flex items-center gap-2">
                                    <TicketPercent className="mr-2" size={16} />Quản lý voucher
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.vouchers ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.vouchers || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('vouchers')} tooltip="Voucher">
                                            <Link href={`${base}/vouchers`}><TicketPercent size={18} />{state !== 'collapsed' && <span>Voucher</span>}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel asChild className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                                <button type="button" onClick={() => toggle('settings')} className="w-full flex items-center gap-2">
                                    <Settings className="mr-2" size={16} />Cài đặt
                                    <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open.settings ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                        <ChevronDown size={14} />
                                    </span>
                                </button>
                            </SidebarGroupLabel>
                            <SidebarGroupContent className={(open.settings || state === 'collapsed' ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive('settings')} tooltip="Thiết lập">
                                            <Link href={`${base}/settings`}><Settings size={18} />{state !== 'collapsed' && <span>Thiết lập</span>}</Link>
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
