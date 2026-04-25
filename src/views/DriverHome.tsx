import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Location, Ride } from '../types';
import InteractiveMap from '../components/Map';
import { 
  Car, 
  X, 
  CheckCircle2, 
  User as UserIcon,
  LogOut,
  Navigation2,
  Menu,
  History,
  Home,
  Wallet,
  Power,
  TrendingUp,
  MapPin,
  Settings,
  MessageSquare,
  ArrowRight,
  Star
} from 'lucide-react';

const KINSHASA_CENTER: Location = { lat: -4.3276, lng: 15.3139 };

export default function DriverHome({ profile }: { profile: UserProfile }) {
  const [currentLocation, setCurrentLocation] = useState<Location & { timestamp?: number }>(KINSHASA_CENTER);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isOnline, setIsOnline] = useState(profile.isActive || false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  // 1. Watch Location & Sync (Only if not in demo mode)
  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true') {
      return; // Stick to Kinshasa Center for demo
    }
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() };
          setCurrentLocation(loc);
          if (isOnline) {
            updateDoc(doc(db, 'users', profile.uid), { currentLocation: loc }).catch(console.error);
          }
        },
        (err) => console.warn('Geolocation failed', err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOnline, profile.uid]);

  // 2. Fetch available rides (unclaimed)
  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true' && isOnline && !profile.activeRideId) {
      setAvailableRides([
        { 
          id: 'JOB-101', 
          riderName: 'Jean Kabamba', 
          gender: 'male',
          pickup: { lat: -4.3100, lng: 15.3000 }, 
          pickupAddress: 'La Grand Port, P824+JFV, Kinshasa',
          destinationAddress: 'Le valable business, 012, Kinshasa',
          travelDistance: 2.0,
          pickupDistance: 1.2,
          baseFare: 5000,
          platformFee: 750,
          price: 5750,
          status: 'requested',
          rating: 4.8,
          comments: 'I have a large suitcase, please assist.',
          paymentMethod: 'Cash'
        },
        { 
          id: 'JOB-102', 
          riderName: 'Marie Lunda', 
          gender: 'female',
          pickup: { lat: -4.3200, lng: 15.3100 }, 
          pickupAddress: 'Gombe District, Kinshasa',
          destinationAddress: 'Downtown Center Hub, Limete',
          travelDistance: 5.0,
          pickupDistance: 0.8,
          baseFare: 12500,
          platformFee: 1875,
          price: 14375,
          status: 'requested',
          rating: 5.0,
          comments: 'Please call when you arrive at the gate.',
          paymentMethod: 'Cash'
        },
      ] as any);
      return;
    }
    if (isOnline && !profile.activeRideId) {
      const q = query(
        collection(db, 'rides'), 
        where('status', '==', 'requested'),
        limit(5)
      );
      const unsub = onSnapshot(q, (snap) => {
        setAvailableRides(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ride)));
      });
      return unsub;
    } else {
      setAvailableRides([]);
    }
  }, [isOnline, profile.activeRideId]);

  // 3. Watch active ride
  useEffect(() => {
    if (profile.activeRideId) {
      const unsub = onSnapshot(doc(db, 'rides', profile.activeRideId), (snap) => {
        if (snap.exists()) {
          setActiveRide({ id: snap.id, ...snap.data() } as Ride);
        } else {
          setActiveRide(null);
        }
      });
      return unsub;
    }
  }, [profile.activeRideId]);

  const toggleOnline = async () => {
    try {
      const newState = !isOnline;
      if (localStorage.getItem('demo_mode') === 'true') {
        setIsOnline(newState);
        return;
      }
      await updateDoc(doc(db, 'users', profile.uid), { isActive: newState });
      setIsOnline(newState);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const acceptRide = async (ride: Ride) => {
    try {
      if (localStorage.getItem('demo_mode') === 'true') {
        setActiveRide({
          ...ride,
          status: 'accepted',
          driverId: profile.uid,
          driverName: profile.displayName,
        });
        return;
      }
      await updateDoc(doc(db, 'rides', ride.id), {
        status: 'accepted',
        driverId: profile.uid,
        driverName: profile.displayName,
        updatedAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'users', profile.uid), { activeRideId: ride.id });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'rides');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_role');
    auth.signOut();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans">
      
      {/* 1. Map Area (Full Screen Background) */}
      <main className="absolute inset-0 w-full h-full z-0">
        <InteractiveMap 
          center={currentLocation}
          driverLocation={currentLocation}
          nearbyDrivers={[]} 
          activeRides={availableRides.map(r => ({
            id: r.id,
            pickup: r.pickup,
            riderName: r.riderName,
            gender: (r as any).gender || 'male'
          }))}
          onRideClick={(id) => setSelectedRideId(id)}
        />
        
        {/* Floating Top Bar (White Theme) */}
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center pointer-events-none z-10">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center justify-center pointer-events-auto border border-white/50 backdrop-blur-sm"
          >
            <Menu className="text-slate-900 w-6 h-6" />
          </button>
          
          <button 
            onClick={toggleOnline}
            className={`px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border border-white/50 text-[11px] font-black uppercase tracking-widest pointer-events-auto transition-all ${isOnline ? 'bg-green-500 text-white' : 'bg-white/90 text-slate-400'}`}
          >
            {isOnline ? '● Active Duty' : '○ Offline'}
          </button>

          <button 
            onClick={() => setCurrentLocation(KINSHASA_CENTER)}
            className="w-12 h-12 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center justify-center pointer-events-auto border border-white/50 backdrop-blur-sm"
          >
            <Navigation2 className="text-slate-900 w-6 h-6" />
          </button>
        </div>
      </main>

      {/* 2. Bottom Control Panel (White Theme) */}
      <motion.aside 
        initial={false}
        animate={{ 
          height: isSheetExpanded ? '65%' : '30%',
          y: isMenuOpen ? 100 : 0,
          opacity: isMenuOpen ? 0 : 1
        }}
        className="mt-auto bg-white rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] z-30 flex flex-col relative border-t border-slate-100"
      >
        <div 
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          className="w-full py-5 flex justify-center cursor-pointer"
        >
          <div className="w-14 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="px-8 flex-1 overflow-y-auto pb-28">
          <AnimatePresence mode="wait">
            {!activeRide ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Nearby Jobs</h2>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{isOnline ? `${availableRides.length} active dispatches` : 'Connect to hub for dispatches'}</p>
                   </div>
                   <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center border border-yellow-100">
                     <TrendingUp className="text-yellow-600 w-6 h-6" />
                   </div>
                </div>

                {!isOnline ? (
                   <div className="py-8 text-center space-y-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                      <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                         <Power className="text-slate-300 w-10 h-10" />
                      </div>
                      <div>
                         <p className="text-base font-black text-slate-900">System Standby</p>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gombe sector monitoring inactive</p>
                      </div>
                      <button 
                        onClick={toggleOnline}
                        className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200"
                      >
                        Enable Service
                      </button>
                   </div>
                ) : (
                  <div className="space-y-4">
                    {availableRides.map(ride => (
                      <motion.div 
                        key={ride.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={() => setSelectedRideId(ride.id)}
                        className="p-6 bg-white border border-slate-100 rounded-[32px] flex items-center justify-between group hover:border-yellow-400 transition-all shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                              <UserIcon className="text-slate-400 w-7 h-7" />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-lg leading-none">{ride.riderName}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Distance: {ride.pickupDistance?.toFixed(1) || '1.2'} KM</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => acceptRide(ride)}
                          className="px-8 py-4 bg-yellow-400 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-yellow-100 group-hover:scale-105 transition-all"
                        >
                          Accept
                        </button>
                      </motion.div>
                    ))}
                    {availableRides.length === 0 && (
                       <div className="text-center py-12 bg-slate-50 rounded-[32px] border border-slate-100 border-dashed">
                          <div className="animate-pulse text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">Sector Monitoring...</div>
                       </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                   <div className="px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-lg font-black text-[10px] uppercase tracking-widest italic shadow-sm">
                      ACTIVE DISPATCH
                   </div>
                   <div className="text-lg font-black text-slate-900 tracking-tighter">{activeRide.price.toLocaleString()} CDF</div>
                </div>

                <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Hub</p>
                   <h3 className="text-2xl font-black leading-tight mb-6">Gombe Metropolitan Hub</h3>
                   <div className="flex items-center gap-3 text-yellow-400">
                      <MapPin size={16} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Navigation Locked</span>
                   </div>
                </div>

                <div className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                      <img src={`https://ui-avatars.com/api/?name=${activeRide.riderName}&background=f1f5f9&color=0f172a`} className="w-full h-full" alt="" />
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-slate-900 text-lg leading-none">{activeRide.riderName}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Verified Hub User</p>
                   </div>
                   <button className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <Power size={22} />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation (White Theme) */}
        <div className="absolute bottom-0 w-full h-24 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-10 flex justify-between items-center z-40">
           <NavButton icon={Home} label="Status" active onClick={() => setIsSheetExpanded(false)} />
           <NavButton icon={TrendingUp} label="Earnings" />
           <NavButton icon={History} label="History" />
           <NavButton icon={UserIcon} label="Profile" onClick={() => setIsMenuOpen(true)} />
        </div>
      </motion.aside>

      {/* Side Drawer (White Theme) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/40 z-[60] backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 bottom-0 w-[85%] bg-white z-[70] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden">
                  <img src="/Mbote%20Ride%20Logo.png" alt="Mbote Ride Logo" className="w-full h-full object-contain" />
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-100 rounded-2xl">
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-12 p-6 bg-slate-900 text-white rounded-[32px] shadow-xl">
                 <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Car size={32} className="text-yellow-400" />
                 </div>
                 <div>
                    <p className="font-black text-xl leading-none">{profile.displayName}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Verified Partner</p>
                 </div>
              </div>

              <div className="space-y-2 flex-1">
                <DrawerItem icon={History} label="Job History" />
                <DrawerItem icon={TrendingUp} label="Financial Analytics" />
                <DrawerItem icon={Wallet} label="Wallet & Payouts" />
                <DrawerItem icon={Settings} label="System Config" />
              </div>

              <button 
                onClick={handleLogout}
                className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} /> Log Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ride Details Modal */}
      <AnimatePresence>
        {selectedRideId && (
          <RideDetailsModal 
            ride={availableRides.find(r => r.id === selectedRideId) || null} 
            onClose={() => setSelectedRideId(null)}
            onAccept={(ride) => {
              acceptRide(ride);
              setSelectedRideId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DrawerItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="w-full p-5 flex items-center gap-5 hover:bg-slate-50 rounded-2xl transition-colors group text-left">
      <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
        <Icon size={20} className="text-slate-400 group-hover:text-slate-900" />
      </div>
      <span className="font-black text-slate-700 group-hover:text-slate-900 text-sm">{label}</span>
    </button>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group flex-1">
      <Icon className={`w-6 h-6 transition-all ${active ? 'text-slate-900 scale-110' : 'text-slate-300 group-hover:text-slate-500'}`} />
      <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-500'}`}>{label}</span>
    </button>
  );
}

function RideDetailsModal({ ride, onClose, onAccept }: { ride: any, onClose: () => void, onAccept: (ride: any) => void }) {
  if (!ride) return null;
  
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col border border-white"
      >
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl overflow-hidden border-4 border-slate-50">
               <img src={`https://ui-avatars.com/api/?name=${ride.riderName}&background=0f172a&color=fff&size=128`} className="w-full h-full" alt="" />
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-900 leading-none">{ride.riderName}</h3>
            <div className="flex items-center gap-2 mt-3">
               <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(ride.rating || 5) ? 'opacity-100' : 'opacity-20'}`}>★</span>
                  ))}
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ride.rating || '5.0'} Rating</span>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 mt-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                   <div className="w-0.5 h-8 bg-slate-100 rounded-full"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup Location</p>
                       <p className="text-xs font-bold text-slate-700 mt-1">{ride.pickupAddress || 'Gombe District, Kinshasa'}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Drop-off Destination</p>
                       <p className="text-xs font-bold text-slate-700 mt-1">{ride.destinationAddress || 'Downtown Center Hub'}</p>
                    </div>
                </div>
             </div>

              <div className="space-y-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Travel Distance</span>
                    <span className="text-slate-900">{ride.travelDistance?.toFixed(1) || '0.0'} KM</span>
                 </div>
                 
                 <div className="h-px bg-slate-200/50"></div>
                 
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Base Fare (2,500/KM)</span>
                       <span className="text-sm font-bold text-slate-700">{ride.baseFare?.toLocaleString() || '0'} CDF</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Platform Fee (15%)</span>
                       <span className="text-sm font-bold text-slate-700">{ride.platformFee?.toLocaleString() || '0'} CDF</span>
                    </div>
                 </div>

                 <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Fare</span>
                    <div className="text-right">
                       <p className="text-lg font-black text-slate-900 leading-none">{ride.price.toLocaleString()} CDF</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">~ ${(ride.price / 2800).toFixed(2)} USD</p>
                    </div>
                 </div>

                 <div className="pt-2 flex items-center gap-2 text-green-600">
                    <Wallet size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Payment: {ride.paymentMethod || 'Cash'}</span>
                 </div>
              </div>

             {ride.comments && (
               <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
                  <div className="text-yellow-600"><MessageSquare size={16} /></div>
                  <p className="text-[11px] font-medium text-yellow-800 leading-relaxed italic">"{ride.comments}"</p>
               </div>
             )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 mt-4">
           <button 
             onClick={() => onAccept(ride)}
             className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
           >
             Accept Dispatch <ArrowRight size={16} />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
