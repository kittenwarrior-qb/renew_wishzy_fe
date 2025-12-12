"use client";

interface StudentListHeaderProps {
  instructorName?: string;
  isInstructor?: boolean;
}

export const StudentListHeader = ({
  instructorName,
  isInstructor,
}: StudentListHeaderProps) => {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">
        Overview
      </h1>
    </div>
  );
};

