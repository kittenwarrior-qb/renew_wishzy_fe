"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";

export const LoadingState = () => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">{translate("loading")}</p>
      </CardContent>
    </Card>
  );
};

