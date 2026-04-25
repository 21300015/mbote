import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { Car, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('rider');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          role: role,
          createdAt: serverTimestamp(),
          isActive: role === 'driver' ? false : null,
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName || email.split('@')[0],
          role: role,
          createdAt: serverTimestamp(),
          isActive: role === 'driver' ? false : null,
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#f8fafc]">
      {/* Left side - Illustrations/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-16 flex-col justify-between relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 z-10"
        >
          <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
            <span className="text-slate-900 font-black text-xl">M</span>
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-white italic">MboteRide</span>
        </motion.div>

        <div className="z-10 mt-auto">
          <div className="w-12 h-1 bg-yellow-400 mb-8"></div>
          <motion.h2 
            key={role}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-display font-bold text-white mb-6 leading-tight max-w-lg tracking-tighter"
          >
            {role === 'rider' ? "The professional way to move." : "Drive for the elite network."}
          </motion.h2>
          <p className="text-slate-400 text-lg max-w-md font-medium">
            Access the most reliable ride-sharing platform in Kinshasa. Secure, professional, and always available.
          </p>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 overflow-y-auto px-12 py-12 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <h1 className="text-3xl font-display font-extrabold mb-3 text-slate-900 tracking-tight">
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">Enter your credentials to access the portal</p>
          </div>

          <div className="bg-slate-100 p-1.5 rounded-xl flex mb-10">
            <button 
              onClick={() => setRole('rider')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${role === 'rider' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Rider
            </button>
            <button 
              onClick={() => setRole('driver')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${role === 'driver' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Driver
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="E.g. Jean Kabamba" 
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium text-sm text-slate-900"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium text-sm text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium text-sm text-slate-900"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In to Dashboard" : "Register with MboteRide")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Social Access</span>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white border border-slate-200 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50 mb-4 text-slate-700"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" referrerPolicy="no-referrer" />
            Sign in with Google
          </button>

          <button 
            type="button"
            onClick={() => {
              // Mock Login
              localStorage.setItem('demo_mode', 'true');
              localStorage.setItem('demo_role', role);
              window.location.href = '/';
            }}
            className="w-full bg-yellow-400 text-slate-900 py-3.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-yellow-300 transition-all mb-10 shadow-lg shadow-yellow-100"
          >
            Launch Demo Mode
          </button>

          <p className="text-center text-sm font-medium text-slate-500">
            {isLogin ? "New to the platform?" : "Already registered?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-slate-900 font-bold hover:underline underline-offset-4"
            >
              {isLogin ? "Create Account" : "Access Portal"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
