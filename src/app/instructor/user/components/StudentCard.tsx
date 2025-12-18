"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, BookOpen, Eye } from "lucide-react";
import type { Student } from "@/types/user";

interface StudentCardProps {
  student: Student;
  onSelect: (student: Student) => void;
}

export const StudentCard = ({ student, onSelect }: StudentCardProps) => {
  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20"
      onClick={() => onSelect(student)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {student.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Joined on{" "}
                {new Date(student.joinDate).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(student);
            }}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{student.phone}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <BookOpen className="mr-1.5 h-4 w-4" />
              Enrolled Courses
            </div>
            <Badge variant="secondary" className="text-xs">
              {student.courses.length}{" "}
              {student.courses.length === 1 ? "course" : "courses"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {student.courses
              .slice(0, 2)
              .map((course: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs font-normal bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  {course}
                </Badge>
              ))}
            {student.courses.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{student.courses.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

