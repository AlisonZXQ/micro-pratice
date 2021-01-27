import React, { useRef } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import usePrevious from '../../CustomHooks/usePrevious';

describe('usePrevious', () => {
  it('should be defined', () => {
    expect(usePrevious).toBeDefined();
  });

  function getHook(val) {
    return renderHook(() => usePrevious(val));
  }

  it('should update previous value only after render with different value', () => {
    const hook = getHook(0);

    expect(hook.result.current).toBeUndefined();

    hook.rerender(1);
    expect(hook.result.current).toBe(0);
  });
});
