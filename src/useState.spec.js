import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, fireEvent } from '@testing-library/react';

import { act } from 'react-dom/test-utils';
import useState from './useState';

function withUseState(useStateFn) {
  return ({ initialCount = 0 }) => {
    const [count, setCount] = useStateFn(initialCount);
    const increase = () => setCount(prevCount => prevCount + 1);
    const increaseDelay = () => setTimeout(increase, 1000);

    return (
      <div>
        <span data-testid="count">{count}</span>
        <button type="button" onClick={increase}>
          Increase Now
        </button>
        <button type="button" onClick={increaseDelay}>
          Increase Delay
        </button>
      </div>
    );
  };
}

const CounterWithLibUseState = withUseState(useState);
const CounterWithReactUseState = withUseState(React.useState);

describe('useState.js', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterEach(cleanup);

  describe('useState()', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(console, 'error');
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it('should work with "Increase Now" click', () => {
      const { getByText, getByTestId } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Now/i));
      expect(getByTestId('count')).toHaveTextContent(/^11$/);
    });

    it('should work with "Increase Delay" click', () => {
      const { getByText, getByTestId } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Delay/i));
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(getByTestId('count')).toHaveTextContent(/^11$/);
    });

    it('should move on with "Increase Delay" click after component is unmounted (lib.useState())', () => {
      const { unmount, getByText, getByTestId } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Delay/i));
      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(spy).not.toHaveBeenCalled();
    });

    it('should log error with "Increase Delay" click after component is unmounted (React.useState())', () => {
      const { unmount, getByText, getByTestId } = render(
        <CounterWithReactUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Delay/i));
      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(spy).toHaveBeenCalled();
    });
  });
});
