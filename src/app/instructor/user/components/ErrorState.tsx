"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: Error | unknown;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Error Loading Students
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {error instanceof Error
            ? error.message
            : "Failed to load students. Please try again."}
        </p>
      </CardContent>
    </Card>
  );
};

