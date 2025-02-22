import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, examService } from '@/services/examService';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Award } from 'lucide-react';

export const Exams: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (user?.id) {
          const userQuizzes = await examService.getUserQuizzes(user.id);
          setQuizzes(userQuizzes);
        }
      } catch (error) {
        console.error('Sınavlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  const isQuizAvailable = (quiz: Quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.available_from);
    const endDate = new Date(quiz.available_until);
    return now >= startDate && now <= endDate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sınavlarım</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => {
          const isAvailable = isQuizAvailable(quiz);
          return (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant={isAvailable ? 'success' : 'secondary'}>
                    {isAvailable ? 'Aktif' : 'Yakında'}
                  </Badge>
                  <Badge variant="outline">
                    {quiz.time_limit_minutes} Dakika
                  </Badge>
                </div>
                <CardTitle className="mt-2">{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Başlangıç: {new Date(quiz.available_from).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Bitiş: {new Date(quiz.available_until).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm mb-4">
                    <Award className="w-4 h-4 mr-2" />
                    <span>Geçme Notu: {quiz.passing_score}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/exams/${quiz.id}`)}
                    disabled={!isAvailable}
                  >
                    {isAvailable ? 'Sınava Başla' : 'Henüz Aktif Değil'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};