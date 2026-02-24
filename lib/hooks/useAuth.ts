'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function useAuth() {
  const { user, isLoaded } = useUser();
  
  return { 
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      displayName: user.fullName || user.username || '',
    } : null, 
    loading: !isLoaded 
  };
}
