import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, courseService } from '@/services/courseService';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award } from 'lucide-react';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!user?.id) {
          throw new Error('Kullanıcı kimliği bulunamadı');
        }
        
        const userCourses = await courseService.getUserCourses(user.id);
        setCourses(userCourses);
        setError(null);
      } catch (err) {
        console.error('Kurslar yüklenirken hata:', err);
        setError('Kurslar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kurslarım</h1>
        <Button onClick={() => navigate('/courses/browse')}>
          Yeni Kurs Keşfet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant={course.level === 'beginner' ? 'default' : course.level === 'intermediate' ? 'secondary' : 'destructive'}>
                  {course.level === 'beginner' ? 'Başlangıç' : course.level === 'intermediate' ? 'Orta Seviye' : 'İleri Seviye'}
                </Badge>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              <CardTitle className="mt-2">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>12 Ders</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>6 Saat</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Sertifika</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>İlerleme</span>
                    <span>%65</span>
                  </div>
                  <Progress value={65} />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  Kursa Devam Et
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};