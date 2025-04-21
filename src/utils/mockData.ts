
// Mock data that simulates the database
export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    created_at: '2025-01-02T00:00:00Z'
  }
];

export const mockCourses = [
  {
    id: 1,
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React, including components, props, state, and hooks. This comprehensive course will take you from beginner to advanced concepts.',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop',
    created_by: 1,
    created_at: '2025-01-15T00:00:00Z',
    author_name: 'Admin User'
  },
  {
    id: 2,
    title: 'JavaScript for Beginners',
    description: 'Master JavaScript fundamentals with this beginner-friendly course. Explore variables, functions, objects, and more with practical examples.',
    price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop',
    created_by: 1,
    created_at: '2025-01-16T00:00:00Z',
    author_name: 'Admin User'
  },
  {
    id: 3,
    title: 'Advanced CSS Techniques',
    description: 'Take your CSS skills to the next level with advanced layouts, animations, and responsive design techniques for modern web development.',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?auto=format&fit=crop',
    created_by: 1,
    created_at: '2025-01-17T00:00:00Z',
    author_name: 'Admin User'
  },
  {
    id: 4,
    title: 'Full Stack Development',
    description: 'Become a full stack developer by learning both frontend and backend technologies. Build complete web applications from scratch.',
    price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop',
    created_by: 1,
    created_at: '2025-01-18T00:00:00Z',
    author_name: 'Admin User'
  }
];

export const mockCategories = [
  {
    id: 1,
    name: 'Web Development',
    description: 'Courses related to web development technologies'
  },
  {
    id: 2,
    name: 'Mobile Development',
    description: 'Learn to build mobile applications'
  },
  {
    id: 3,
    name: 'Data Science',
    description: 'Learn data analysis and machine learning'
  },
  {
    id: 4,
    name: 'Design',
    description: 'UI/UX and graphic design courses'
  }
];

export const mockCoursesCategories = [
  { id: 1, course_id: 1, category_id: 1 },
  { id: 2, course_id: 2, category_id: 1 },
  { id: 3, course_id: 3, category_id: 1 },
  { id: 4, course_id: 3, category_id: 4 },
  { id: 5, course_id: 4, category_id: 1 },
  { id: 6, course_id: 4, category_id: 3 }
];

export const mockEnrollments = [
  {
    id: 1,
    user_id: 2,
    course_id: 1,
    enrolled_at: '2025-02-01T00:00:00Z'
  }
];

export const mockPayments = [
  {
    id: 1,
    user_id: 2,
    course_id: 1,
    amount: 49.99,
    payment_status: 'completed',
    payment_date: '2025-02-01T00:00:00Z'
  }
];
