import { useState, useEffect, useCallback } from 'react';
import { daoApi } from '../services/api';

export const useDAO = (daoId = null) => {
  const [dao, setDao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single DAO
  const fetchDAO = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await daoApi.getById(id);
      setDao(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch DAO');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch DAO if ID is provided
  useEffect(() => {
    if (daoId) {
      fetchDAO(daoId);
    }
  }, [daoId, fetchDAO]);

  // Create new DAO
  const createDAO = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await daoApi.create(daoData);
      setDao(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create DAO');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update DAO
  const updateDAO = useCallback(async (id, daoData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await daoApi.update(id, daoData);
      setDao(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update DAO');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete DAO
  const deleteDAO = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await daoApi.delete(id);
      setDao(null);
    } catch (err) {
      setError(err.message || 'Failed to delete DAO');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dao,
    loading,
    error,
    fetchDAO,
    createDAO,
    updateDAO,
    deleteDAO,
  };
};

export const useDAOs = () => {
  const [daos, setDaos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch all DAOs
  const fetchDAOs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await daoApi.getAll(params);
      setDaos(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch DAOs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search DAOs
  const searchDAOs = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await daoApi.search(query);
      setDaos(response.data);
    } catch (err) {
      setError(err.message || 'Failed to search DAOs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch DAO statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await daoApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch DAO stats:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDAOs();
    fetchStats();
  }, [fetchDAOs, fetchStats]);

  return {
    daos,
    loading,
    error,
    stats,
    fetchDAOs,
    searchDAOs,
    fetchStats,
  };
};

export default useDAO;