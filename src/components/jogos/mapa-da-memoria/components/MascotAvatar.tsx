import React from 'react';
import { motion } from 'framer-motion';
import { MascotPose } from '../types';
import { playHeartbeatPulse } from '../utils/soundEffects';

import mascotHeartImg from '../assets/images/mascot_heart_pose.jpg';
import mascotListeningImg from '../assets/images/mascot_listening.jpg';
import mascotPointingImg from '../assets/images/mascot_pointing.jpg';
import mascotHugImg from '../assets/images/mascot_warm_hug.jpg';

interface MascotAvatarProps { pose?: MascotPose; size?: 'sm' | 'md' | 'lg' | 'hero' | 'full'; className?: string; showHeartBadge?: boolean; interactive?: boolean; framed?: boolean; }

const POSE_IMAGES: Record<MascotPose, string> = { heart: mascotHeartImg, listening: mascotListeningImg, pointing: mascotPointingImg, hug: mascotHugImg };

export const MascotAvatar: React.FC<MascotAvatarProps> = ({ pose = 'heart', size = 'md', className = '', showHeartBadge = true, interactive = true, framed = true }) => {
  const imgSrc = POSE_IMAGES[pose] || mascotHeartImg;
  const sizeClasses = { sm: 'w-14 h-14 sm:w-16 sm:h-16', md: 'w-24 h-24 sm:w-28 sm:h-28', lg: 'w-36 h-36 sm:w-40 sm:h-40', hero: 'w-48 h-48 sm:w-56 sm:h-56', full: 'w-48 h-64 sm:w-56 sm:h-72' }[size];

  const handleHeartClick = (e: React.MouseEvent) => { if (!interactive) return; e.stopPropagation(); playHeartbeatPulse(); };

  return (
    <motion.div className={`relative inline-flex items-center justify-center ${className}`} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
      <div className="absolute -inset-4 pointer-events-none overflow-hidden rounded-full opacity-60">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-300/30 via-transparent to-teal-400/20 blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -top-10 -left-10 w-40 h-80 bg-gradient-to-b from-yellow-200/25 to-transparent transform -rotate-45 blur-md pointer-events-none" />
      </div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className={`relative ${sizeClasses} ${framed ? 'rounded-[32px] sm:rounded-[36px] p-1 shadow-2xl frosted-glass border-2 border-white/40 overflow-hidden' : 'overflow-visible'} cursor-pointer group`} onClick={handleHeartClick} title="Toque no coraçãozinho do camaleão!">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-emerald-500/20 to-emerald-950/40 rounded-[30px] pointer-events-none" />
        <img src={imgSrc} alt="Camaleão Mascote Kidzz com coração dourado no peito" referrerPolicy="no-referrer" className="w-full h-full object-cover object-center rounded-[28px] transform transition-transform duration-700 group-hover:scale-105 filter brightness-100 contrast-105" />
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative mt-2"><div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-400/30 blur-md animate-ping opacity-60" /></div>
        </div>
      </motion.div>
      {showHeartBadge && (
        <motion.button type="button" onClick={handleHeartClick} whileTap={{ scale: 0.88 }} className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-1 z-30 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-2 border-white shadow-[0_0_18px_rgba(255,234,167,0.9)] cursor-pointer transition-transform hover:scale-115 active:scale-95" title="Batimento do coração">
          <div className="relative flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#064e3b] animate-heart-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-[1.5px] bg-red-600 rounded-full animate-pulse" /></div>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};
