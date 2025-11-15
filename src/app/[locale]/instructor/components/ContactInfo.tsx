"use client";

import { Mail, Phone, Calendar } from "lucide-react";
import { useTranslations } from "@/providers/TranslationProvider";
import type { Student } from "@/types/user";

interface ContactInfoProps {
  student: Student;
}

export const ContactInfo = ({ student }: ContactInfoProps) => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        {translate("contactInfo")}
      </h4>
      <div className="space-y-3 pl-7">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {translate("email")}
            </p>
            <p className="text-sm font-medium">{student.email}</p>
          </div>

        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {translate("phone")}
            </p>
            <p className="text-sm font-medium">{student.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {translate("joinDate")}
            </p>
            <p className="text-sm font-medium">
              {new Date(student.joinDate).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


