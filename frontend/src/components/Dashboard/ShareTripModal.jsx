import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { BASE_URL } from '../../services/api';

const ShareTripModal = ({ isOpen, onClose, trip }) => {
  const [copied, setCopied] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (trip) {
      setShareToken(trip.shareToken);
    }
  }, [trip]);

  if (!isOpen || !trip) return null;

  const handleGenerateToken = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/api/trips/${trip._id}/generate-token`);
      const data = response.data;
      if (data.shareToken) {
        setShareToken(data.shareToken);
      } else {
        console.error("Failed to generate token:", data.message);
      }
    } catch (error) {
      console.error("Error generating token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Construct the join link using window.location.origin to ensure it works in any environment
  const shareLink = shareToken ? `${window.location.origin}/join/${shareToken}` : '';

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-serif font-bold text-white">Invite Friends</h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Share Link
                </label>
                
                {!shareToken ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-dashed border-white/10 rounded-xl gap-3">
                    <p className="text-sm text-slate-400 text-center">No invite link generated yet.</p>
                    <button
                      onClick={handleGenerateToken}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-[#fcd34d] text-[#020617] rounded-full text-sm font-bold hover:bg-[#fcd34d]/90 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Generate Invite Link
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 truncate font-mono">
                      {shareLink}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center justify-center p-3 bg-[#fcd34d] text-[#020617] rounded-xl hover:bg-[#fcd34d]/90 transition-colors font-bold shadow-lg shadow-[#fcd34d]/20"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Collaborators List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Collaborators</span>
                </div>
                
                <div className="bg-white/5 rounded-xl border border-white/5 divide-y divide-white/5">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fcd34d] to-[#b45309] flex items-center justify-center text-[#020617] font-bold text-xs">
                        {trip.owner?.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{trip.owner?.name || 'Owner'}</p>
                        <p className="text-xs text-slate-500">Owner</p>
                      </div>
                    </div>
                  </div>

                  {/* Other Collaborators */}
                  {trip.collaborators && trip.collaborators.map((collab) => (
                    <div key={collab._id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs border border-white/10">
                          {collab.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{collab.user?.name || 'User'}</p>
                          <p className="text-xs text-slate-500 capitalize">{collab.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!trip.collaborators || trip.collaborators.length === 0) && (
                    <div className="p-4 text-center text-slate-500 text-sm italic">
                      No collaborators yet. Share the link to invite friends!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareTripModal;
