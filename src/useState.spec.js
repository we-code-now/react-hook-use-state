import React from 'react';
import { shallow } from 'enzyme';

import useState from './useState';

function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  return (
    <div>
      <span className="count">{count}</span>
      <button
        type="button"
        onClick={() => setCount(count + 1)}
      >
        Increase 1
      </button>
    </div>
  );
}

describe('useState.js', () => {
  describe('useState()', () => {
    it('should be exported correctly', () => {
      const wrapper = shallow(<Counter initialCount={10} />);
      expect(wrapper.find('.count').text()).toEqual('10');
    });
  });
});
