
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { executeQuery } from '@/utils/db';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if the user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real application, use a secure API endpoint for authentication
      const users = await executeQuery<User[]>(
        'SELECT id, name, email, role FROM Users WHERE email = ? AND password = ?', 
        [email, password] // In production, NEVER store plain text passwords
      );
      
      if (users.length === 0) {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
        return false;
      }

      const loggedInUser = users[0];
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${loggedInUser.name}!`
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
      // Check if user already exists
      const existingUsers = await executeQuery<User[]>(
        'SELECT id FROM Users WHERE email = ?', 
        [email]
      );
      
      if (existingUsers.length > 0) {
        toast({
          title: 'Signup failed',
          description: 'Email already in use',
          variant: 'destructive'
        });
        return false;
      }

      // Insert new user
      const result = await executeQuery(
        'INSERT INTO Users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [name, email, password, 'user']
      );

      // @ts-ignore - MySQL insert result structure
      const newUserId = result.insertId;
      
      if (!newUserId) {
        throw new Error('Failed to create user');
      }

      const newUser = {
        id: newUserId,
        name,
        email,
        role: 'user' as const
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
