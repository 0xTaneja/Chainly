'use client';

import { useState, useEffect } from "react";
import {
  useAccount,
  useContractWrite,
  useWaitForTransaction,
  useChainId,
  useContractRead,
} from "wagmi";
import { ADDRESSES } from "../lib/addresses";
import { attentionFuturesAbi } from "../lib/abi/attentionFutures";
import { attentionOracleAbi } from "../lib/abi/attentionOracle";
import toast from "react-hot-toast";
import React from "react";

export default function TradeForm() {
  const { address } = useAccount();
  const chainId = useChainId();

  // ───────────────── CLIENT-SIDE ONLY RENDERING ─────────────────
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ───────────────── COMPONENT STATE ─────────────────
  const [token, setToken] = useState("BTC"); // Currently only BTC has active oracle data
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState(2);
  const [collateral, setCollateral] = useState<string>("");
  const [freshAt, setFreshAt] = useState<number>(0);
  const [now, setNow] = useState<number>(() => (typeof window !== 'undefined' ? Date.now() : 0));

  const futuresAddress = chainId ? ADDRESSES[chainId]?.futures : undefined;

  // ───────────────── ORACLE ADDRESS (read from contract) ─────────────────
  const { data: oracleAddress, refetch: refetchOracle } = useContractRead({
    address: futuresAddress as `0x${string}` | undefined,
    abi: attentionFuturesAbi,
    functionName: "oracle",
    enabled: Boolean(futuresAddress),
  });

  // ───────────────── PAUSED STATE ─────────────────
  const { data: isPaused } = useContractRead({
    address: futuresAddress as `0x${string}` | undefined,
    abi: attentionFuturesAbi,
    functionName: "paused",
    enabled: Boolean(futuresAddress),
  });

  // ───────────────── FRESHNESS STATE ─────────────────
  const { 
    data: isFresh, 
    refetch: refetchFreshness,
    isLoading: freshLoading 
  } = useContractRead({
    address: oracleAddress as `0x${string}` | undefined,
    abi: attentionOracleAbi,
    functionName: "isDataFresh",
    args: [token],
    enabled: Boolean(oracleAddress),
    cacheTime: 0, // Don't cache to ensure fresh data
    staleTime: 0, // Always consider data stale for frequent updates
  });

  // ───────────────── DEBUG LOGGING ─────────────────
  useEffect(() => {
    try {
      console.log('🔍 State Debug:', {
        oracleAddress: oracleAddress || 'undefined',
        isFresh: isFresh ?? 'undefined',
        token: token || 'undefined',
        freshAt: freshAt || 0,
        now: now || 0,
        timeSinceFresh: (now || 0) - (freshAt || 0),
        tradeReady: isFresh === true && (now || 0) - (freshAt || 0) > 15_000,
      });
    } catch (error) {
      console.warn('Debug logging error:', error);
    }
  }, [oracleAddress, isFresh, token, freshAt, now]);

  // ───────────────── POLLING FOR FRESHNESS ─────────────────
  useEffect(() => {
    if (!oracleAddress) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Polling oracle freshness...');
      refetchFreshness();
    }, 8_000); // Poll every 8 seconds for optimal balance of responsiveness and efficiency
    
    return () => clearInterval(interval);
  }, [oracleAddress, refetchFreshness, token]); // Add token dependency to re-poll when token changes

  // ─────────── Track transitions from stale→fresh ───────────
  const prevFreshRef = React.useRef<boolean | undefined>(undefined);

  useEffect(() => {
    console.log('📊 Fresh transition check:', { 
      current: isFresh, 
      previous: prevFreshRef.current 
    });
    
    if (isFresh && prevFreshRef.current === false) {
      // Data has just become fresh – start 15-second safety delay
      console.log('✅ Oracle data became fresh! Starting 15s countdown...');
      setFreshAt(Date.now());
    }
    prevFreshRef.current = isFresh;
  }, [isFresh]);

  // tick every second on client
  useEffect(() => {
    if (!isClient) return;
    
    const updateTime = () => setNow(Date.now());
    updateTime(); // Initial update
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [isClient]);

  const SAFE_DELAY_MS = 15_000; // 15-second cushion after freshness flips
  const tradeReady =
    isFresh === true && now - freshAt > SAFE_DELAY_MS;

  function toWei(eth: string) {
    return BigInt(Math.floor(Number(eth) * 1e18));
  }

  const enabled = Boolean(
    futuresAddress &&
    collateral &&
    isPaused === false &&
    tradeReady
  );

  const {
    data,
    error: writeError,
    isLoading: isPending,
    write,
  } = useContractWrite({
    address: futuresAddress as `0x${string}` | undefined,
    abi: attentionFuturesAbi,
    functionName: "openPosition",
    args: [token, isLong, BigInt(leverage)],
    value: collateral ? toWei(collateral) : undefined,
    mode: "recklesslyUnprepared" as any,
  });

  const { isLoading: txLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  // ───────────────── SUCCESS HANDLING ─────────────────
  const [alertedTxHashes, setAlertedTxHashes] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (isSuccess && data?.hash && !alertedTxHashes.has(data.hash)) {
      const explorerUrl = `https://sepolia.etherscan.io/tx/${data.hash}`;
      
      // Mark this transaction as alerted
      setAlertedTxHashes(prev => new Set([...prev, data.hash]));
      
      // Show success toast with transaction hash
      toast.success(
        `🎉 Position opened successfully!\nTx: ${data.hash.slice(0, 10)}...${data.hash.slice(-8)}`,
        {
          duration: 8000,
          style: {
            background: '#10B981',
            color: 'white',
          }
        }
      );
      
      // Also show browser alert for testing
      alert(
        `✅ POSITION OPENED SUCCESSFULLY!\n\n` +
        `Token: ${token}\n` +
        `Direction: ${isLong ? 'LONG' : 'SHORT'}\n` +
        `Leverage: ${leverage}x\n` +
        `Collateral: ${collateral} ETH\n\n` +
        `Transaction Hash:\n${data.hash}\n\n` +
        `View on Etherscan:\n${explorerUrl}`
      );

      // Log for debugging
      console.log('🎉 Position Opened Successfully!', {
        token,
        isLong,
        leverage,
        collateral,
        txHash: data.hash,
        explorerUrl
      });
    }
  }, [isSuccess, data?.hash, alertedTxHashes, token, isLong, leverage, collateral]);

  const submit = async () => {
    if (isPaused) {
      toast.error("Trading is paused");
      return;
    }
    if (!tradeReady) {
      toast.error("Oracle data is updating. Please wait a few seconds.");
      return;
    }
    if (!address) {
      toast.error("Connect wallet first");
      return;
    }
    if (!enabled) {
      toast.error("Fill all fields");
      return;
    }
    write?.();
  };

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-700 flex items-center justify-center h-64">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-700 flex flex-col gap-4">
      {/* ────────── STATUS BANNERS ────────── */}
      {(!oracleAddress) && (
        <p className="text-zinc-600 dark:text-zinc-400 text-center text-sm mb-2">
          Loading oracle address …
        </p>
      )}

      {isPaused && (
        <p className="text-red-600 text-center text-sm mb-2">
          Trading is currently paused. Please try again later.
        </p>
      )}

      {/* Freshness countdown after a successful refresh */}
      {!tradeReady && isFresh && (
        <p className="text-yellow-600 text-center text-sm mb-2">
          Oracle refreshed. Trading re-opens in {Math.max(0, Math.ceil((SAFE_DELAY_MS - (now - freshAt)) / 1000))} s …
        </p>
      )}

      {/* Stale state while a new Functions round is in flight */}
      {isFresh === false && (
        <p className="text-orange-600 dark:text-orange-400 text-center text-sm mb-2">
          Oracle data stale – waiting for Chainlink Functions update (≈1–2 min)…
        </p>
      )}

      <h2 className="text-xl font-semibold mb-2">New Position</h2>
      <label className="flex flex-col gap-1 text-sm">
        Token Symbol
        <input
          className="rounded border px-3 py-2 bg-transparent"
          value={token}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
          disabled={Boolean(isPaused)}
          placeholder="BTC"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Currently supported: BTC, ETH, PEPE, DOGE (All live with automation!)
        </div>
      </label>

      <div className="flex gap-4">
        <button
          onClick={() => setIsLong(true)}
          className={`flex-1 py-2 rounded font-medium border ${
            isLong
              ? "bg-green-600 text-white border-green-600"
              : "border-zinc-400 dark:border-zinc-600"
          } ${isPaused ? "opacity-50" : ""}`}
          disabled={Boolean(isPaused)}
        >
          Long
        </button>
        <button
          onClick={() => setIsLong(false)}
          className={`flex-1 py-2 rounded font-medium border ${
            !isLong
              ? "bg-red-600 text-white border-red-600"
              : "border-zinc-400 dark:border-zinc-600"
          } ${isPaused ? "opacity-50" : ""}`}
          disabled={Boolean(isPaused)}
        >
          Short
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Leverage
        <select
          className="rounded border px-3 py-2 bg-transparent"
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          disabled={Boolean(isPaused)}
        >
          <option value={2}>2x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Collateral (ETH)
        <input
          type="number"
          min="0"
          step="0.0001"
          value={collateral}
          onChange={(e) => setCollateral(e.target.value)}
          className="rounded border px-3 py-2 bg-transparent"
          disabled={Boolean(isPaused)}
        />
      </label>

      <button
        disabled={
          isPending ||
          txLoading ||
          Boolean(isPaused) ||
          !tradeReady
        }
        onClick={submit}
        className="py-2 rounded bg-blue-600 disabled:opacity-50 text-white font-semibold"
      >
        {isPaused
          ? "Trading Paused"
          : !tradeReady
          ? "Stale Oracle Data"
          : isPending || txLoading
          ? "Processing..."
          : "Open Position"}
      </button>

      {isSuccess && data?.hash && (
        <div className="text-green-600 text-sm text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <p className="font-semibold mb-1">✅ Position Opened Successfully!</p>
          <p className="text-xs">
            Tx: {data.hash.slice(0, 10)}...{data.hash.slice(-8)}
          </p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${data.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 dark:text-green-300 underline hover:no-underline text-xs"
          >
            View on Etherscan →
          </a>
        </div>
      )}

      {writeError && (
        <p className="text-red-600 text-sm text-center">
          {writeError?.message}
        </p>
      )}
    </div>
  );
} 