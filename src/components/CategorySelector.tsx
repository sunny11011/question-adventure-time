
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getTriviaCategories, TriviaCategory } from '@/services/triviaService';
import { toast } from 'sonner';

type CategorySelectorProps = {
  selectedCategories: number[];
  onCategoriesChange: (categories: number[]) => void;
  disabled?: boolean;
};

const CategorySelector = ({ selectedCategories, onCategoriesChange, disabled }: CategorySelectorProps) => {
  const [categories, setCategories] = useState<TriviaCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const triviaCategories = await getTriviaCategories();
        setCategories(triviaCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load trivia categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  if (loading) {
    return (
      <div>
        <Label className="quiz-label">Categories</Label>
        <div className="text-sm text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <Label className="quiz-label">Select Categories</Label>
      <p className="text-xs text-gray-500 mb-3">
        Choose from trivia categories (select at least one)
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant={selectedCategories.includes(category.id) ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryToggle(category.id)}
            disabled={disabled}
            className="text-xs h-8"
          >
            {category.name}
          </Button>
        ))}
      </div>
      {selectedCategories.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Selected: {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
