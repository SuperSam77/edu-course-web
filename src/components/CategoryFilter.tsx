
import { useEffect, useState } from 'react';
import { executeQuery } from '@/utils/db';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface CategoryFilterProps {
  onCategoryChange: (categoryId: number | undefined) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const results = await executeQuery<Category[]>('SELECT * FROM Categories');
        setCategories(results);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
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
