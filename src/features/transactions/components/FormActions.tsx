import React from 'react';

interface Props {
  onSubmit: (e?: React.FormEvent) => unknown;
  onReset: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const FormActions: React.FC<Props> = ({ onSubmit, onReset, onCancel, isSubmitting }) => (
  <div className="pt-4 flex gap-3">
    <button
      type="button"
      onClick={onReset}
      className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
    >
      Reset
    </button>
    <button
      type="submit"
      onClick={onSubmit}
      disabled={isSubmitting}
      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
    >
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
  </div>
); 