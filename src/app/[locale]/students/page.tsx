'use client';

import React, { useState, useTransition } from 'react';

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  courses: string[];
  joinDate: string;
};
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye, Mail, Phone, BookOpen, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from '@/providers/TranslationProvider';

// Mock data - replace with actual API calls in production
const mockStudents = [
  {
    id: 1,
    name: 'Nguyen Van A',
    email: 'vana@example.com',
    phone: '0987654321',
    avatar: '',
    courses: ['Web Development', 'React Native'],
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Tran Thi B',
    email: 'thib@example.com',
    phone: '0912345678',
    avatar: '',
    courses: ['UI/UX Design', 'Figma'],
    joinDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'Le Van C',
    email: 'vanc@example.com',
    phone: '0967890123',
    avatar: '',
    courses: ['Data Science', 'Python'],
    joinDate: '2023-03-10',
  },
];

const StudentsPage = () => {
  const t = useTranslations();
  const translate = (key: string) => t(`students.${key}`);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = mockStudents.filter((student: Student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translate('title')}</h1>
          <p className="text-muted-foreground">
            {translate('description')}
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={translate('searchPlaceholder')}
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {translate('addStudent')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {selectedStudent ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{translate('studentDetails')}</CardTitle>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  {translate('backToList')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedStudent.avatar} />
                    <AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <h4 className="font-medium">{translate('contactInfo')}</h4>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {selectedStudent.email}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {selectedStudent.phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {translate('joinedOn')} {new Date(selectedStudent.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">{translate('enrolledCourses')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.courses.map((course, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{translate('studentList')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{translate('student')}</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{translate('contact')}</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{translate('enrolledCourses')}</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{translate('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">{student.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">{student.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {student.courses.map((course, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right align-middle">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedStudent(student)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">{translate('view')}</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
