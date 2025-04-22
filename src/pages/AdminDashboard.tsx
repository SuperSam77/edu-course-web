import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2 } from 'lucide-react';
import { 
  fetchCourses, 
  fetchCategories, 
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCourseCategories
} from '@/services/courseService';
import { Course, Category, User } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    image_url: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchDashboardData = async () => {
      try {
        const coursesData = await fetchCourses();
        setCourses(coursesData);

        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
          
        if (usersError) throw usersError;
        setUsers(usersData as User[]);

        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
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

  const resetCourseForm = () => {
    setNewCourse({
      title: '',
      description: '',
      price: 0,
      image_url: ''
    });
    setSelectedCategories([]);
    setSelectedCourse(null);
    setEditMode(false);
  };

  const handleCreateOrUpdateCourse = async () => {
    if (!user) return;
    
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

    setIsSubmitting(true);

    try {
      if (editMode && selectedCourse) {
        const success = await updateCourse(
          selectedCourse.id, 
          {
            title: newCourse.title,
            description: newCourse.description,
            price: newCourse.price,
            image_url: newCourse.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop',
          },
          selectedCategories
        );

        if (success) {
          toast({
            title: 'Success',
            description: 'Course updated successfully'
          });
          
          const updatedCourses = await fetchCourses();
          setCourses(updatedCourses);
          resetCourseForm();
        } else {
          throw new Error('Failed to update course');
        }
      } else {
        const courseId = await createCourse(
          {
            title: newCourse.title,
            description: newCourse.description,
            price: newCourse.price,
            image_url: newCourse.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop',
            created_by: user.id,
            created_at: new Date().toISOString()
          },
          selectedCategories
        );

        if (courseId) {
          toast({
            title: 'Success',
            description: 'Course created successfully'
          });
          
          const updatedCourses = await fetchCourses();
          setCourses(updatedCourses);
          resetCourseForm();
        } else {
          throw new Error('Failed to create course');
        }
      }
    } catch (error) {
      console.error('Error creating/updating course:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editMode ? 'update' : 'create'} course`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = async (course: Course) => {
    setEditMode(true);
    setSelectedCourse(course);
    setNewCourse({
      title: course.title,
      description: course.description,
      price: course.price,
      image_url: course.image_url
    });
    
    const courseCategories = await fetchCourseCategories(course.id);
    setSelectedCategories(courseCategories.map(cat => cat.id));
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteCourse(selectedCourse.id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Course deleted successfully'
        });
        
        setCourses(courses.filter(c => c.id !== selectedCourse.id));
        setShowDeleteDialog(false);
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
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
            <TabsTrigger value="addCourse">
              {editMode ? 'Edit Course' : 'Add Course'}
            </TabsTrigger>
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
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
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
                      <TableCell>{user.id.substring(0, 8)}...</TableCell>
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

          <TabsContent value="addCourse" className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? 'Edit Course' : 'Add New Course'}
            </h2>
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
              <div className="flex space-x-4">
                <Button 
                  onClick={handleCreateOrUpdateCourse}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : editMode ? 'Update Course' : 'Create Course'}
                </Button>
                {editMode && (
                  <Button 
                    variant="outline" 
                    onClick={resetCourseForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCourse}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
