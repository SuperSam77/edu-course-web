
import { supabase, Course, Category } from '@/lib/supabase';

export async function fetchCourses(categoryId?: number): Promise<Course[]> {
  try {
    let query = supabase
      .from('courses')
      .select(`
        *,
        users:created_by (name)
      `);
    
    if (categoryId) {
      // First get all course_ids for the given category
      const { data: courseCategories } = await supabase
        .from('course_categories')
        .select('course_id')
        .eq('category_id', categoryId);
      
      if (courseCategories && courseCategories.length > 0) {
        const courseIds = courseCategories.map(cc => cc.course_id);
        query = query.in('id', courseIds);
      } else {
        // No courses in this category
        return [];
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
    
    // Transform the data to match the expected format
    return data.map(course => ({
      ...course,
      author_name: course.users?.name || 'Unknown'
    })) as Course[];
  } catch (error) {
    console.error('Error in fetchCourses:', error);
    return [];
  }
}

export async function fetchCourseById(id: number): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        users:created_by (name)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching course by id:', error);
      return null;
    }
    
    return {
      ...data,
      author_name: data.users?.name || 'Unknown',
    } as Course;
  } catch (error) {
    console.error('Error in fetchCourseById:', error);
    return null;
  }
}

export async function fetchCourseCategories(courseId: number): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('course_categories')
      .select('categories:category_id(*)')
      .eq('course_id', courseId);
      
    if (error || !data) {
      console.error('Error fetching course categories:', error);
      return [];
    }
    
    // Properly cast and extract the category data
    return data.map(item => item.categories as Category);
  } catch (error) {
    console.error('Error in fetchCourseCategories:', error);
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data as Category[];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
  }
}

export async function createCourse(courseData: Partial<Course>, categoryIds: number[]): Promise<number | null> {
  try {
    // Insert the course
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select('id')
      .single();
      
    if (error || !data) {
      console.error('Error creating course:', error);
      return null;
    }

    const courseId = data.id;
    
    // Associate course with categories
    if (categoryIds.length > 0) {
      const categoryMappings = categoryIds.map(categoryId => ({
        course_id: courseId,
        category_id: categoryId
      }));
      
      const { error: mapError } = await supabase
        .from('course_categories')
        .insert(categoryMappings);
        
      if (mapError) {
        console.error('Error mapping course to categories:', mapError);
      }
    }
    
    return courseId;
  } catch (error) {
    console.error('Error in createCourse:', error);
    return null;
  }
}

export async function updateCourse(
  courseId: number, 
  courseData: Partial<Course>, 
  categoryIds?: number[]
): Promise<boolean> {
  try {
    // Update the course
    const { error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId);
      
    if (error) {
      console.error('Error updating course:', error);
      return false;
    }
    
    // Update categories if provided
    if (categoryIds) {
      // First delete existing mappings
      await supabase
        .from('course_categories')
        .delete()
        .eq('course_id', courseId);
        
      // Then insert new mappings
      if (categoryIds.length > 0) {
        const categoryMappings = categoryIds.map(categoryId => ({
          course_id: courseId,
          category_id: categoryId
        }));
        
        const { error: mapError } = await supabase
          .from('course_categories')
          .insert(categoryMappings);
          
        if (mapError) {
          console.error('Error remapping course categories:', mapError);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateCourse:', error);
    return false;
  }
}

export async function deleteCourse(courseId: number): Promise<boolean> {
  try {
    // Delete course-category mappings first (foreign key constraint)
    await supabase
      .from('course_categories')
      .delete()
      .eq('course_id', courseId);
      
    // Delete enrollments (foreign key constraint)
    await supabase
      .from('enrollments')
      .delete()
      .eq('course_id', courseId);
      
    // Delete payments (foreign key constraint)
    await supabase
      .from('payments')
      .delete()
      .eq('course_id', courseId);
      
    // Finally delete the course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
      
    if (error) {
      console.error('Error deleting course:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    return false;
  }
}

export async function enrollInCourse(userId: string, courseId: number, price: number): Promise<boolean> {
  try {
    // Create enrollment record
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString()
      });
      
    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      return false;
    }
    
    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: price,
        payment_status: 'completed',
        payment_date: new Date().toISOString()
      });
      
    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    return false;
  }
}

export async function checkEnrollment(userId: string, courseId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
      
    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkEnrollment:', error);
    return false;
  }
}
