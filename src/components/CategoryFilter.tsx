
import { useEffect, useState } from 'react';
import { fetchCategories } from '@/services/courseService';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category } from '@/lib/supabase';

interface CategoryFilterProps {
  onCategoryChange: (categoryId: number | undefined) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const results = await fetchCategories();
        setCategories(results);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value === 'all' ? undefined : parseInt(value));
  };

  return (
    <div className="mb-6">
      <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full overflow-x-auto">
        <TabsList className="h-auto p-1">
          <TabsTrigger value="all" className="px-4 py-2">
            All Courses
          </TabsTrigger>
          
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={String(category.id)} 
              className="px-4 py-2"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
