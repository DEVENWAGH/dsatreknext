'use client';

import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PropTypes from 'prop-types';

const difficulties = [
  { value: 'all', label: 'All Difficulty' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const DifficultyFilter = ({ selectedDifficulty, onDifficultyChange }) => (
  <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
    <SelectTrigger className="w-32">
      <SelectValue placeholder="All Difficulty">
        {difficulties.find(d => d.value === selectedDifficulty)?.label ||
          'All Difficulty'}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {difficulties.map(diff => (
        <SelectItem key={diff.value} value={diff.value}>
          {diff.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

DifficultyFilter.propTypes = {
  selectedDifficulty: PropTypes.string.isRequired,
  onDifficultyChange: PropTypes.func.isRequired,
};

export default DifficultyFilter;
