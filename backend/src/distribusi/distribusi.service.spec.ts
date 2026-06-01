import { isValidTransition } from './distribusi.service';
import { StatusDistribusi } from '@prisma/client';

describe('Distribusi state machine — isValidTransition', () => {
  describe('TIM_DAPUR', () => {
    it.each<[StatusDistribusi, StatusDistribusi, boolean]>([
      ['DRAFT', 'DIKIRIM', true],
      ['DRAFT', 'BERMASALAH', true],
      ['DITERIMA', 'SELESAI', true],
      ['BERMASALAH', 'SELESAI', true],
      ['DRAFT', 'DITERIMA', false],
      ['DRAFT', 'SELESAI', false],
      ['DIKIRIM', 'DITERIMA', false],
      ['SELESAI', 'DRAFT', false],
    ])('%s → %s = %s', (from, to, expected) => {
      expect(isValidTransition(from, to, 'TIM_DAPUR')).toBe(expected);
    });
  });

  describe('GURU', () => {
    it.each<[StatusDistribusi, StatusDistribusi, boolean]>([
      ['DIKIRIM', 'DITERIMA', true],
      ['DIKIRIM', 'BERMASALAH', true],
      ['DITERIMA', 'DIKIRIM', true],
      ['DITERIMA', 'BERMASALAH', true],
      ['BERMASALAH', 'DITERIMA', true],
      ['DRAFT', 'DIKIRIM', false],
      ['DITERIMA', 'SELESAI', false],
      ['SELESAI', 'DITERIMA', false],
    ])('%s → %s = %s', (from, to, expected) => {
      expect(isValidTransition(from, to, 'GURU')).toBe(expected);
    });
  });
});
