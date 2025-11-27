"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </CardContent>
    </Card>
  );
};

