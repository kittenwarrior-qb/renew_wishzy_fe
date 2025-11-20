import React from "react";
import { QuizCard } from "@/components/quiz/quiz-card";

const fakeQuizzes = [
  {
    id: "0a71ec6a-9774-4a36-ac19-410d01a3c032",
    title: "Kiểm tra kiến thức JavaScript cơ bản",
    description: "Bài kiểm tra về các khái niệm cơ bản trong JavaScript như biến, hàm, vòng lặp và điều kiện.",
    questionCount: 10,
    timeLimit: 15,
  },
  {
    id: "0a71ec6a-9774-4a36-ac19-410d01a3c032",
    title: "React Hooks và State Management",
    description: "Đánh giá hiểu biết về React Hooks, useState, useEffect và quản lý state trong ứng dụng React.",
    questionCount: 15,
    timeLimit: 20,
  },
  {
    id: "0a71ec6a-9774-4a36-ac19-410d01a3c032",
    title: "TypeScript Advanced",
    description: "Kiểm tra kiến thức nâng cao về TypeScript: Generics, Utility Types, và Type Guards.",
    questionCount: 12,
    timeLimit: 25,
  },
  {
    id: "0a71ec6a-9774-4a36-ac19-410d01a3c032",
    title: "CSS và Responsive Design",
    description: "Bài test về CSS Flexbox, Grid, và các kỹ thuật tạo giao diện responsive.",
    questionCount: 8,
    timeLimit: 10,
  },
  {
    id: "0a71ec6a-9774-4a36-ac19-410d01a3c032",
    title: "Node.js và Express",
    description: "Kiểm tra kiến thức về backend với Node.js, Express framework và RESTful API.",
    questionCount: 20,
    timeLimit: 30,
  },
  {
    id: "0a71ec6a-9774-4a36-ac19-410d01a3c032",
    title: "Database và SQL",
    description: "Đánh giá kỹ năng làm việc với database, viết query SQL và tối ưu hóa truy vấn.",
    questionCount: 18,
    timeLimit: 25,
  },
];

export const QuizSection: React.FC = () => {
  return (
    <section className="py-12">
      <div className="max-w-[1300px] mx-auto px-4 pt-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bài kiểm tra</h2>
          <p className="text-muted-foreground">
            Chọn một bài kiểm tra để bắt đầu thử thách bản thân
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fakeQuizzes.map((quiz, index) => (
            <QuizCard
              key={`${quiz.id}-${index}`}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description}
              questionCount={quiz.questionCount}
              timeLimit={quiz.timeLimit}
            />
          ))}
        </div>
      </div>
    </section>
  );
};