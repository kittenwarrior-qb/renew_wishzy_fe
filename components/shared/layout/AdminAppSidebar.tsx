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
    ShoppingCart,
    Settings,
    ChevronDown,
    ArrowLeftToLine,
    ArrowRightToLine,
    List,
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
            orders: isActive('orders'),
            banners: isActive('banners'),
            vouchers: isActive('vouchers'),
            settings: isActive('settings'),
        })
    }, [pathname])

    const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }))

    type MenuItem = { label: string; href: string; icon: React.ReactNode; isActiveKey: string }
    type MenuGroup = {
        key: string
        label: string
        icon: React.ReactNode
        collapsible?: boolean
        items: MenuItem[]
    }

    const menuGroups: MenuGroup[] = [
        {
            key: 'dashboard',
            label: 'Thống kê & báo cáo',
            icon: <BarChart3 className="mr-2 inline" size={16} />,
            collapsible: false,
            items: [
                { label: 'Tổng quan', href: base, icon: <Home size={18} />, isActiveKey: '.' },
            ],
        },
        {
            key: 'users',
            label: 'Quản lý người dùng',
            icon: <Users className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Học sinh', href: `${base}/users/students`, icon: <School size={18} />, isActiveKey: 'users/students' },
                { label: 'Giảng viên', href: `${base}/users/teachers`, icon: <GraduationCap size={18} />, isActiveKey: 'users/teachers' },
                { label: 'Quản trị viên', href: `${base}/users/admins`, icon: <Shield size={18} />, isActiveKey: 'users/admins' },
            ],
        },
        {
            key: 'classes',
            label: 'Quản lý danh mục',
            icon: <Layers3 className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Danh sách', href: `${base}/categories`, icon: <List size={18} />, isActiveKey: 'categories' },
                { label: 'Thùng rác', href: `${base}/categories/trash`, icon: <Trash2 size={18} />, isActiveKey: 'categories/create' },
            ],
        },
        {
            key: 'courses',
            label: 'Quản lý khoá học',
            icon: <BookOpen className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Khoá học', href: `${base}/courses`, icon: <BookOpen size={18} />, isActiveKey: 'courses' },
            ],
        },
        {
            key: 'exams',
            label: 'Quản lý bài kiểm tra',
            icon: <ListChecks className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Bài kiểm tra', href: `${base}/exams`, icon: <ListChecks size={18} />, isActiveKey: 'exams' },
            ],
        },
        {
            key: 'communication',
            label: 'Quản lý giao tiếp',
            icon: <MessageSquare className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Đánh giá', href: `${base}/communication/reviews`, icon: <Star size={18} />, isActiveKey: 'communication/reviews' },
                { label: 'Bình luận', href: `${base}/communication/comments`, icon: <MessageCircle size={18} />, isActiveKey: 'communication/comments' },
            ],
        },
        {
            key: 'posts',
            label: 'Quản lý bài viết',
            icon: <FileText className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Danh sách bài viết', href: `${base}/posts`, icon: <FileText size={18} />, isActiveKey: 'posts' },
                { label: 'Danh mục bài viết', href: `${base}/posts/categories`, icon: <Folder size={18} />, isActiveKey: 'posts/categories' },
                { label: 'Bình luận', href: `${base}/posts/comments`, icon: <MessageCircle size={18} />, isActiveKey: 'posts/comments' },
            ],
        },
        {
            key: 'orders',
            label: 'Quản lý đơn hàng',
            icon: <ShoppingCart className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Đơn hàng', href: `${base}/orders`, icon: <ShoppingCart size={18} />, isActiveKey: 'orders' },
            ],
        },
        {
            key: 'banners',
            label: 'Quản lý banner',
            icon: <ImageIcon className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Banner', href: `${base}/banners`, icon: <ImageIcon size={18} />, isActiveKey: 'banners' },
            ],
        },
        {
            key: 'vouchers',
            label: 'Quản lý voucher',
            icon: <TicketPercent className="mr-2" size={16} />,
            collapsible: true,
            items: [
                { label: 'Voucher', href: `${base}/vouchers`, icon: <TicketPercent size={18} />, isActiveKey: 'vouchers' },
            ],
        },
        {
            key: 'settings',
            label: 'Cài đặt',
            icon: <Settings className="mr-2" size={16} />,
            collapsible: false,
            items: [
                { label: 'Thiết lập', href: `${base}/settings`, icon: <Settings size={18} />, isActiveKey: 'settings' },
            ],
        },
    ]

    const renderGroup = (g: MenuGroup) => {
        const content = (
            <SidebarGroup key={g.key}>
                <SidebarGroupLabel asChild={g.collapsible} className="text-[16px] font-semibold tracking-wide text-foreground truncate">
                    {g.collapsible ? (
                        <button type="button" onClick={() => toggle(g.key)} className="w-full flex items-center gap-2">
                            {g.icon}{g.label}
                            <span className="ml-auto group-data-[collapsible=icon]:hidden transition-transform" style={{ transform: open[g.key] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                <ChevronDown size={14} />
                            </span>
                        </button>
                    ) : (
                        <span className="flex items-center gap-2">{g.icon}{g.label}</span>
                    )}
                </SidebarGroupLabel>
                <SidebarGroupContent className={((g.collapsible ? (open[g.key] || state === 'collapsed') : true) ? '' : 'hidden') + ' ' + (state === 'collapsed' ? '' : 'pl-6')}>
                    <SidebarMenu>
                        {g.items.map(it => (
                            <SidebarMenuItem key={it.href}>
                                <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center" asChild isActive={isActive(it.isActiveKey)} tooltip={it.label}>
                                    <Link href={it.href}>{it.icon}{state !== 'collapsed' && <span>{it.label}</span>}</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        )
        return content
    }

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
                        {menuGroups.map((g, idx) => (
                            <React.Fragment key={g.key}>
                                {idx > 0 && <SidebarSeparator />}
                                {renderGroup(g)}
                            </React.Fragment>
                        ))}
                    </>
                )}
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}
