
# E-Learning Platform with Supabase Backend

This project is a complete e-learning platform with admin functionality to manage courses, categories, and users.

## Features

- User authentication (signup, login, logout)
- Course browsing and filtering by categories
- Course enrollment with payment simulation
- Admin dashboard to manage courses, users, and enrollments
- CRUD operations for courses (Create, Read, Update, Delete)

## Setup Instructions

### 1. Create a Supabase Project

1. Sign up at [Supabase](https://supabase.com) and create a new project
2. Note down your project URL and anon key (public)

### 2. Set up Environment Variables

Create a `.env` file in the root of your project with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create tables
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE course_categories (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE (course_id, category_id)
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description)
VALUES 
  ('Web Development', 'Learn to build websites and web applications'),
  ('Mobile Development', 'Build apps for iOS and Android'),
  ('Data Science', 'Learn data analysis and machine learning'),
  ('Design', 'Master UI/UX and graphic design'),
  ('Business', 'Entrepreneurship and business skills');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
-- Users table policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all user data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a trigger to automatically create a user entry when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Make the first user an admin (use after creating your first user)
-- UPDATE users SET role = 'admin' WHERE id = 'your-user-id';
```

### 4. Create an Admin User

1. Sign up through the application's signup page
2. Go to your Supabase dashboard > SQL Editor and run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Replace `'your-admin-email@example.com'` with the email you used during signup.

### 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:5173` and login with your admin account to access the admin dashboard.

## Technology Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Authentication, Database)
- Shadcn UI Components

## License

MIT
