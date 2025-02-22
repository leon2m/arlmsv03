import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { competencyService, CompetencySet } from '@/services/competencyService';
import { initializeUserCompetencies } from '@/services/api';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  BookOpen,
  Award,
  TrendingUp,
  Target,
  Activity,
  Clock,
  Send,
  Star,
  Trophy,
  Zap,
  Book,
  Calendar,
  Users,
  BarChart,
  Sparkles,
  Brain,
  Plus,
  FileText,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Rocket,
  Flag,
  ArrowUp,
  Gift,
  GraduationCap,
  Flame,
  Medal
} from 'lucide-react';
import { PredictiveRecommendations } from '../components/PredictiveRecommendations';
import { userService, analyticsService } from '../services/supabase';
import { COURSE_PLACEHOLDER, CERTIFICATE_PLACEHOLDER } from '../assets/placeholders';
import '../styles/dashboard.css';
import AIChat from '../components/AIChat';
import { ChatBot } from '../components/ChatBot';
import { Line, Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Görseller - Bu kısımda framework ikonlarını güncelleyebilirsiniz
// SVG ikonlar için önerilen kaynaklar:
// - svgrepo.com (ücretsiz, atıf gerektirmez)
// - iconscout.com (ücretli, 3D ikonlar)
// - flaticon.com (ücretsiz, atıf gerektirir)
const images = {
  courses: {
    // Framework ikonları - SVG formatında
    react: "https://www.svgrepo.com/show/452092/react.svg", // React ikonu
    angular: "https://www.svgrepo.com/show/452156/angular.svg", // Angular ikonu
    vue: "https://www.svgrepo.com/show/452130/vue.svg", // Vue.js ikonu
    node: "https://www.svgrepo.com/show/452075/node-js.svg" // Node.js ikonu
  },
  certificates: {
    // Sertifika ikonları - SVG formatında
    webDev: "https://www.svgrepo.com/show/530444/availability.svg", // Web geliştirme ikonu
    mobileDev: "https://www.svgrepo.com/show/530452/mobile-app.svg", // Mobil geliştirme ikonu
    cloudComputing: "https://www.svgrepo.com/show/530438/ddos-protection.svg", // Cloud computing ikonu
    dataScience: "https://www.svgrepo.com/show/530447/all-covered.svg" // Veri bilimi ikonu
  }
};

// ... (diğer kodlar)

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [competencySets, setCompetencySets] = useState<CompetencySet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Örnek aktivite verileri
  const activities = [
    {
      title: 'React.js Kursunu Tamamladı',
      timestamp: '2 saat önce',
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Yeni Rozet Kazandı: TypeScript Master',
      timestamp: '4 saat önce',
      icon: <Medal className="h-4 w-4 text-purple-500" />,
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Node.js Projesine Başladı',
      timestamp: '1 gün önce',
      icon: <Rocket className="h-4 w-4 text-blue-500" />,
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Yeni Hedef: GraphQL Öğrenimi',
      timestamp: '2 gün önce',
      icon: <Target className="h-4 w-4 text-green-500" />,
      iconBg: 'bg-green-100'
    }
  ];

  // Örnek yaklaşan etkinlikler
  const upcomingEvents = [
    {
      title: 'React Workshop',
      date: '24 Şubat 2025',
      icon: <BookOpen className="h-4 w-4 text-blue-500" />,
      iconBg: 'bg-blue-100'
    },
    {
      title: 'TypeScript Webinar',
      date: '26 Şubat 2025',
      icon: <GraduationCap className="h-4 w-4 text-purple-500" />,
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Team Code Review',
      date: '28 Şubat 2025',
      icon: <Users className="h-4 w-4 text-green-500" />,
      iconBg: 'bg-green-100'
    }
  ];

  // Örnek görevler
  const assignedTasks = [
    {
      id: 't1',
      title: 'API Dokümantasyonu',
      description: 'REST API endpoints için Swagger dökümantasyonu hazırla',
      priority: 'high',
      dueDate: '23 Şubat 2025',
      status: 'in-progress',
      tags: ['documentation', 'api']
    },
    {
      id: 't2',
      title: 'Unit Testleri',
      description: 'Yeni eklenen özelliklerin birim testlerini yaz',
      priority: 'medium',
      dueDate: '25 Şubat 2025',
      status: 'todo',
      tags: ['testing', 'quality']
    },
    {
      id: 't3',
      title: 'Code Review',
      description: 'Frontend PR\'larını incele ve geri bildirim ver',
      priority: 'low',
      dueDate: '24 Şubat 2025',
      status: 'todo',
      tags: ['review', 'collaboration']
    }
  ];

  const [stats, setStats] = useState({
    xp: 3750,
    level: 8,
    completedTrainings: 24,
    monthlyCompletions: 6,
    streak: 12,
    longestStreak: 21,
    badges: 15,
    totalHours: 156,
    coursesInProgress: 3,
    certificatesEarned: 8,
    contributions: 45,
    mentoring: {
      sessions: 12,
      rating: 4.8,
      students: 8
    },
    weeklyProgress: {
      target: 10,
      completed: 8,
      efficiency: 85
    },
    skillLevels: {
      frontend: 85,
      backend: 70,
      devops: 65,
      database: 75,
      testing: 80
    }
  });

  // Öğrenme yolu verileri
  const learningPathData = {
    currentCourse: {
      title: 'Advanced React Patterns',
      progress: 75,
      nextLesson: 'Higher Order Components',
      timeSpent: '12.5 saat',
      deadline: '2025-03-01'
    },
    recommendedPaths: [
      {
        title: 'Frontend Architect',
        description: 'Modern frontend mimarisi ve performans optimizasyonu',
        courses: 8,
        duration: '48 saat',
        matchRate: 95
      },
      {
        title: 'Full Stack Developer',
        description: 'Tam yığın web uygulamaları geliştirme',
        courses: 12,
        duration: '72 saat',
        matchRate: 85
      }
    ],
    nextMilestones: [
      {
        title: 'React Performance Expert',
        description: 'React uygulamalarında ileri düzey performans optimizasyonu',
        requiredSkills: ['React', 'Redux', 'Webpack'],
        estimatedTime: '24 saat'
      },
      {
        title: 'Cloud Architecture Specialist',
        description: 'AWS üzerinde ölçeklenebilir uygulamalar tasarlama',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes'],
        estimatedTime: '36 saat'
      }
    ]
  };

  // Grafik verileri
  const skillsData = {
    labels: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Testing', 'DevOps'],
    datasets: [{
      label: 'Yetkinlikler',
      data: [85, 75, 65, 70, 60, 55],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      pointBackgroundColor: '#6366f1'
    }]
  };

  const progressData = {
    labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
    datasets: [{
      label: 'Tamamlanan Eğitimler',
      data: [4, 6, 8, 12, 15, 18],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4
    }]
  };

  const learningStyleData = {
    labels: ['Görsel', 'İşitsel', 'Uygulamalı'],
    datasets: [{
      data: [40, 30, 30],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  };

  // Önerilen kurslar
  const recommendedCourses = [
    {
      id: 'course-001',
      title: 'Advanced React Patterns',
      duration: '6 saat',
      level: 'İleri Seviye',
      match: 95,
      rating: 4.8,
      progress: 85,
      instructor: {
        name: 'Mehmet Yılmaz',
        title: 'Senior React Developer',
        rating: 4.9
      },
      topics: [
        'Higher Order Components',
        'Render Props',
        'Custom Hooks',
        'Performance Optimization'
      ],
      skills: ['React', 'TypeScript', 'Redux'],
      prerequisites: ['React Fundamentals', 'JavaScript ES6+']
    },
    {
      id: 'course-002',
      title: 'TypeScript Best Practices',
      duration: '4 saat',
      level: 'Orta Seviye',
      match: 90,
      rating: 4.7,
      progress: 60,
      instructor: {
        name: 'Ayşe Kara',
        title: 'TypeScript Expert',
        rating: 4.8
      },
      topics: [
        'Advanced Types',
        'Generics',
        'Decorators',
        'Type Guards'
      ],
      skills: ['TypeScript', 'JavaScript'],
      prerequisites: ['JavaScript Fundamentals']
    },
    {
      id: 'course-003',
      title: 'Node.js Performance',
      duration: '5 saat',
      level: 'İleri Seviye',
      match: 85,
      rating: 4.9,
      progress: 40,
      instructor: {
        name: 'Ali Demir',
        title: 'Backend Architect',
        rating: 4.9
      },
      topics: [
        'Memory Management',
        'Clustering',
        'Caching Strategies',
        'Database Optimization'
      ],
      skills: ['Node.js', 'MongoDB', 'Redis'],
      prerequisites: ['Node.js Basics', 'Database Fundamentals']
    }
  ];

  // Başarılar
  const achievements = [
    {
      id: 'achievement-001',
      title: 'Frontend Master',
      description: '100 frontend görevi tamamla',
      progress: 85,
      icon: '🏆',
      criteria: {
        total: 100,
        completed: 85,
        remaining: 15
      },
      rewards: {
        xp: 1000,
        badge: 'Frontend Master',
        certificate: true
      },
      dateStarted: '2025-01-01',
      estimatedCompletion: '2025-03-15'
    },
    {
      id: 'achievement-002',
      title: 'Sürekli Öğrenme',
      description: '30 gün kesintisiz öğrenme',
      progress: 70,
      icon: '🎯',
      criteria: {
        total: 30,
        completed: 21,
        remaining: 9
      },
      rewards: {
        xp: 500,
        badge: 'Learning Streak',
        certificate: false
      },
      dateStarted: '2025-02-01',
      estimatedCompletion: '2025-03-01'
    },
    {
      id: 'achievement-003',
      title: 'Takım Oyuncusu',
      description: '50 yorum yap',
      progress: 90,
      icon: '🌟',
      criteria: {
        total: 50,
        completed: 45,
        remaining: 5
      },
      rewards: {
        xp: 300,
        badge: 'Team Player',
        certificate: false
      },
      dateStarted: '2025-01-15',
      estimatedCompletion: '2025-02-28'
    }
  ];

  // Popüler eğitimler
  const popularCourses = [
    {
      id: 'pop-course-001',
      title: 'React Performance Optimization',
      instructor: 'Mehmet Yılmaz',
      duration: '4 saat',
      rating: 4.9,
      students: 1250,
      image: "https://www.svgrepo.com/show/521303/react-16.svg",
      price: 299,
      level: 'İleri Seviye',
      language: 'Türkçe',
      lastUpdated: '2025-02-15',
      topics: [
        'React.memo',
        'useMemo',
        'useCallback',
        'Code Splitting',
        'Lazy Loading'
      ],
      includes: [
        '4 saat video',
        '15 alıştırma',
        '5 proje',
        'Sertifika'
      ]
    },
    {
      id: 'pop-course-002',
      title: 'TypeScript Advanced Types',
      instructor: 'Ayşe Kara',
      duration: '3.5 saat',
      rating: 4.8,
      students: 980,
      image: "https://www.svgrepo.com/show/342317/typescript.svg",
      price: 249,
      level: 'Orta Seviye',
      language: 'Türkçe',
      lastUpdated: '2025-02-10',
      topics: [
        'Generic Types',
        'Utility Types',
        'Mapped Types',
        'Conditional Types'
      ],
      includes: [
        '3.5 saat video',
        '12 alıştırma',
        '3 proje',
        'Sertifika'
      ]
    },
    {
      id: 'pop-course-003',
      title: 'Node.js Microservices',
      instructor: 'Ali Demir',
      duration: '6 saat',
      rating: 4.7,
      students: 850,
      image: "https://www.svgrepo.com/show/369459/nodejs.svg",
      price: 399,
      level: 'İleri Seviye',
      language: 'Türkçe',
      lastUpdated: '2025-02-01',
      topics: [
        'Microservice Architecture',
        'Docker',
        'Kubernetes',
        'API Gateway'
      ],
      includes: [
        '6 saat video',
        '20 alıştırma',
        '4 proje',
        'Sertifika'
      ]
    },
    {
      id: 'pop-course-003',
      title: 'Advanced Level Python',
      instructor: 'Ramazan Çakıcı',
      duration: '6 saat',
      rating: 4.7,
      students: 1250,
      image: "https://www.svgrepo.com/show/512738/python-127.svg",
      price: 399,
      level: 'İleri Seviye',
      language: 'Türkçe',
      lastUpdated: '2025-02-01',
      topics: [
        'Microservice Architecture',
        'Docker',
        'Kubernetes',
        'API Gateway'
      ],
      includes: [
        '6 saat video',
        '20 alıştırma',
        '4 proje',
        'Sertifika'
      ]
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.id) {
          // Kullanıcı profili verilerini çek
          const { data: profileData, error: profileError } = await userService.getUserProfile(user.id);
          if (profileError) throw profileError;
          setUserProfile(profileData);

          // Kullanıcı istatistiklerini çek
          const { data: statsData, error: statsError } = await analyticsService.getUserStats(user.id);
          if (statsError) throw statsError;
          setStats(statsData);

          // Yetkinlik setlerini çek
          const userCompetencies = await competencyService.getUserCompetencies(user.id);
          setCompetencySets(userCompetencies);

          // Eğer yetkinlik seti yoksa, örnek verileri yükle
          if (!userCompetencies || userCompetencies.length === 0) {
            await initializeUserCompetencies(user.id);
            const initialCompetencies = await competencyService.getUserCompetencies(user.id);
            setCompetencySets(initialCompetencies);
          }
        }
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const filteredCompetencySets = selectedCategory === 'all'
    ? competencySets
    : competencySets.filter(set => set.category === selectedCategory);

  const renderLearningPath = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!userProfile) {
      return (
        <div className="text-center text-red-500 p-4">
          Kullanıcı profili yüklenemedi.
        </div>
      );
    }

    return (
      <div className="container mx-auto p-6">
        {/* Üst kısım */}
        {/* ... */}

        {/* Alt kısım - Öğrenme Yolu */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Öğrenme Yolculuğu</h2>
            <p className="text-sm text-gray-600 mt-2">Öğrenme hedefleriniz ve ilerlemeniz</p>
          </div>

          {/* AI Destekli Öğrenme Asistanı */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Destekli Öğrenme Asistanı</h3>
                  <p className="text-sm text-gray-600">Kişiselleştirilmiş öğrenme önerileri</p>
                </div>
              </div>
              <Badge variant="success" className="bg-green-100 text-green-800">
                Çevrimiçi
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded p-4 shadow-sm">
                <h4 className="font-medium mb-2">AI Önerileri</h4>
                <div className="text-sm text-gray-600">
                  Mevcut yetkinliklerinize göre önerilen hedefler:
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      İleri Seviye React.js
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      TypeScript Best Practices
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Yetkinlik Setleri */}
          <div className="space-y-6">
            {filteredCompetencySets.map((set) => (
              <Card key={set.id} className="border border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {set.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{set.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {set.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {set.competencies?.map((comp) => (
                      <div key={comp.id} className="bg-white rounded-lg p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{comp.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{comp.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {comp.current_score} / {comp.target_score}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Son değerlendirme: {new Date(comp.last_assessment_date || '').toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress 
                            value={(comp.current_score! / comp.max_score) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Başlangıç ({comp.min_score})</span>
                            <span>Hedef ({comp.max_score})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Yeni Hedef Ekleme */}
          <div className="mt-8">
            <Card className="border border-dashed border-gray-300 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input 
                      type="text" 
                      placeholder="Yeni bir hedef ekleyin..." 
                      className="w-full bg-white"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Hedef Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kategori Filtreleri */}
          <div className="mt-6 flex justify-end space-x-2">
            <Badge 
              variant={selectedCategory === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              Tümü
            </Badge>
            <Badge 
              variant={selectedCategory === 'Hard Skills' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedCategory('Hard Skills')}
            >
              Teknik
            </Badge>
            <Badge 
              variant={selectedCategory === 'Soft Skills' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedCategory('Soft Skills')}
            >
              Soft Skills
            </Badge>
            <Badge 
              variant={selectedCategory === 'Leadership' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setSelectedCategory('Leadership')}
            >
              Liderlik
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  const aiSuggestions = [
    {
      id: 'sug-001',
      title: 'İleri Seviye React.js',
      description: 'Modern React patterns ve performans optimizasyonu',
      progress: 45,
      deadline: '2025-03-15',
      type: 'technical',
      priority: 'high',
      estimatedHours: 24,
      prerequisites: ['React Temelleri', 'JavaScript ES6+'],
      resources: [
        { type: 'video', title: 'React Performance Masterclass', duration: '2.5 saat' },
        { type: 'practice', title: 'Real-world Optimization Project', duration: '4 saat' }
      ]
    },
    {
      id: 'sug-002',
      title: 'TypeScript Best Practices',
      description: 'Tip güvenli kod yazma ve mimari tasarım',
      progress: 30,
      deadline: '2025-04-01',
      type: 'technical',
      priority: 'medium',
      estimatedHours: 16,
      prerequisites: ['TypeScript Basics'],
      resources: [
        { type: 'document', title: 'Advanced Types Guide', duration: '1 saat' },
        { type: 'exercise', title: 'Type Challenges', duration: '3 saat' }
      ]
    }
  ];

  const renderAIAssistant = () => {
    return (
      <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Destekli Öğrenme Asistanı</h3>
              <p className="text-sm text-gray-600">Kişiselleştirilmiş öğrenme önerileri</p>
            </div>
          </div>
          <Badge variant="success" className="bg-green-100 text-green-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Çevrimiçi
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Öneriler */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Önerilen Hedefler</h4>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <RefreshCw className="h-4 w-4 mr-1" />
                Yenile
              </Button>
            </div>
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'outline'}>
                    {suggestion.priority === 'high' ? 'Öncelikli' : 'Normal'}
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>İlerleme</span>
                    <span>{suggestion.progress}%</span>
                  </div>
                  <Progress value={suggestion.progress} className="h-2" />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {suggestion.estimatedHours} saat
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Detaylar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ Panel - İstatistikler ve Öneriler */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            {/* Profil Kartı */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userProfile?.avatar_url || ''} />
                    <AvatarFallback>
                      {userProfile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{userProfile?.full_name || 'Kullanıcı'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.title || 'Öğrenci'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Başarılar</p>
                      <p className="text-xs text-muted-foreground">12 Rozet Kazanıldı</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Star className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Seviye</p>
                      <p className="text-xs text-muted-foreground">İleri Düzey</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Öğrenme Süresi</p>
                      <p className="text-xs text-muted-foreground">120 Saat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aktivite Akışı */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivite Akışı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${activity.iconBg}`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Yaklaşan Etkinlikler */}
            <Card>
              <CardHeader>
                <CardTitle>Yaklaşan Etkinlikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${event.iconBg}`}>
                          {event.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const handleUpdateUserName = async () => {
    const result = await updateUserName('Ahmet Yılmaz', 'Ramazan Çakıcı');
    if (result) {
      console.log('Kullanıcı adı başarıyla güncellendi:', result);
    } else {
      console.error('Kullanıcı adı güncellenemedi.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Üst Bar - Logo ve Profil */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src="https://arlearning.com.tr/uploads/img/general/1732669625-AR%20(1500%20x%20313%20piksel)%20(3).png" alt="LMS Logo" className="h-10 w-auto mr-4" />
          <h1 className="text-2xl font-bold text-gray-800">Eğitim Platformu</h1>
        </div>
        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p className="font-semibold">{userProfile?.full_name}</p>
            <p className="text-sm text-gray-600">{userProfile?.title}</p>
          </div>
          <img 
            src="https://i.hizliresim.com/iq1bbwi.jpg"
            alt="Profil" 
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-lg"
          />
        </div>
      </div>

      {/* Üst Bar - Seviye ve Deneyim Puanı Bilgisi */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="level-badge flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Seviye {stats.level}
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-600">Deneyim İlerlemesi</div>
            <div className="flex items-center gap-2">
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500"
                  style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {stats.xp}/{stats.nextLevelXp} DP
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Ara..."
              value={''}
              onChange={(e) => {}}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={''}
            onChange={(e) => {}}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="last7Days">Son 7 Gün</option>
            <option value="last30Days">Son 30 Gün</option>
            <option value="last90Days">Son 90 Gün</option>
          </select>
        </div>
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* XP ve Seviye */}
        <div className="stat-card gradient-bg-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">XP & Seviye</h3>
              <p className="text-3xl font-bold mb-2">{stats.xp} XP</p>
              <p className="text-sm opacity-90">Seviye {stats.level}</p>
            </div>
            <Star className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(stats.xp % 1000) / 10}%` }} />
          </div>
        </div>

        {/* Tamamlanan Eğitimler */}
        <div className="stat-card gradient-bg-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Tamamlanan Eğitimler</h3>
              <p className="text-3xl font-bold mb-2">{stats.completedTrainings}</p>
              <p className="text-sm opacity-90">Bu ay +{stats.monthlyCompletions}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${stats.weeklyProgress}%` }} />
          </div>
        </div>

        {/* Öğrenme Serisi */}
        <div className="stat-card gradient-bg-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Öğrenme Serisi</h3>
              <p className="text-3xl font-bold mb-2">{stats.streak} Gün</p>
              <p className="text-sm opacity-90">En uzun: {stats.longestStreak} gün</p>
            </div>
            <Flame className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(stats.streak / stats.longestStreak) * 100}%` }} />
          </div>
        </div>

        {/* Başarı Rozetleri */}
        <div className="stat-card gradient-bg-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Başarı Rozetleri</h3>
              <p className="text-3xl font-bold mb-2">{stats.badges}</p>
              <p className="text-sm opacity-90">Son: Frontend Master</p>
            </div>
            <Medal className="h-8 w-8 text-white opacity-80" />
          </div>
          <div className="progress-bar">
            <div style={{ width: `${(stats.badges / 20) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Ana Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sol Panel - İstatistikler ve Grafikler */}
        <div className="col-span-8 space-y-6">
          {/* Performans Grafiği */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Öğrenme Performansı</h3>
              <div className="flex gap-2">
                {['Günlük', 'Haftalık', 'Aylık'].map((period) => (
                  <button
                    key={period}
                    className="px-3 py-1 text-sm rounded-full hover:bg-indigo-50 text-indigo-600"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <Line
              data={{
                labels: ['1 Şub', '5 Şub', '10 Şub', '15 Şub', '20 Şub'],
                datasets: [{
                  label: 'Performans',
                  data: [65, 70, 75, 85, 90],
                  borderColor: '#6366f1',
                  tension: 0.4,
                  fill: true,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)'
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>

          {/* Yetkinlik Haritası ve Öğrenme Analizi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
              <h3 className="text-lg font-semibold mb-6">Yetkinlik Haritası</h3>
              <div className="relative h-80">
                <Radar
                  data={skillsData}
                  options={{
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover-card">
              <h3 className="text-lg font-semibold mb-6">Öğrenme Analizi</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Haftalık İlerleme</h4>
                    <p className="text-sm text-gray-600">Son 7 günde 12 saat çalışma</p>
                  </div>
                  <div className="w-32 h-32">
                    <Doughnut
                      data={learningStyleData}
                      options={{
                        cutout: '70%',
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Öğrenme Alışkanlıkları</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium">En Verimli Saat</span>
                      </div>
                      <p className="text-lg font-semibold text-indigo-600">09:00 - 12:00</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Odak Süresi</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">45 dk</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Öğrenme Tarzı Dağılımı</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Görsel Öğrenme</span>
                        <span>40%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>İşitsel Öğrenme</span>
                        <span>30%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uygulamalı Öğrenme</span>
                        <span>30%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sağ Panel - İstatistikler ve Aktiviteler */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Profil Kartı */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userProfile?.avatar_url || ''} />
                  <AvatarFallback>
                    {userProfile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{userProfile?.full_name || 'Kullanıcı'}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.title || 'Öğrenci'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Başarılar</p>
                    <p className="text-xs text-muted-foreground">12 Rozet Kazanıldı</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Star className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Seviye</p>
                    <p className="text-xs text-muted-foreground">İleri Düzey</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Öğrenme Süresi</p>
                    <p className="text-xs text-muted-foreground">120 Saat</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aktivite Akışı */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Akışı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${activity.iconBg}`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Yaklaşan Etkinlikler */}
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Etkinlikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${event.iconBg}`}>
                        {event.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Görev Listesi */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Görevlerim</CardTitle>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col space-y-2 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-red-500'
                              : task.priority === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-medium text-sm">{task.title}</span>
                      </div>
                      <Badge
                        variant={task.status === 'in-progress' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {task.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Son: {task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating ChatBot */}
      <ChatBot />

      {/* Alt Panel - Başarılar ve Rozetler */}
      <div className="mt-6 grid grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div key={achievement.title} className="bg-white p-6 rounded-lg shadow-sm hover-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">{achievement.progress}%</span>
              </div>
            </div>
            <Progress value={achievement.progress} className="h-2" />
          </div>
        ))}
      </div>

      {/* Popüler Eğitimler */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Popüler Eğitimler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCourses.map((course) => (
            <div key={course.title} className="popular-course-card">
              <img src={course.image} alt={course.title} className="w-24 h-24 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{course.instructor}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-600">{course.rating} / 5</span>
                <span className="text-sm text-gray-500">{course.students} öğrenci</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sertifikalar */}
      <h2 className="text-2xl font-bold mb-6"> </h2>
      <h2 className="text-2xl font-bold mb-6">Sertifikalar</h2>
      <div className="flex justify-center mb-8">
        <div className="flex space-x-6 max-w-[1200px]">
          <div className="certificate-card w-72">
            <div className="relative pt-[60%]">
              <img src={images.certificates.webDev} alt="Web Development" className="absolute inset-0 w-full h-full object-contain p-4" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">Web Geliştirme</h3>
              <p className="text-sm text-gray-600 mt-2">Full Stack Developer Sertifikası</p>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">%85 Tamamlandı</span>
                <div className="progress-bar mt-2">
                  <div style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="certificate-card w-72">
            <div className="relative pt-[60%]">
              <img src={images.certificates.mobileDev} alt="Mobile Development" className="absolute inset-0 w-full h-full object-contain p-4" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">Mobil Geliştirme</h3>
              <p className="text-sm text-gray-600 mt-2">Cross-Platform Developer Sertifikası</p>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">%60 Tamamlandı</span>
                <div className="progress-bar mt-2">
                  <div style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="certificate-card w-72">
            <div className="relative pt-[60%]">
              <img src={images.certificates.cloudComputing} alt="Cloud Computing" className="absolute inset-0 w-full h-full object-contain p-4" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">Cloud Computing</h3>
              <p className="text-sm text-gray-600 mt-2">AWS Solutions Architect Sertifikası</p>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">%40 Tamamlandı</span>
                <div className="progress-bar mt-2">
                  <div style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="certificate-card w-72">
            <div className="relative pt-[60%]">
              <img src={images.certificates.dataScience} alt="Data Science" className="absolute inset-0 w-full h-full object-contain p-4" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">Veri Bilimi</h3>
              <p className="text-sm text-gray-600 mt-2">Data Scientist Sertifikası</p>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">%25 Tamamlandı</span>
                <div className="progress-bar mt-2">
                  <div style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Özellikleri */}
      <div className="dashboard-content">
        {/* Öğrenme Yolculuğu */}
        <div className="mt-8 space-y-6">
          {renderLearningPath()}
        </div>
        <Button onClick={handleUpdateUserName}>Kullanıcı Adını Güncelle</Button>
      </div>
    </div>
  );
};