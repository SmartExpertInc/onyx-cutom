// custom_extensions/frontend/src/utils/quizRenderUtils.tsx
import React from 'react';
import {
  AnyQuizQuestion, MultipleChoiceQuestion, MultiSelectQuestion,
  MatchingQuestion, SortingQuestion, OpenAnswerQuestion, SortableItem
} from '@/types/quizTypes';

interface QuizRenderProps {
  question: AnyQuizQuestion;
  index: number;
  userAnswers: Record<number, any>;
  showAnswers: boolean;
  isSubmitted: boolean;
  isEditing?: boolean;
  handleTextChange?: (path: (string | number)[], newValue: any) => void;
  t: (key: string, fallback: string) => string;
}

export const renderMultipleChoiceQuestion = ({
  question,
  index,
  userAnswers,
  showAnswers,
  isSubmitted,
  isEditing,
  handleTextChange,
  t
}: QuizRenderProps & { question: MultipleChoiceQuestion }) => {
  const isCorrect = userAnswers[index] === question.correct_option_id;
  const showResult = isSubmitted && showAnswers;

  const handleCorrectAnswerChange = (optionId: string, isCorrect: boolean) => {
    if (handleTextChange) {
      handleTextChange(['questions', index, 'correct_option_id'], optionId);
    }
  };

  return (
    <div className="mt-4">
      <div className="space-y-2">
        {question.options.map((option, optIndex) => (
          <div key={option.id} className="flex items-start">
            <div className={`flex items-center h-5 ${isEditing ? 'cursor-pointer' : ''}`}>
              <div 
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  option.id === question.correct_option_id ? 'border-[#2563eb] bg-[#2563eb]' : 'border-gray-300'
                }`}
                onClick={() => isEditing && handleCorrectAnswerChange(option.id, option.id === question.correct_option_id)}
              >
                {option.id === question.correct_option_id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                {!isEditing && (
                  <span className="font-medium mr-2 text-black">
                    {String.fromCharCode(65 + optIndex)}.
                  </span>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleTextChange && handleTextChange(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                    className="w-full p-2 border rounded text-black"
                  />
                ) : (
                  <span className="text-black">{option.text}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {renderExplanation(question, index, isEditing, handleTextChange, t)}
    </div>
  );
};

export const renderMultiSelectQuestion = ({
  question,
  index,
  userAnswers,
  showAnswers,
  isSubmitted,
  isEditing,
  handleTextChange,
  t
}: QuizRenderProps & { question: MultiSelectQuestion }) => {
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

  const handleCorrectAnswerChange = (optionId: string, isCorrect: boolean) => {
    if (!handleTextChange) return;
    
    const newCorrectIds = isCorrect
      ? correctIds.filter(id => id !== optionId)
      : [...correctIds, optionId];
    handleTextChange(['questions', index, 'correct_option_ids'], newCorrectIds);
  };

  return (
    <div className="mt-4">
      <div className="space-y-2">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-start">
            <div className={`flex items-center h-5 ${isEditing ? 'cursor-pointer' : ''}`}>
              <div 
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  correctIds.includes(option.id) ? 'border-[#2563eb] bg-[#2563eb]' : 'border-gray-300'
                }`}
                onClick={() => isEditing && handleCorrectAnswerChange(option.id, correctIds.includes(option.id))}
              >
                {correctIds.includes(option.id) && (
                  <div className="w-2 h-2 bg-white" />
                )}
              </div>
            </div>
            <div className="ml-3 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleTextChange && handleTextChange(['questions', index, 'options', question.options.findIndex(o => o.id === option.id), 'text'], e.target.value)}
                  className="w-full p-2 border rounded text-black"
                />
              ) : (
                <span className="text-black">{option.text}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {renderExplanation(question, index, isEditing, handleTextChange, t)}
    </div>
  );
};

export const renderMatchingQuestion = ({
  question,
  index,
  userAnswers,
  showAnswers,
  isSubmitted,
  isEditing,
  handleTextChange,
  t
}: QuizRenderProps & { question: MatchingQuestion }) => {
  const userAnswer = userAnswers[index] || {};
  const isCorrect = Object.entries(question.correct_matches).every(
    ([promptId, optionId]: [string, string]) => userAnswer[promptId] === optionId
  );
  const showResult = isSubmitted && showAnswers;

  const handleMatchChange = (promptId: string, newOptionId: string) => {
    if (!handleTextChange) return;
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
                    onChange={(e) => handleTextChange && handleTextChange(['questions', index, 'prompts', promptIndex, 'text'], e.target.value)}
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
                    onChange={(e) => handleTextChange && handleTextChange(['questions', index, 'options', optionIndex, 'text'], e.target.value)}
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
      {renderExplanation(question, index, isEditing, handleTextChange, t)}
    </div>
  );
};

export const renderSortingQuestion = ({
  question,
  index,
  userAnswers,
  showAnswers,
  isSubmitted,
  isEditing,
  handleTextChange,
  t
}: QuizRenderProps & { question: SortingQuestion }) => {
  const userAnswer = userAnswers[index] || [];
  const isCorrect = question.items_to_sort.every((item: SortableItem, i: number) => item.id === userAnswer[i]);
  const showResult = isSubmitted && showAnswers;
  
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
              {isEditing ? (
                <input
                  type="text"
                  value={item?.text || ''}
                  onChange={(e) => handleTextChange && handleTextChange(['questions', index, 'items_to_sort', question.items_to_sort.findIndex(i => i.id === itemId), 'text'], e.target.value)}
                  className="flex-1 p-1 border rounded text-black"
                />
              ) : (
                <span className="text-black">{item?.text}</span>
              )}
            </div>
          );
        })}
      </div>
      {renderExplanation(question, index, isEditing, handleTextChange, t)}
    </div>
  );
};

