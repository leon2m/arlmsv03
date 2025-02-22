import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Home,
  LayoutDashboard,
  BookOpen,
  FileText,
  FileQuestion,
  ScrollText,
  Calendar,
  MessageSquare,
  FolderOpen,
  Users,
  Library,
  Microscope,
  MonitorPlay,
  Headphones,
  Rocket,
  UserPlus,
  BarChart,
  Code2,
  FileSpreadsheet,
  Share2,
  Globe2,
  Palette,
  Wrench,
  Database,
  Lightbulb,
  Network,
  ChevronRight,
  Menu,
  Bell,
  ChevronDown,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { SectionCard } from '@/components/Settings/SectionCard';

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  path: string;
  color: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 'courses', title: 'Kurslarım', icon: BookOpen, path: '/courses', color: 'text-blue-500', badge: 12 },
  { id: 'assignments', title: 'Ödevler', icon: FileText, path: '/assignments', color: 'text-purple-500', badge: 5 },
  { id: 'exams', title: 'Sınavlar', icon: FileQuestion, path: '/exams', color: 'text-red-500', badge: 3 },
  { id: 'certificates', title: 'Sertifikalar', icon: ScrollText, path: '/certificates', color: 'text-green-500', badge: 8 },
  { id: 'calendar', title: 'Takvim', icon: Calendar, path: '/calendar', color: 'text-yellow-500', badge: 4 },
  { id: 'messages', title: 'Mesajlar', icon: MessageSquare, path: '/messages', color: 'text-pink-500', badge: 15 },
  { id: 'resources', title: 'Kaynaklar', icon: FolderOpen, path: '/resources', color: 'text-orange-500', badge: 25 },
  { id: 'meetings', title: 'Toplantılar', icon: Users, path: '/meetings', color: 'text-teal-500', badge: 2 },
  { id: 'library', title: 'Dijital Kütüphane', icon: Library, path: '/library', color: 'text-indigo-500', badge: 150 },
  { id: 'labs', title: 'Sanal Laboratuvarlar', icon: Microscope, path: '/labs', color: 'text-cyan-500', badge: 8 },
  { id: 'webinars', title: 'Webinarlar', icon: MonitorPlay, path: '/webinars', color: 'text-rose-500', badge: 6 },
  { id: 'podcasts', title: 'Eğitim Podcastleri', icon: Headphones, path: '/podcasts', color: 'text-amber-500', badge: 45 },
  { id: 'projects', title: 'Proje Çalışmaları', icon: Rocket, path: '/projects', color: 'text-lime-500', badge: 10 },
  { id: 'mentorship', title: 'Mentörlük', icon: UserPlus, path: '/mentorship', color: 'text-emerald-500', badge: 3 },
  { id: 'analytics', title: 'Analitik Raporlar', icon: BarChart, path: '/analytics', color: 'text-sky-500', badge: 12 },
  { id: 'coding', title: 'Kod Örnekleri', icon: Code2, path: '/coding', color: 'text-violet-500', badge: 89 },
  { id: 'spreadsheets', title: 'Çalışma Dokümanları', icon: FileSpreadsheet, path: '/spreadsheets', color: 'text-fuchsia-500', badge: 34 },
  { id: 'collaboration', title: 'İş Birliği Alanı', icon: Share2, path: '/collaboration', color: 'text-blue-600', badge: 7 },
  { id: 'global', title: 'Global Öğrenme', icon: Globe2, path: '/global', color: 'text-purple-600', badge: 15 },
  { id: 'design', title: 'Tasarım Galerisi', icon: Palette, path: '/design', color: 'text-pink-600', badge: 28 },
  { id: 'tools', title: 'Öğrenme Araçları', icon: Wrench, path: '/tools', color: 'text-orange-600', badge: 19 },
  { id: 'database', title: 'Bilgi Bankası', icon: Database, path: '/database', color: 'text-teal-600', badge: 56 },
  { id: 'ideas', title: 'Fikir Havuzu', icon: Lightbulb, path: '/ideas', color: 'text-yellow-600', badge: 42 },
  { id: 'network', title: 'Öğrenci Ağı', icon: Network, path: '/network', color: 'text-green-600', badge: 234 }
];

const navigation = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    id: 'courses',
    title: 'Kurslar',
    icon: BookOpen,
    children: [
      { id: 'my-courses', title: 'Kurslarım', href: '/my-courses' },
      { id: 'course-catalog', title: 'Kurs Kataloğu', href: '/courses' },
      { id: 'learning-paths', title: 'Öğrenme Yolları', href: '/learning-paths' }
    ]
  },
  {
    id: 'analytics',
    title: 'Analitik',
    icon: BarChart,
    children: [
      { id: 'progress', title: 'İlerleme', href: '/analytics/progress' },
      { id: 'performance', title: 'Performans', href: '/analytics/performance' },
      { id: 'engagement', title: 'Katılım', href: '/analytics/engagement' }
    ]
  },
  {
    id: 'communication',
    title: 'İletişim',
    icon: MessageSquare,
    children: [
      { id: 'messages', title: 'Mesajlar', href: '/messages' },
      { id: 'notifications', title: 'Bildirimler', href: '/notifications' },
      { id: 'announcements', title: 'Duyurular', href: '/announcements' }
    ]
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    icon: Palette,
    children: [
      { id: 'profile', title: 'Profil', href: '/settings/profile' },
      { id: 'preferences', title: 'Tercihler', href: '/settings/preferences' },
      { id: 'security', title: 'Güvenlik', href: '/settings/security' }
    ]
  }
];

