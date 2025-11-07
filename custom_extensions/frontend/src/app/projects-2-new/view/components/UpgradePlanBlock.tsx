"use client";

import React from 'react';

export function UpgradePlanBlock() {
  return (
    <div className="mt-3 flex flex-col gap-2 items-center text-center px-3 py-4">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.66667 7.33203V4.66536C4.66667 3.78131 5.01786 2.93346 5.64298 2.30834C6.2681 1.68322 7.11595 1.33203 8 1.33203C8.88406 1.33203 9.7319 1.68322 10.357 2.30834C10.9821 2.93346 11.3333 3.78131 11.3333 4.66536V7.33203M3.33333 7.33203H12.6667C13.403 7.33203 14 7.92898 14 8.66536V13.332C14 14.0684 13.403 14.6654 12.6667 14.6654H3.33333C2.59695 14.6654 2 14.0684 2 13.332V8.66536C2 7.92898 2.59695 7.33203 3.33333 7.33203Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-xs font-medium" style={{ color: '#171718' }}>
        Unlock with Team plan
      </span>
      <button
        type="button"
        className="w-full px-3 py-1.5 rounded-md text-xs font-medium text-white"
        style={{ backgroundColor: '#0F58F9' }}
      >
        Upgrade plan
      </button>
    </div>
  );
}