export const renderOpenAnswerQuestion = ({
  question,
  index,
  userAnswers,
  showAnswers,
  isSubmitted,
  isEditing,
  handleTextChange,
  t
}: QuizRenderProps & { question: OpenAnswerQuestion }) => {
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
                onChange={(e) => handleTextChange && handleTextChange(['questions', index, 'acceptable_answers', answerIndex], e.target.value)}
                className="w-full p-2 border rounded text-black"
              />
            ) : (
              <p className="text-black">{answer}</p>
            )}
          </div>
        ))}
      </div>
      {renderExplanation(question, index, isEditing, handleTextChange, t)}
    </div>
  );
};

const renderExplanation = (
  question: AnyQuizQuestion,
  index: number,
  isEditing?: boolean,
  handleTextChange?: (path: (string | number)[], newValue: any) => void,
  t?: (key: string, fallback: string) => string
) => {
  if (isEditing && handleTextChange && t) {
    return (
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
    );
  } else if (question.explanation) {
    return (
      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(9, 200, 25, 0.2)' }}>
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded text-black flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9.063 18.045c-.046-1.131-.794-2.194-1.803-3.18a7.5 7.5 0 1 1 10.48 0c-1.041 1.017-1.805 2.117-1.805 3.29v1.595a2.25 2.25 0 0 1-2.25 2.25h-2.373a2.25 2.25 0 0 1-2.25-2.25zM6.5 9.5a5.98 5.98 0 0 0 1.808 4.293c.741.724 1.512 1.633 1.933 2.707h4.518c.421-1.074 1.192-1.984 1.933-2.707A6 6 0 1 0 6.5 9.5m4.063 8.713v1.537c0 .414.335.75.75.75h2.372a.75.75 0 0 0 .75-.75V18h-3.873v.017a4 4 0 0 1 0 .196M1.75 9.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75m2.465-5.65a.75.75 0 1 0-.75 1.3l.866.5a.75.75 0 1 0 .75-1.3zM3.19 14.875a.75.75 0 0 1 .275-1.024l.866-.5a.75.75 0 0 1 .75 1.298l-.866.5a.75.75 0 0 1-1.025-.274M21.5 8.75a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5zm-1.855 4.875a.75.75 0 0 1 1.025-.274l.866.5a.75.75 0 1 1-.75 1.298l-.866-.5a.75.75 0 0 1-.275-1.024m.275-9.275a.75.75 0 0 0 .75 1.3l.866-.5a.75.75 0 1 0-.75-1.3z"/>
            </svg>
          </div>
          <p className="text-sm text-black flex-1">{question.explanation}</p>
        </div>
      </div>
    );
  }
  return null;
};

export const renderQuestionByType = (props: QuizRenderProps) => {
  const { question } = props;
  
  switch (question.question_type) {
    case 'multiple-choice':
      return renderMultipleChoiceQuestion({...props, question: question as MultipleChoiceQuestion});
    case 'multi-select':
      return renderMultiSelectQuestion({...props, question: question as MultiSelectQuestion});
    case 'matching':
      return renderMatchingQuestion({...props, question: question as MatchingQuestion});
    case 'sorting':
      return renderSortingQuestion({...props, question: question as SortingQuestion});
    case 'open-answer':
      return renderOpenAnswerQuestion({...props, question: question as OpenAnswerQuestion});
    default:
      return <div className="text-red-500">Unsupported question type: {question.question_type}</div>;
  }
}; 