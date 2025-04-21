
import { useEffect, useState } from 'react';
import { CourseCard, Course } from '@/components/CourseCard';
import { executeQuery } from '@/utils/db';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseGrid({ categoryId }: { categoryId?: number }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let query = `
          SELECT c.*, u.name AS author_name 
          FROM Courses c
          LEFT JOIN Users u ON c.created_by = u.id
        `;
        
        let params: any[] = [];
        
        if (categoryId) {
          query += `
            JOIN Course_Categories cc ON c.id = cc.course_id
            WHERE cc.category_id = ?
          `;
          params.push(categoryId);
        }
        
        query += ' ORDER BY c.created_at DESC';
        
        const results = await executeQuery<Course[]>(query, params);
        setCourses(results);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="p-5">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
        <p className="mt-1 text-sm text-gray-500">Try checking back later for new courses.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
