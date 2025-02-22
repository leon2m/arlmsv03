import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, assignmentService } from '@/services/assignmentService';
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
import { Calendar, Clock, FileText } from 'lucide-react';

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        if (user?.id) {
          const userAssignments = await assignmentService.getUserAssignments(user.id);
          setAssignments(userAssignments);
        }
      } catch (error) {
        console.error('Ödevler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'submitted':
        return 'secondary';
      case 'graded':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'submitted':
        return 'Gönderildi';
      case 'graded':
        return 'Notlandırıldı';
      default:
        return status;
    }
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
        <h1 className="text-3xl font-bold">Ödevlerim</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant={getStatusColor(assignment.status)}>
                  {getStatusText(assignment.status)}
                </Badge>
                {assignment.grade && (
                  <Badge variant="outline">
                    Not: {assignment.grade}/100
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2">{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Teslim: {new Date(assignment.due_date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(assignment.due_date).getTime() - new Date().getTime() > 0
                        ? 'Kalan: ' + Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' gün'
                        : 'Süresi Doldu'}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                  variant={assignment.status === 'graded' ? 'outline' : 'default'}
                >
                  {assignment.status === 'graded' ? 'Geri Bildirimi Gör' : 'Ödeve Git'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
