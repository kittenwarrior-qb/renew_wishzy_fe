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
  BookOpen,
  MessageSquare,
  ListChecks,
  ChevronDown,
  ArrowLeftToLine,
  ArrowRightToLine,
  GraduationCap,
  PlusCircle,
  Star,
  FileText,
  FileQuestion,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

export default function InstructorAppSidebar() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [open, setOpen] = useState<{ [k: string]: boolean }>({});
  const base = `/instructor`;
  const isActive = (sub: string) => {
    if (sub === ".") return (pathname || "").replace(/\/$/, "") === base;
    
    const currentPath = (pathname || "").replace(/\/$/, "");
    const targetPath = `${base}/${sub}`.replace(/\/$/, "");
    
    // Handle specific course routes to avoid conflicts
    if (sub === "courses") {
      // Match /instructor/courses and /instructor/courses/[id] (course detail pages)
      // But NOT /instructor/courses/create or /instructor/courses/edit/[id]
      return (
        currentPath === targetPath || 
        (currentPath.startsWith(`${targetPath}/`) && 
         !currentPath.includes('/create') && 
         !currentPath.includes('/edit') &&
         currentPath.split('/').length === 4) // /instructor/courses/[id]
      );
    }
    
    if (sub === "courses/create") {
      // Match /instructor/courses/create exactly
      return currentPath === targetPath;
    }
    
    if (sub.includes("courses/edit")) {
      // Match /instructor/courses/edit/[id] pattern
      return currentPath.startsWith(`${base}/courses/edit/`);
    }
    
    // For other routes, use startsWith as before
    return currentPath.startsWith(targetPath);
  };

  useEffect(() => {
    setOpen({
      dashboard: isActive("."),
      courses: isActive("courses") || isActive("course"),
      students: isActive("user/students"),
      comments: isActive("comments"),

      feedbacks: isActive("feedbacks"),
      documents: isActive("documents"),
      quizzes: isActive("quizzes") || isActive("quiz-attempts"),
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
      key: "courses",
      label: "Quản lý khoá học",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Danh sách khoá học",
          href: `${base}/courses`,
          icon: <BookOpen className="h-[18px] w-[18px]" />,
          isActiveKey: "courses",
        },
        {
          label: "Tạo khoá học mới",
          href: `${base}/courses/create`,
          icon: <PlusCircle className="h-[18px] w-[18px]" />,
          isActiveKey: "courses/create",
        },
      ],
    },
    {
      key: "students",
      label: "Quản lý học viên",
      icon: <Users className="mr-2 h-4 w-4" />,
      collapsible: false,
      items: [
        {
          label: "Danh sách học viên",
          href: `${base}/user/students`,
          icon: <GraduationCap className="h-[18px] w-[18px]" />,
          isActiveKey: "user/students",
        },
      ],
    },

    {
      key: "comments",
      label: "Bình luận",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      collapsible: false,
      items: [
        {
          label: "Quản lý bình luận",
          href: `${base}/comments`,
          icon: <MessageSquare className="h-[18px] w-[18px]" />,
          isActiveKey: "comments",
        },
      ],
    },
    {
      key: "feedbacks",
      label: "Đánh giá",
      icon: <Star className="mr-2 h-4 w-4" />,
      collapsible: false,
      items: [
        {
          label: "Xem đánh giá",
          href: `${base}/feedbacks`,
          icon: <Star className="h-[18px] w-[18px]" />,
          isActiveKey: "feedbacks",
        },
      ],
    },
    {
      key: "documents",
      label: "Tài liệu",
      icon: <FileText className="mr-2 h-4 w-4" />,
      collapsible: false,
      items: [
        {
          label: "Tài liệu khoá học",
          href: `${base}/documents`,
          icon: <FileText className="h-[18px] w-[18px]" />,
          isActiveKey: "documents",
        },
      ],
    },
    {
      key: "quizzes",
      label: "Quiz",
      icon: <FileQuestion className="mr-2 h-4 w-4" />,
      collapsible: true,
      items: [
        {
          label: "Quản lý Quiz",
          href: `${base}/quizzes`,
          icon: <FileQuestion className="h-[18px] w-[18px]" />,
          isActiveKey: "quizzes",
        },
        {
          label: "Bài làm học viên",
          href: `${base}/quiz-attempts`,
          icon: <ListChecks className="h-[18px] w-[18px]" />,
          isActiveKey: "quiz-attempts",
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
