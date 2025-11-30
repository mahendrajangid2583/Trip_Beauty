import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { fetchTrips } from '../store/tripSlice';
import api from '../services/api';

const JoinTrip = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('joining'); // joining, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const joinTrip = async () => {
      try {
        await api.post(`/api/trips/join/${token}`);
        
        setStatus('success');
        // Refresh trips to show the new one
        dispatch(fetchTrips());
        setTimeout(() => {
          navigate('/trips');
        }, 2000);
      } catch (error) {
        console.error("Join error:", error);
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Failed to join trip');
      }
    };

    if (token) {
      joinTrip();
    } else {
      setStatus('error');
      setErrorMessage('Invalid invite link.');
    }
  }, [token, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        {status === 'joining' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#fcd34d] animate-spin" />
            <h2 className="text-xl font-serif font-bold text-white">Joining Trip...</h2>
            <p className="text-slate-400 text-sm">Please wait while we connect you to the adventure.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">You're In!</h2>
            <p className="text-slate-400 text-sm">Successfully joined the trip. Redirecting you to your dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">Unable to Join</h2>
            <p className="text-red-400 text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-full text-sm font-medium transition-colors border border-white/10"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTrip;
