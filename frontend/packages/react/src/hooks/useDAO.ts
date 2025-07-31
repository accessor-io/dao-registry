import { useState, useEffect } from 'react';
import { DAORegistry, DAOData, GovernanceData, TreasuryData, TokenData, AnalyticsData, SocialData } from '@dao-registry/core';

/**
 * React hook for fetching DAO data
 */
export function useDAO(identifier: string) {
  const [data, setData] = useState<DAOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const daoData = await registry.get(identifier);
        
        setData(daoData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchData();
    }
  }, [identifier]);

  return { data, loading, error };
}

/**
 * React hook for fetching DAO governance data
 */
export function useDAOGovernance(identifier: string) {
  const [data, setData] = useState<GovernanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const governanceData = await registry.getGovernance(identifier);
        
        setData(governanceData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchData();
    }
  }, [identifier]);

  return { data, loading, error };
}

/**
 * React hook for fetching DAO treasury data
 */
export function useDAOTreasury(identifier: string) {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const treasuryData = await registry.getTreasury(identifier);
        
        setData(treasuryData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchData();
    }
  }, [identifier]);

  return { data, loading, error };
}

/**
 * React hook for fetching DAO token data
 */
export function useDAOToken(identifier: string) {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const tokenData = await registry.getToken(identifier);
        
        setData(tokenData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchData();
    }
  }, [identifier]);

  return { data, loading, error };
}

/**
 * React hook for fetching DAO analytics data
 */
export function useDAOAnalytics(identifier: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const analyticsData = await registry.getAnalytics(identifier);
        
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchData();
    }
  }, [identifier]);

  return { data, loading, error };
}

/**
 * React hook for fetching DAO social data
 */
export function useDAOSocial(identifier: string) {
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const socialData = await registry.getSocial(identifier);
        
        setData(socialData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchData();
    }
  }, [identifier]);

  return { data, loading, error };
}

/**
 * React hook for searching DAOs
 */
export function useDAOSearch(query: string) {
  const [data, setData] = useState<DAOData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchDAOs = async () => {
      if (!query || query.length < 2) {
        setData([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const searchResults = await registry.search(query);
        
        setData(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchDAOs, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { data, loading, error };
}

/**
 * React hook for trending DAOs
 */
export function useTrendingDAOs() {
  const [data, setData] = useState<DAOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const registry = new DAORegistry();
        const trendingDAOs = await registry.getTrending();
        
        setData(trendingDAOs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { data, loading, error };
} 