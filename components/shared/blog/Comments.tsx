"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageSquare, Heart, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/src/stores/useAppStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import { useCommentBlogList, useCreateCommentBlog, useToggleLikeCommentBlog, useDeleteCommentBlog } from "./useCommentBlog";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const commentSchema = z.object({
    content: z.string().min(1, "Vui lòng nhập nội dung bình luận"),
});

const formatFBTime = (date: string | Date | undefined): string => {
    if (!date) return "Vừa xong";

    let then: Date;
    try {
        if (typeof date === 'string') {
            // Replace space with T to make it ISO-compliant
            let isoStr = date.replace(' ', 'T');
            // If no timezone/offset is present, assume UTC (Z)
            if (!isoStr.includes('Z') && !isoStr.includes('+')) {
                isoStr += 'Z';
            }
            then = new Date(isoStr);
        } else {
            then = date;
        }

        if (isNaN(then.getTime())) return "Vừa xong";
    } catch (e) {
        return "Vừa xong";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    const cleanVN = (str: string) => str.replace("khoảng ", "").replace("dưới ", "");

    if (diffInSeconds < 30) return "Vừa xong";
    if (diffInSeconds < 60) return "Vài giây trước";
    if (diffInSeconds < 3600) return cleanVN(formatDistanceToNow(then, { addSuffix: true, locale: vi }));
    if (diffInSeconds < 86400) return cleanVN(formatDistanceToNow(then, { locale: vi }));
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần`;
    if (then.getFullYear() === now.getFullYear()) return format(then, "d 'tháng' M", { locale: vi });
    return format(then, "d/M/yyyy", { locale: vi });
};

export interface Comment {
    id: string;
    author?: string; // We'll map from user.fullName
    date?: string;   // We'll map from createdAt
    content: string;
    avatar?: string;
    likes?: number;
    replies?: Comment[];
    parentId?: string;
    user?: {
        fullName: string;
        avatar?: string;
    };
    createdAt: string;
}

export interface CurrentUser {
    fullName: string;
    avatar?: string | null;
}

interface CommentsProps {
    comments: Comment[];
    blogId: string;
}

interface CommentFormProps {
    onSubmit: (data: { content: string }) => Promise<void>;
    currentUser?: CurrentUser;
    placeholder?: string;
    submitLabel?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
    hideAvatar?: boolean;
    defaultValue?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
    onSubmit,
    currentUser,
    placeholder = "Viết bình luận của bạn...",
    submitLabel = "Gửi bình luận",
    autoFocus = false,
    onCancel,
    hideAvatar = false,
    defaultValue = "",
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            content: defaultValue,
        },
    });

    const submitHandler = async (data: { content: string }) => {
        try {
            setIsSubmitting(true);
            await onSubmit(data);
            reset();
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const avatarUrl =
        currentUser?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            currentUser?.fullName || "User"
        )}&background=random`;

    return (
        <div className="flex gap-4">
            {!hideAvatar && (
                <Image
                    src={avatarUrl}
                    alt={currentUser?.fullName || "User"}
                    width={40}
                    height={40}
                    className="rounded-full shrink-0 w-10 h-10 object-cover"
                />
            )}
            <div className="flex-1 space-y-4">
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    <div>
                        {currentUser && (
                            <p className="font-medium text-sm mb-2">{currentUser.fullName}</p>
                        )}
                        <Textarea
                            placeholder={placeholder}
                            className="min-h-[100px] resize-none bg-background focus-visible:ring-primary/20"
                            {...register("content")}
                            autoFocus={autoFocus}
                        />
                        {errors.content && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.content.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Đang gửi..." : submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CommentContent: React.FC<{ content: string; limit?: number }> = ({ content, limit = 300 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = content.length > limit;

    const displayContent = isExpanded ? content : content.slice(0, limit);

    return (
        <div className="inline-block">
            <p className="text-[15px] text-foreground/90 leading-snug whitespace-pre-wrap break-words inline">
                {displayContent}
                {!isExpanded && shouldTruncate && "..."}
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[14px] font-semibold text-foreground/60 hover:underline transition-all ml-1"
                >
                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
            )}
        </div>
    );
};

const CommentItem: React.FC<{
    comment: Comment;
    currentUser?: CurrentUser;
    likes: Record<string, number>;
    replyingToId: string | null;
    onToggleLike: (id: string) => void;
    onReplyClick: (id: string) => void;
    onReplySubmit: (parentId: string, content: string) => Promise<void>;
    onCancelReply: () => void;
    depth?: number;
}> = ({
    comment,
    currentUser,
    likes,
    replyingToId,
    onToggleLike,
    onReplyClick,
    onReplySubmit,
    onCancelReply,
    depth = 0,
}) => {
        const [sessionLikes, setSessionLikes] = useState<Set<string>>(new Set());

        const toggleLike = (id: string) => {
            onToggleLike(id);
            setSessionLikes(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        };

        const hasLiked = sessionLikes.has(comment.id) || (comment.likes || 0) > 0;

        return (
            <div className={cn("relative", depth === 1 && "ml-12 md:ml-12 mt-2")}>
                {/* Vertical connector line for replies - stays behind everything */}
                {depth === 0 && comment.replies && comment.replies.length > 0 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-[2.5px] bg-slate-200 dark:bg-slate-700" />
                )}

                {/* If we have a replyingToId, the line should extend to the form at the bottom */}
                {depth === 0 && replyingToId === comment.id && !comment.replies?.length && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-[2.5px] bg-slate-200 dark:bg-slate-700" />
                )}

                <div className="flex items-start gap-2 relative group mb-1">
                    {/* Elbow connector for replies */}
                    {depth > 0 && (
                        <div className="absolute -left-[21px] top-0 w-5 h-5 border-l-[2.5px] border-b-[2.5px] border-slate-200 dark:border-slate-700 rounded-bl-[12px]" />
                    )}

                    <Image
                        src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            comment.user?.fullName || comment.author || "User"
                        )}&background=random`}
                        alt={comment.user?.fullName || comment.author || "User"}
                        width={depth > 0 ? 32 : 40}
                        height={depth > 0 ? 32 : 40}
                        className={cn("rounded-full shrink-0 object-cover z-10 bg-background", depth > 0 ? "w-8 h-8" : "w-10 h-10")}
                    />

                    <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-[13px] text-slate-900 dark:text-slate-100 hover:underline cursor-pointer">
                                {comment.user?.fullName || comment.author || "Người dùng Wishzy"}
                            </p>
                            <span className="text-[11px] text-muted-foreground/40 font-medium whitespace-nowrap">
                                {comment.createdAt ? format(new Date(comment.createdAt.replace(' ', 'T')), "dd/MM/yyyy HH:mm") : "Vừa xong"}
                            </span>
                        </div>

                        <div className="relative group/content flex items-center gap-2 max-w-full">
                            <div className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                                <CommentContent content={comment.content} />
                            </div>

                            {/* Minimalist Reactions */}
                            {((comment.likes || 0) + (sessionLikes.has(comment.id) ? 1 : 0)) > 0 && (
                                <div className="flex items-center gap-0.5 ml-2 bg-slate-50 dark:bg-slate-800 rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-75 duration-200">
                                    <div className="bg-[#EE2339] rounded-full p-0.5">
                                        <Heart className="w-2 h-2 fill-white text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                        {(comment.likes || 0) + (sessionLikes.has(comment.id) ? 1 : 0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[12px] font-bold text-muted-foreground/60 transition-colors">
                            <button
                                onClick={() => toggleLike(comment.id)}
                                className={cn("hover:text-slate-900 dark:hover:text-slate-100", hasLiked && "text-[#EE2339]")}
                            >
                                Thích
                            </button>

                            <button
                                onClick={() => onReplyClick(comment.id)}
                                className="hover:text-slate-900 dark:hover:text-slate-100"
                            >
                                Trả lời
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub-tree: includes replies AND the reply form if active */}
                <div className="relative">
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-2">
                            {comment.replies.map((reply, idx) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUser={currentUser}
                                    likes={likes}
                                    replyingToId={replyingToId}
                                    onToggleLike={onToggleLike}
                                    onReplyClick={onReplyClick}
                                    onReplySubmit={onReplySubmit}
                                    onCancelReply={onCancelReply}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}

                    {/* Reply Form integrated into the line system */}
                    {replyingToId === comment.id && (
                        <div className={cn("relative ml-10 md:ml-12 mt-2 pb-2")}>
                            {/* Elbow for reply box */}
                            <div className="absolute -left-[21px] top-0 w-5 h-5 border-l-[2.5px] border-b-[2.5px] border-slate-200 dark:border-slate-700 rounded-bl-[12px]" />

                            <div className="flex gap-2 items-start">
                                <Image
                                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || "User")}&background=random`}
                                    alt="User"
                                    width={24}
                                    height={24}
                                    className="rounded-full shrink-0 w-6 h-6 mt-1 object-cover"
                                />
                                <div className="flex-1">
                                    <CommentForm
                                        onSubmit={async (data) =>
                                            onReplySubmit(comment.id, data.content)
                                        }
                                        currentUser={currentUser}
                                        defaultValue={`@${comment.user?.fullName || comment.author || "User"} `}
                                        placeholder={`Trả lời ${comment.user?.fullName || "bình luận này"}...`}
                                        submitLabel="Gửi"
                                        autoFocus
                                        onCancel={onCancelReply}
                                        hideAvatar
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };


