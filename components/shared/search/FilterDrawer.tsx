'use client';

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRating: string;
  selectedPrice: string;
  selectedLevel: string;
  selectedCategoryId: string;
  onRatingChange: (rating: string) => void;
  onPriceChange: (price: string) => void;
  onLevelChange: (level: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onApply: () => void;
  onReset: () => void;
  parentCategories: any[];
  categoriesByParent: Record<string, any[]>;
  isCategoriesLoading: boolean;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (value: string) => void;
  onMaxPriceChange?: (value: string) => void;
}

export const FilterDrawer = ({
  isOpen,
  onClose,
  selectedRating,
  selectedPrice,
  selectedLevel,
  selectedCategoryId,
  onRatingChange,
  onPriceChange,
  onLevelChange,
  onCategoryChange,
  onApply,
  onReset,
  parentCategories,
  categoriesByParent,
  isCategoriesLoading,
  minPrice = '',
  maxPrice = '',
  onMinPriceChange,
  onMaxPriceChange,
}: FilterDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto p-6 animate-slide-in-right">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Bộ lọc</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium">Đánh giá</h4>
            <RadioGroup value={selectedRating} onValueChange={onRatingChange}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4.5" id="dr1" />
                  <Label htmlFor="dr1" className="flex items-center">
                    <span className="flex text-yellow-400">★★★★★</span>
                    <span className="ml-1">4.5 & up</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4.0" id="dr2" />
                  <Label htmlFor="dr2" className="flex items-center">
                    <span className="flex text-yellow-400">★★★★<span className="text-gray-400">★</span></span>
                    <span className="ml-1">4.0 & up</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3.5" id="dr3" />
                  <Label htmlFor="dr3" className="flex items-center">
                    <span className="flex text-yellow-400">★★★★<span className="text-gray-400">★</span></span>
                    <span className="ml-1">3.5 & up</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3.0" id="dr4" />
                  <Label htmlFor="dr4" className="flex items-center">
                    <span className="flex text-yellow-400">★★★<span className="text-gray-400">★★</span></span>
                    <span className="ml-1">3.0 & up</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium">Giá</h4>
            <RadioGroup value={selectedPrice} onValueChange={onPriceChange}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="dp0" />
                  <Label htmlFor="dp0">Tất cả</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="dp1" />
                  <Label htmlFor="dp1">Miễn phí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="dp2" />
                  <Label htmlFor="dp2">Trả phí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="dp3" />
                  <Label htmlFor="dp3">Tùy chỉnh</Label>
                </div>
              </div>
            </RadioGroup>
            
            {selectedPrice === 'custom' && (
              <div className="mt-3 space-y-2 pl-6">
                <div className="space-y-1">
                  <Label htmlFor="minPrice" className="text-sm">Giá tối thiểu (VNĐ)</Label>
                  <Input
                    id="minPrice"
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
                  <Label htmlFor="maxPrice" className="text-sm">Giá tối đa (VNĐ)</Label>
                  <Input
                    id="maxPrice"
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

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Cấp độ</h4>
            <RadioGroup value={selectedLevel} onValueChange={onLevelChange}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="dl0" />
                  <Label htmlFor="dl0">Tất cả</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="dl1" />
                  <Label htmlFor="dl1">Cơ bản</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="dl2" />
                  <Label htmlFor="dl2">Trung cấp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="dl3" />
                  <Label htmlFor="dl3">Nâng cao</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Danh mục</h4>
            {isCategoriesLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : parentCategories.length > 0 ? (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start ${!selectedCategoryId ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => onCategoryChange("")}
                >
                  Tất cả
                </Button>
                {parentCategories.map((parent: any) => {
                  const children = categoriesByParent[parent.id] || [];
                  if (children.length > 0) {
                    return (
                      <div key={parent.id} className="space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`w-full justify-start ${String(selectedCategoryId) === String(parent.id) ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => onCategoryChange(String(parent.id))}
                        >
                          {parent.name}
                        </Button>
                        <div className="pl-4 space-y-1">
                          {children.map((child: any) => (
                            <Button
                              key={child.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`w-full justify-start text-sm ${String(selectedCategoryId) === String(child.id) ? 'bg-primary text-primary-foreground' : ''}`}
                              onClick={() => onCategoryChange(String(child.id))}
                            >
                              {child.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Button
                      key={parent.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${String(selectedCategoryId) === String(parent.id) ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => onCategoryChange(String(parent.id))}
                    >
                      {parent.name}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Không có danh mục nào</p>
            )}
          </div>

          <div className="pt-4">
            <Button className="w-full" onClick={onApply}>
              Áp dụng bộ lọc
            </Button>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={onReset}
              disabled={!selectedRating && !selectedLevel && !selectedPrice && !selectedCategoryId}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
