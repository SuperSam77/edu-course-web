
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course as SupabaseCourse } from '@/lib/supabase';

// Use the same Course type as defined in supabase.ts
export type Course = SupabaseCourse;

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="course-card">
      <div className="overlay" />
      <img 
        src={course.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop'} 
        alt={course.title} 
        className="course-image"
      />
      <div className="price-tag">${course.price}</div>
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">
            By {course.author_name || 'Instructor'}
          </span>
          <Button asChild size="sm">
            <Link to={`/courses/${course.id}`}>View Course</Link>
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