const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentMap: Record<string, Comment> = {};
    const tree: Comment[] = [];

    // First pass: create copies and initialize empty replies arrays
    flatComments.forEach(comment => {
        // Create a new object to avoid mutating the original
        commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: build the tree
    flatComments.forEach(comment => {
        const mappedComment = commentMap[comment.id];
        if (comment.parentId && commentMap[comment.parentId]) {
            // It's a reply, add it to parent's replies
            const parent = commentMap[comment.parentId];
            if (!parent.replies?.find(r => r.id === comment.id)) {
                parent.replies?.push(mappedComment);
            }
        } else if (!comment.parentId) {
            // It's a root comment
            tree.push(mappedComment);
        }
    });

    // If initialComments were already nested, they might have replies not in the flat list
    // We should preserve those if realCommentsData is not yet loaded
    if (tree.length === 0 && flatComments.length > 0) {
        return flatComments;
    }

    return tree;
};

const countCommentsRecursive = (nodes: any[]): number => {
    let total = 0;
    nodes.forEach(node => {
        total += 1;
        if (node.replies && node.replies.length > 0) {
            total += countCommentsRecursive(node.replies);
        }
    });
    return total;
};

const Comments: React.FC<CommentsProps> = ({ comments: initialComments, blogId }) => {
    const { user: currentUser } = useAppStore();
    const { openLoginModal } = useAuthModalStore();

    const { data: realCommentsData } = useCommentBlogList(blogId, { limit: 100 });

    // Use helper to build tree if data is flat (initialComments) or just use nested items from real-time query
    const rawComments = [...(realCommentsData?.items || initialComments)].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const comments = buildCommentTree(rawComments);

    // Calculate total count (recursive because comments tree is nested)
    const totalCount = realCommentsData?.pagination?.totalItems || countCommentsRecursive(comments);

    const { mutateAsync: createComment } = useCreateCommentBlog();
    const { mutate: toggleLike } = useToggleLikeCommentBlog(blogId);

    const [replyingToId, setReplyingToId] = useState<string | null>(null);

    const handleMainSubmit = async (data: { content: string }) => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        await createComment({
            content: data.content,
            blogId,
        });
    };

    const handleReplySubmit = async (parentId: string, content: string) => {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        await createComment({
            content,
            blogId,
            parentId,
        });
        setReplyingToId(null);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2">
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                    Bình luận ({totalCount})
                </h3>
            </div>

            {/* Main Comment Form */}
            <div className="bg-background">
                {currentUser ? (
                    <CommentForm onSubmit={handleMainSubmit} currentUser={currentUser ?? undefined} />
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed rounded-xl text-center space-y-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <MessageSquare className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-slate-900">Bạn muốn tham gia thảo luận?</h4>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Vui lòng đăng nhập tài khoản để để lại bình luận và trao đổi với mọi người.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                className="font-semibold shadow-lg shadow-primary/20"
                                onClick={openLoginModal}
                            >
                                Đăng nhập ngay
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Comments List */}
            {!comments?.length ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser ?? undefined}
                            likes={{}}
                            replyingToId={replyingToId}
                            onToggleLike={(id) => toggleLike(id)}
                            onReplyClick={(id) => {
                                if (!currentUser) {
                                    openLoginModal();
                                    return;
                                }
                                setReplyingToId(id);
                            }}
                            onReplySubmit={handleReplySubmit}
                            onCancelReply={() => setReplyingToId(null)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;
