
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CourseGrid } from '@/components/CourseGrid';
import { CategoryFilter } from '@/components/CategoryFilter';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mt-8">
              Browse Our Courses
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Discover high-quality courses across various categories to enhance your skills and advance your career.
            </p>
          </div>
          
          <CategoryFilter onCategoryChange={setSelectedCategory} />
          
          <CourseGrid categoryId={selectedCategory} />
        </div>
      </div>
    </div>
  );
};

export default Courses;
