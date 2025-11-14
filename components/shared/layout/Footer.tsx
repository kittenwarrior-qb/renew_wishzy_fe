'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, Facebook, Twitter, Linkedin, Heart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePathname } from 'next/navigation'

const Footer = () => {
  const pathname = usePathname();
  
  if (pathname?.includes('/admin') || pathname?.includes('/instructor')) {
    return null;
  }
  
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1300px] mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img src="/images/black-logo.png" alt="Wishzy logo" className="h-8 dark:hidden" />
              <img src="/images/white-logo.png" alt="Wishzy logo" className="h-8 hidden dark:block" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Nền tảng học trực tuyến hàng đầu với hàng ngàn khóa học chất lượng cao.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Sản phẩm */}
          <div className="space-y-4">
            <h3 className="font-medium">Sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tổng quan
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tính năng
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tích hợp
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Công ty</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Đội ngũ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Đăng ký nhận tin</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder="Email" 
                className="w-full" 
              />
              <Button variant="default">
                Đăng ký
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-primary transition-colors">
                Chính sách bảo mật
              </Link>
            </p>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            {new Date().getFullYear()} Wishzy. All rights reserved.
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Wishzy Team</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer