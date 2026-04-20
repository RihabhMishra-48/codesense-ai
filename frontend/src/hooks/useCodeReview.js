import { useCallback, useRef } from 'react';
import useAppStore from '../store/appStore';
import { reviewCode as apiReviewCode } from '../services/api';

export function useCodeReview() {
  const {
    code,
    language,
    user,
    setReviewResult,
    setIsReviewing,
    setReviewError,
    isReviewing,
  } = useAppStore();

  const debounceRef = useRef(null);

  const runReview = useCallback(
    async (codeToReview = code, lang = language) => {
      if (!codeToReview.trim() || isReviewing) return;

      setIsReviewing(true);
      setReviewError(null);

      try {
        const res = await apiReviewCode(codeToReview, lang, user?.id);
        setReviewResult(res.data.data);
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Review failed. Try again.';
        setReviewError(msg);
      } finally {
        setIsReviewing(false);
      }
    },
    [code, language, user, isReviewing, setReviewResult, setIsReviewing, setReviewError]
  );

  // Debounced version for real-time review
  const runReviewDebounced = useCallback(
    (codeToReview, lang) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (codeToReview.trim().length > 50) {
          runReview(codeToReview, lang);
        }
      }, 1800);
    },
    [runReview]
  );

  return { runReview, runReviewDebounced };
}
