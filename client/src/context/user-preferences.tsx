import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserPreferences {
  defaultTimeframe: string;
  theme: string;
  favoriteIndicators: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  theme: string;
  setTheme: (theme: string) => void;
}

const defaultPreferences: UserPreferences = {
  defaultTimeframe: "1D",
  theme: "light",
  favoriteIndicators: ["SMA", "EMA"],
};

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
  updatePreferences: async () => {},
  theme: "light",
  setTheme: () => {},
});

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState("light");
  
  const { data: preferences, isLoading, error } = useQuery<UserPreferences>({
    queryKey: ['/api/preferences'],
    // Don't throw errors for 404 (user without preferences yet)
    onError: () => {},
    initialData: defaultPreferences
  });
  
  const { mutateAsync: updatePreferencesMutation } = useMutation({
    mutationFn: async (newPrefs: Partial<UserPreferences>) => {
      const response = await apiRequest("PUT", "/api/preferences", newPrefs);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/preferences']
      });
    },
  });
  
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    await updatePreferencesMutation(newPrefs);
  };
  
  // Update theme when preferences load
  useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme);
    }
  }, [preferences]);
  
  // Update theme preference when theme changes
  useEffect(() => {
    if (preferences && theme !== preferences.theme) {
      updatePreferences({ theme });
    }
  }, [theme]);
  
  return (
    <UserPreferencesContext.Provider
      value={{
        preferences: preferences || defaultPreferences,
        isLoading,
        error: error as Error | null,
        updatePreferences,
        theme,
        setTheme,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => useContext(UserPreferencesContext);
