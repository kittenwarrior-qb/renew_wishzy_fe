import * as React from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterType } from "@/src/types/chapter/chapter.types";
import { useTranslations } from "@/providers/TranslationProvider";

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
    const t = useTranslations();
    const translate = (key: string) => t(`courses.${key}`);
    
    return (
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
                                    <span>{lectureCount} {translate("lectureCount")}</span>
                                    {chapterDuration > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>{chapterDuration} {translate("minutes")}</span>
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
                                        <div key={lecture.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-medium truncate">{lecture.name}</span>
                                                    {lecture.isPreview && (
                                                        <button
                                                            className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors w-fit mt-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                console.log('Preview clicked for lecture:', lecture.id);
                                                            }}
                                                        >
                                                            {translate("preview")}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">{lecture.duration} {translate("minutes")}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    {translate("noLectures")}
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    )
}
