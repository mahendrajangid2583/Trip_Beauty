import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Get user from Redux
  const { user } = useSelector((state) => state.user);

  const slides = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068&auto=format&fit=crop"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await api.getReviews();
      if (data) setReviews(data);
    };
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.submitReview(reviewForm);
      toast.success('Thank you for your review!');
      setReviewForm({ rating: 5, comment: '' });
      // Refresh reviews
      const data = await api.getReviews();
      if (data) setReviews(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-slate-950 text-slate-200 font-sans overflow-x-hidden">
      
      {/* Section 1: The Portal (Hero) */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Slideshow */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={slides[currentSlide]} 
              alt="Luxury Travel" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-6xl md:text-8xl italic mb-6 text-slate-100"
          >
            The Art of the Journey.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl font-light tracking-wide mb-12 max-w-2xl text-slate-300"
          >
            Curating the world's finest experiences for the discerning traveler.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link 
              to="/discover" 
              className="backdrop-blur-xl bg-white/5 border border-amber-200/30 text-amber-200 px-12 py-4 rounded-full hover:bg-amber-200/10 transition-all duration-700 text-lg tracking-widest uppercase"
            >
              Begin
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 2: The Pillars (Feature Showcase) */}
      <section className="py-32 px-6 md:px-12 bg-slate-950">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto h-[80vh]"
        >
          {[
            { 
              title: "Curated Wonders", 
              subtext: "Destinations chosen by experts.", 
              img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
              link: "/discover"
            },
            { 
              title: "Bespoke Itineraries", 
              subtext: "Craft your perfect narrative.", 
              img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
              link: "/trips"
            },
            { 
              title: "Local Secrets", 
              subtext: "Uncover hidden gems.", 
              img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
              link: "/dining"
            }
          ].map((item, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              className="group relative h-full overflow-hidden rounded-sm cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700 z-10" />
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
              />
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                <h3 className="font-serif text-3xl text-white mb-2">{item.title}</h3>
                <p className="text-slate-300 font-light mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{item.subtext}</p>
                <div className="flex items-center text-amber-200 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                  <span className="uppercase tracking-widest text-sm mr-2">Explore</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Section 3: The Atelier (Video Tutorial) */}
      <section className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-5xl text-center mb-16 text-slate-100"
          >
            The Quester Philosophy.
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-video rounded-sm overflow-hidden group cursor-pointer"
            onClick={() => setShowVideo(true)}
          >
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
              alt="Video Thumbnail" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-700"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-amber-200/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                <Play className="text-amber-200 fill-amber-200/20 ml-1" size={32} />
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showVideo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            >
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors z-50"
              >
                <X size={32} />
              </button>
              <div className="w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-800">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0" 
                  title="The Quester Philosophy" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 4: The Guestbook (Reviews) */}
      <section className="py-32 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left: Submission */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-serif text-3xl mb-8 text-slate-100">Share Your Experience.</h3>
            
            {!user ? (
              <div className="bg-white/5 backdrop-blur-md p-8 border border-white/5 rounded-sm">
                <p className="text-slate-400 mb-4">Please log in to share your review.</p>
                <Link 
                  to="/login"
                  className="inline-block border border-amber-200/30 text-amber-200 px-6 py-2 rounded-full hover:bg-amber-200/10 transition-all duration-500 uppercase tracking-widest text-sm"
                >
                  Log In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-8">
                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          size={24} 
                          className={star <= reviewForm.rating ? "text-amber-200 fill-amber-200" : "text-slate-700"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wide">Your Narrative</label>
                  <textarea 
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-transparent border-b border-slate-700 focus:border-amber-200 outline-none py-2 text-slate-200 placeholder-slate-600 transition-colors h-32 resize-none"
                    placeholder="Tell us about your journey..."
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="border border-amber-200/30 text-amber-200 px-8 py-3 rounded-full hover:bg-amber-200/10 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Right: Carousel (Endorsements) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden"
          >
            <h3 className="font-serif text-3xl mb-8 text-slate-100">Endorsements.</h3>
            
            <div className="relative h-[400px] overflow-y-auto pr-4 custom-scrollbar">
               {Array.isArray(reviews) && reviews.length > 0 ? (
                 <div className="space-y-6">
                   {reviews.map((review) => (
                     <div key={review._id} className="bg-white/5 backdrop-blur-md p-8 border border-white/5 rounded-sm">
                       <div className="flex mb-4">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} className={i < review.rating ? "text-amber-200 fill-amber-200" : "text-slate-700"} />
                         ))}
                       </div>
                       <p className="font-serif italic text-lg text-slate-300 leading-relaxed">"{review.comment}"</p>
                       <div className="mt-4 text-sm text-slate-500 uppercase tracking-widest">
                         — {review.user?.name || 'Traveler'}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500">
                   <p className="font-serif italic">Be the first to share your story.</p>
                 </div>
               )}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-8 text-center text-slate-600 text-sm uppercase tracking-widest border-t border-slate-900">
        &copy; 2025 Quester. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Home;
