
import { mockUsers, mockCourses, mockCategories, mockCoursesCategories, mockEnrollments, mockPayments } from './mockData';

// Simulate database operations with mock data
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  console.log('Mock DB Query:', query);
  console.log('Parameters:', params);
  
  // Simulate query execution delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Handle different types of queries
  if (query.includes('FROM Categories')) {
    return mockCategories as unknown as T;
  }
  
  if (query.includes('FROM Courses c') || query.includes('Courses c')) {
    let results = [...mockCourses];
    
    // Filter by category if needed
    if (query.includes('cc.category_id = ?') && params.length > 0) {
      const categoryId = params[0];
      const coursesInCategory = mockCoursesCategories
        .filter(cc => cc.category_id === categoryId)
        .map(cc => cc.course_id);
      
      results = results.filter(course => coursesInCategory.includes(course.id));
    }
    
    // Filter by course ID if needed
    if (query.includes('c.id = ?') && params.length > 0) {
      const courseId = params[0];
      results = results.filter(course => course.id === courseId);
    }
    
    return results as unknown as T;
  }
  
  if (query.includes('FROM Enrollments')) {
    let results = [...mockEnrollments];
    
    // Filter enrollments if needed
    if (query.includes('user_id = ? AND course_id = ?') && params.length === 2) {
      results = results.filter(
        enrollment => enrollment.user_id === params[0] && enrollment.course_id === params[1]
      );
    }
    
    return results as unknown as T;
  }
  
  if (query.includes('cat.id, cat.name') && query.includes('JOIN Course_Categories')) {
    const courseId = params[0];
    const categoriesForCourse = mockCoursesCategories
      .filter(cc => cc.course_id === courseId)
      .map(cc => cc.category_id);
    
    const results = mockCategories.filter(cat => categoriesForCourse.includes(cat.id));
    return results as unknown as T;
  }
  
  // Handle INSERT operations
  if (query.includes('INSERT INTO Enrollments')) {
    const [userId, courseId] = params;
    const newId = mockEnrollments.length + 1;
    const newEnrollment = {
      id: newId,
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString()
    };
    mockEnrollments.push(newEnrollment);
    return [{ insertId: newId }] as unknown as T;
  }
  
  if (query.includes('INSERT INTO Payments')) {
    const [userId, courseId, amount, status] = params;
    const newId = mockPayments.length + 1;
    const newPayment = {
      id: newId,
      user_id: userId,
      course_id: courseId,
      amount,
      payment_status: status,
      payment_date: new Date().toISOString()
    };
    mockPayments.push(newPayment);
    return [{ insertId: newId }] as unknown as T;
  }
  
  // Default fallback
  return [] as unknown as T;
}

export default {
  query: (query: string, params: any[] = []): Promise<any> => {
    return executeQuery(query, params);
  }
};
