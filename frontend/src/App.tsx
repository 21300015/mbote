import React from 'react';
import { Car, Shield, Clock, MapPin, Menu, User, PhoneCall, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="hero-gradient" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Car className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Mbote<span className="text-primary">.</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Ride</a>
          <a href="#" className="hover:text-white transition-colors">Drive</a>
          <a href="#" className="hover:text-white transition-colors">Business</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">Log in</button>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all">Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
              Your Ride in <span className="gradient-text">Kinshasa</span> Starts Here.
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg">
              Experience the safest, most reliable ride-hailing service in DR Congo. Fast, affordable, and always at your service.
            </p>
            
            <div className="glass-card p-6 md:p-8 max-w-md">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                  <input 
                    type="text" 
                    placeholder="Enter pickup location" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
                  <input 
                    type="text" 
                    placeholder="Where to?" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  Find a Ride <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="/hero.png" 
                alt="Mbote Ride" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Stats */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 glass-card p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Shield className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Verified Drivers</p>
                <p className="text-lg font-bold">100% Safe</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features */}
        <section className="mt-40 grid md:grid-cols-3 gap-8">
          {[
            { icon: Clock, title: 'Real-time Tracking', desc: 'Track your ride in real-time with our advanced GPS mapping.' },
            { icon: PhoneCall, title: '24/7 Support', desc: 'Our dedicated support team is always ready to assist you.' },
            { icon: User, title: 'Professional Drivers', desc: 'All our drivers undergo rigorous background checks and training.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-8 hover:bg-white/10 transition-colors cursor-default"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-blue-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 px-6 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Mbote Technologies. Built for DR Congo with ❤️.</p>
      </footer>
    </div>
  );
};

export default App;
