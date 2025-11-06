"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  QuizData, AnyQuizQuestion, MultipleChoiceQuestion, MultiSelectQuestion,
  MatchingQuestion, SortingQuestion, OpenAnswerQuestion, SortableItem
} from '@/types/quizTypes';
import { CheckCircle, XCircle, Info, ArrowRight, Check } from 'lucide-react';
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

// Explanation Field Component
interface ExplanationFieldProps {
  explanation: string | undefined;
  questionIndex: number;
  isEditing: boolean;
  editingField: {type: 'question' | 'option' | 'answer' | 'prompt' | 'match-option' | 'explanation', questionIndex: number, optionIndex?: number, answerIndex?: number, promptIndex?: number} | null;
  onBlur: (path: (string | number)[], newValue: any) => void;
  onInputChange?: (path: (string | number)[], value: string) => void;
  getInputValue?: (path: (string | number)[], defaultValue: string) => string;
  setEditingField: (field: {type: 'explanation', questionIndex: number} | null) => void;
  t: (key: string, fallback?: string) => string;
  className?: string;
}

const ExplanationField: React.FC<ExplanationFieldProps> = ({
  explanation,
  questionIndex,
  isEditing,
  editingField,
  onBlur,
  onInputChange,
  getInputValue,
  setEditingField,
  t,
  className = 'mt-4'
}) => {
  const isEditingExplanation = isEditing || (editingField?.type === 'explanation' && editingField.questionIndex === questionIndex);

  if (isEditingExplanation) {
    const path = ['questions', questionIndex, 'explanation'];
    const defaultValue = explanation || '';
    return (
      <input
        type="text"
        value={getInputValue ? getInputValue(path, defaultValue) : defaultValue}
        onChange={onInputChange ? (e) => onInputChange(path, e.target.value) : undefined}
        onBlur={(e) => onBlur(path, e.target.value)}
        autoFocus={editingField?.type === 'explanation'}
        className={`w-full p-2 border-b-2 border-blue-500 bg-transparent outline-none text-gray-900 ${className}`}
        placeholder={t('quiz.explanation', 'Explanation')}
      />
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div className={`${className} p-4 bg-[#D8FDF9] rounded-lg`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_904_128436)">
              <path d="M14.5349 1.8677C13.3208 0.662148 11.7134 0 10.0035 0C9.98804 0 9.97222 3.90625e-05 9.95675 0.00015625C8.28746 0.0119141 6.70695 0.665938 5.50633 1.84176C4.30547 3.01781 3.6191 4.58437 3.57375 6.25277C3.52644 7.99141 4.16328 9.63809 5.36695 10.8895C6.3148 11.875 6.83679 13.1857 6.83679 14.5804V17.2633C6.83679 17.8145 7.21949 18.2777 7.733 18.402V18.7597C7.733 19.4436 8.28937 20 8.97324 20H11.024C11.7079 20 12.2643 19.4436 12.2643 18.7597V18.4041C12.7823 18.283 13.1694 17.8177 13.1694 17.2633V14.5805C13.1694 13.2041 13.7057 11.8782 14.6796 10.8471C15.8115 9.64875 16.4349 8.0807 16.4349 6.43176C16.4349 4.7052 15.7601 3.0843 14.5349 1.8677ZM11.483 18.7598C11.483 19.0129 11.2771 19.2188 11.0241 19.2188H8.97328C8.72019 19.2188 8.51429 19.0129 8.51429 18.7598V18.435H11.483V18.7598ZM12.3882 17.2633C12.3882 17.4786 12.213 17.6538 11.9977 17.6538H11.8737H8.12367H8.00859C7.79324 17.6538 7.61808 17.4786 7.61808 17.2633V15.0416H12.3882V17.2633ZM9.38949 14.2604V9.31945H10.6064V14.2603H9.38949V14.2604ZM14.1118 10.3106C13.0757 11.4075 12.4736 12.7994 12.3966 14.2603H11.3877V9.31945H11.7388C12.3632 9.31945 12.8712 8.81148 12.8712 8.18707V8.12652C12.8712 7.50211 12.3632 6.99414 11.7388 6.99414C11.1144 6.99414 10.6064 7.50211 10.6064 8.12652V8.5382H9.38949V8.12652C9.38949 7.50211 8.88152 6.99414 8.25715 6.99414H8.18019C7.55582 6.99414 7.04785 7.50211 7.04785 8.12652V8.18707C7.04785 8.81145 7.55582 9.31945 8.18019 9.31945H8.60824V14.2603H7.61004C7.53547 12.7829 6.94558 11.4037 5.93004 10.3479C4.87261 9.24855 4.31312 7.80172 4.35472 6.27402C4.43652 3.2666 6.95203 0.802617 9.96226 0.781367C11.4816 0.770703 12.9081 1.35336 13.9845 2.42207C15.0609 3.4909 15.6537 4.91492 15.6537 6.43176C15.6537 7.88043 15.1061 9.25793 14.1118 10.3106ZM11.3877 8.5382V8.12652C11.3877 7.93289 11.5452 7.77539 11.7388 7.77539C11.9324 7.77539 12.0899 7.93293 12.0899 8.12652V8.18707C12.0899 8.3807 11.9324 8.5382 11.7388 8.5382H11.3877ZM8.6082 8.12652V8.5382H8.18015C7.98656 8.5382 7.82906 8.3807 7.82906 8.18707V8.12652C7.82906 7.93289 7.98656 7.77539 8.18015 7.77539H8.25711C8.4507 7.77539 8.6082 7.93297 8.6082 8.12652Z" fill="#434343"/>
              <path d="M14.1918 4.74281C13.8563 3.90976 13.2856 3.20082 12.5415 2.69261C11.7787 2.17172 10.8847 1.89984 9.95821 1.90636C9.74247 1.90789 9.5688 2.08402 9.57032 2.29976C9.57185 2.51457 9.74646 2.68761 9.96087 2.68761C9.96181 2.68761 9.96278 2.68761 9.96368 2.68761C9.97286 2.68758 9.98181 2.68754 9.99095 2.68754C11.5292 2.68754 12.8918 3.60648 13.4672 5.03472C13.5285 5.18699 13.675 5.27949 13.8296 5.27949C13.8782 5.27949 13.9277 5.27039 13.9755 5.25109C14.1756 5.17047 14.2725 4.94289 14.1918 4.74281Z" fill="#434343"/>
              <path d="M14.4021 6.15352C14.3295 6.08086 14.2287 6.03906 14.126 6.03906C14.0232 6.03906 13.9225 6.08086 13.8498 6.15352C13.7768 6.22617 13.7354 6.32695 13.7354 6.42969C13.7354 6.53281 13.7768 6.6332 13.8498 6.70586C13.9225 6.77891 14.0229 6.82031 14.126 6.82031C14.2287 6.82031 14.3295 6.77891 14.4021 6.70586C14.4748 6.6332 14.5166 6.53281 14.5166 6.42969C14.5166 6.32695 14.4748 6.22617 14.4021 6.15352Z" fill="#434343"/>
              <path d="M18.1437 1.94644C17.9911 1.7939 17.7438 1.7939 17.5912 1.94644L16.8634 2.67421C16.7109 2.82675 16.7109 3.07409 16.8634 3.22667C16.9397 3.30296 17.0397 3.34108 17.1397 3.34108C17.2397 3.34108 17.3396 3.30296 17.4159 3.22667L18.1437 2.4989C18.2962 2.34636 18.2962 2.09901 18.1437 1.94644Z" fill="#434343"/>
              <path d="M18.1436 10.3656L17.4159 9.63784C17.2633 9.4853 17.0161 9.4853 16.8634 9.63784C16.7109 9.79038 16.7109 10.0377 16.8634 10.1903L17.5912 10.918C17.6675 10.9943 17.7675 11.0325 17.8674 11.0325C17.9674 11.0325 18.0673 10.9943 18.1436 10.918C18.2962 10.7655 18.2962 10.5182 18.1436 10.3656Z" fill="#434343"/>
              <path d="M19.6084 6.03906H18.5791C18.3634 6.03906 18.1885 6.21395 18.1885 6.42969C18.1885 6.64543 18.3634 6.82031 18.5791 6.82031H19.6084C19.8241 6.82031 19.999 6.64543 19.999 6.42969C19.999 6.21395 19.8241 6.03906 19.6084 6.03906Z" fill="#434343"/>
              <path d="M3.13776 2.67421L2.41003 1.94644C2.25745 1.7939 2.01019 1.7939 1.85757 1.94644C1.70503 2.09897 1.70503 2.34632 1.85757 2.4989L2.58534 3.22667C2.66163 3.30296 2.76159 3.34108 2.86155 3.34108C2.96151 3.34108 3.06147 3.30296 3.13776 3.22667C3.2903 3.07409 3.2903 2.82679 3.13776 2.67421Z" fill="#434343"/>
              <path d="M3.13776 9.63787C2.98522 9.48529 2.73792 9.48529 2.58534 9.63787L1.85757 10.3657C1.70503 10.5182 1.70503 10.7656 1.85757 10.9181C1.93386 10.9944 2.03382 11.0325 2.13378 11.0325C2.23374 11.0325 2.3337 10.9944 2.40999 10.9181L3.13776 10.1903C3.2903 10.0378 3.2903 9.79045 3.13776 9.63787Z" fill="#434343"/>
              <path d="M1.41988 6.03906H0.390625C0.174922 6.03906 0 6.21395 0 6.42969C0 6.64543 0.174922 6.82031 0.390625 6.82031H1.41988C1.63559 6.82031 1.81051 6.64543 1.81051 6.42969C1.81051 6.21395 1.63559 6.03906 1.41988 6.03906Z" fill="#434343"/>
            </g>
            <defs>
              <clipPath id="clip0_904_128436">
                <rect width="20" height="20" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <p 
          className="text-sm text-[#434343] flex-1 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors"
          onClick={() => setEditingField({type: 'explanation', questionIndex})}
        >
          {explanation}
        </p>
      </div>
    </div>
  );
};

const QuizDisplay: React.FC<QuizDisplayProps> = ({ dataToDisplay, isEditing, onTextChange, parentProjectName, lessonNumber }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [editingField, setEditingField] = useState<{type: 'question' | 'option' | 'answer' | 'prompt' | 'match-option' | 'explanation', questionIndex: number, optionIndex?: number, answerIndex?: number, promptIndex?: number} | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [showQuestionTypeMenu, setShowQuestionTypeMenu] = useState(false);
  const questionTypeMenuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (questionTypeMenuRef.current && !questionTypeMenuRef.current.contains(event.target as Node)) {
        setShowQuestionTypeMenu(false);
      }
    };

    if (showQuestionTypeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuestionTypeMenu]);

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

  const handleTextSubmit = (path: (string | number)[], newValue: any) => {
    if (onTextChange) {
      onTextChange(path, newValue);
    }
  };

  const getFieldKey = (path: (string | number)[]): string => {
    return path.join('-');
  };

  const handleInputChange = (path: (string | number)[], value: string) => {
    const fieldKey = getFieldKey(path);
    setEditingValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleBlur = (path: (string | number)[], newValue: any) => {
    const fieldKey = getFieldKey(path);
    setEditingField(null);
    // Clear the temporary value
    setEditingValues(prev => {
      const updated = { ...prev };
      delete updated[fieldKey];
      return updated;
    });
    // Update the actual data
    if (onTextChange) {
      onTextChange(path, newValue);
    }
  };

  const getInputValue = (path: (string | number)[], defaultValue: string): string => {
    const fieldKey = getFieldKey(path);
    return editingValues[fieldKey] !== undefined ? editingValues[fieldKey] : defaultValue;
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionId: string, isCorrect: boolean) => {
    const question = questions[questionIndex];
    if (question.question_type === 'multiple-choice') {
      handleTextSubmit(['questions', questionIndex, 'correct_option_id'], optionId);
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
        handleTextSubmit(['questions', questionIndex, 'correct_option_ids'], newCorrectIds);
    }
  };

  const handleAddQuestion = (questionType: 'multiple-choice' | 'multi-select' | 'matching' | 'sorting' | 'open-answer') => {
    if (!onTextChange) return;

    let newQuestion: AnyQuizQuestion;

    switch (questionType) {
      case 'multiple-choice':
        newQuestion = {
          question_type: 'multiple-choice',
          question_text: 'New Multiple Choice Question',
          options: [
            { id: 'A', text: 'Option A' },
            { id: 'B', text: 'Option B' },
            { id: 'C', text: 'Option C' },
            { id: 'D', text: 'Option D' }
          ],
          correct_option_id: 'A',
          explanation: ''
        } as MultipleChoiceQuestion;
        break;

      case 'multi-select':
        newQuestion = {
          question_type: 'multi-select',
          question_text: 'New Multi-Select Question',
          options: [
            { id: 'A', text: 'Option A' },
            { id: 'B', text: 'Option B' },
            { id: 'C', text: 'Option C' },
            { id: 'D', text: 'Option D' }
          ],
          correct_option_ids: ['A', 'B'],
          explanation: ''
        } as MultiSelectQuestion;
        break;

      case 'matching':
        newQuestion = {
          question_type: 'matching',
          question_text: 'New Matching Question',
          prompts: [
            { id: 'A', text: 'Item A' },
            { id: 'B', text: 'Item B' },
            { id: 'C', text: 'Item C' }
          ],
          options: [
            { id: '1', text: 'Match 1' },
            { id: '2', text: 'Match 2' },
            { id: '3', text: 'Match 3' }
          ],
          correct_matches: { 'A': '1', 'B': '2', 'C': '3' },
          explanation: ''
        } as MatchingQuestion;
        break;

      case 'sorting':
        newQuestion = {
          question_type: 'sorting',
          question_text: 'New Sorting Question',
          items_to_sort: [
            { id: 'item1', text: 'First item' },
            { id: 'item2', text: 'Second item' },
            { id: 'item3', text: 'Third item' }
          ],
          correct_order: ['item1', 'item2', 'item3'],
          explanation: ''
        } as SortingQuestion;
        break;

      case 'open-answer':
        newQuestion = {
          question_type: 'open-answer',
          question_text: 'New Open Answer Question',
          acceptable_answers: ['Answer 1', 'Answer 2'],
          explanation: ''
        } as OpenAnswerQuestion;
        break;
    }

    // Add the new question to the questions array
    const updatedQuestions = [...questions, newQuestion];
    handleTextSubmit(['questions'], updatedQuestions);
    setShowQuestionTypeMenu(false);
  };

  const renderMultipleChoice = (question: MultipleChoiceQuestion, index: number) => {
    const isCorrect = userAnswers[index] === question.correct_option_id;
    const showResult = isSubmitted && showAnswers;

    return (
      <div>
        <div>
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className={`flex items-center mt-1 h-5 ${onTextChange ? 'cursor-pointer' : ''}`}>
                <div 
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option.id === question.correct_option_id ? 'border-blue-600 bg-blue-600' : 'border-[#E0E0E0]'}`}
                  onClick={() => onTextChange && handleCorrectAnswerChange(index, option.id, option.id === question.correct_option_id)}
                >
                  {option.id === question.correct_option_id && (
                    <Check strokeWidth={2} width={9} height={9} className='text-white' />
                  )}
                </div>
              </div>
              <div className="ml-1 flex-1">
                {(isEditing || (editingField?.type === 'option' && editingField.questionIndex === index && editingField.optionIndex === question.options.findIndex(o => o.id === option.id))) ? (
                  <input
                    type="text"
                    value={getInputValue(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], option.text)}
                    onChange={(e) => handleInputChange(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    onBlur={(e) => handleBlur(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    autoFocus
                    className="w-full p-2 border-b-2 border-blue-500 bg-transparent outline-none text-gray-900"
                  />
                ) : (
                  <span 
                    className="text-[#171718] font-light text-base cursor-pointer hover:bg-blue-50 rounded px-2 py-1 inline-block transition-colors"
                    onClick={() => onTextChange && setEditingField({type: 'option', questionIndex: index, optionIndex: question.options.findIndex(o => o.id === option.id)})}
                  >
                    {option.text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <ExplanationField
          explanation={question.explanation}
          questionIndex={index}
          isEditing={isEditing || false}
          editingField={editingField}
          onBlur={handleBlur}
          onInputChange={handleInputChange}
          getInputValue={getInputValue}
          setEditingField={setEditingField}
          t={t}
        />
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
        <div>
          {question.options.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className={`flex items-center mt-1 h-5 ${onTextChange ? 'cursor-pointer' : ''}`}>
                <div 
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${correctIds.includes(option.id) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}
                  onClick={() => onTextChange && handleCorrectAnswerChange(index, option.id, correctIds.includes(option.id))}
                >
                  {correctIds.includes(option.id) && (
                    <Check strokeWidth={2} width={9} height={9} className='text-white' />
                  )}
                </div>
              </div>
              <div className="ml-1 flex-1">
                {(isEditing || (editingField?.type === 'option' && editingField.questionIndex === index && editingField.optionIndex === question.options.findIndex(o => o.id === option.id))) ? (
                  <input
                    type="text"
                    value={getInputValue(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], option.text)}
                    onChange={(e) => handleInputChange(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    onBlur={(e) => handleBlur(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    autoFocus
                    className="w-full p-2 border-b-2 border-blue-500 bg-transparent outline-none text-[#171718]"
                  />
                ) : (
                  <span 
                    className="text-[#171718] font-light cursor-pointer hover:bg-blue-50 rounded px-2 py-1 inline-block transition-colors"
                    onClick={() => onTextChange && setEditingField({type: 'option', questionIndex: index, optionIndex: question.options.findIndex(o => o.id === option.id)})}
                  >
                    {option.text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <ExplanationField
          explanation={question.explanation}
          questionIndex={index}
          isEditing={isEditing || false}
          editingField={editingField}
          onBlur={handleBlur}
          onInputChange={handleInputChange}
          getInputValue={getInputValue}
          setEditingField={setEditingField}
          t={t}
        />
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
      handleTextSubmit(['questions', index, 'correct_matches'], newCorrectMatches);
    };

    return (
      <div>
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
                    value={getInputValue(['questions', index, 'prompts', promptIndex, 'text'], prompt.text)}
                    onChange={(e) => handleInputChange(['questions', index, 'prompts', promptIndex, 'text'], e.target.value)}
                    onBlur={(e) => handleBlur(['questions', index, 'prompts', promptIndex, 'text'], e.target.value)}
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
                    value={getInputValue(['questions', index, 'options', optionIndex, 'text'], option.text)}
                    onChange={(e) => handleInputChange(['questions', index, 'options', optionIndex, 'text'], e.target.value)}
                    onBlur={(e) => handleBlur(['questions', index, 'options', optionIndex, 'text'], e.target.value)}
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
            <div>
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
                      <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold ml-1">
                        {matchedOption?.id || '?'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <ExplanationField
          explanation={question.explanation}
          questionIndex={index}
          isEditing={isEditing || false}
          editingField={editingField}
          onBlur={handleBlur}
          setEditingField={setEditingField}
          t={t}
          className="mt-6 pt-4"
        />
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
      handleTextSubmit(['questions', index, 'correct_order'], newSortedItems);
    };


    const handleAddItem = () => {
      const newItemId = `item-${Date.now()}`;
      const newItem = { id: newItemId, text: 'New Item' };
      
      const newItemsToSort = [...question.items_to_sort, newItem];
      const newCorrectOrder = [...question.correct_order, newItemId];
      
      handleTextSubmit(['questions', index, 'items_to_sort'], newItemsToSort);
      handleTextSubmit(['questions', index, 'correct_order'], newCorrectOrder);
    };

    const handleRemoveItem = (itemId: string) => {
      const newItemsToSort = question.items_to_sort.filter(item => item.id !== itemId);
      const newCorrectOrder = question.correct_order.filter(id => id !== itemId);

      handleTextSubmit(['questions', index, 'items_to_sort'], newItemsToSort);
      handleTextSubmit(['questions', index, 'correct_order'], newCorrectOrder);
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
                    className="w-4 h-4 flex items-center justify-center bg-[#0F58F9] text-xs text-white rounded-full mr-3 cursor-grab"
                    draggable
                    onDragStart={(e) => handleDragStart(e, itemId)}
                >
                  {orderIndex + 1}
                </span>
                <input
                  type="text"
                  value={getInputValue(['questions', index, 'items_to_sort', question.items_to_sort.findIndex(i => i.id === itemId), 'text'], item?.text || '')}
                  onChange={(e) => handleInputChange(['questions', index, 'items_to_sort', question.items_to_sort.findIndex(i => i.id === itemId), 'text'], e.target.value)}
                  onBlur={(e) => handleBlur(['questions', index, 'items_to_sort', question.items_to_sort.findIndex(i => i.id === itemId), 'text'], e.target.value)}
                  className="flex-1 p-1 border-none rounded text-black bg-transparent focus:ring-0"
                />
                <button type="button" onClick={() => handleRemoveItem(itemId)} className="ml-2 text-red-500 font-bold">X</button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={handleAddItem} className="mt-4 p-2 border rounded text-white bg-[#2563eb]">{t('quiz.addItem', 'Add Item')}</button>

          <ExplanationField
          explanation={question.explanation}
          questionIndex={index}
          isEditing={isEditing || false}
          editingField={editingField}
          onBlur={handleBlur}
          setEditingField={setEditingField}
          t={t}
        />
      </div>
    )
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
              {(isEditing || (editingField?.type === 'answer' && editingField.questionIndex === index && editingField.answerIndex === answerIndex)) ? (
                <input
                  type="text"
                  value={getInputValue(['questions', index, 'acceptable_answers', answerIndex], answer)}
                  onChange={(e) => handleInputChange(['questions', index, 'acceptable_answers', answerIndex], e.target.value)}
                  onBlur={(e) => handleBlur(['questions', index, 'acceptable_answers', answerIndex], e.target.value)}
                  autoFocus
                  className="w-full p-2 border-b-2 border-blue-500 bg-transparent outline-none text-black"
                />
              ) : (
                <p 
                  className="text-black cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors"
                  onClick={() => onTextChange && setEditingField({type: 'answer', questionIndex: index, answerIndex})}
                >
                  {answer}
                </p>
              )}
            </div>
          ))}
        </div>
        <ExplanationField
          explanation={question.explanation}
          questionIndex={index}
          isEditing={isEditing || false}
          editingField={editingField}
          onBlur={handleBlur}
          onInputChange={handleInputChange}
          getInputValue={getInputValue}
          setEditingField={setEditingField}
          t={t}
        />
      </div>
    );
  };

  const renderQuestion = (question: AnyQuizQuestion, index: number) => {
    const questionNumber = index + 1;
    const questionType = question.question_type;

    return (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Question Header Bar */}
        <div className="bg-[#CCDBFC] pr-6 pl-3 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
              {/* <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="1.57349" cy="1.57349" r="1.57349" fill="white"/>
              <circle cx="1.57349" cy="8.65552" r="1.57349" fill="white"/>
              <circle cx="1.57349" cy="16.5227" r="1.57349" fill="white"/>
              <circle cx="9.44068" cy="1.57349" r="1.57349" fill="white"/>
              <circle cx="9.44068" cy="8.65552" r="1.57349" fill="white"/>
              <circle cx="9.44068" cy="16.5227" r="1.57349" fill="white"/>
              </svg> */}
              </div>
              <div className="flex-1">
                {(isEditing || (editingField?.type === 'question' && editingField.questionIndex === index)) ? (
                  <input
                    type="text"
                    value={getInputValue(['questions', index, 'question_text'], question.question_text)}
                    onChange={(e) => handleInputChange(['questions', index, 'question_text'], e.target.value)}
                    onBlur={(e) => handleBlur(['questions', index, 'question_text'], e.target.value)}
                    autoFocus
                    className="w-[400px] text-lg font-semibold text-[#0F58F9] bg-transparent border-b-2 border-blue-500 outline-none"
                    placeholder={`${questionNumber}. Enter your question...`}
                  />
                ) : (
                  <h3 
                    className="text-xl font-bold text-[#0F58F9] cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors"
                    onClick={() => onTextChange && setEditingField({type: 'question', questionIndex: index})}
                  >
                    {questionNumber}. {question.question_text}
                  </h3>
                )}
              </div>
            </div>
            {(isEditing || editingField !== null) && (
              <button className="p-2 rounded">
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.44573 2.60853H2.48794C1.96071 2.60853 1.45507 2.81797 1.08225 3.19078C0.709443 3.5636 0.5 4.06924 0.5 4.59647V18.5121C0.5 19.0393 0.709443 19.5449 1.08225 19.9177C1.45507 20.2906 1.96071 20.5 2.48794 20.5H16.4035C16.9308 20.5 17.4364 20.2906 17.8092 19.9177C18.182 19.5449 18.3915 19.0393 18.3915 18.5121V11.5543M16.9005 1.11757C17.2959 0.722148 17.8323 0.5 18.3915 0.5C18.9507 0.5 19.487 0.722148 19.8824 1.11757C20.2779 1.513 20.5 2.04931 20.5 2.60853C20.5 3.16775 20.2779 3.70406 19.8824 4.09949L10.4397 13.5422L6.46382 14.5362L7.45779 10.5603L16.9005 1.11757Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            )}
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
    <div className="min-h-screen bg-[#F2F2F4]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="text-sm text-[#797979] mb-6">
          {questions.length} questions total
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => renderQuestion(question, index))}
          
          {/* Add Question Button with Dropdown */}
          <div className="flex justify-center mt-8 relative" ref={questionTypeMenuRef}>
            <button
              onClick={() => setShowQuestionTypeMenu(!showQuestionTypeMenu)}
              className="flex text-sm w-full font-medium items-center justify-center gap-2 px-6 py-4 bg-white border border-[#E0E0E0] rounded-lg text-[#498FFF] hover:bg-gray-50 transition-colors"
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.79167 0.5V17.0333M0.5 8.76667H15.0833" stroke="#498FFF" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Add Question
            </button>

            {/* Question Type Dropdown Menu */}
            {showQuestionTypeMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleAddQuestion('multiple-choice')}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5"></div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Multiple Choice</div>
                      <div className="text-xs text-gray-500">Single correct answer</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddQuestion('multi-select')}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5"></div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Multi-Select</div>
                      <div className="text-xs text-gray-500">Multiple correct answers</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddQuestion('matching')}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
                      <path d="M3 3H7M3 8H7M9 3H13M9 8H13" stroke="#498FFF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Matching</div>
                      <div className="text-xs text-gray-500">Match items to options</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddQuestion('sorting')}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
                      <path d="M2 4H14M2 8H14M2 12H14" stroke="#498FFF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Sorting</div>
                      <div className="text-xs text-gray-500">Put items in order</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddQuestion('open-answer')}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
                      <path d="M2 4H14M2 8H10M2 12H12" stroke="#498FFF" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Open Answer</div>
                      <div className="text-xs text-gray-500">Text-based answer</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay; 