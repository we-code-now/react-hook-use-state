import useState from './useState';
import IndexUseState from './index';

describe('index.js', () => {
  describe('useState()', () => {
    it('should be exported correctly', () => {
      expect(useState).toEqual(IndexUseState);
    });
  });
});
