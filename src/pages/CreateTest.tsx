import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useTestStore } from '../store/testStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

interface TestFormData {
  title: string;
  description: string;
  is_public: boolean;
  price: string;
  questions: {
    text: string;
    options: {
      text: string;
      value: string;
    }[];
  }[];
}

const CreateTest: React.FC = () => {
  const { user } = useAuthStore();
  const { createTest, isLoading } = useTestStore();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<TestFormData>({
    defaultValues: {
      title: '',
      description: '',
      is_public: true,
      price: '0',
      questions: [
        {
          text: '',
          options: [
            { text: '', value: '0' },
            { text: '', value: '0' },
          ]
        }
      ]
    }
  });
  
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions'
  });
  
  const onSubmit = async (data: TestFormData) => {
    if (!user) return;
    
    try {
      // Convert string values to appropriate types
      const formattedData = {
        title: data.title,
        description: data.description,
        is_public: data.is_public,
        price: isPaid ? parseFloat(data.price) : null,
        created_by: user.id,
        questions: data.questions.map((q, qIndex) => ({
          id: `q-${qIndex}`,
          text: q.text,
          options: q.options.map((o, oIndex) => ({
            id: `q-${qIndex}-o-${oIndex}`,
            text: o.text,
            value: parseInt(o.value, 10)
          }))
        }))
      };
      
      await createTest(formattedData);
      navigate('/tests');
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tests')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Tests
        </button>
      </div>
      
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
          <p className="mt-1 text-gray-600">
            Design a psychological test with questions and scoring options.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Test Details */}
          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Test Title
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="is_public"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                {...register('is_public')}
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                Make this test public
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="isPaid"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={isPaid}
                onChange={() => setIsPaid(!isPaid)}
              />
              <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-900">
                This is a paid test
              </label>
            </div>
            
            {isPaid && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register('price', { 
                    required: isPaid ? 'Price is required' : false,
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Questions */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Questions</h2>
            
            {questionFields.map((field, questionIndex) => (
              <div key={field.id} className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium">Question {questionIndex + 1}</h3>
                  {questionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Question Text
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    {...register(`questions.${questionIndex}.text`, { 
                      required: 'Question text is required' 
                    })}
                  />
                  {errors.questions?.[questionIndex]?.text && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.questions[questionIndex]?.text?.message}
                    </p>
                  )}
                </div>
                
                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options
                  </label>
                  
                  {field.options.map((_, optionIndex) => (
                    <div key={optionIndex} className="flex space-x-2">
                      <div className="flex-grow">
                        <input
                          type="text"
                          placeholder="Option text"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          {...register(`questions.${questionIndex}.options.${optionIndex}.text`, {
                            required: 'Option text is required'
                          })}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="Value"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          {...register(`questions.${questionIndex}.options.${optionIndex}.value`, {
                            required: 'Value is required',
                            valueAsNumber: true
                          })}
                        />
                      </div>
                      {field.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const options = [...field.options];
                            options.splice(optionIndex, 1);
                            // Update the field manually since we're using nested arrays
                            const newQuestions = [...questionFields];
                            newQuestions[questionIndex].options = options;
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const options = [...field.options, { text: '', value: '0' }];
                      // Update the field manually
                      const newQuestions = [...questionFields];
                      newQuestions[questionIndex].options = options;
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendQuestion({ 
                text: '', 
                options: [
                  { text: '', value: '0' },
                  { text: '', value: '0' }
                ] 
              })}
              className="mb-6"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Question
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Create Test
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTest;