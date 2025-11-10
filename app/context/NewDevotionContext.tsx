import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NewDevotionContextType {
  hasNewDevotion: boolean;
  setHasNewDevotion: (hasNew: boolean) => void;
}

const NewDevotionContext = createContext<NewDevotionContextType | undefined>(undefined);

export const NewDevotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasNewDevotion, setHasNewDevotion] = useState(false);

  return (
    <NewDevotionContext.Provider value={{ hasNewDevotion, setHasNewDevotion }}>
      {children}
    </NewDevotionContext.Provider>
  );
};

export const useNewDevotion = () => {
  const context = useContext(NewDevotionContext);
  if (context === undefined) {
    throw new Error('useNewDevotion must be used within a NewDevotionProvider');
  }
  return context;
};
