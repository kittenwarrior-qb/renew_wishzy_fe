"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";

interface ErrorStateProps {
  error: Error | unknown;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {translate("errorLoading")}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {error instanceof Error
            ? error.message
            : translate("errorLoading")}
        </p>
      </CardContent>
    </Card>
  );
};

