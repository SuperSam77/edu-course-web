
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { executeQuery } from '@/utils/db';
import { Course } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  user_name: string;
  course_title: string;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    image_url: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch data for dashboard
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch courses
        const coursesResult = await executeQuery<Course[]>(`
          SELECT c.*, u.name AS author_name 
          FROM Courses c
          JOIN Users u ON c.created_by = u.id
          ORDER BY c.created_at DESC
        `);
        setCourses(coursesResult);

        // Fetch users
        const usersResult = await executeQuery<User[]>(`
          SELECT id, name, email, role FROM Users
        `);
        setUsers(usersResult);

        // Fetch enrollments with user and course names
        const enrollmentsResult = await executeQuery<Enrollment[]>(`
          SELECT e.*, u.name as user_name, c.title as course_title
          FROM Enrollments e
          JOIN Users u ON e.user_id = u.id
          JOIN Courses c ON e.course_id = c.id
          ORDER BY e.enrolled_at DESC
        `);
        setEnrollments(enrollmentsResult);

        // Fetch categories
        const categoriesResult = await executeQuery<Category[]>(`
          SELECT * FROM Categories
        `);
        setCategories(categoriesResult);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      }
    };

    fetchDashboardData();
  }, [user, isAdmin]);

  const handleCreateCourse = async () => {
    if (!user) return;
    
    // Validate course data
    if (!newCourse.title.trim()) {
      toast({
        title: 'Error',
        description: 'Course title is required',
        variant: 'destructive'
      });
      return;
    }

    if (!newCourse.description.trim()) {
      toast({
        title: 'Error',
        description: 'Course description is required',
        variant: 'destructive'
      });
      return;
    }

    if (newCourse.price < 0) {
      toast({
        title: 'Error',
        description: 'Price cannot be negative',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingCourse(true);

    try {
      // Insert the course
      const courseResult = await executeQuery(`
        INSERT INTO Courses (title, description, price, image_url, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        newCourse.title,
        newCourse.description,
        newCourse.price,
        newCourse.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop',
        user.id
      ]);

      // @ts-ignore - MySQL insert result structure
      const courseId = courseResult.insertId;

      // Insert course categories
      if (selectedCategories.length > 0) {
        for (const categoryId of selectedCategories) {
          await executeQuery(`
            INSERT INTO Course_Categories (course_id, category_id)
            VALUES (?, ?)
          `, [courseId, categoryId]);
        }
      }

      // Log admin action
      await executeQuery(`
        INSERT INTO Admin_Actions (admin_id, action, action_date)
        VALUES (?, ?, NOW())
      `, [user.id, `Created course: ${newCourse.title}`]);

      toast({
        title: 'Success',
        description: 'Course created successfully'
      });

      // Reset form and fetch updated courses
      setNewCourse({
        title: '',
        description: '',
        price: 0,
        image_url: ''
      });
      setSelectedCategories([]);

      // Refresh courses list
      const coursesResult = await executeQuery<Course[]>(`
        SELECT c.*, u.name AS author_name 
        FROM Courses c
        JOIN Users u ON c.created_by = u.id
        ORDER BY c.created_at DESC
      `);
      setCourses(coursesResult);
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: 'Failed to create course',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-6">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="addCourse">Add Course</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">Courses</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell>{course.id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.author_name}</TableCell>
                      <TableCell>${course.price}</TableCell>
                      <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={user.role === 'admin' ? 'text-primary font-medium' : ''}>
                          {user.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="enrollments" className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">Enrollments</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map(enrollment => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{enrollment.id}</TableCell>
                      <TableCell>{enrollment.user_name}</TableCell>
                      <TableCell>{enrollment.course_title}</TableCell>
                      <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="addCourse" className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newCourse.title} 
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                    placeholder="Course title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={newCourse.price.toString()} 
                    onChange={e => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  value={newCourse.image_url} 
                  onChange={e => setNewCourse({...newCourse, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newCourse.description} 
                  onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Course description"
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`category-${category.id}`} 
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`category-${category.id}`} className="font-normal">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                className="mt-4" 
                onClick={handleCreateCourse}
                disabled={isCreatingCourse}
              >
                {isCreatingCourse ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
