import React from 'react';
import Toast from 'react-native-toast-message';

export const Toaster: React.FC = () => {
  return (
    <Toast
      position="top"
      topOffset={60}
      visibilityTime={4000}
    />
  );
};
