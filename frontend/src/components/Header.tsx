'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="w-full flex justify-end p-4">
      <ConnectButton accountStatus="address" showBalance={false} />
    </header>
  );
} 