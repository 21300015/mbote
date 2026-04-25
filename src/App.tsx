/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';

// Placeholder components - will be created next
import Landing from './views/Landing';
import RiderHome from './views/RiderHome';
import DriverHome from './views/DriverHome';
import AuthView from './views/AuthView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo Mode Check
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      const demoRole = localStorage.getItem('demo_role') || 'rider';
      setUser({ 
        uid: 'demo_user_123', 
        email: 'demo@mbote.cd',
        displayName: 'Demo User (Meeting)',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
      } as any);
      setProfile({
        uid: 'demo_user_123',
        displayName: 'Demo User (Meeting)',
        email: 'demo@mbote.cd',
        role: demoRole as any,
        isActive: true,
        activeRideId: null,
      } as UserProfile);
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) return;

    if (user) {
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Landing /> : (profile?.role === 'driver' ? <Navigate to="/driver" /> : <Navigate to="/rider" />)} />
        <Route path="/auth" element={!user ? <AuthView /> : <Navigate to="/" />} />
        
        <Route 
          path="/rider/*" 
          element={user && profile?.role === 'rider' ? <RiderHome profile={profile} /> : <Navigate to="/auth" />} 
        />
        
        <Route 
          path="/driver/*" 
          element={user && profile?.role === 'driver' ? <DriverHome profile={profile} /> : <Navigate to="/auth" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
