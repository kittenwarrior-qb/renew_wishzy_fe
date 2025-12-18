'use client';

import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2, Save, X, Camera } from 'lucide-react';
import { useQueryHook } from '@/src/hooks/useQueryHook';
import { useMutationHook } from '@/src/hooks/useMutationHook';
import { wishzyAuthService } from '@/src/services/auth';
import { UpdateProfileData } from '@/src/types/auth';
import { useAppStore } from '@/src/stores/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ProfileTabContent = () => {
    const queryClient = useQueryClient();
    const { setUser } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    
    const { data, isLoading } = useQueryHook(
        ['profile'],
        () => wishzyAuthService.getProfile(),
    );

    const profile = data;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateProfileData>({
        fullName: profile?.fullName || '',
        phone: profile?.phone || '',
        dob: profile?.dob || '',
        gender: profile?.gender || '',
        age: profile?.age || undefined,
        address: profile?.address || '',
        avatar: profile?.avatar || '',
    });

    const updateMutation = useMutationHook(
        (data: UpdateProfileData) => wishzyAuthService.updateProfile(data),
        {
            onSuccess: (updatedUser) => {
                // Update store with new user data
                setUser(updatedUser);
                // Invalidate cache
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                setIsEditing(false);
            },
        }
    );

    const uploadAvatarMutation = useMutationHook(
        (file: File) => wishzyAuthService.uploadAvatar(file),
        {
            onSuccess: (updatedUser) => {
                // Update store with new user data
                setUser(updatedUser);
                // Invalidate cache
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            },
        }
    );

    React.useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                dob: profile.dob || '',
                gender: profile.gender || '',
                age: profile.age || undefined,
                address: profile.address || '',
                avatar: profile.avatar || '',
            });
        }
    }, [profile]);

    if (isLoading) {
        return (
            <div className="bg-card rounded-lg border border-border p-6">
                <div className="text-muted-foreground">Đang tải thông tin...</div>
            </div>
        );
    }

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGenderLabel = (gender: string | null | undefined) => {
        if (!gender) return 'Chưa cập nhật';
        return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác';
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        setFormData({
            fullName: profile?.fullName || '',
            phone: profile?.phone || '',
            dob: profile?.dob || '',
            gender: profile?.gender || '',
            age: profile?.age || undefined,
            address: profile?.address || '',
        });
        setIsEditing(false);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }
            console.log('Uploading file:', file.name, file.type, file.size);
            uploadAvatarMutation.mutate(file);
        }
        // Reset input để có thể upload lại cùng file
        event.target.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Header với nút Edit/Save/Cancel */}
            <div className="space-y-3">
                <div className="flex justify-end gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                            <Edit2 className="h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Hủy
                            </Button>
                        </>
                    )}
                </div>
                
                {/* Success/Error Messages */}
                {updateMutation.isSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded">
                        Cập nhật thông tin thành công!
                    </div>
                )}
                {updateMutation.isError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded">
                        Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.
                    </div>
                )}
                {uploadAvatarMutation.isSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded">
                        Cập nhật avatar thành công!
                    </div>
                )}
                {uploadAvatarMutation.isError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded">
                        Có lỗi xảy ra khi tải lên avatar. Vui lòng thử lại.
                    </div>
                )}
            </div>

            {/* Avatar và thông tin cơ bản */}
            <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div 
                        className="shrink-0 relative cursor-pointer group"
                        onMouseEnter={() => setIsHoveringAvatar(true)}
                        onMouseLeave={() => setIsHoveringAvatar(false)}
                        onClick={handleAvatarClick}
                    >
                        {profile?.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={profile.fullName || 'Avatar'}
                                className="w-24 h-24 rounded-full object-cover border-4 border-primary/10 transition-opacity group-hover:opacity-70"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center border-4 border-primary/10 transition-opacity group-hover:opacity-70">
                                <span className="text-primary-foreground text-3xl font-semibold">
                                    {profile?.fullName?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        
                        {/* Overlay with camera icon */}
                        <div className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity ${isHoveringAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                        
                        {/* Loading overlay */}
                        {uploadAvatarMutation.isPending && (
                            <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                        
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Thông tin cơ bản */}
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-3">
                                <Input
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Họ và tên"
                                    className="text-2xl font-bold"
                                />
                                <p className="text-muted-foreground">{profile?.email}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    {profile?.fullName || 'Chưa cập nhật tên'}
                                </h2>
                                <p className="text-muted-foreground mb-3">{profile?.email}</p>
                            </>
                        )}
                        <div className="flex flex-wrap gap-3">
                            {profile?.verified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    ✓ Đã xác thực
                                </span>
                            )}
                            {profile?.role && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {profile.role === 'admin' ? 'Quản trị viên' : profile.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                </span>
                            )}
                            {profile?.loginType && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                    Đăng nhập: {profile.loginType === 'local' ? 'Tài khoản thường' : profile.loginType}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Yêu cầu trở thành giảng viên - Chỉ hiển thị cho role=user */}
            {profile?.role === 'user' && (
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Trở thành Giảng viên</h3>
                            {profile?.isInstructorActive ? (
                                // Đang chờ xác nhận
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 px-4 py-3 rounded">
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="font-medium">Đang chờ xác nhận</span>
                                    </div>
                                    <p className="text-sm mt-1">Yêu cầu của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.</p>
                                </div>
                            ) : (
                                // Chưa gửi yêu cầu
                                <>
                                    <p className="text-muted-foreground mb-4">
                                        Bạn có muốn chia sẻ kiến thức và kinh nghiệm của mình? Đăng ký trở thành giảng viên trên Wishzy để tạo và bán các khóa học của riêng bạn.
                                    </p>
                                    <InstructorRequestButton />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Thông tin chi tiết */}
            <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-xl font-semibold mb-6">Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        {isEditing ? (
                            <Input
                                value={profile?.email || ''}
                                disabled
                                className="mt-1 bg-muted cursor-not-allowed"
                            />
                        ) : (
                            <p className="text-foreground mt-1">{profile?.email || 'Chưa cập nhật'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                        {isEditing ? (
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Số điện thoại"
                                className="mt-1"
                            />
                        ) : (
                            <p className="text-foreground mt-1">{profile?.phone || 'Chưa cập nhật'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Ngày sinh</label>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="mt-1"
                            />
                        ) : (
                            <p className="text-foreground mt-1">{formatDate(profile?.dob)}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Giới tính</label>
                        {isEditing ? (
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-foreground mt-1">{getGenderLabel(profile?.gender)}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Tuổi</label>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formData.age || ''}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                                placeholder="Tuổi"
                                className="mt-1"
                            />
                        ) : (
                            <p className="text-foreground mt-1">{profile?.age || 'Chưa cập nhật'}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Địa chỉ</label>
                        {isEditing ? (
                            <Textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Địa chỉ"
                                className="mt-1"
                                rows={3}
                            />
                        ) : (
                            <p className="text-foreground mt-1">{profile?.address || 'Chưa cập nhật'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Thông tin tài khoản */}
            <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-xl font-semibold mb-6">Thông tin tài khoản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Ngày tạo tài khoản</label>
                        <p className="text-foreground mt-1">{formatDate(profile?.createdAt)}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</label>
                        <p className="text-foreground mt-1">{formatDate(profile?.updatedAt)}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Trạng thái giảng viên</label>
                        <p className="text-foreground mt-1">
                            {profile?.isInstructorActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Đã đổi mật khẩu</label>
                        <p className="text-foreground mt-1">
                            {profile?.passwordModified ? 'Có' : 'Chưa'}
                        </p>
                    </div>
            </div>
            </div>
        </div>
    );
};

// Component con để xử lý yêu cầu trở thành giảng viên
const InstructorRequestButton = () => {
    const queryClient = useQueryClient();
    
    const requestMutation = useMutationHook(
        async () => {
            const api = (await import('@/src/services/api')).default;
            return api.post('/users/request-instructor');
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            },
        }
    );

    return (
        <div className="space-y-3">
            {requestMutation.isSuccess ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded">
                    <div className="font-medium">✓ Yêu cầu đã được gửi!</div>
                    <p className="text-sm mt-1">Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.</p>
                </div>
            ) : requestMutation.isError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded">
                    Có lỗi xảy ra. Vui lòng thử lại sau.
                </div>
            ) : null}
            
            {!requestMutation.isSuccess && (
                <Button
                    onClick={() => requestMutation.mutate(undefined)}
                    disabled={requestMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                >
                    {requestMutation.isPending ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang gửi...
                        </>
                    ) : (
                        'Gửi yêu cầu trở thành Giảng viên'
                    )}
                </Button>
            )}
        </div>
    );
};
