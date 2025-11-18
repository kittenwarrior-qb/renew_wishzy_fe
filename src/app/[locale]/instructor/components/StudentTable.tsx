"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Phone } from "lucide-react";
import type { Student } from "@/types/user";
import { useTranslations } from "@/providers/TranslationProvider";

interface StudentTableProps {
  students: Student[];
  onViewDetails: (student: Student) => void;
}

export const StudentTable = ({ students, onViewDetails }: StudentTableProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (students.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                {translate("student")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                {translate("email")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                {translate("phone")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                {translate("joinDate")}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground whitespace-nowrap">
                {translate("status")}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground whitespace-nowrap">
                {translate("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y bg-background">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {student.name}
                      </div>
                      {student.fullName !== student.name && (
                        <div className="text-xs text-muted-foreground truncate">
                          {student.fullName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm min-w-[200px]">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{student.email}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {student.phone || "—"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(student.joinDate).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>

                <td className="px-6 py-4 text-center">
                  {student.verified ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      {translate("verified")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
                      {translate("notVerified")}
                    </Badge>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(student)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {translate("view")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

