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
  onRatingChange: (rating: string) => void;
  onLevelChange: (level: string) => void;
  onPriceChange: (price: string) => void;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (value: string) => void;
  onMaxPriceChange?: (value: string) => void;
}

export const FilterPopovers = ({
  selectedRating,
  selectedLevel,
  selectedPrice,
  onRatingChange,
  onLevelChange,
  onPriceChange,
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
                <RadioGroupItem value="4.5" id="r1" />
                <Label htmlFor="r1" className="flex items-center">
                  <span className="flex text-yellow-400">★★★★★</span>
                  <span className="ml-1">4.5 & up</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4.0" id="r2" />
                <Label htmlFor="r2" className="flex items-center">
                  <span className="flex text-yellow-400">★★★★<span className="text-gray-400">★</span></span>
                  <span className="ml-1">4.0 & up</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3.5" id="r3" />
                <Label htmlFor="r3" className="flex items-center">
                  <span className="flex text-yellow-400">★★★★<span className="text-gray-400">★</span></span>
                  <span className="ml-1">3.5 & up</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3.0" id="r4" />
                <Label htmlFor="r4" className="flex items-center">
                  <span className="flex text-yellow-400">★★★<span className="text-gray-400">★★</span></span>
                  <span className="ml-1">3.0 & up</span>
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
            Giá
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
    </>
  );
};
