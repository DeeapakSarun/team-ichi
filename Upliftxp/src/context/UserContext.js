import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, getUserProfile } from '../services/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserData(profile);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const updateUserData = (newData) => {
    setUserData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const calculateLevel = (xp) => {
    // Level 1: 0-1000 XP
    // Level 2: 1000-2000 XP
    // Level 3: 2000-3000 XP
    // Level 4: 3000-4000 XP
    // Level 5: 4000-5000 XP
    // Level 6: 5000-6000 XP
    // Level 7: 6000-7000 XP
    // Level 8: 7000-8000 XP
    // Level 9: 8000-9000 XP
    // Level 10+: 9000+ XP (increases by 1000 XP per level)
    if (xp < 1000) return 1;
    if (xp < 9000) return Math.floor(xp / 1000) + 1;
    return Math.floor((xp - 9000) / 1000) + 10;
  };

  const calculateLevelProgress = (xp) => {
    const level = calculateLevel(xp);
    if (level < 10) {
      // For levels 1-9, progress is based on 1000 XP per level
      const levelStartXP = (level - 1) * 1000;
      const levelEndXP = level * 1000;
      return (xp - levelStartXP) / (levelEndXP - levelStartXP);
    } else {
      // For levels 10+, progress is based on 1000 XP per level
      const levelStartXP = 9000 + (level - 10) * 1000;
      const levelEndXP = levelStartXP + 1000;
      return (xp - levelStartXP) / (levelEndXP - levelStartXP);
    }
  };

  return (
    <UserContext.Provider value={{ userData, loading, updateUserData, refreshUserData: loadUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 