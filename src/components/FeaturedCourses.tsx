
import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { fetchCourses } from '@/services/courseService';
import { Course } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      setLoading(true);
      try {
        // Get the latest 4 courses
        const allCourses = await fetchCourses();
        setCourses(allCourses.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Courses
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Our most popular courses, handpicked by our team of experts to help you get started on your learning journey.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden bg-card">
                <Skeleton className="h-48 w-full" />
                <div className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
