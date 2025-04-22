import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  fetchCourseById, 
  fetchCourseCategories,
  enrollInCourse,
  checkEnrollment
} from '@/services/courseService';
import { Course, Category } from '@/lib/supabase';

const CourseDetail = () => {
  const { id } = useParams();
  const courseId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseData = await fetchCourseById(courseId);

        if (!courseData) {
          navigate('/courses');
          return;
        }

        setCourse(courseData);

        // Fetch categories for this course
        const categoriesData = await fetchCourseCategories(courseId);
        setCategories(categoriesData);

        // Check if user is enrolled
        if (user) {
          const enrolled = await checkEnrollment(user.id, courseId);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, user, navigate]);

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to enroll in courses',
        variant: 'default'
      });
      navigate('/login');
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      const success = await enrollInCourse(user.id, courseId, course.price);
      
      if (success) {
        setIsEnrolled(true);
        toast({
          title: 'Enrollment successful',
          description: `You are now enrolled in "${course.title}"`,
        });
      } else {
        throw new Error('Enrollment failed');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Enrollment failed',
        description: 'An error occurred while enrolling in this course',
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="flex justify-end">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <div className="mt-2 flex items-center space-x-1">
                <p className="text-sm text-gray-700">
                  Created by <span className="font-medium">{course.author_name}</span>
                </p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mt-8 rounded-lg overflow-hidden">
              <img 
                src={course.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop'} 
                alt={course.title} 
                className="w-full h-auto object-cover rounded-lg" 
              />
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this course</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {course.description}
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg border p-6 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-4">
                ${course.price}
              </div>
              
              {isEnrolled ? (
                <div>
                  <Button className="w-full mb-4" variant="outline" disabled>
                    Already Enrolled
                  </Button>
                  <Button className="w-full">
                    Go to Course Content
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Processing...' : 'Enroll Now'}
                </Button>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">This course includes:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Full lifetime access</li>
                  <li>• Access on mobile and desktop</li>
                  <li>• Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