const menuItems2 = [
  { path: '/', icon: <Home />, title: 'Ana Sayfa' },
  { path: '/users', icon: <Users />, title: 'Kullanıcılar' },
  { path: '/courses', icon: <BookOpen />, title: 'Kurslar' },
  { path: '/analytics', icon: <BarChart />, title: 'Analizler' },
  { path: '/settings', icon: <Palette />, title: 'Ayarlar' },
];

const layoutImages = {
  logo: "https://arlearning.com.tr/uploads/img/general/1732669625-AR%20(1500%20x%20313%20piksel)%20(3).png", // Modern, minimalist eğitim logosu
  companyLogo: "https://arlearning.com.tr/uploads/img/general/1732669625-AR%20(1500%20x%20313%20piksel)%20(3).png", // Şirket logosu
  userAvatar: "https://i.hizliresim.com/iq1bbwi.jpg" // Profesyonel avatar
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Yeni Kurs Talebi',
      message: 'İleri Seviye AI Kursu için yeni talep',
      time: '5 dakika önce',
      unread: true
    },
    {
      id: 2,
      title: 'Sistem Güncellemesi',
      message: 'Platform güncellemesi tamamlandı',
      time: '1 saat önce',
      unread: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Ahmet Yılmaz',
      content: 'Eğitim materyalleri hazır mı?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      unread: true
    },
    {
      id: 2,
      sender: 'Ayşe Demir',
      content: 'Sınav sonuçları ne zaman açıklanacak?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      unread: true
    }
  ]);

  const helpTopics = [
    {
      title: 'Eğitim Nasıl Oluşturulur?',
      content: 'Eğitim oluşturmak için Eğitim İçerik Yönetimi menüsüne gidin ve "Yeni Eğitim" butonuna tıklayın.'
    },
    {
      title: 'Sertifika Nasıl Verilir?',
      content: 'Sertifikalar menüsünden "Yeni Sertifika" oluştur butonuna tıklayarak sertifika verebilirsiniz.'
    },
    {
      title: 'Kullanıcı Nasıl Eklenir?',
      content: 'Kullanıcılar menüsünden "Yeni Kullanıcı" butonuna tıklayarak veya Excel listesi ile toplu kullanıcı ekleyebilirsiniz.'
    }
  ];

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [themeColor, setThemeColor] = useState('indigo');

  const [userRole, setUserRole] = useState<'user' | 'admin' | 'superadmin'>('user');

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // Edit mode'u tüm uygulamaya yayalım
    document.body.classList.toggle('dashboard-edit-mode');
  };

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    // Tema rengini CSS değişkenlerine uygulayalım
    document.documentElement.style.setProperty('--primary-color', `var(--${color}-600)`);
    document.documentElement.style.setProperty('--primary-light', `var(--${color}-400)`);
    document.documentElement.style.setProperty('--primary-dark', `var(--${color}-800)`);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNavigation = (href: string) => {
    if (!href) return;
    
    setIsLoading(true);
    navigate(href);
    setIsMobileMenuOpen(false);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      console.log('Logging out...');
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  const handleMessageClick = (messageId: number) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, unread: false } : msg
    ));
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleSubmenu = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const filteredNavigation = navigation.filter(item => {
    if (item.superAdminOnly && userRole !== 'superadmin') return false;
    if (item.adminOnly && userRole !== 'admin' && userRole !== 'superadmin') return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo ve Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && <img src={layoutImages.logo} alt="Logo" className="h-8" />}
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Ana Menü */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredNavigation.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => item.children && toggleSubmenu(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
                {!isCollapsed && item.children && (
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      activeMenu === item.id ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {!isCollapsed && item.children && activeMenu === item.id && (
                <div className="bg-gray-50 py-2">
                  {item.children.map((child) => (
                    <div key={child.id}>
                      <Link
                        to={child.href}
                        className="flex items-center pl-12 pr-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <child.icon size={16} className="mr-3" />
                        <span>{child.title}</span>
                      </Link>
                      {child.children && activeMenu === item.id && (
                        <div className="pl-16">
                          {child.children.map((subChild) => (
                            <Link
                              key={subChild.id}
                              to={subChild.href}
                              className="flex items-center py-2 text-sm text-gray-500 hover:text-blue-600"
                            >
                              <span>{subChild.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} />
                {!isCollapsed && <span>{item.title}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* Alt Menü */}
        <div className="border-t p-4">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-red-600">
            <LogOut size={20} />
            {!isCollapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
            </div>
          </div>
        {children}
      </main>
    </div>
  );
};