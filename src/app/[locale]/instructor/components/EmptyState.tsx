"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export const EmptyState = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          No Students Found
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          There are no students enrolled in your courses yet.
        </p>
      </CardContent>
    </Card>
  );
};

