"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Student } from "@/types/user";

interface StudentProfileProps {
  student: Student;
}

export const StudentProfile = ({ student }: StudentProfileProps) => {
  const displayName = student.fullName || student.name
  
  return (
    <div className="flex flex-col items-center md:items-start space-y-4 md:min-w-[200px]">
      <Avatar className="h-28 w-28 ring-4 ring-primary/10">
        <AvatarImage src={student.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
          {displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center md:text-left">
        <h3 className="text-2xl font-bold mb-1">{displayName}</h3>
        <p className="text-sm text-muted-foreground">
          Student ID: #{student.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

