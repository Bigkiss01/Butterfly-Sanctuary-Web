import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase'; // Import db instance from your firebase.js
import { Star, Heart, Home, Send, Loader2 } from 'lucide-react';

const FeedbackForm = ({ userName, rating, setRating, hoverRating, setHoverRating, onSubmitted, onExploreMore }) => {
  const [comment, setComment] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please tap a star rating before sending.');
      return;
    }
    setStatus('submitting');
    setErrorMessage('');

    try {
      const feedbackCollection = collection(db, 'feedback');
      await addDoc(feedbackCollection, {
        name: userName,
        rating: rating,
        comment: comment,
        language: navigator.language.split('-')[0] || 'en', // Get browser language
        createdAt: serverTimestamp(), // Use server timestamp for consistency
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        metadata: { source: 'webapp' },
      });
      setStatus('success');
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again in a moment.');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-4 animate-slideUp">
        <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-300">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-6 h-6 text-red-500 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-800">Thank you for your feedback!</h3>
          </div>
          <p className="text-gray-700">
            Your opinion helps us create an even more magical experience. We look forward to welcoming you back soon! 🦋
          </p>
        </div>
        <button
          onClick={onExploreMore}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl text-lg font-bold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Explore More
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slideUp">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="email"
          className="w-full px-6 py-4 text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-300 bg-white border-2 border-gray-200"
          placeholder="Email (optional)"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <input
          type="tel"
          className="w-full px-6 py-4 text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-300 bg-white border-2 border-gray-200"
          placeholder="Phone (optional)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>
      <textarea
        className="w-full px-6 py-4 text-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-300 bg-white border-2 border-gray-200"
        placeholder="Care to share more? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="3"
      />
      {errorMessage && <p className="text-red-600 text-center font-semibold">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:from-green-600 hover:to-teal-600 disabled:opacity-60 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-6 h-6" />
            Send Feedback
          </>
        )}
      </button>
    </form>
  );
};

export default FeedbackForm;