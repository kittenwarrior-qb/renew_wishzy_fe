"use client";

import { useTranslations } from "@/providers/TranslationProvider";

interface StudentListHeaderProps {
  instructorName?: string;
  isInstructor?: boolean;
}

export const StudentListHeader = ({
  instructorName,
  isInstructor,
}: StudentListHeaderProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">
        {translate("title")}
      </h1>
      <p className="text-muted-foreground text-sm">
        {translate("description")}
        {isInstructor && instructorName && (
          <span className="ml-2 text-primary font-medium">
            - {instructorName}
          </span>
        )}
      </p>
    </div>
  );
};

