import React, { useState, useRef, useEffect } from 'react';
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ReviewSection = () => {
  const [showModal, setShowModal] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Nadia",
      role: "Travel Blogger @Couple Travel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia",
      rating: 5,
      review: "Planning your trip by having all the attractions already plugged into a map makes trip planning so much easier."
    },
    {
      id: 2,
      name: "Sharon Brewster",
      role: "Explorer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sharon",
      rating: 5,
      review: "amazing app! easy to use, love the AI functionality."
    },
    {
      id: 3,
      name: "Jayson Oite",
      role: "Adventure Seeker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jayson",
      rating: 5,
      review: "It seems to be this is my new travel app buddy. Very handy, convenient and very easy to use. It also recommends tourist destinations and nearby places. Kudos to the programmer. 👏 👏 👏 👏"
    },
    {
      id: 4,
      name: "Belinda and Kathy Kohles",
      role: "Travel Enthusiasts",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Belinda",
      rating: 5,
      review: "I have used several trip planning apps. This one by far is the best. The interaction between google maps makes the planning so much easier. Adding an adventure not in the app is also easy. Love the app!"
    },
    {
      id: 5,
      name: "Lydia Yang",
      role: "Founder @LydiaScapes Adventures",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lydia",
      rating: 5,
      review: "So much easier to visualize and plan a road trip to my favourite rock climbing destinations and explore the area around."
    },
    {
      id: 6,
      name: "Erica Franco",
      role: "Travel Planner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Erica",
      rating: 5,
      review: "Absolutely love this app! It is so helpful when planning my trips. I especially love The optimize route option. When I have all my information in place like my starting point to my ending point it is fabulous!"
    },
    {
      id: 7,
      name: "Jorge D.",
      role: "Digital Nomad",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge",
      rating: 5,
      review: "It left me speechless that I can add places to my trip and they get automatically populated with a featured pic and description from the web."
    },
    {
      id: 8,
      name: "A. Rosa",
      role: "Adventurer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rosa",
      rating: 5,
      review: "Great for planning multi-city trips! The interface is intuitive and saves so much time."
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    review: ''
  });

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [reviews]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.role || !formData.review) {
      alert('Please fill in all fields');
      return;
    }
    
    const newReview = {
      id: reviews.length + 1,
      name: formData.name,
      role: formData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      rating: formData.rating,
      review: formData.review
    };
    setReviews([newReview, ...reviews]);
    setFormData({ name: '', role: '', rating: 5, review: '' });
    setShowModal(false);
  };

  const StarRating = ({ rating, size = 'small', interactive = false, onRate = null }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'large' ? 'w-8 h-8' : 'w-5 h-5'} ${
              star <= rating ? 'fill-gray-600 text-gray-600' : 'fill-gray-300 text-gray-300'
            } ${interactive ? 'cursor-pointer hover:fill-gray-500' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What travelers are raving about
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Over 1 million people have already tried Wanderlog and loved its easy trip planning features.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 w-80"
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{review.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{review.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <StarRating rating={review.rating} />
                </div>

                {/* Review Text */}
                <p className="text-gray-700 leading-relaxed">{review.review}</p>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Write Your Review</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Travel Blogger, Explorer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating
                  </label>
                  <StarRating
                    rating={formData.rating}
                    size="large"
                    interactive={true}
                    onRate={(rating) => setFormData({ ...formData, rating })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ReviewSection;