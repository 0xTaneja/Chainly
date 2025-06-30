export interface ContractAddresses {
  oracle: string;
  futures: string;
  sender?: string; // only on Sepolia
  receiver?: string; // only on Fuji
}

export const ADDRESSES: Record<number, ContractAddresses> = {
  // Sepolia (Ethereum)
  11155111: {
    // Prefer explicit NEXT_PUBLIC_* vars (available in browser), fall back to hardcoded default.
    oracle:
      process.env.NEXT_PUBLIC_ORACLE_SEPOLIA ??
      "0x10F2370b3413b453154E520c516a2945e5f52dC8",
    futures:
      process.env.NEXT_PUBLIC_FUTURES_SEPOLIA ??
      "0x715AeE1089db8F208cE41A4Ad6fd5Bae57e8FfCE",
    sender:
      process.env.NEXT_PUBLIC_SENDER_SEPOLIA ??
      "0xE64F40435c377dfE5C4cC37b1CD997d00a502168",
  },

  // Avalanche Fuji
  43113: {
    oracle:
      process.env.NEXT_PUBLIC_ORACLE_FUJI ??
      "0x1789917EF9886da58Da6a50A674e7040733Ac3C4",
    futures:
      process.env.NEXT_PUBLIC_FUTURES_FUJI ??
      "0x5908e961D998fe2B6c0Ed872eFa95eB248fADC33",
    receiver:
      process.env.NEXT_PUBLIC_RECEIVER_FUJI ??
      "0xCFF01e60C769C5Fde8E488E7bE55fBb8D907AFf3",
  },
}; 