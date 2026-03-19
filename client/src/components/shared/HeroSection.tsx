import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import LogoSlider from './LogoSlider';

export default function HeroSection() {
  return (
    <section className="relative bg-white dark:bg-gray-950 pt-8 pb-16">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-primary-950 shadow-2xl min-h-[600px] flex items-center group">
          {/* Subtle slow zoom on background image to make it feel alive */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.img 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="/assets/images/hero-bg.png" 
              alt="Business Professionals" 
              className="w-full h-full object-cover object-[70%_50%] transition-transform duration-[10s] group-hover:scale-105"
            />
            {/* Dark green gradient overlay providing heavy contrast on text side */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-900/80 to-transparent dark:from-gray-950/95 dark:via-gray-900/80" />
          </div>

          <div className="relative px-6 py-20 md:px-12 lg:px-20 grid lg:grid-cols-2 gap-12 items-center w-full z-10">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] text-white mb-6">
                Powering Businesses with <br className="hidden md:block"/>
                <span className="text-accent-400">Smart Solutions.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-lg font-medium leading-relaxed">
                We help businesses refine strategy, strengthen operations, and scale with confidence through GST-compliant software and reliable hardware.
              </p>
              
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary-950 font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-transform duration-300 shadow-xl"
              >
                Book a Call <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Right Side - Floating Stats Card (matches reference '30k+ Happy Clients') */}
            <div className="hidden lg:flex justify-end items-end h-full mt-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="mb-0 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-[280px]"
              >
                <div className="flex -space-x-4 mb-5">
                  <img src="https://i.pravatar.cc/100?img=11" alt="Client 1" className="w-12 h-12 rounded-full border-2 border-primary-800 object-cover" />
                  <img src="https://i.pravatar.cc/100?img=33" alt="Client 2" className="w-12 h-12 rounded-full border-2 border-primary-800 object-cover" />
                  <img src="https://i.pravatar.cc/100?img=44" alt="Client 3" className="w-12 h-12 rounded-full border-2 border-primary-800 object-cover" />
                  <div className="w-12 h-12 rounded-full border-2 border-primary-800 bg-accent-500 flex items-center justify-center text-primary-950 font-extrabold text-sm shadow-inner z-10 relative">
                    +
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2 text-accent-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                
                <h3 className="text-white font-bold text-2xl leading-tight mb-2 tracking-tight">
                  500+ Active<br/>Deployments.
                </h3>
                
                <p className="text-primary-100 text-sm font-medium">
                  Happy Indian businesses scaling with our platforms worldwide.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Partner Logo Slider Integrated Below */}
        <div className="mt-8 mb-4">
          <LogoSlider />
        </div>
      </div>
    </section>
  );
}
