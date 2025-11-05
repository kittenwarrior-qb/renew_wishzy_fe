export type Instructor = {
  id: string;
  name: string;
  title: string; // 职称，如 "Giảng viên cao cấp", "Chuyên gia"
  bio?: string;
  avatar?: string;
  specialties: string[]; // 专业领域
  rating: number;
  totalStudents: number;
  totalCourses: number;
  experience: number; // 经验年数
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
};
