import { useState, useEffect } from 'react';
import { apiService, getGlobalEstablishmentId, setGlobalEstablishmentId } from '../services/api';

export const useEstablishment = () => {
  const [establishmentId, setEstablishmentId] = useState<number | null>(null);
  const [establishments, setEstablishments] = useState<Array<{ id: number; role: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeEstablishment();
  }, []);

  const initializeEstablishment = () => {
    setIsLoading(true);
    
    // Get current establishment ID
    const currentId = getGlobalEstablishmentId();
    setEstablishmentId(currentId);

    // Get user establishments from token
    const userEstablishments = apiService.getUserEstablishments();
    setEstablishments(userEstablishments);

    // If no establishment is set but user has establishments, set the first one
    if (currentId === null && userEstablishments && userEstablishments.length > 0) {
      const firstEstablishmentId = userEstablishments[0].id;
      setGlobalEstablishmentId(firstEstablishmentId);
      setEstablishmentId(firstEstablishmentId);
    }

    setIsLoading(false);
  };

  const switchEstablishment = (id: number) => {
    // Validate that the user has access to this establishment
    if (establishments && establishments.find(est => est.id === id)) {
      setGlobalEstablishmentId(id);
      setEstablishmentId(id);
      return true;
    }
    return false;
  };

  const refresh = () => {
    initializeEstablishment();
  };

  return {
    establishmentId,
    establishments,
    isLoading,
    switchEstablishment,
    refresh,
    hasMultipleEstablishments: establishments && establishments.length > 1,
    currentRole: establishments?.find(est => est.id === establishmentId)?.role || null,
  };
};