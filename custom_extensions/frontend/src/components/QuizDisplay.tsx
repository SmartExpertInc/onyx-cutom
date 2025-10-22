"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  QuizData, AnyQuizQuestion, MultipleChoiceQuestion, MultiSelectQuestion,
  MatchingQuestion, SortingQuestion, OpenAnswerQuestion, SortableItem
} from '@/types/quizTypes';
import { CheckCircle, XCircle, Info, ArrowRight } from 'lucide-react';
import { locales } from '@/locales';
import { useLanguage } from '../contexts/LanguageContext';

const THEME_COLORS = {
  primaryText: 'text-[#4B4B4B]',
  headingText: 'text-black',
  accentRed: 'text-[#FF1414]',
  accentRedBg: 'bg-[#FF1414]',
  veryLightAccentBg: 'bg-[#FAFAFA]',
  lightBorder: 'border-gray-200',
  mutedText: 'text-[#4B4B4B]',
  defaultBorder: 'border-gray-300',
  underlineAccent: 'border-[#FF1414]',
  successText: 'text-green-600',
  errorText: 'text-red-600',
  successBg: 'bg-green-50',
  errorBg: 'bg-red-50',
  successBorder: 'border-green-200',
  errorBorder: 'border-red-200',
};

interface QuizDisplayProps {
  dataToDisplay: QuizData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: any) => void;
  parentProjectName?: string;
  lessonNumber?: number;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ dataToDisplay, isEditing, onTextChange, parentProjectName, lessonNumber }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  if (!dataToDisplay || !dataToDisplay.questions) {
    return null;
  }

  const questions = Array.isArray(dataToDisplay.questions) ? dataToDisplay.questions : [];

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    setUserAnswers((prev: Record<number, any>) => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowAnswers(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setShowAnswers(false);
  };

  const handleTextChange = (path: (string | number)[], newValue: any) => {
    if (onTextChange) {
      onTextChange(path, newValue);
    }
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionId: string, isCorrect: boolean) => {
    const question = questions[questionIndex];
    if (question.question_type === 'multiple-choice') {
      handleTextChange(['questions', questionIndex, 'correct_option_id'], optionId);
    } else if (question.question_type === 'multi-select') {
      const multiSelectQuestion = question as MultiSelectQuestion;
      let currentCorrectIds: string[] = [];
      if (Array.isArray(multiSelectQuestion.correct_option_ids)) {
        currentCorrectIds = multiSelectQuestion.correct_option_ids;
      } else if (typeof multiSelectQuestion.correct_option_ids === 'string') {
        currentCorrectIds = multiSelectQuestion.correct_option_ids.split(',').filter(id => id.trim() !== '');
      }

      const newCorrectIds = isCorrect
        ? currentCorrectIds.filter(id => id !== optionId)
        : [...currentCorrectIds, optionId];
      handleTextChange(['questions', questionIndex, 'correct_option_ids'], newCorrectIds);
    }
  };

  const renderMultipleChoice = (question: MultipleChoiceQuestion, index: number) => {
    const isCorrect = userAnswers[index] === question.correct_option_id;
    const showResult = isSubmitted && showAnswers;

    return (
      <div>
        <div className="space-y-3">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className={`flex items-center h-5 ${isEditing ? 'cursor-pointer' : ''}`}>
                <div 
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option.id === question.correct_option_id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}
                  onClick={() => isEditing && handleCorrectAnswerChange(index, option.id, option.id === question.correct_option_id)}
                >
                  {option.id === question.correct_option_id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleTextChange(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                ) : (
                  <span className="text-gray-900">{option.text}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {isEditing ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-1">{t('quiz.explanation', 'Explanation')}</label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => handleTextChange(['questions', index, 'explanation'], e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder={t('quiz.explanation', 'Explanation')}
            />
          </div>
        ) : question.explanation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" fill="#10B981"/>
                  <path d="M8 4.5c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5zm0 6c-1.38 0-2.5-1.12-2.5-2.5S6.62 5.5 8 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981"/>
                  <path d="M8 6.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" fill="#10B981"/>
                </svg>
              </div>
              <p className="text-sm text-gray-800 flex-1">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMultiSelect = (question: MultiSelectQuestion, index: number) => {
    const userAnswer = userAnswers[index] || [];

    let correctIds: string[] = [];
    if (Array.isArray(question.correct_option_ids)) {
      correctIds = question.correct_option_ids;
    } else if (typeof question.correct_option_ids === 'string') {
      correctIds = question.correct_option_ids.split(',').filter(id => id.trim() !== '');
    }

    const isCorrect = correctIds.every((id: string) => userAnswer.includes(id)) &&
                     userAnswer.every((id: string) => correctIds.includes(id));
    const showResult = isSubmitted && showAnswers;

    return (
      <div>
        <div className="space-y-3">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className={`flex items-center h-5 ${isEditing ? 'cursor-pointer' : ''}`}>
                <div 
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${correctIds.includes(option.id) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}
                  onClick={() => isEditing && handleCorrectAnswerChange(index, option.id, correctIds.includes(option.id))}
                >
                  {correctIds.includes(option.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleTextChange(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    className="w-full p-2 border rounded text-gray-900"
                  />
                ) : (
                  <span className="text-gray-900">{option.text}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {isEditing ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-1">{t('quiz.explanation', 'Explanation')}</label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => handleTextChange(['questions', index, 'explanation'], e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder={t('quiz.explanation', 'Explanation')}
            />
          </div>
        ) : question.explanation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" fill="#10B981"/>
                  <path d="M8 4.5c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5zm0 6c-1.38 0-2.5-1.12-2.5-2.5S6.62 5.5 8 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981"/>
                  <path d="M8 6.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" fill="#10B981"/>
                </svg>
              </div>
              <p className="text-sm text-gray-800 flex-1">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMatching = (question: MatchingQuestion, index: number) => {
    const userAnswer = userAnswers[index] || {};
    const isCorrect = Object.entries(question.correct_matches).every(
      ([promptId, optionId]: [string, string]) => userAnswer[promptId] === optionId
    );
    const showResult = isSubmitted && showAnswers;

    const handleMatchChange = (promptId: string, newOptionId: string) => {
      const newCorrectMatches = {
        ...question.correct_matches,
        [promptId]: newOptionId,
      };
      handleTextChange(['questions', index, 'correct_matches'], newCorrectMatches);
    };

    return (
      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-6">
            {/* Items/Prompts Section */}
            <div>
              <h4 className="font-semibold mb-3 text-black border-b pb-2">{t('quiz.prompts', 'Items to Match')}</h4>
              <div className="space-y-2">
                {question.prompts.map((prompt, promptIndex) => (
                  <div key={prompt.id} className="flex items-center p-3 bg-blue-50 rounded-lg border">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                      {prompt.id}
                    </span>
                    <input
                      type="text"
                      value={prompt.text}
                      onChange={(e) => handleTextChange(['questions', index, 'prompts', promptIndex, 'text'], e.target.value)}
                      className="flex-1 p-2 border rounded text-black bg-white"
                      placeholder={`Item ${prompt.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Options Section */}
            <div>
              <h4 className="font-semibold mb-3 text-black border-b pb-2">{t('quiz.options', 'Answer Options')}</h4>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center p-3 bg-green-50 rounded-lg border">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                      {option.id}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleTextChange(['questions', index, 'options', optionIndex, 'text'], e.target.value)}
                      className="flex-1 p-2 border rounded text-black bg-white"
                      placeholder={`Option ${option.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Matches Section */}
            <div>
              <h4 className="font-semibold mb-3 text-black border-b pb-2">{t('quiz.correctMatches', 'Correct Matches')}</h4>
              <div className="space-y-3">
                {question.prompts.map((prompt) => {
                  const matchedOption = question.options.find(opt => opt.id === question.correct_matches[prompt.id]);
                  return (
                    <div key={prompt.id} className="flex items-center p-3 bg-yellow-50 rounded-lg border">
                      <div className="flex items-center flex-1">
                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                          {prompt.id}
                        </span>
                        <span className="text-black font-medium mr-3">{prompt.text}</span>
                        <span className="text-gray-500 mx-2">→</span>
                        <select
                          value={question.correct_matches[prompt.id] || ''}
                          onChange={(e) => handleMatchChange(prompt.id, e.target.value)}
                          className="p-2 border rounded text-black bg-white min-w-[120px]"
                        >
                          <option value="" disabled>{t('quiz.selectOption', 'Select option')}</option>
                          {question.options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.id}: {option.text.substring(0, 30)}{option.text.length > 30 ? '...' : ''}
                            </option>
                          ))}
                        </select>
                        <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold ml-3">
                          {matchedOption?.id || '?'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <h4 className="font-semibold text-black">{t('quiz.prompts', 'Items')}:</h4>
              <h4 className="font-semibold text-black">{t('quiz.correctMatches', 'Matches')}:</h4>
            </div>
            {question.prompts.map((prompt, promptIndex) => {
              const matchedOption = question.options.find(opt => opt.id === question.correct_matches[prompt.id]);
              return (
                <div key={prompt.id} className="grid grid-cols-2 gap-4 mb-3 p-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold mr-3 text-sm">
                      {prompt.id}
                    </span>
                    <span className="text-black">{prompt.text}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold mr-3 text-sm">
                      {matchedOption?.id}
                    </span>
                    <span className="text-black">{matchedOption?.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {isEditing ? (
          <div className="mt-6 pt-4 border-t">
            <label className="block text-sm font-medium text-black mb-2">{t('quiz.explanation', 'Explanation')}</label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => handleTextChange(['questions', index, 'explanation'], e.target.value)}
              className="w-full p-3 border rounded text-black"
              placeholder={t('quiz.explanation', 'Explanation for this question...')}
            />
          </div>
        ) : question.explanation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" fill="#10B981"/>
                  <path d="M8 4.5c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5zm0 6c-1.38 0-2.5-1.12-2.5-2.5S6.62 5.5 8 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981"/>
                  <path d="M8 6.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" fill="#10B981"/>
                </svg>
              </div>
              <p className="text-sm text-gray-800 flex-1">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSorting = (question: SortingQuestion, index: number) => {
    const userAnswer = userAnswers[index] || [];
    const isCorrect = question.items_to_sort.every((item: SortableItem, i: number) => item.id === userAnswer[i]);
    const showResult = isSubmitted && showAnswers;
    
    // Use component state to manage the order during editing
    const [sortedItems, setSortedItems] = useState(question.correct_order);
    
    React.useEffect(() => {
        setSortedItems(question.correct_order);
    }, [question.correct_order]);


    const handleDragStart = (e: React.DragEvent, itemId: string) => {
      e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetItemId: string) => {
      e.preventDefault();
      const sourceItemId = e.dataTransfer.getData('text/plain');
      if (sourceItemId === targetItemId) return;

      const newSortedItems = [...(userAnswer as string[])]; // Use userAnswer which is the state for sorting
      const sourceIndex = newSortedItems.indexOf(sourceItemId);
      const targetIndex = newSortedItems.indexOf(targetItemId);

      newSortedItems.splice(sourceIndex, 1);
      newSortedItems.splice(targetIndex, 0, sourceItemId);
      
      handleAnswerChange(index, newSortedItems); // This updates user answers for taking the quiz
    };
    
    const handleEditDrop = (e: React.DragEvent, targetItemId: string) => {
      e.preventDefault();
      const sourceItemId = e.dataTransfer.getData('text/plain');
      if (sourceItemId === targetItemId) return;

      const newSortedItems = [...sortedItems];
      const sourceIndex = newSortedItems.indexOf(sourceItemId);
      const targetIndex = newSortedItems.indexOf(targetItemId);

      newSortedItems.splice(sourceIndex, 1);
      newSortedItems.splice(targetIndex, 0, sourceItemId);
      
      setSortedItems(newSortedItems);
      handleTextChange(['questions', index, 'correct_order'], newSortedItems);
    };

    if (isEditing) {
        const handleAddItem = () => {
          const newItemId = `item-${Date.now()}`;
          const newItem = { id: newItemId, text: 'New Item' };
          
          const newItemsToSort = [...question.items_to_sort, newItem];
          const newCorrectOrder = [...question.correct_order, newItemId];
          
          handleTextChange(['questions', index, 'items_to_sort'], newItemsToSort);
          handleTextChange(['questions', index, 'correct_order'], newCorrectOrder);
        };

        const handleRemoveItem = (itemId: string) => {
          const newItemsToSort = question.items_to_sort.filter(item => item.id !== itemId);
          const newCorrectOrder = question.correct_order.filter(id => id !== itemId);

          handleTextChange(['questions', index, 'items_to_sort'], newItemsToSort);
          handleTextChange(['questions', index, 'correct_order'], newCorrectOrder);
        };

        return (
          <div className="mt-4">
            <h4 className="font-medium mb-2 text-black">{t('quiz.itemsToSort', 'Items to Sort')}</h4>
            <div className="space-y-2">
              {sortedItems.map((itemId, orderIndex) => {
                const item = question.items_to_sort.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div 
                    key={itemId} 
                    className="flex items-center p-2 border rounded bg-white"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleEditDrop(e, itemId)}
                  >
                    <span 
                        className="w-6 h-6 flex items-center justify-center bg-[#2563eb] text-white rounded-full mr-3 cursor-grab"
                        draggable
                        onDragStart={(e) => handleDragStart(e, itemId)}
                    >
                      {orderIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={item?.text || ''}
                      onChange={(e) => handleTextChange(['questions', index, 'items_to_sort', question.items_to_sort.findIndex(i => i.id === itemId), 'text'], e.target.value)}
                      className="flex-1 p-1 border-none rounded text-black bg-transparent focus:ring-0"
                    />
                    <button type="button" onClick={() => handleRemoveItem(itemId)} className="ml-2 text-red-500 font-bold">X</button>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={handleAddItem} className="mt-4 p-2 border rounded text-white bg-[#2563eb]">{t('quiz.addItem', 'Add Item')}</button>

             <div className="mt-4">
                <label className="block text-sm font-medium text-black mb-1">{t('quiz.explanation', 'Explanation')}</label>
                <input
                  type="text"
                  value={question.explanation || ''}
                  onChange={(e) => handleTextChange(['questions', index, 'explanation'], e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder={t('quiz.explanation', 'Explanation')}
                />
              </div>
          </div>
        )
    }

    return (
      <div className="mt-4">
        <div className="space-y-2">
          {question.correct_order.map((itemId, orderIndex) => {
            const item = question.items_to_sort.find(i => i.id === itemId);
            return (
              <div key={itemId} className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center bg-[#2563eb] text-white rounded-full mr-3">
                  {orderIndex + 1}
                </span>
                <span className="text-black">{item?.text}</span>
              </div>
            );
          })}
        </div>
        {question.explanation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" fill="#10B981"/>
                  <path d="M8 4.5c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5zm0 6c-1.38 0-2.5-1.12-2.5-2.5S6.62 5.5 8 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981"/>
                  <path d="M8 6.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" fill="#10B981"/>
                </svg>
              </div>
              <p className="text-sm text-gray-800 flex-1">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>  
    );
  };

  const renderOpenAnswer = (question: OpenAnswerQuestion, index: number) => {
    const userAnswer = userAnswers[index] || '';
    const isCorrect = question.acceptable_answers.some(
      answer => answer.toLowerCase() === userAnswer.toLowerCase()
    );
    const showResult = isSubmitted && showAnswers;

    return (
      <div className="mt-4">
        <div className="space-y-2">
          <h4 className="italic text-black">{t('quiz.acceptableAnswers', 'Acceptable Answers')}:</h4>
          {question.acceptable_answers.map((answer, answerIndex) => (
            <div key={answerIndex}>
              {isEditing ? (
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleTextChange(['questions', index, 'acceptable_answers', answerIndex], e.target.value)}
                  className="w-full p-2 border rounded text-black"
                />
              ) : (
                <p className="text-black">{answer}</p>
              )}
            </div>
          ))}
        </div>
        {isEditing ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-1">{t('quiz.explanation', 'Explanation')}</label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => handleTextChange(['questions', index, 'explanation'], e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder={t('quiz.explanation', 'Explanation')}
            />
          </div>
        ) : question.explanation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" fill="#10B981"/>
                  <path d="M8 4.5c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5zm0 6c-1.38 0-2.5-1.12-2.5-2.5S6.62 5.5 8 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10B981"/>
                  <path d="M8 6.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" fill="#10B981"/>
                </svg>
              </div>
              <p className="text-sm text-gray-800 flex-1">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestion = (question: AnyQuizQuestion, index: number) => {
    const questionNumber = index + 1;
    const questionType = question.question_type;

    return (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Question Header Bar */}
        <div className="bg-blue-50 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded"></div>
                <div className="w-2 h-2 bg-gray-400 rounded"></div>
                <div className="w-2 h-2 bg-gray-400 rounded"></div>
                <div className="w-2 h-2 bg-gray-400 rounded"></div>
                <div className="w-2 h-2 bg-gray-400 rounded"></div>
                <div className="w-2 h-2 bg-gray-400 rounded"></div>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={question.question_text}
                    onChange={(e) => handleTextChange(['questions', index, 'question_text'], e.target.value)}
                    className="w-full text-lg font-semibold text-blue-900 bg-transparent border-none outline-none"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-blue-900">{question.question_text}</h3>
                )}
                {questionType === 'multi-select' && (
                  <p className="text-sm text-gray-600 mt-1">(Select all that apply)</p>
                )}
              </div>
            </div>
            <button className="p-2 hover:bg-blue-100 rounded">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.333 2.667H4.667C3.93 2.667 3.333 3.264 3.333 4v8c0 .736.597 1.333 1.334 1.333h6.666c.737 0 1.334-.597 1.334-1.333V4c0-.736-.597-1.333-1.334-1.333zM4.667 4h6.666v8H4.667V4z" fill="#6B7280"/>
                <path d="M6 6h4v1.333H6V6zm0 2h4v1.333H6V8z" fill="#6B7280"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          {questionType === 'multiple-choice' && renderMultipleChoice(question as MultipleChoiceQuestion, index)}
          {questionType === 'multi-select' && renderMultiSelect(question as MultiSelectQuestion, index)}
          {questionType === 'matching' && renderMatching(question as MatchingQuestion, index)}
          {questionType === 'sorting' && renderSorting(question as SortingQuestion, index)}
          {questionType === 'open-answer' && renderOpenAnswer(question as OpenAnswerQuestion, index)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {dataToDisplay.quizTitle || t('quiz.quizTitle', 'Quiz Title')}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1L9.5 4.5L13 4.5L10.5 7L12 10.5L8 8L4 10.5L5.5 7L3 4.5L6.5 4.5L8 1Z" fill="currentColor"/>
              </svg>
              AI Improve
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1L9.5 4.5L13 4.5L10.5 7L12 10.5L8 8L4 10.5L5.5 7L3 4.5L6.5 4.5L8 1Z" fill="currentColor"/>
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-sm text-gray-600 mb-6">
          {questions.length} questions total
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => renderQuestion(question, index))}
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay; 