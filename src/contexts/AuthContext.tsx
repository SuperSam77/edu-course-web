
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase, User } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already signed in
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUser(userData as User);
        }
      }
      setLoading(false);
    };

    loadUser();

    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUser(userData as User);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        toast({
          title: 'Login failed',
          description: authError.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Login successful',
        description: `Welcome back!`
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An error occurred during login',
        variant: 'destructive'
      });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        toast({
          title: 'Signup failed',
          description: authError?.message || 'Failed to create account',
          variant: 'destructive'
        });
        return false;
      }

      // Create a profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          role: 'user',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: 'Profile creation failed',
          description: profileError.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Signup successful',
        description: `Welcome, ${name}!`
      });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: 'An error occurred during signup',
        variant: 'destructive'
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out'
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
