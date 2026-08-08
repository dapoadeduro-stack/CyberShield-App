import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth, UserProfile } from './AuthContext';
import { auth, googleProvider, signInWithPopup, signOut, db, collection, getDocs, query, where, orderBy, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, handleFirestoreError, OperationType } from './firebase';
import { 
  Shield, 
  BookOpen, 
  Trophy, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Award,
  Plus,
  Edit,
  Trash2,
  LayoutDashboard,
  GraduationCap,
  Search,
  X,
  Users,
  BarChart3,
  Layers,
  HelpCircle,
  Check,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Sliders,
  ArrowLeft,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  public props: any;
  public state: any = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-8">The application encountered an unexpected error. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-xl font-bold shadow-lg"
            >
              Return to Safety
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-slate-900 text-slate-100 text-xs rounded-xl overflow-x-auto text-left">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Types ---
interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  points: number;
  createdAt: string;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  quiz?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// --- Components ---

const Navbar = () => {
  const { profile, toggleRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Shield size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">CyberShield</span>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link to="/courses" className="hover:text-indigo-600 transition-colors">Courses</Link>
          <Link 
            to="/admin" 
            className={cn(
              "flex items-center gap-1.5 transition-colors font-medium px-2.5 py-1.5 rounded-lg text-xs",
              profile?.role === 'admin' 
                ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100" 
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            Admin CMS
            {profile?.role === 'admin' && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
          </Link>
        </div>

        <button
          onClick={toggleRole}
          title="Click to toggle between Student and Admin mode"
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm",
            profile?.role === 'admin'
              ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
          )}
        >
          <Shield size={14} className={profile?.role === 'admin' ? "text-purple-600" : "text-slate-400"} />
          <span>{profile?.role === 'admin' ? 'Admin Mode' : 'Student Mode'}</span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-slate-900">{profile?.displayName}</span>
            <span className="text-xs text-slate-500 capitalize">{profile?.level} Level</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const { profile } = useAuth();
  
  const levels = [
    { id: '100', label: '100 Level', desc: 'Fundamentals' },
    { id: '200', label: '200 Level', desc: 'Network Security' },
    { id: '300', label: '300 Level', desc: 'Ethical Hacking' },
    { id: '400', label: '400 Level', desc: 'Advanced Defense' },
    { id: 'professional', label: 'Professional', desc: 'Specializations' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 border-r border-slate-200 p-6 hidden lg:block overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          <GraduationCap size={14} />
          Learning Paths
        </div>
        <div className="space-y-1">
          {levels.map((lvl) => (
            <Link
              key={lvl.id}
              to={`/courses?level=${lvl.id}`}
              className={cn(
                "group flex flex-col p-3 rounded-xl transition-all duration-200",
                profile?.level === lvl.id 
                  ? "bg-white shadow-sm border border-slate-200 text-indigo-600" 
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <span className="font-semibold text-sm">{lvl.label}</span>
              <span className="text-[10px] opacity-60">{lvl.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <Trophy size={20} />
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Points</span>
        </div>
        <div className="text-2xl font-bold">{profile?.points || 0}</div>
        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((profile?.points || 0) / 10, 100)}%` }}
            className="h-full bg-white"
          />
        </div>
        <p className="text-[10px] mt-2 opacity-80">Next rank: Cyber Sentinel</p>
      </div>
    </aside>
  );
};

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-200 p-10 text-center"
      >
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-100">
          <Shield size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">CyberShield Academy</h1>
        <p className="text-slate-500 mb-10">Master the art of digital defense through structured, guided learning paths.</p>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
        
        <p className="mt-8 text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!profile) return;
      setLoading(true);
      const path = 'courses';
      try {
        const q = query(collection(db, path), where('level', '==', profile.level || '100'));
        const snapshot = await getDocs(q);
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [profile]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
        <p className="text-slate-500">You're currently on the <span className="font-semibold text-indigo-600">{profile?.level} Level</span> path.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
            <Link to="/courses" className="text-sm font-semibold text-indigo-600 hover:underline">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />)
            ) : courses.length > 0 ? (
              courses.slice(0, 4).map(course => (
                <Link 
                  key={course.id} 
                  to={`/course/${course.id}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">+{course.points} pts</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                    Start Learning <ChevronRight size={14} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No courses available for your level yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Your Progress</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Modules Completed</span>
                  <span className="font-bold text-slate-900">{profile?.completedModules?.length || 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/3" />
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Award size={16} />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">First Step</p>
                      <p className="text-slate-500">Completed your first module</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const levelFilter = searchParams.get('level') || profile?.level || '100';

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const path = 'courses';
      try {
        const q = query(collection(db, path), where('level', '==', levelFilter));
        const snapshot = await getDocs(q);
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [levelFilter]);

  const filteredCourses = courses.filter(course => {
    const queryStr = searchQuery.toLowerCase().trim();
    if (!queryStr) return true;
    const titleMatch = course.title?.toLowerCase().includes(queryStr);
    const categoryMatch = course.category?.toLowerCase().includes(queryStr);
    const descMatch = course.description?.toLowerCase().includes(queryStr);
    return titleMatch || categoryMatch || descMatch;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-500">Showing modules for <span className="font-semibold text-indigo-600">{levelFilter} Level</span></p>
        </div>

        <div className="relative w-full sm:w-72 md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <Link 
              key={course.id} 
              to={`/course/${course.id}`}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-600 transition-all shadow-sm hover:shadow-md flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">+{course.points} pts</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-grow">{course.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.category || 'General'}</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full p-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? 'No matching courses' : 'No courses found'}
            </h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? `No courses matching "${searchQuery}" were found in ${levelFilter} Level.` 
                : 'Check back later for new content in this level.'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      setLoading(true);
      const coursePath = `courses/${id}`;
      const modulesPath = `courses/${id}/modules`;
      try {
        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
          const modulesSnap = await getDocs(query(collection(db, 'courses', id, 'modules'), orderBy('order')));
          setModules(modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module)));
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        // We don't necessarily want to crash the whole app if one course fails, 
        // but we should log it properly.
        if (error instanceof Error && error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.GET, coursePath);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  if (loading) return <div className="p-12 text-center">Loading course...</div>;
  if (!course) return (
    <div className="p-12 text-center space-y-4">
      <p className="text-red-500 font-bold">Course not found.</p>
      <Link to="/courses" className="text-indigo-600 hover:underline">Back to Courses</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
        <ChevronRight size={16} className="rotate-180" /> Back to Courses
      </Link>

      <header className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest">{course.level} Level</span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-widest">{course.points} Points</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{course.title}</h1>
        <p className="text-lg text-slate-600 leading-relaxed">{course.description}</p>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 px-2">Learning Path</h2>
        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const isCompleted = profile?.completedModules?.includes(mod.id);
            const isLocked = idx > 0 && !profile?.completedModules?.includes(modules[idx-1].id);

            return (
              <div 
                key={mod.id}
                className={cn(
                  "group flex items-center gap-4 p-5 rounded-2xl border transition-all",
                  isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-200",
                  isLocked ? "opacity-60 cursor-not-allowed" : "hover:border-indigo-600 hover:shadow-md cursor-pointer"
                )}
                onClick={() => !isLocked && navigate(`/course/${id}/module/${mod.id}`)}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                  isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                )}>
                  {isCompleted ? <CheckCircle2 size={24} /> : idx + 1}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-xs text-slate-500">Module {idx + 1}</p>
                </div>
                {isLocked ? (
                  <Lock size={20} className="text-slate-300" />
                ) : (
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ModuleDetail = () => {
  const { courseId, moduleId } = useParams();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModule = async () => {
      if (!courseId || !moduleId) return;
      setLoading(true);
      const path = `courses/${courseId}/modules/${moduleId}`;
      try {
        const modDoc = await getDoc(doc(db, 'courses', courseId, 'modules', moduleId));
        if (modDoc.exists()) {
          setModule({ id: modDoc.id, ...modDoc.data() } as Module);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [courseId, moduleId]);

  const handleComplete = async () => {
    if (!profile || !moduleId || !courseId) return;
    
    const path = `users/${profile.uid}`;
    try {
      const isAlreadyCompleted = profile.completedModules.includes(moduleId);
      if (!isAlreadyCompleted) {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        const coursePoints = courseDoc.data()?.points || 0;
        
        await updateDoc(doc(db, 'users', profile.uid), {
          completedModules: [...profile.completedModules, moduleId],
          points: profile.points + (coursePoints / 5)
        });
      }
      navigate(`/course/${courseId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading module...</div>;
  if (!module) return <div className="p-12 text-center text-red-500">Module not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to={`/course/${courseId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
        <ChevronRight size={16} className="rotate-180" /> Back to Course
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-3xl font-bold text-slate-900">{module.title}</h1>
        </div>
        
        <div className="p-8 prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: module.content }} />
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <BookOpen size={18} />
            <span>Read carefully before taking the quiz</span>
          </div>
          <button 
            onClick={() => setShowQuiz(true)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
          >
            Take Module Quiz
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl p-10"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Module Quiz: {module.title}</h2>
              
              <div className="space-y-8">
                {module.quiz?.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-4">
                    <p className="font-bold text-slate-800">{qIdx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <button 
                          key={oIdx}
                          className="p-4 text-left rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium text-slate-700"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setShowQuiz(false)}
                  className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleComplete}
                  className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100"
                >
                  Submit Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminCMS = () => {
  const { profile, toggleRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'analytics'>('courses');

  // Courses & Modules State
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Course Form Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    level: '100',
    category: 'Cyber Security',
    points: 100
  });

  // Module & Quiz State
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    content: '',
    order: 1
  });
  const [moduleQuiz, setModuleQuiz] = useState<QuizQuestion[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  // Users Management State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');

  // Delete Confirmations
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);

  // Fetch Courses
  const fetchCourses = async () => {
    setCoursesLoading(true);
    const path = 'courses';
    try {
      const snapshot = await getDocs(collection(db, path));
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch Modules for a course
  const fetchModules = async (courseId: string) => {
    setModulesLoading(true);
    const path = `courses/${courseId}/modules`;
    try {
      const snapshot = await getDocs(query(collection(db, 'courses', courseId, 'modules'), orderBy('order')));
      setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setModulesLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, path));
      setUsersList(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'analytics') {
      fetchUsers();
    }
  }, [activeTab]);

  // --- Course Handlers ---
  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title || '',
        description: course.description || '',
        level: course.level || '100',
        category: course.category || 'Cyber Security',
        points: course.points || 100
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        description: '',
        level: '100',
        category: 'Cyber Security',
        points: 100
      });
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      // Update existing course
      const path = `courses/${editingCourse.id}`;
      try {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseForm);
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...courseForm } : c));
        setShowCourseModal(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      // Create new course
      const path = 'courses';
      try {
        const docRef = doc(collection(db, path));
        const courseData = {
          ...courseForm,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, courseData);
        setCourses([...courses, { id: docRef.id, ...courseData } as Course]);
        setShowCourseModal(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    const path = `courses/${deletingCourse.id}`;
    try {
      await deleteDoc(doc(db, 'courses', deletingCourse.id));
      setCourses(courses.filter(c => c.id !== deletingCourse.id));
      if (selectedCourse?.id === deletingCourse.id) {
        setSelectedCourse(null);
      }
      setDeletingCourse(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // --- Module Handlers ---
  const handleOpenModuleModal = (mod?: Module) => {
    if (mod) {
      setEditingModule(mod);
      setModuleForm({
        title: mod.title || '',
        content: mod.content || '',
        order: mod.order || 1
      });
      setModuleQuiz(mod.quiz && mod.quiz.length > 0 ? mod.quiz : [
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]);
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        content: '',
        order: modules.length + 1
      });
      setModuleQuiz([
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]);
    }
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    // Filter out empty quiz questions
    const validQuiz = moduleQuiz.filter(q => q.question.trim().length > 0 && q.options.some(o => o.trim().length > 0));

    if (editingModule) {
      // Update module
      const path = `courses/${selectedCourse.id}/modules/${editingModule.id}`;
      try {
        const payload = {
          ...moduleForm,
          quiz: validQuiz
        };
        await updateDoc(doc(db, 'courses', selectedCourse.id, 'modules', editingModule.id), payload);
        setModules(modules.map(m => m.id === editingModule.id ? { ...m, ...payload } : m));
        setShowModuleModal(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      // Create module
      const path = `courses/${selectedCourse.id}/modules`;
      try {
        const docRef = doc(collection(db, 'courses', selectedCourse.id, 'modules'));
        const payload = {
          ...moduleForm,
          courseId: selectedCourse.id,
          quiz: validQuiz
        };
        await setDoc(docRef, payload);
        setModules([...modules, { id: docRef.id, ...payload } as Module]);
        setShowModuleModal(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteModule = async () => {
    if (!selectedCourse || !deletingModule) return;
    const path = `courses/${selectedCourse.id}/modules/${deletingModule.id}`;
    try {
      await deleteDoc(doc(db, 'courses', selectedCourse.id, 'modules', deletingModule.id));
      setModules(modules.filter(m => m.id !== deletingModule.id));
      setDeletingModule(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // --- Quiz Helper Handlers ---
  const handleAddQuizQuestion = () => {
    setModuleQuiz([...moduleQuiz, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setModuleQuiz(moduleQuiz.filter((_, idx) => idx !== index));
  };

  const handleQuizQuestionChange = (index: number, questionText: string) => {
    const updated = [...moduleQuiz];
    updated[index].question = questionText;
    setModuleQuiz(updated);
  };

  const handleQuizOptionChange = (qIndex: number, oIndex: number, optValue: string) => {
    const updated = [...moduleQuiz];
    updated[qIndex].options[oIndex] = optValue;
    setModuleQuiz(updated);
  };

  const handleQuizCorrectAnswerChange = (qIndex: number, correctIdx: number) => {
    const updated = [...moduleQuiz];
    updated[qIndex].correctAnswer = correctIdx;
    setModuleQuiz(updated);
  };

  // --- User Management Handlers ---
  const handleToggleUserRole = async (targetUser: UserProfile) => {
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    const path = `users/${targetUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { role: newRole });
      setUsersList(usersList.map(u => u.uid === targetUser.uid ? { ...u, role: newRole } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleChangeUserLevel = async (targetUser: UserProfile, newLevel: UserProfile['level']) => {
    const path = `users/${targetUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { level: newLevel });
      setUsersList(usersList.map(u => u.uid === targetUser.uid ? { ...u, level: newLevel } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleResetUserProgress = async (targetUser: UserProfile) => {
    if (!confirm(`Are you sure you want to reset points and progress for ${targetUser.displayName}?`)) return;
    const path = `users/${targetUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { points: 0, completedModules: [] });
      setUsersList(usersList.map(u => u.uid === targetUser.uid ? { ...u, points: 0, completedModules: [] } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Filtered Lists
  const filteredCourses = courses.filter(c => {
    const query = courseSearch.toLowerCase();
    return c.title?.toLowerCase().includes(query) || c.category?.toLowerCase().includes(query) || c.level?.toLowerCase().includes(query);
  });

  const filteredUsers = usersList.filter(u => {
    const query = userSearch.toLowerCase();
    const matchesSearch = u.displayName?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Mode Safeguard Banner if not admin
  if (profile?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-3xl border border-purple-200 shadow-xl shadow-purple-50 text-center space-y-6">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Admin Mode Required</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            You are currently viewing the platform in <span className="font-semibold text-slate-700">Student Mode</span>. Enable Admin Mode to edit courses, manage modules, configure quizzes, and assign student levels.
          </p>
        </div>
        <button 
          onClick={toggleRole}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5"
        >
          <Shield size={18} /> Enable Admin Mode Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* CMS Header & Top Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin CMS</h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} /> Active Admin
            </span>
          </div>
          <p className="text-slate-500 text-sm">Create courses, manage interactive module contents, edit quizzes, and manage user roles.</p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all",
              activeTab === 'courses'
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BookOpen size={16} /> Courses & Content
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all",
              activeTab === 'users'
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Users size={16} /> User Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all",
              activeTab === 'analytics'
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BarChart3 size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{courses.length}</h3>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Modules</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{modules.length > 0 ? modules.length : 'Multiple'}</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.length || '—'}</h3>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Admins</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {usersList.filter(u => u.role === 'admin').length || 1}
            </h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
        </div>
      </div>

      {/* TAB 1: COURSES & MODULES */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {!selectedCourse ? (
            /* COURSES TABLE VIEW */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search courses by title, level, category..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  {courseSearch && (
                    <button onClick={() => setCourseSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => handleOpenCourseModal()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-100"
                >
                  <Plus size={18} /> Create New Course
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {coursesLoading ? (
                  <div className="p-12 text-center text-slate-400">Loading courses...</div>
                ) : filteredCourses.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <BookOpen size={40} className="mx-auto text-slate-300" />
                    <p className="text-slate-500 font-medium">No courses found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Course Title</th>
                          <th className="px-6 py-4">Level</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Points</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredCourses.map(course => (
                          <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{course.title}</div>
                              <div className="text-xs text-slate-500 line-clamp-1 max-w-md">{course.description}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100 uppercase">
                                {course.level} Level
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-600">
                              {course.category || 'Cyber Security'}
                            </td>
                            <td className="px-6 py-4 font-bold text-amber-600">
                              +{course.points} pts
                            </td>
                            <td className="px-6 py-4 text-right space-x-1">
                              <button 
                                onClick={() => {
                                  setSelectedCourse(course);
                                  fetchModules(course.id);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                              >
                                Manage Modules
                              </button>
                              <button 
                                onClick={() => handleOpenCourseModal(course)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Course"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => setDeletingCourse(course)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Course"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* MODULES VIEW FOR SELECTED COURSE */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-2"
                  >
                    <ArrowLeft size={14} /> Back to Courses
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCourse.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCourse.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleOpenModuleModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-100"
                  >
                    <Plus size={18} /> Add New Module
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {modulesLoading ? (
                  <div className="p-12 text-center text-slate-400">Loading course modules...</div>
                ) : modules.length === 0 ? (
                  <div className="p-16 text-center space-y-3">
                    <Layers size={48} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">No modules in this course</h3>
                    <p className="text-xs text-slate-500">Click "Add New Module" above to create the first module and quiz questions.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 w-16">Order</th>
                          <th className="px-6 py-4">Module Title</th>
                          <th className="px-6 py-4">Quiz Questions</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {modules.map((mod) => (
                          <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-400">
                              #{mod.order}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">
                              {mod.title}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                                {mod.quiz?.length || 0} Questions
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => handleOpenModuleModal(mod)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Module & Quiz"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => setDeletingModule(mod)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Module"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {userSearch && (
                <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins Only</option>
                <option value="student">Students Only</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {usersLoading ? (
              <div className="p-12 text-center text-slate-400">Loading registered users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No users found matching filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Completed Modules</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName} className="w-9 h-9 rounded-full border border-slate-200" />
                            ) : (
                              <div className="w-9 h-9 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-xs">
                                {u.displayName?.[0] || 'U'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{u.displayName || 'Unnamed User'}</div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider",
                            u.role === 'admin'
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {u.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={u.level || '100'}
                            onChange={(e) => handleChangeUserLevel(u, e.target.value as any)}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value="100">100 Level</option>
                            <option value="200">200 Level</option>
                            <option value="300">300 Level</option>
                            <option value="400">400 Level</option>
                            <option value="professional">Professional</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 font-bold text-amber-600">
                          {u.points || 0} pts
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {u.completedModules?.length || 0} modules
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className={cn(
                              "px-3 py-1.5 font-bold rounded-lg text-xs transition-colors border",
                              u.role === 'admin'
                                ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            )}
                          >
                            {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                          </button>
                          <button
                            onClick={() => handleResetUserProgress(u)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reset Progress"
                          >
                            <RefreshCw size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600" /> Student Level Distribution
              </h3>
              <div className="space-y-3 pt-2">
                {['100', '200', '300', '400', 'professional'].map((lvl) => {
                  const count = usersList.filter(u => (u.level || '100') === lvl).length;
                  const pct = usersList.length ? Math.round((count / usersList.length) * 100) : 0;
                  return (
                    <div key={lvl} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{lvl} Level</span>
                        <span className="text-slate-400">{count} users ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" /> Top Performing Students
              </h3>
              <div className="divide-y divide-slate-100">
                {usersList
                  .sort((a, b) => (b.points || 0) - (a.points || 0))
                  .slice(0, 5)
                  .map((u, i) => (
                    <div key={u.uid} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center",
                          i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        )}>
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.displayName || u.email}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{u.level} Level</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-indigo-600 text-sm">+{u.points || 0} pts</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button onClick={() => setShowCourseModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                <input
                  required
                  placeholder="e.g. Network Penetration Fundamentals"
                  value={courseForm.title}
                  onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea
                  required
                  placeholder="Course summary and objectives..."
                  rows={3}
                  value={courseForm.description}
                  onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Points</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={1000}
                    value={courseForm.points}
                    onChange={e => setCourseForm({ ...courseForm, points: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                <input
                  required
                  placeholder="e.g. Networking, Defensive Security"
                  value={courseForm.category}
                  onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT MODULE & QUIZ BUILDER */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingModule ? 'Edit Module' : 'Add Module'}
                </h2>
                <p className="text-xs text-slate-400">Course: {selectedCourse?.title}</p>
              </div>
              <button onClick={() => setShowModuleModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Module Title</label>
                  <input
                    required
                    placeholder="e.g. Understanding Firewall Rules"
                    value={moduleForm.title}
                    onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order #</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={moduleForm.order}
                    onChange={e => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Module Content (Rich Text)</label>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                  <ReactQuill
                    theme="snow"
                    value={moduleForm.content}
                    onChange={(content) => setModuleForm({ ...moduleForm, content })}
                    className="h-48 mb-12"
                  />
                </div>
              </div>

              {/* QUIZ BUILDER SECTION */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle size={18} className="text-indigo-600" /> Interactive Quiz Questions
                    </h3>
                    <p className="text-xs text-slate-500">Add multiple-choice questions for students to test their knowledge.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuizQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {moduleQuiz.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Question #{qIdx + 1}</span>
                        {moduleQuiz.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(qIdx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Remove Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Enter the question text..."
                        value={q.question}
                        onChange={(e) => handleQuizQuestionChange(qIdx, e.target.value)}
                        className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-semibold"
                      />

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Options (Mark correct answer)</label>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === oIdx}
                              onChange={() => handleQuizCorrectAnswerChange(qIdx, oIdx)}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt}
                              onChange={(e) => handleQuizOptionChange(qIdx, oIdx, e.target.value)}
                              className="flex-1 p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  {editingModule ? 'Save Module Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE COURSE CONFIRMATION */}
      {deletingCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Delete Course?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingCourse.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingCourse(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition-colors"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE MODULE CONFIRMATION */}
      {deletingModule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Delete Module?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete module <span className="font-bold text-slate-800">"{deletingModule.title}"</span>?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingModule(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteModule}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-700 transition-colors"
              >
                Delete Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Seeding Logic ---
const seedInitialData = async () => {
  const path = 'courses';
  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      const initialCourses = [
        {
          title: "Introduction to Cyber Security",
          description: "Learn the core principles of digital security, confidentiality, integrity, and availability.",
          level: "100",
          category: "Fundamentals",
          points: 100,
          createdAt: new Date().toISOString(),
          modules: [
            { title: "The CIA Triad", content: "<h1>The CIA Triad</h1><p>Confidentiality, Integrity, and Availability are the pillars of security...</p>", order: 1 },
            { title: "Common Threats", content: "<h1>Common Threats</h1><p>Phishing, Malware, and Social Engineering...</p>", order: 2 }
          ]
        },
        {
          title: "Network Security Basics",
          description: "Understanding TCP/IP, firewalls, and how to secure a local area network.",
          level: "200",
          category: "Networking",
          points: 200,
          createdAt: new Date().toISOString(),
          modules: [
            { title: "OSI Model Security", content: "<h1>OSI Model</h1><p>Securing each layer of the network stack...</p>", order: 1 }
          ]
        },
        {
          title: "Ethical Hacking & Penetration Testing",
          description: "Learn how to think like a hacker to better defend your systems.",
          level: "300",
          category: "Offensive Security",
          points: 300,
          createdAt: new Date().toISOString(),
          modules: [
            { title: "Reconnaissance", content: "<h1>Reconnaissance</h1><p>Gathering information about a target...</p>", order: 1 }
          ]
        },
        {
          title: "Digital Forensics & Incident Response",
          description: "How to investigate a breach and recover systems after an attack.",
          level: "400",
          category: "Defensive Security",
          points: 400,
          createdAt: new Date().toISOString(),
          modules: [
            { title: "Memory Forensics", content: "<h1>Memory Forensics</h1><p>Analyzing RAM for malicious artifacts...</p>", order: 1 }
          ]
        }
      ];

      for (const course of initialCourses) {
        const { modules, ...courseData } = course;
        const courseRef = doc(collection(db, path));
        await setDoc(courseRef, courseData);
        
        for (const mod of modules) {
          const modRef = doc(collection(db, 'courses', courseRef.id, 'modules'));
          await setDoc(modRef, { ...mod, courseId: courseRef.id });
        }
      }
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    // We don't use handleFirestoreError here to avoid blocking the user's first login experience
    // if seeding fails for some reason (e.g. partial failure).
  }
};

// --- Main App ---

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (user) seedInitialData();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-64 pt-24 p-6 md:p-10 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course/:courseId/module/:moduleId" element={<ModuleDetail />} />
          <Route path="/admin" element={<AdminCMS />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center p-6 text-center">
    <div className="max-w-md">
      <h1 className="text-6xl font-black text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8">The learning path you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
        Go Home
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
