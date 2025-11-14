"use client";

import { Users, FileText, GraduationCap, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface StatItem {
  icon: typeof Users;
  value: number;
  label: string;
  suffix: string;
  color: string;
  bgColor: string;
}

const statsData: StatItem[] = [
  {
    icon: Users,
    value: 10,
    label: "Học viên",
    suffix: "+",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: FileText,
    value: 10,
    label: "Bài kiểm tra",
    suffix: "+",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: GraduationCap,
    value: 5,
    label: "Giảng viên",
    suffix: "+",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BookOpen,
    value: 20,
    label: "Bài viết",
    suffix: "+",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const StatSection = () => {
  const [counts, setCounts] = useState<number[]>(statsData.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    statsData.forEach((stat, index) => {
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newValue = Math.floor(easeOutQuart * stat.value);

        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = newValue;
          return newCounts;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = stat.value;
            return newCounts;
          });
        }
      }, interval);
    });
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-muted/20 pb-10 md:pb-20">
      <div className="max-w-[1300px] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[14px] text-muted-foreground max-w-2xl mx-auto">
            Hàng ngàn học viên đã tin tưởng và đồng hành cùng chúng tôi<br />trên hành trình học tập
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <div className="text-[20px] font-bold">
                    {counts[index].toLocaleString()}
                    <span className="text-primary">{stat.suffix}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-[14px]">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
