import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
            <span className="text-slate-900 font-black text-xl">M</span>
          </div>
          <span className="text-xl font-display font-bold tracking-tight italic">MboteRide</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
            <span className="text-yellow-400 cursor-pointer">Rider</span>
            <span className="hover:text-white transition-colors cursor-pointer">Driver</span>
            <span className="hover:text-white transition-colors cursor-pointer">Fleet</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-700 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Log in</Link>
            <Link to="/auth" className="bg-yellow-400 text-slate-900 px-5 py-2 rounded font-bold text-xs uppercase tracking-wider hover:bg-yellow-300 transition-all shadow-md">Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-[10px] uppercase font-black tracking-widest mb-6 border border-yellow-200">
            Now live in Kinshasa
          </div>
          <h1 className="text-6xl lg:text-8xl font-display font-extrabold leading-[1] mb-8 text-slate-900 tracking-tighter">
            Travel <span className="italic text-slate-800 underline decoration-yellow-400 underline-offset-8">Better</span>.
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-sm font-medium leading-relaxed">
            The professional dispatch network for the DR Congo. Fast, verified, and transparent pricing at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth" className="bg-slate-900 text-white px-10 py-4 rounded-lg font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/auth" className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all text-center">
              Become a Driver
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="aspect-square bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-white p-2">
            <img 
              src="https://images.unsplash.com/photo-1549194388-2469d41ec367?q=80&w=1000&auto=format&fit=crop" 
              alt="Kinshasa"
              className="w-full h-full object-cover rounded-[2rem]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 flex gap-4 items-center animate-bounce-slow">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="text-slate-900 w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Active Dispatch</p>
                <p className="font-bold text-sm text-slate-900">450+ Drivers online</p>
              </div>
            </div>
          </div>
          
          {/* Floating Action Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-8 -right-8 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl flex gap-6 items-center"
          >
            <div className="text-right">
              <p className="text-sm font-bold">Safe Travels</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Verified Fleet 2026</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Shield className="text-slate-900 w-6 h-6" />
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Grid - Bento Style */}
      <section className="bg-slate-50 py-24 mb-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <Clock className="text-yellow-500 w-10 h-10 mb-6" />
              <h3 className="text-xl font-bold mb-4 tracking-tight">Rapid Response</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Kinshasa's fastest network with sub-5 minute wait times across Gombe and beyond.</p>
            </div>
            <div className="bg-slate-900 p-10 rounded-3xl shadow-xl shadow-slate-200 transition-all hover:bg-slate-800">
              <MapPin className="text-yellow-400 w-10 h-10 mb-6" />
              <h3 className="text-xl font-bold mb-4 tracking-tight text-white">Full Coverage</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">From N'Djili to binza - we have drivers positioned throughout every district of Kinshasa.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <Shield className="text-yellow-500 w-10 h-10 mb-6" />
              <h3 className="text-xl font-bold mb-4 tracking-tight">Professional Standards</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Rigorous driver background checks and vehicle quality inspections before every onboarding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Car className="text-black w-5 h-5" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight">MboteRide</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
            <a href="#" className="hover:text-black">Support</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 MboteRide Technologies. DR Congo.</p>
        </div>
      </footer>
    </div>
  );
}
