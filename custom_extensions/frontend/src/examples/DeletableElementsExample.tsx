import React from 'react';
import DeletableDiv from '../components/DeletableDiv';
import DeletableWrapper from '../components/DeletableWrapper';
import { useDeletableElements } from '../hooks/useDeletableElements';

interface CourseItem {
  id: string;
  title: string;
  description: string;
  price: string;
}

const DeletableElementsExample: React.FC = () => {
  const {
    elements: courses,
    addElement,
    removeElement,
    updateElement
  } = useDeletableElements<CourseItem>([
    { id: '1', title: 'Course 1', description: 'Description 1', price: '$100' },
    { id: '2', title: 'Course 2', description: 'Description 2', price: '$200' },
    { id: '3', title: 'Course 3', description: 'Description 3', price: '$300' }
  ]);

  const handleDeleteCourse = (courseId: string) => {
    removeElement(courseId);
  };

  const handleAddCourse = () => {
    const newCourse: CourseItem = {
      id: Date.now().toString(),
      title: `Course ${courses.length + 1}`,
      description: `Description ${courses.length + 1}`,
      price: `$${(courses.length + 1) * 100}`
    };
    addElement(newCourse);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Deletable Elements Examples</h1>
      
      {/* Example 1: Simple DeletableDiv */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Example 1: Simple DeletableDiv</h2>
        <DeletableDiv
          onDelete={() => alert('Simple div deleted!')}
          className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300"
        >
          <p>This is a simple deletable div. Hover to see the delete button!</p>
        </DeletableDiv>
      </div>

      {/* Example 2: DeletableWrapper with different positions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Example 2: DeletableWrapper with different positions</h2>
        <div className="grid grid-cols-2 gap-4">
          <DeletableWrapper
            deleteButtonPosition="top-right"
            onDelete={() => alert('Top-right deleted!')}
            className="p-4 bg-green-100 rounded-lg border-2 border-green-300"
          >
            <p>Delete button: Top-right</p>
          </DeletableWrapper>
          
          <DeletableWrapper
            deleteButtonPosition="top-left"
            onDelete={() => alert('Top-left deleted!')}
            className="p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300"
          >
            <p>Delete button: Top-left</p>
          </DeletableWrapper>
        </div>
      </div>

      {/* Example 3: Dynamic list with delete functionality */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Example 3: Dynamic Course List</h2>
        <button
          onClick={handleAddCourse}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Course
        </button>
        
        <div className="space-y-2">
          {courses.map((course) => (
            <DeletableWrapper
              key={course.id}
              onDelete={() => handleDeleteCourse(course.id)}
              className="p-4 bg-gray-100 rounded-lg border"
              deleteButtonSize="sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>
                <span className="font-bold text-green-600">{course.price}</span>
              </div>
            </DeletableWrapper>
          ))}
        </div>
      </div>

      {/* Example 4: Custom styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Example 4: Custom Styling</h2>
        <DeletableWrapper
          onDelete={() => alert('Custom styled deleted!')}
          className="p-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl"
          deleteButtonClassName="bg-black hover:bg-gray-800"
          deleteButtonSize="lg"
        >
          <h3 className="text-xl font-bold">Custom Styled Card</h3>
          <p>This card has custom styling for the delete button!</p>
        </DeletableWrapper>
      </div>

      {/* Example 5: Without confirmation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Example 5: No Confirmation</h2>
        <DeletableWrapper
          onDelete={() => alert('Deleted without confirmation!')}
          confirmDelete={false}
          className="p-4 bg-red-100 rounded-lg border-2 border-red-300"
        >
          <p>This item deletes immediately without confirmation!</p>
        </DeletableWrapper>
      </div>
    </div>
  );
};

export default DeletableElementsExample;
