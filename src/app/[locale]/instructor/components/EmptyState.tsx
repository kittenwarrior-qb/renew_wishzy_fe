"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";

export const EmptyState = () => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {translate("noStudentsFound")}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {translate("noStudentsFoundDescription")}
        </p>
      </CardContent>
    </Card>
  );
};

