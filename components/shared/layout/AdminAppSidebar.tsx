"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
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
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

export default function AdminAppSidebar() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [open, setOpen] = useState<{ [k: string]: boolean }>({});
  const base = `/admin`;
  const isActive = (sub: string, isGroup = false) => {
    const p = (pathname || "").replace(/\/$/, "");
    const target = `${base}/${sub}`.replace(/\/$/, "");

    if (sub === ".") return p === base;
    if (p === target) return true;

    // For the group open state, we just need prefix matching
    if (isGroup) {
      return p.startsWith(target + "/");
    }

    // Special handling for the posts list to not overlap with its sub-sections
    if (sub === "posts") {
      return p.startsWith(`${target}/`) &&
        !p.startsWith(`${target}/categories`) &&
        !p.startsWith(`${target}/comments`);
    }

    return p.startsWith(target + "/");
  };

  useEffect(() => {
    setOpen({
      dashboard: isActive("."),
      users: isActive("users", true),
      classes: isActive("categories", true) || isActive("categories/create", true),
      courses: isActive("courses", true),
      exams: isActive("exams", true),
      communication: isActive("communication", true),
      posts: isActive("posts", true),
      orders: isActive("orders", true),
      banners: isActive("banners", true),
      vouchers: isActive("vouchers", true),
      settings: isActive("settings", true),
    });
  }, [pathname]);

  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const theme = useAppStore((state) => state.theme);
  const logoSrc =
    theme === "dark" ? "/images/white-logo.png" : "/images/black-logo.png";

  type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
    isActiveKey: string;
  };
  type MenuGroup = {
    key: string;
    label: string;
    icon: React.ReactNode;
    collapsible?: boolean;
    items: MenuItem[];
  };

  const menuGroups: MenuGroup[] = [
    {
      key: "dashboard",
      label: "",
      icon: null,
      collapsible: false,
      items: [
        {
          label: "Tổng quan",
          href: base,
          icon: <Home className="h-[18px] w-[18px]" />,
          isActiveKey: ".",
        },
      ],
    },
    {
      key: "users",
      label: "Quản lý người dùng",
      icon: <Users className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Học sinh",
          href: `${base}/users/students`,
          icon: <School className="h-[18px] w-[18px]" />,
          isActiveKey: "users/students",
        },
        {
          label: "Giảng viên",
          href: `${base}/users/teachers`,
          icon: <GraduationCap className="h-[18px] w-[18px]" />,
          isActiveKey: "users/teachers",
        },
        {
          label: "Quản trị viên",
          href: `${base}/users/admins`,
          icon: <Shield className="h-[18px] w-[18px]" />,
          isActiveKey: "users/admins",
        },
      ],
    },
    {
      key: "classes",
      label: "Quản lý danh mục",
      icon: <Layers3 className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Danh sách",
          href: `${base}/categories`,
          icon: <List className="h-[18px] w-[18px]" />,
          isActiveKey: "categories",
        },
      ],
    },
    {
      key: "courses",
      label: "Quản lý khoá học",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Khoá học",
          href: `${base}/courses`,
          icon: <BookOpen className="h-[18px] w-[18px]" />,
          isActiveKey: "courses",
        },
      ],
    },
    {
      key: "exams",
      label: "Quản lý bài kiểm tra",
      icon: <ListChecks className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Bài kiểm tra",
          href: `${base}/exams`,
          icon: <ListChecks className="h-[18px] w-[18px]" />,
          isActiveKey: "exams",
        },
        {
          label: "Bài làm",
          href: `${base}/quiz-attempts`,
          icon: <FileText className="h-[18px] w-[18px]" />,
          isActiveKey: "quiz-attempts",
        },
      ],
    },
    {
      key: "communication",
      label: "Quản lý giao tiếp",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Đánh giá",
          href: `${base}/communication/reviews`,
          icon: <Star className="h-[18px] w-[18px]" />,
          isActiveKey: "communication/reviews",
        },
        {
          label: "Bình luận",
          href: `${base}/communication/comments`,
          icon: <MessageCircle className="h-[18px] w-[18px]" />,
          isActiveKey: "communication/comments",
        },
      ],
    },
    {
      key: "posts",
      label: "Quản lý bài viết",
      icon: <FileText className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Danh sách bài viết",
          href: `${base}/posts`,
          icon: <FileText className="h-[18px] w-[18px]" />,
          isActiveKey: "posts",
        },
        {
          label: "Danh mục bài viết",
          href: `${base}/posts/categories`,
          icon: <Folder className="h-[18px] w-[18px]" />,
          isActiveKey: "posts/categories",
        },
        {
          label: "Bình luận",
          href: `${base}/posts/comments`,
          icon: <MessageCircle className="h-[18px] w-[18px]" />,
          isActiveKey: "posts/comments",
        },
      ],
    },
    {
      key: "orders",
      label: "Quản lý đơn hàng",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Đơn hàng",
          href: `${base}/orders`,
          icon: <ShoppingCart className="h-[18px] w-[18px]" />,
          isActiveKey: "orders",
        },
      ],
    },
    {
      key: "banners",
      label: "Quản lý banner",
      icon: <ImageIcon className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Banner",
          href: `${base}/banners`,
          icon: <ImageIcon className="h-[18px] w-[18px]" />,
          isActiveKey: "banners",
        },
      ],
    },
    {
      key: "vouchers",
      label: "Quản lý voucher",
      icon: <TicketPercent className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Voucher",
          href: `${base}/vouchers`,
          icon: <TicketPercent className="h-[18px] w-[18px]" />,
          isActiveKey: "vouchers",
        },
      ],
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <Settings className="mr-2 h-4 w-4" />,
      collapsible: false,
      items: [
        {
          label: "Thiết lập",
          href: `${base}/settings`,
          icon: <Settings className="h-[18px] w-[18px]" />,
          isActiveKey: "settings",
        },
      ],
    },
  ];

  const renderGroup = (g: MenuGroup) => {
    const content = (
      <SidebarGroup key={g.key} className="px-2">
        {g.label && (
          <SidebarGroupLabel
            asChild={g.collapsible}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 truncate"
          >
            {g.collapsible ? (
              <button
                type="button"
                onClick={() => toggle(g.key)}
                className="w-full flex items-center gap-2 hover:text-primary transition-colors py-2 px-3 rounded-lg"
              >
                {g.icon}
                {g.label}
                <span
                  className="ml-auto group-data-[collapsible=icon]:hidden transition-transform duration-200"
                  style={{
                    transform: open[g.key] ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </button>
            ) : (
              <span className="flex items-center gap-2 py-2 px-3">
                {g.icon}
                {g.label}
              </span>
            )}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent
          className={
            ((g.collapsible ? open[g.key] || state === "collapsed" : true)
              ? ""
              : "hidden") +
            " " +
            (state === "collapsed" ? "" : "pl-0")
          }
        >
          <SidebarMenu className="space-y-0.5">
            {g.items.map((it) => (
              <SidebarMenuItem key={it.href}>
                <SidebarMenuButton
                  size="lg"
                  className="group-data-[collapsible=icon]:justify-center rounded-lg transition-all duration-200 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm font-medium h-10"
                  asChild
                  isActive={isActive(it.isActiveKey)}
                  tooltip={it.label}
                >
                  <Link
                    href={it.href}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    {it.icon}
                    {state !== "collapsed" && (
                      <span className="text-sm">{it.label}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
    return content;
  };

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="[&_[data-slot=sidebar-inner]]:bg-transparent bg-background z-99 [&_[data-slot=sidebar-container]]:border-r [&_[data-slot=sidebar-container]]:border-border/40 [&_[data-mobile=true][data-slot=sidebar]]:w-screen [&_[data-mobile=true][data-slot=sidebar]]:max-w-none"
    >
      <SidebarHeader className="border-b border-border/40">
        <div className="px-4 py-4 text-sm font-semibold grid grid-cols-3 items-center">
          <div />
          <div className="flex justify-center">
            {state === "collapsed" ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                title="Mở sidebar"
                aria-label="Mở sidebar"
                className="hidden md:inline-flex h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200"
              >
                <ArrowRightToLine className="h-5 w-5" />
              </Button>
            ) : (
              <Link href={base} className="transition-opacity hover:opacity-80">
                <NextImage
                  src={logoSrc}
                  alt="Wishzy"
                  width={140}
                  height={28}
                  priority
                />
              </Link>
            )}
          </div>
          <div className="flex justify-end">
            {state !== "collapsed" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                title="Thu gọn sidebar"
                aria-label="Thu gọn sidebar"
                className="hidden md:inline-flex h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200"
              >
                <ArrowLeftToLine className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-3 overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/50">
        {hydrated && (
          <>
            {menuGroups.map((g, idx) => (
              <React.Fragment key={g.key}>
                {idx > 0 && <SidebarSeparator className="my-2 mx-2" />}
                {renderGroup(g)}
              </React.Fragment>
            ))}
          </>
        )}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
