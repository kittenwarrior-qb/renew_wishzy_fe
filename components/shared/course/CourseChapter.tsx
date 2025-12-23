import * as React from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon, Play, Eye, FileQuestion } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterType } from "@/src/types/chapter/chapter.types";
import { formatDuration } from "@/lib/format-duration";
import { VideoPreviewDialog } from "./VideoPreviewDialog";
import { Button } from "@/components/ui/button";

function CustomAccordionTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                className={cn(
                    "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center gap-2 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                {...props}
            >
                <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
                {children}
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    )
}

export function CourseChapter({ chapters }: { chapters: ChapterType[] }) {
    const [previewVideo, setPreviewVideo] = React.useState<{ url: string; title: string } | null>(null);
    
    return (
        <>
            <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
            >
                {chapters?.map((chapter) => {
                const chapterDuration = chapter.lecture?.reduce((total, lecture) => total + lecture.duration, 0) || chapter.duration || 0;
                const lectureCount = chapter.lecture?.length || 0;
                
                return (
                    <AccordionItem className="py-4" value={chapter.id} key={chapter.id}>
                        <CustomAccordionTrigger className="flex items-center justify-between gap-2">
                            <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{chapter.name}</span>
                                <span className="flex gap-2 text-muted-foreground text-sm">
                                    <span>{lectureCount} bài giảng</span>
                                    {chapterDuration > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>{formatDuration(chapterDuration, 'short')}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                        </CustomAccordionTrigger>
                        <AccordionContent className="flex flex-col gap-2">
                            {chapter.description && (
                                <p className="text-sm text-muted-foreground mb-2 pb-2 border-b">
                                    {chapter.description}
                                </p>
                            )}
                            {chapter.lecture && chapter.lecture.length > 0 ? (
                                chapter.lecture
                                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                    .map((lecture) => (
                                        <div key={lecture.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {lecture.requiresQuiz ? (
                                                    <FileQuestion className="w-4 h-4 text-blue-600 shrink-0" />
                                                ) : (
                                                    <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                                                )}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium truncate">{lecture.name}</span>
                                                        {lecture.requiresQuiz && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Bài kiểm tra
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lecture.isPreview && lecture.fileUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-0 text-xs font-medium  hover:bg-transparent w-fit mt-1 gap-1.5"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewVideo({
                                                                    url: lecture.fileUrl!,
                                                                    title: lecture.name
                                                                });
                                                            }}
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            Xem trước
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground shrink-0 ml-2">
                                                {lecture.requiresQuiz ? 'Bài kiểm tra' : formatDuration(lecture.duration, 'time')}
                                            </span>
                                        </div>
                                    ))
                            ) : (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    Chưa có bài giảng
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
                })}
            </Accordion>
            
            {previewVideo && (
                <VideoPreviewDialog
                    open={!!previewVideo}
                    onOpenChange={(open) => !open && setPreviewVideo(null)}
                    videoUrl={previewVideo.url}
                    title={previewVideo.title}
                />
            )}
        </>
    )
}
