"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const featuresData = [
  "Học mọi lúc mọi nơi",
  "Nội dung chất lượng",
  "Đánh giá năng lực",
];

const image = [
  "https://res.cloudinary.com/djuksxdrw/image/upload/v1763030028/QmZKSgTAvsNo9tMZcMvMMQoYLAUMqiGfPVbQgj9YKEmW8y_l7c3at.avif",
  "https://res.cloudinary.com/djuksxdrw/image/upload/v1763030307/z6859109728630_0a19fc6f5477fe33038f87e95c653a13-Photoroom_psx2ld.png",
  "https://res.cloudinary.com/djuksxdrw/image/upload/v1763029064/2c43debb-0cc1-4d34-a923-8fac68aedaba_vbw6vq.png"
  
]

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col space-y-8">
            <div className="inline-flex items-center self-start gap-2 px-5 py-2 bg-muted/80 rounded-full text-sm font-medium shadow-sm">
              <span className="text-primary">✦</span>
              <span>Nền tảng học trực tuyến</span>
            </div>

            <div className="space-y-4">
              <h1 className="space-y-1 text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
                <div>
                  Khám phá <span className="italic font-normal">khóa học</span>
                </div>
                <div>
                  <span className="text-primary">wishzy</span>{" "}
                  <span>Online</span>
                </div>
              </h1>

              <p className="text-xl text-muted-foreground">
                Học tập chủ động – luyện thi hiệu quả. Truy cập hàng trăm khóa
                học, bài giảng và bài kiểm tra được cập nhật liên tục.
                <br className="hidden sm:block" />
                Trải nghiệm học tập dễ dàng, không cần đăng ký trước.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full px-7! h-[48px] bg-primary hover:bg-primary/90 text-[16px] transition-all hover:-translate-y-1 "
              >
                Bắt đầu học ngay
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>

              <Button variant="outline" size="lg" className="rounded-full px-7 h-[48px] text-[16px] transition-transform hover:-translate-y-1">
                Xem khóa học
              </Button>
            </div>
            <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-8">
              {featuresData.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className=" h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="inline-flex items-end gap-4 relative">
              <div className="self-stretch inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
                <div className="relative flex-1 w-[277px] grow rounded-lg overflow-hidden">
                  <img 
                    src={image[0]} 
                    alt="Khóa học trực tuyến" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="relative w-[277px] h-[188px] overflow-hidden">
                  <div className="absolute inset-0 bg-primary rounded-bl-[200px] rounded-2xl" />
                </div>
              </div>

              <div className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
                <div className="relative w-[277px] h-[270px] rounded-lg overflow-hidden">
                  <div className="absolute left-[calc(50.00%-138px)] bottom-0 w-[277px] h-[188px] overflow-hidden">
                    <div className="absolute inset-0 bg-primary rounded-tr-[200px] rounded-2xl" />
                  </div>

                  <div className="absolute top-7 left-[calc(50.00%-112px)] w-[213px] h-[242px] rounded-t-full overflow-hidden">
                    <img 
                      src={image[1]} 
                      alt="Học tập trực tuyến" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="relative self-stretch w-full h-56 rounded-lg overflow-hidden">
                  <img 
                    src={image[2]} 
                    alt="Nền tảng học trực tuyến" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


