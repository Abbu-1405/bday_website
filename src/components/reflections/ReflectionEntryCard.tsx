import React from 'react';
import { Heart, Mail, Feather, ArrowUpRight } from 'lucide-react';
import { UserFeelingRef, UserLetterRef } from '../../services/reflectionsService';

interface ReflectionEntryCardProps {
  type: 'feeling' | 'letter';
  item: UserFeelingRef | UserLetterRef;
  index: number;
  onSelect: () => void;
}

export const ReflectionEntryCard: React.FC<ReflectionEntryCardProps> = ({
  type,
  item,
  index,
  onSelect,
}) => {
  const isFeeling = type === 'feeling';
  const feeling = isFeeling ? (item as UserFeelingRef) : null;
  const letter = !isFeeling ? (item as UserLetterRef) : null;

  // Subtle natural paper rotation and tint variations
  const rotations = ['rotate-[-0.4deg]', 'rotate-[0.4deg]', 'rotate-[-0.2deg]', 'rotate-[0.3deg]', 'rotate-[0deg]'];
  const tints = ['entry-tint-warm', 'entry-tint-amber', 'entry-tint-parchment'];
  
  const rotationClass = rotations[index % rotations.length];
  const tintClass = tints[index % tints.length];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`journal-entry-fragment ${tintClass} ${rotationClass} rounded-2xl p-5 sm:p-6 cursor-pointer flex flex-col justify-between space-y-4 focus:outline-none focus:ring-2 focus:ring-[#C59A52] focus:ring-offset-2 focus:ring-offset-[#0f1424]`}
      style={{
        minHeight: '180px',
      }}
    >
      {/* Entry Header: Type Badge & Date */}
      <div className="flex items-center justify-between border-b border-[#C8AD80]/35 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-serif font-medium tracking-wide">
          {isFeeling ? (
            <>
              <span className="w-5 h-5 rounded-full bg-[#6E3E42]/15 flex items-center justify-center text-[#6E3E42]">
                <Heart className="w-3 h-3 fill-[#6E3E42]/30" />
              </span>
              <span className="text-[#6E3E42]">Quiet Feeling</span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full bg-[#9F7A3D]/15 flex items-center justify-center text-[#9F7A3D]">
                <Mail className="w-3 h-3" />
              </span>
              <span className="text-[#845E28]">Personal Letter</span>
            </>
          )}
        </div>

        <time
          dateTime={item.createdAt}
          className="text-[11px] font-serif text-[#7A6855] italic"
        >
          {item.createdAt}
        </time>
      </div>

      {/* Entry Body Content */}
      <div className="space-y-2 flex-1">
        {letter && letter.title && (
          <h3 className="font-serif font-semibold text-base sm:text-lg text-[#2B211B] tracking-tight line-clamp-1">
            {letter.title}
          </h3>
        )}

        <p className="font-serif text-sm sm:text-base text-[#2B211B]/90 line-clamp-4 leading-relaxed italic">
          &ldquo;{isFeeling ? feeling?.content : letter?.content}&rdquo;
        </p>
      </div>

      {/* Entry Footer: Subtle Archival Notation */}
      <div className="flex items-center justify-between pt-2 border-t border-[#C8AD80]/25 text-xs font-serif">
        <span className="text-[11px] text-[#8C7965] italic flex items-center gap-1">
          <Feather className="w-3 h-3 text-[#B89A6A]" />
          <span>Preserved in journal</span>
        </span>

        <span className="inline-flex items-center gap-1 text-[#6E3E42] font-medium group-hover:text-[#84363C] transition-colors">
          <span>{isFeeling ? 'Read feeling' : 'Open letter'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
