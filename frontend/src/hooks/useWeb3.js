/**
 * useWeb3 Hook
 * Custom hook for accessing Web3 context throughout the application
 * This is a re-export of the useWeb3 hook from Web3Context for convenience
 */

import { useWeb3 as useWeb3Context } from '../contexts/Web3Context';

export const useWeb3 = useWeb3Context;

export default useWeb3;


