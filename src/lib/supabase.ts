import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase URL
const supabaseUrl = 'https://tflsdkrbeaicubiwkyrq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Tables = {
  users: User;
  courses: Course;
  categories: Category;
  course_categories: CourseCategory;
  enrollments: Enrollment;
  payments: Payment;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  created_by: string;
  created_at: string;
  author_name?: string;
};

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type CourseCategory = {
  id: number;
  course_id: number;
  category_id: number;
};

export type Enrollment = {
  id: number;
  user_id: string;
  course_id: number;
  enrolled_at: string;
};

export type Payment = {
  id: number;
  user_id: string;
  course_id: number;
  amount: number;
  payment_status: string;
  payment_date: string;
};
