'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook that returns `true` only after the component has mounted on the client.
 * This is useful to prevent hydration mismatches when rendering UI that depends
 * on client-only APIs like `window` or `localStorage`.
 * @returns {boolean} - `true` if the component has mounted, `false` otherwise.
 */
export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}; 