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

const commentSchema = z.object({
    content: z.string().min(1, "Vui lòng nhập nội dung bình luận"),
});

export interface Comment {
    id: string;
    author: string;
    date: string;
    content: string;
    avatar?: string;
    likes?: number;
    replies?: Comment[];
}

export interface CurrentUser {
    name: string;
    avatar?: string;
}

interface CommentsProps {
    comments: Comment[];
    // currentUser is now fetched from store
}

interface CommentFormProps {
    onSubmit: (data: { content: string }) => Promise<void>;
    currentUser?: CurrentUser;
    placeholder?: string;
    submitLabel?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
    onSubmit,
    currentUser,
    placeholder = "Viết bình luận của bạn...",
    submitLabel = "Gửi bình luận",
    autoFocus = false,
    onCancel,
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
            content: "",
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
            currentUser?.name || "User"
        )}&background=random`;

    return (
        <div className="flex gap-4">
            <Image
                src={avatarUrl}
                alt={currentUser?.name || "User"}
                width={40}
                height={40}
                className="rounded-full shrink-0 w-10 h-10 object-cover"
            />
            <div className="flex-1 space-y-4">
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    <div>
                        {currentUser && (
                            <p className="font-medium text-sm mb-2">{currentUser.name}</p>
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
        return (
            <div className={cn("space-y-4", depth > 0 && "ml-12 mt-4")}>
                <div className="flex items-start gap-3">
                    <Image
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            comment.author
                        )}&background=random`}
                        alt={comment.author}
                        width={40}
                        height={40}
                        className="rounded-full shrink-0 w-10 h-10 object-cover"
                    />
                    <div className="flex-1 space-y-2">
                        <div className="bg-muted/30 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-sm">{comment.author}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {comment.date}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                {comment.content}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 px-2 text-xs font-medium text-muted-foreground">
                            <button
                                onClick={() => onToggleLike(comment.id)}
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            >
                                <Heart className={cn("w-3.5 h-3.5", likes[comment.id] && "fill-current text-red-500")} />
                                {likes[comment.id] ?? 0} Thích
                            </button>

                            <button
                                onClick={() => onReplyClick(comment.id)}
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                                <Reply className="w-3.5 h-3.5" />
                                Trả lời
                            </button>
                        </div>

                        {replyingToId === comment.id && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <CommentForm
                                    onSubmit={async (data) =>
                                        onReplySubmit(comment.id, data.content)
                                    }
                                    currentUser={currentUser}
                                    placeholder={`Trả lời ${comment.author}...`}
                                    submitLabel="Trả lời"
                                    autoFocus
                                    onCancel={onCancelReply}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="relative">
                        {/* Line connector for replies */}
                        {depth === 0 && (
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50 -z-10" />
                        )}
                        {comment.replies.map((reply) => (
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
            </div>
        );
    };

const Comments: React.FC<CommentsProps> = ({ comments }) => {
    const { user: currentUser } = useAppStore();
    const { openLoginModal } = useAuthModalStore();

    const [commentLikes, setCommentLikes] = useState<Record<string, number>>(() =>
        Object.fromEntries(comments.map((c) => [c.id, c.likes ?? 0]) ?? [])
    );
    const [replyingToId, setReplyingToId] = useState<string | null>(null);

    const toggleLike = (id: string) => {
        setCommentLikes((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) + 1,
        }));
    };

    const handleMainSubmit = async (data: { content: string }) => {
        // TODO: Replace with your actual API call for main comment
        console.log("New main comment:", data.content);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    const handleReplySubmit = async (parentId: string, content: string) => {
        // TODO: Replace with your actual API call for reply
        console.log(`New reply to ${parentId}:`, content);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setReplyingToId(null);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-2xl md:text-3xl font-bold">
                    Bình luận ({comments.length})
                </h3>
            </div>

            {/* Main Comment Form */}
            <div className="bg-background">
                {currentUser ? (
                    <CommentForm onSubmit={handleMainSubmit} currentUser={currentUser} />
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
                            <Button variant="outline" className="font-semibold">
                                Đăng ký
                            </Button>
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
                            currentUser={currentUser}
                            likes={commentLikes}
                            replyingToId={replyingToId}
                            onToggleLike={toggleLike}
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
