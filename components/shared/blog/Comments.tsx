"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageSquare, Heart, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const commentSchema = z.object({
    content: z.string().min(1, "Vui lòng nhập nội dung bình luận"),
});

interface Comment {
    id: string;
    author: string;
    date: string;
    content: string;
    avatar?: string;
    likes?: number;
}

interface CommentsProps {
    comments: Comment[];
}

const Comments: React.FC<CommentsProps> = ({ comments }) => {
    const [commentLikes, setCommentLikes] = useState<Record<string, number>>(
        () => Object.fromEntries(comments.map((c) => [c.id, c.likes ?? 0]) ?? [])
    );
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

    const toggleLike = (id: string) => {
        setCommentLikes((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) + 1,
        }));
    };

    const onSubmit = async (data: { content: string }) => {
        try {
            setIsSubmitting(true);
            // TODO: Replace with your actual API call
            console.log("New comment:", data.content);
            // Reset form after successful submission
            reset();
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <div className="bg-muted/50 p-4 rounded-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Textarea
                            placeholder="Viết bình luận của bạn..."
                            className="min-h-[100px]"
                            {...register("content")}
                        />
                        {errors.content && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.content.message}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            {!comments?.length ? (
                <p className="text-muted-foreground text-center py-8">
                    Chưa có bình luận nào.
                </p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b pb-6 last:border-none">
                            <div className="flex items-center gap-3 mb-2">
                                <Image
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        comment.author
                                    )}&background=random`}
                                    alt={comment.author}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <div>
                                    <p className="font-medium">{comment.author}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {comment.date}
                                    </p>
                                </div>
                            </div>

                            <p className="text-muted-foreground pl-[52px] mb-3">
                                {comment.content}
                            </p>

                            <div className="flex items-center gap-4 pl-[52px] text-sm">
                                <button
                                    onClick={() => toggleLike(comment.id)}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition"
                                >
                                    <Heart className="w-4 h-4" />
                                    {commentLikes[comment.id] ?? 0}
                                </button>

                                <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition">
                                    <Reply className="w-4 h-4" />
                                    Trả lời
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;