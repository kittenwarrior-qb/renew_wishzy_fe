'use client';

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterPopoversProps {
  selectedRating: string;
  selectedLevel: string;
  selectedPrice: string;
  selectedSort?: string;
  onRatingChange: (rating: string) => void;
  onLevelChange: (level: string) => void;
  onPriceChange: (price: string) => void;
  onSortChange?: (sort: string) => void;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (value: string) => void;
  onMaxPriceChange?: (value: string) => void;
}

export const FilterPopovers = ({
  selectedRating,
  selectedLevel,
  selectedPrice,
  selectedSort = '',
  onRatingChange,
  onLevelChange,
  onPriceChange,
  onSortChange,
  minPrice = '',
  maxPrice = '',
  onMinPriceChange,
  onMaxPriceChange,
}: FilterPopoversProps) => {
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            Đánh giá
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Đánh giá</h4>
            <RadioGroup value={selectedRating} onValueChange={onRatingChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="r0" />
                <Label htmlFor="r0">Tất cả</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="r1" />
                <Label htmlFor="r1" className="flex items-center">
                  <span className="flex text-yellow-400">★★★★<span className="text-gray-400">★</span></span>
                  <span className="ml-1">4.0 & up</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="r2" />
                <Label htmlFor="r2" className="flex items-center">
                  <span className="flex text-yellow-400">★★★<span className="text-gray-400">★★</span></span>
                  <span className="ml-1">3.0 & up</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="r3" />
                <Label htmlFor="r3" className="flex items-center">
                  <span className="flex text-yellow-400">★★<span className="text-gray-400">★★★</span></span>
                  <span className="ml-1">2.0 & up</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="r4" />
                <Label htmlFor="r4" className="flex items-center">
                  <span className="flex text-yellow-400">★<span className="text-gray-400">★★★★</span></span>
                  <span className="ml-1">1.0 & up</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            Level
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Level</h4>
            <RadioGroup value={selectedLevel} onValueChange={onLevelChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="l0" />
                <Label htmlFor="l0">Tất cả</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="l1" />
                <Label htmlFor="l1">Cơ bản</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="l2" />
                <Label htmlFor="l2">Trung cấp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="l3" />
                <Label htmlFor="l3">Nâng cao</Label>
              </div>
            </RadioGroup>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            {selectedPrice === 'free' ? 'Miễn phí' : selectedPrice === 'paid' ? 'Trả phí' : selectedPrice === 'custom' ? 'Tùy chỉnh' : 'Giá'}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Giá</h4>
            <RadioGroup value={selectedPrice} onValueChange={onPriceChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="p0" />
                <Label htmlFor="p0">Tất cả</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="p1" />
                <Label htmlFor="p1">Miễn phí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="p2" />
                <Label htmlFor="p2">Trả phí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="p3" />
                <Label htmlFor="p3">Tùy chỉnh</Label>
              </div>
            </RadioGroup>
            
            {selectedPrice === 'custom' && (
              <div className="mt-3 space-y-2 pl-6">
                <div className="space-y-1">
                  <Label htmlFor="minPricePopover" className="text-sm">Giá tối thiểu (VNĐ)</Label>
                  <Input
                    id="minPricePopover"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      onMinPriceChange?.(value);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxPricePopover" className="text-sm">Giá tối đa (VNĐ)</Label>
                  <Input
                    id="maxPricePopover"
                    type="text"
                    inputMode="numeric"
                    placeholder="Không giới hạn"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      onMaxPriceChange?.(value);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            {selectedSort === 'newest' ? 'Mới nhất' : selectedSort === 'popular' ? 'Bán chạy' : selectedSort === 'price-asc' ? 'Giá thấp' : selectedSort === 'price-desc' ? 'Giá cao' : 'Sắp xếp'}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">Sắp xếp theo</h4>
            <RadioGroup value={selectedSort} onValueChange={onSortChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="s0" />
                <Label htmlFor="s0">Mặc định</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="s1" />
                <Label htmlFor="s1">Mới nhất</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="popular" id="s2" />
                <Label htmlFor="s2">Bán chạy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-asc" id="s3" />
                <Label htmlFor="s3">Giá thấp đến cao</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-desc" id="s4" />
                <Label htmlFor="s4">Giá cao đến thấp</Label>
              </div>
            </RadioGroup>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
