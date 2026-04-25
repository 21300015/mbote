import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Location, Ride } from '../types';
import InteractiveMap from '../components/Map';
import { 
  MapPin, 
  Car, 
  X, 
  CheckCircle2, 
  User as UserIcon,
  LogOut,
  Clock,
  Navigation2,
  ArrowRight,
  Menu,
  History,
  Home,
  Wallet,
  Settings,
  Search
} from 'lucide-react';

const KINSHASA_CENTER: Location = { lat: -4.3276, lng: 15.3139 };

export default function RiderHome({ profile }: { profile: UserProfile }) {
  const [currentLocation, setCurrentLocation] = useState<Location>(KINSHASA_CENTER);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(KINSHASA_CENTER);
  const [destination, setDestination] = useState<Location | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<{ id: string, location: Location }[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'destination'>('destination');

  // 1. Get current location (Only if not in demo mode)
  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true') {
      return; // Stick to Kinshasa Center for demo
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(loc);
          if (!pickupLocation) setPickupLocation(loc);
          updateDoc(doc(db, 'users', profile.uid), { currentLocation: loc }).catch(console.error);
        },
        (err) => console.warn('Geolocation failed', err),
        { enableHighAccuracy: true }
      );
    }
  }, [profile.uid]);

  // 2. Fetch active ride
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
    } else {
      setActiveRide(null);
    }
  }, [profile.activeRideId]);

  // 3. Fetch nearby drivers
  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true') {
      setNearbyDrivers([
        { id: 'd1', location: { lat: -4.3200, lng: 15.3100 } },
        { id: 'd2', location: { lat: -4.3300, lng: 15.3200 } },
        { id: 'd3', location: { lat: -4.3250, lng: 15.3150 } },
      ]);
      return;
    }
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'driver'),
      where('isActive', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const drivers = snap.docs
        .filter(d => d.data().currentLocation)
        .map(d => ({
          id: d.id,
          location: d.data().currentLocation
        }));
      setNearbyDrivers(drivers);
    });
    return unsub;
  }, []);

  const handleMapClick = (loc: Location) => {
    if (activeRide) return;
    if (selectionMode === 'pickup') {
      setPickupLocation(loc);
      setSelectionMode('destination'); // Auto-switch to destination after setting pickup
    } else {
      setDestination(loc);
    }
  };

  const handleRequestRide = async () => {
    if (!pickupLocation || !destination) return;
    setIsRequesting(true);
    
    if (localStorage.getItem('demo_mode') === 'true') {
      const mockRide: Ride = {
        id: 'DEMO-RIDE-' + Math.random().toString(36).substr(2, 9),
        riderId: profile.uid,
        riderName: profile.displayName,
        pickup: pickupLocation,
        destination: destination,
        status: 'requested',
        price: 15000 + Math.floor(Math.random() * 5000),
      };
      
      setActiveRide(mockRide);
      setIsRequesting(false);

      setTimeout(() => {
        setActiveRide(prev => prev ? {
          ...prev,
          status: 'accepted',
          driverId: 'driver_001',
          driverName: 'Elias Bakamba',
        } : null);
      }, 3000);
      return;
    }

    try {
      const rideData = {
        riderId: profile.uid,
        riderName: profile.displayName,
        pickup: pickupLocation,
        destination: destination,
        status: 'requested',
        price: 15000 + Math.floor(Math.random() * 5000),
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'rides'), rideData);
      await updateDoc(doc(db, 'users', profile.uid), { activeRideId: docRef.id });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'rides');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRide = async () => {
    if (!activeRide) return;
    try {
      if (activeRide.status === 'requested') {
        await updateDoc(doc(db, 'rides', activeRide.id), { status: 'cancelled' });
      }
      await updateDoc(doc(db, 'users', profile.uid), { activeRideId: null });
      setDestination(null);
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
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans relative">
      
      {/* 1. Map Area (Full Screen Background) */}
      <main className="absolute inset-0 w-full h-full z-0">
        <InteractiveMap 
          center={pickupLocation || currentLocation}
          riderLocation={pickupLocation || currentLocation}
          destination={destination || activeRide?.destination || undefined}
          nearbyDrivers={nearbyDrivers}
          onMapClick={handleMapClick}
        />
        
        {/* Floating Top Bar (White Theme) */}
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center pointer-events-none z-10">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center justify-center pointer-events-auto border border-white/50 backdrop-blur-sm"
          >
            <Menu className="text-slate-900 w-6 h-6" />
          </button>
          
          <div className="px-6 py-3 bg-white/90 text-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border border-white/50 text-[11px] font-black uppercase tracking-widest pointer-events-auto flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             {profile.displayName.split(' ')[0]} • <span className="text-yellow-600">Rider</span>
          </div>

          <button 
            onClick={() => {
                setPickupLocation(currentLocation);
                setSelectionMode('destination');
            }}
            className="w-12 h-12 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center justify-center pointer-events-auto border border-white/50 backdrop-blur-sm"
          >
            <Navigation2 className="text-slate-900 w-6 h-6" />
          </button>
        </div>

        {/* Selection Mode Indicator */}
        {!activeRide && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce">
                {selectionMode === 'pickup' ? 'Select Pickup on Map' : 'Select Destination on Map'}
              </div>
           </div>
        )}
      </main>

      {/* 2. Bottom Booking Panel (White Theme) */}
      <motion.aside 
        initial={false}
        animate={{ 
          height: isSheetExpanded ? (activeRide ? '45%' : '75%') : (activeRide ? '35%' : '32%'),
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
                key="booking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">New Mission</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Gombe District Deployment</p>
                  </div>
                  {(destination || pickupLocation) && (
                    <button onClick={() => { setDestination(null); setSelectionMode('pickup'); }} className="p-2.5 bg-slate-100 rounded-full text-slate-400">
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Pickup Selection */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Extraction Point</label>
                    <button 
                      onClick={() => { setSelectionMode('pickup'); setIsSheetExpanded(false); }}
                      className={`w-full p-5 border rounded-2xl flex items-center gap-5 transition-all shadow-sm ${selectionMode === 'pickup' ? 'border-blue-500 bg-blue-50/30' : 'bg-slate-50 border-slate-100'}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
                      <div className="flex-1 text-sm font-bold text-slate-900 truncate text-left">
                        {pickupLocation ? `Lat: ${pickupLocation.lat.toFixed(4)}, Lng: ${pickupLocation.lng.toFixed(4)}` : "Set Extraction Point..."}
                      </div>
                      <Search size={16} className="text-slate-300" />
                    </button>
                  </div>
                  
                  {/* Destination Selection */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Hub</label>
                    <button 
                      onClick={() => { setSelectionMode('destination'); setIsSheetExpanded(false); }}
                      className={`w-full p-5 border rounded-2xl flex items-center gap-5 transition-all shadow-sm ${selectionMode === 'destination' ? 'border-red-500 bg-red-50/30' : 'bg-white border-slate-100'}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${destination ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-slate-300'}`}></div>
                      <span className="text-sm font-bold flex-1 text-left">
                        {destination ? `Target Hub Locked: ${destination.lat.toFixed(4)}` : "Select Target Hub..."}
                      </span>
                      <MapPin size={16} className="text-slate-300" />
                    </button>
                  </div>
                </div>

                {(isSheetExpanded || (pickupLocation && destination)) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <button className="bg-yellow-50 border-2 border-yellow-400 p-5 rounded-3xl text-left transition-all hover:bg-yellow-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                         <div className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Express</div>
                         <Car className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="text-base font-black text-slate-900">Moto-Taxi</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Est. 2,500 CDF</div>
                    </button>
                    <button className="bg-slate-50 border border-slate-100 p-5 rounded-3xl text-left opacity-40 cursor-not-allowed">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard</div>
                        <Car className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="text-base font-black text-slate-400">Mbote Car</div>
                      <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Coming Soon</div>
                    </button>
                  </motion.div>
                )}

                <button 
                  disabled={!pickupLocation || !destination || isRequesting}
                  onClick={handleRequestRide}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
                >
                  {isRequesting ? <Loader2 /> : <>Execute Dispatch <ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                   <div className="px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-lg font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse"></div>
                      {activeRide.status.toUpperCase()}
                   </div>
                   <button onClick={handleCancelRide} className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" /> Abort
                   </button>
                </div>

                <div className="p-7 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6 shadow-inner">
                  <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center border border-slate-100">
                    <Car className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                      {activeRide.status === 'requested' && "Acquiring Driver..."}
                      {activeRide.status === 'accepted' && "Agent on Approach"}
                      {activeRide.status === 'ongoing' && "Dispatch Active"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Ref: {activeRide.id.slice(0, 10).toUpperCase()}</p>
                  </div>
                </div>

                {activeRide.driverId && (
                  <div className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                       <img src={`https://ui-avatars.com/api/?name=${activeRide.driverName}&background=f1f5f9&color=0f172a`} className="w-full h-full" alt="" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Assigned Agent</p>
                      <p className="font-black text-slate-900 text-lg leading-none">{activeRide.driverName}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Toyota Corolla • Yellow</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Bottom Navigation (White Theme) */}
        <div className="absolute bottom-0 w-full h-24 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-10 flex justify-between items-center z-40">
           <NavButton icon={Home} label="Home" active onClick={() => setIsSheetExpanded(false)} />
           <NavButton icon={History} label="Activity" onClick={() => setIsMenuOpen(true)} />
           <NavButton icon={Wallet} label="Wallet" onClick={() => setIsMenuOpen(true)} />
           <NavButton icon={UserIcon} label="Profile" onClick={() => setIsMenuOpen(true)} />
        </div>
      </motion.aside>

      {/* 4. Side Drawer (Menu - White Theme) */}
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
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] bg-white z-[70] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100">
                  <span className="text-slate-900 font-black text-3xl italic">M</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-100 rounded-2xl">
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    <UserIcon size={32} className="text-slate-300" />
                 </div>
                 <div>
                    <p className="font-black text-slate-900 text-xl leading-none">{profile.displayName}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Gold Member</p>
                 </div>
              </div>

              <div className="space-y-3 flex-1">
                <DrawerItem icon={History} label="Ride History" />
                <DrawerItem icon={Wallet} label="Payments" />
                <DrawerItem icon={Settings} label="System Settings" />
                <DrawerItem icon={Clock} label="Scheduled Missions" />
              </div>

              <button 
                onClick={handleLogout}
                className="w-full p-5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} /> Abort Session
              </button>
            </motion.div>
          </>
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

function Loader2() {
  return <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-white rounded-full"></div>;
}
