// components/CompletionFlow.tsx
import { useState } from 'react';
import { WorkflowItem } from '../lib/types';
import { saveItem } from '../lib/data-store';

interface CompletionQuestion {
  id: string;
  question: string;
  tag: string;
  followUp?: string[];
  note?: string;
}

interface CompletionFlowProps {
  item: WorkflowItem;
  onComplete: () => void;
  onCancel: () => void;
}

export default function CompletionFlow({ item, onComplete, onCancel }: CompletionFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // Define questions
  const questions: CompletionQuestion[] = [
    {
      id: 'investor',
      question: 'Would this be appropriate to update investors about?',
      tag: 'update:investors'
    },
    {
      id: 'users',
      question: 'Would this be appropriate to update users about?',
      tag: 'update:users',
      followUp: ['ad', 'email', 'blog', 'changelog']
    },
    {
      id: 'ad',
      question: 'Would this be appropriate content to turn into an ad?',
      tag: 'content:ad'
    },
    {
      id: 'email',
      question: 'Should this go into an email update to all users?',
      tag: 'content:email',
      note: 'If this is both substantial and high impact, it should'
    },
    {
      id: 'blog',
      question: 'Should this go into the blog?',
      tag: 'content:blog'
    },
    {
      id: 'changelog',
      question: 'Should this go into the change log?',
      tag: 'content:changelog'
    },
    {
      id: 'team',
      question: 'Would this be something you should notify your team about?',
      tag: 'update:team'
    }
  ];

  // Get current question
  const questionSequence = ['investor', 'users', 'team'];

  // Add follow-up questions based on answers
  if (answers.users === true) {
    // Insert follow-up questions after 'users'
    questionSequence.splice(2, 0, 'ad', 'email', 'blog', 'changelog');
  }

  const currentQuestionId = questionSequence[currentStep];
  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const handleAnswer = async (answer: boolean) => {
    // Save this answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionId]: answer
    }));

    // Move to next question or complete flow
    if (currentStep < questionSequence.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // We're done, process all answers
      await processCompletionAnswers();
    }
  };

  const processCompletionAnswers = async () => {
    try {
      const updatedItem: WorkflowItem = { ...item };

      // Initialize or get existing metadata
      updatedItem.metadata = updatedItem.metadata || {};
      updatedItem.metadata.completionFlow = answers;

      // Add tags based on answers
      updatedItem.systemTags = updatedItem.systemTags || [];

      // Process each answer and add appropriate tags
      Object.entries(answers).forEach(([key, value]) => {
        if (value) {
          const question = questions.find((q) => q.id === key);
          if (question) {
            updatedItem.systemTags.push(question.tag);
          }
        }
      });

      // Save the updated item
      await saveItem(updatedItem);
      onComplete();
    } catch (error) {
      console.error('Error processing completion answers:', error);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="completion-flow">
      <div className="completion-header">
        <h2>Completion Questionnaire</h2>
        <button className="close-btn" onClick={onCancel}>
          ×
        </button>
      </div>

      <div className="completion-content">
        <div className="completion-item-preview">
          <h3>{item.title}</h3>
          <p className="item-text">{item.text || 'No description'}</p>
        </div>

        <div className="completion-question">
          <h3>
            Question {currentStep + 1} of {questionSequence.length}
          </h3>
          <p className="question-text">{currentQuestion.question}</p>

          {currentQuestion.note && <p className="question-note">{currentQuestion.note}</p>}

          <div className="completion-actions">
            <button className="completion-btn yes-btn" onClick={() => handleAnswer(true)}>
              Yes
            </button>
            <button className="completion-btn no-btn" onClick={() => handleAnswer(false)}>
              No
            </button>
          </div>
        </div>

        <div className="completion-progress">
          <div
            className="progress-bar"
            style={{ width: `${((currentStep + 1) / questionSequence.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
