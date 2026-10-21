import React, { createContext, useState, useEffect, useContext } from 'react';
import { initialUser, initialSubjects, initialActivities, studyStats } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null when logged out, object when logged in
  const [session, setSession] = useState(null);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [activities, setActivities] = useState(initialActivities);
  const [stats, setStats] = useState(studyStats);
  const [currentScreen, setCurrentScreen] = useState('Home'); // Home, Subjects, Upload, Quiz, Profile
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const isSupabaseActive = isSupabaseConfigured();

  // Escuchar cambios de sesión de Supabase al iniciar la app
  useEffect(() => {
    if (!isSupabaseActive) {
      setIsLoadingAuth(false);
      return;
    }

    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Suscripción en tiempo real al estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseActive]);

  // Cargar perfil del estudiante desde la tabla public.profiles
  const fetchUserProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile from Supabase:', error.message);
      }

      const formattedUser = {
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || authUser.user_metadata?.name || 'Estudiante Uniguajira',
        role: profile?.role || authUser.user_metadata?.role || 'Estudiante Universitario',
        institution: profile?.institution || authUser.user_metadata?.institution || 'Universidad de La Guajira',
        career: profile?.career || authUser.user_metadata?.career || 'Ingeniería de Sistemas',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        semester: profile?.semester || '1er Semestre',
        studyStreakDays: profile?.study_streak_days || 1,
        xpPoints: profile?.xp_points || 0,
      };

      setUser(formattedUser);
      await fetchUserSubjects(authUser.id);
    } catch (err) {
      console.warn('Profile fetch exception:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Cargar materias del estudiante desde Supabase
  const fetchUserSubjects = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching subjects:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const formatted = data.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          description: s.description,
          icon: s.icon || 'book-open-page-variant',
          color: s.color || '#6366F1',
          notesCount: s.notes_count || 0,
          progress: s.progress || 0,
          lastActivity: s.last_activity || 'Recién agregada',
        }));
        setSubjects(formatted);
      }
    } catch (err) {
      console.warn('Error loading subjects:', err);
    }
  };

  // Iniciar Sesión (Soporta Supabase y Modo Local de Respaldo)
  const login = async (email, password) => {
    if (isSupabaseActive) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchUserProfile(data.user);
          setCurrentScreen('Home');
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Modo local / demo
    setUser({
      ...initialUser,
      email: email || initialUser.email,
    });
    setCurrentScreen('Home');
    return { success: true };
  };

  // Acceso Rápido Demo
  const loginAsDemo = () => {
    setUser(initialUser);
    setSubjects(initialSubjects);
    setCurrentScreen('Home');
  };

  // Registro de Cuenta
  const register = async ({ name, email, password, role, institution, career }) => {
    if (isSupabaseActive) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              name: name || 'Estudiante',
              role: role || 'Estudiante Universitario',
              institution: institution || 'Universidad de La Guajira',
              career: career || 'Ingeniería de Sistemas',
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchUserProfile(data.user);
          setCurrentScreen('Home');
          return { success: true };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Modo local
    setUser({
      id: `usr_${Date.now()}`,
      name: name || 'Estudiante',
      email: email,
      role: role || 'Estudiante Universitario',
      institution: institution || 'Universidad de La Guajira',
      career: career || 'Ingeniería de Sistemas',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      semester: '1er Semestre',
      studyStreakDays: 1,
    });
    setCurrentScreen('Home');
    return { success: true };
  };

  // Cerrar Sesión
  const logout = async () => {
    if (isSupabaseActive) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setCurrentScreen('Login');
  };

  // Agregar Asignatura
  const addSubject = async (newSubject) => {
    const localSubject = {
      id: `mat_${Date.now()}`,
      notesCount: 0,
      progress: 0,
      lastActivity: 'Recién agregada',
      icon: 'book-open-page-variant',
      color: '#6366F1',
      ...newSubject,
    };

    setSubjects((prev) => [localSubject, ...prev]);

    // Si Supabase está conectado, persistir en la tabla public.subjects
    if (isSupabaseActive && user?.id) {
      try {
        await supabase.from('subjects').insert({
          user_id: user.id,
          name: newSubject.name,
          code: newSubject.code || 'MAT-101',
          description: newSubject.description || '',
          icon: newSubject.icon || 'book-open-page-variant',
          color: newSubject.color || '#6366F1',
          notes_count: 0,
          progress: 0,
          last_activity: 'Recién agregada',
        });
      } catch (err) {
        console.warn('Error saving subject to Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        subjects,
        activities,
        stats,
        currentScreen,
        setCurrentScreen,
        isLoadingAuth,
        isSupabaseActive,
        login,
        loginAsDemo,
        register,
        logout,
        addSubject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
