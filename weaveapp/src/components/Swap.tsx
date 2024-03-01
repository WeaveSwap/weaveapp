"use client";
import React, { useContext, useEffect, useState } from "react";
// import {
//   erc20ABI,
//   useAccount,
//   useBalance,
//   useContractRead,
//   useContractWrite,
//   useWaitForTransaction,
// } from "wagmi";
// import { TraderContext } from "../context/TraderContext";
// import useDebounce from "@/hooks/useDebounce";
// import { TOKENS } from "@/libs/constants";
// import { TransactionState } from "@/libs/providers";
// import { SwapRoute } from "@uniswap/smart-order-router";
// import { generateRoute } from "@/libs/routing";
// import { Token } from "@uniswap/sdk-core";
// import SwapTokenModalSelect from "./SwapTokenModalSelect";
// import { Button } from "@/components/utils/Button";
// import { fromReadableAmount } from "@/libs/conversion";
// import {
//   calculateActualPrice,
//   formatNumberToFixed,
//   getSwapText,
//   getUSDPrice,
// } from "@/utils";
// import SwapOutcomeModal from "./SwapOutcomeModal";
// import { USDRatesContext } from "@/context/USDRatesContext";
import { IoMdSettings } from "react-icons/io";
import { FaClockRotateLeft } from "react-icons/fa6";
import { IoSwapVertical } from "react-icons/io5";
import { Button, Input } from "@/primitives";
import { useAccount } from "wagmi";
import Image from "next/image";
import { IoMdArrowDropdown } from "react-icons/io";
import { swapAbi, swap, tokenA, tokenB, tokenC } from "@/constants";
import { useReadContract } from "wagmi";
import { Select } from "@/primitives";
import { erc20Abi } from "viem";
const Swap = () => {
  //   const { usdRates } = useContext(USDRatesContext);
  const { address } = useAccount();
  const [inputAmount, setInputAmount] = useState<number | string>(0);
  const [outputAmount, setOutputAmount] = useState<number | string>(0);
  const [gasFee, setGasFee] = useState("0");
  //   const { traderSelectedSafe } = useContext(TraderContext);
  //   const [selectedInToken0, setIsSelectedInToken0] = useState<Token | undefined>(
  //     TOKENS[0]
  //   );
  //   const [selectedInToken1, setIsSelectedInToken1] = useState<
  //     Token | undefined
  //   >();
  const [isMoreTokens0, setIsMoreTokens0] = useState(false);
  const [isMoreTokens1, setIsMoreTokens1] = useState(false);
  // const [tokenInBalance, setTokenInBalance] = useState<string | number>(0);
  // const [tokenOutBalance, setTokenOutBalance] = useState<string | number>(0);
  //   const [txState, setTxState] = useState<TransactionState>(
  //     TransactionState.Newimport { IoMdArrowDropdown } from "react-icons/io";
  //   );
  const [blockNumber, setBlockNumber] = useState<number>(0);

  //   const [route, setRoute] = useState<SwapRoute | null>(null);
  const [isSwapSuccessModalOpen, setIsSwapSuccessModalOpen] = useState(false);

  //   const debouncedAmountIn = useDebounce(Number(inputAmount));
  //   const { data: token0Balance } = useContractRead({
  //     address: selectedInToken0?.address as `0x${string}`,
  //     abi: erc20ABI,
  //     functionName: "balanceOf",
  //     args: [traderSelectedSafe as `0x${string}`],
  //   });
  //   const result = useBalance({
  //     address: traderSelectedSafe as `0x${string}`,
  //   });

  //   useEffect(() => {
  //     if (selectedInToken0 && selectedInToken0.symbol === "ETH") {
  //       setTokenInBalance(formatNumberToFixed(result?.data?.formatted));
  //     }
  //     if (selectedInToken0 && selectedInToken0.symbol !== "ETH") {
  //       setTokenInBalance(
  //         formatNumberToFixed(
  //           calculateActualPrice(token0Balance, selectedInToken0?.decimals)
  //         )
  //       );
  //     }
  //   }, [result, token0Balance, selectedInToken0]);

  //   const { data: token1Balance } = useContractRead({
  //     address: selectedInToken1?.address as `0x${string}`,
  //     abi: erc20ABI,
  //     functionName: "balanceOf",
  //     args: [traderSelectedSafe as `0x${string}`],
  //   });

  //   useEffect(() => {
  //     if (selectedInToken1 && selectedInToken1.symbol === "ETH") {
  //       setTokenOutBalance(formatNumberToFixed(result?.data?.formatted));
  //     }
  //     if (selectedInToken1 && selectedInToken1.symbol !== "ETH") {
  //       setTokenOutBalance(
  //         formatNumberToFixed(
  //           calculateActualPrice(token1Balance, selectedInToken1?.decimals)
  //         )
  //       );
  //     }
  //   }, [result, token1Balance, selectedInToken1]);

  //   const {
  //     data: transaction,
  //     writeAsync: swap,
  //     isLoading: isTransactionLoading,
  //     isError: isTransactionError,
  //     error: transactionError,
  //   } = useContractWrite({
  //     address: delegation.address,
  //     abi: delegation.abi,
  //     functionName: "executeSwap",
  //     args: [
  //       traderSelectedSafe,
  //       selectedInToken0?.address,
  //       selectedInToken1?.address,
  //       fromReadableAmount(
  //         Number(inputAmount),
  //         selectedInToken0?.decimals!
  //       ).toString(),
  //     ],
  //   });

  //   const {
  //     isLoading: isAwaitingSwapCompletion,
  //     isSuccess: isTransactionSuccessful,
  //     isError: isSwapError,
  //     error: swapError,
  //   } = useWaitForTransaction({
  //     hash: transaction?.hash,
  //   });

  //   useEffect(() => {
  //     if (isAwaitingSwapCompletion || isTransactionLoading) {
  //       setIsSwapSuccessModalOpen(true);
  //     }
  //   }, [isAwaitingSwapCompletion, isTransactionLoading, swapError]);

  //   const onCreateRoute = async () => {
  //     const route = await generateRoute(
  //       Number(inputAmount),
  //       selectedInToken0!,
  //       selectedInToken1!,
  //       address!
  //     );
  //     setOutputAmount(Number(route?.quote.toExact()));
  //     setRoute(route);
  //   };

  //   useEffect(() => {
  //     if (debouncedAmountIn) {
  //       onCreateRoute();
  //     }
  //   }, [debouncedAmountIn, selectedInToken0]);

  const handleReset = () => {
    setOutputAmount(0);
    setInputAmount(0);
    setGasFee("0");
  };

  //   const handleSwitchToken = () => {
  //     const token0Amount = inputAmount;
  //     const selectedToken0 = selectedInToken0;
  //     setInputAmount(outputAmount);
  //     setIsSelectedInToken0(selectedInToken1);
  //     setOutputAmount(token0Amount);
  //     setIsSelectedInToken1(selectedToken0);
  //   };

  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");

  const { data: swapAmount, isLoading } = useReadContract({
    abi: swapAbi,
    address: swap,
    functionName: "getSwapAmount",
    account: address,
    args: [tokenIn, tokenOut, inputAmount],
  });

  const { data: tokenInBalance } = useReadContract({
    address: tokenIn as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const { data: tokenOutBalance } = useReadContract({
    address: tokenOut as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  console.log("swap details:", tokenInBalance, tokenOutBalance);

  console.log("tokens:", tokenIn, tokenOut);

  console.log("input amount:", inputAmount);

  console.log("swapAmount", Number(swapAmount));

  return (
    <main className="flex items-center justify-center">
      <div className="flex max-h-[58%] w-[33%] flex-col gap-10 rounded-[10px] border border-[0.5] border-grey-1 p-10 font-khand text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Swap</h2>
          <span className="flex items-center gap-2">
            <IoMdSettings />
            <FaClockRotateLeft />
          </span>
        </div>
        <div className="rounded-md bg-grey-1/30 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <p className="text-sm font-semibold text-grey-1">From</p>
              {/* <span className="flex items-center gap-1">
                <Image
                  height={20}
                  width={20}
                  src="/ethlogo.svg"
                  alt="ethlogo"
                />
                <p>ETH</p>
                <IoMdArrowDropdown />
              </span> */}
              <Select
                inputId="token1"
                option={[
                  {
                    label: "Token A",
                    value: tokenA,
                    icon: {
                      1: "blylogo",
                    },
                  },
                  {
                    label: "Token B",
                    value: tokenB,
                    icon: {
                      1: "clylogo",
                    },
                  },
                  {
                    label: "Token C",
                    value: tokenC,
                    icon: {
                      1: "dotlogo",
                    },
                  },
                ]}
                onChange={(option) => {
                  console.log(option?.value);
                  setTokenIn(option?.value!);
                }}
              />
            </span>
            <span className="flex items-center gap-1">
              <p className="text-sm font-semibold text-grey-1">Wallet Bal</p>
              <p>{tokenInBalance?.toString()}</p>
              <Button variant="primary" className="h-3.5 w-5">
                Max
              </Button>
            </span>
          </div>
          <hr />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Input
                id="valueIn"
                type="number"
                onChange={(e) => setInputAmount(e.target.value)}
              />
              <p className="text-sm font-semibold text-grey-1">($4602.43)</p>
            </span>
            <span className="flex items-center gap-1">
              <Image height={20} width={20} src="/ethlogo.svg" alt="ethlogo" />
              <p className="text-2xl">Ethereum</p>
              <IoMdArrowDropdown />
            </span>
          </div>
        </div>
        <div className="rounded-md bg-grey-1/30 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <p className="text-sm font-semibold text-grey-1">To</p>
              {/* <span className="flex items-center gap-1">
                <Image
                  height={20}
                  width={20}
                  src="/weavelogo.svg"
                  alt="weavelogo"
                />
                <p>WAS</p>
                <IoMdArrowDropdown />
              </span> */}
              <Select
                inputId="token1"
                option={[
                  {
                    label: "Token A",
                    value: tokenA,
                    icon: {
                      1: "blylogo",
                    },
                  },
                  {
                    label: "Token B",
                    value: tokenB,
                    icon: {
                      1: "clylogo",
                    },
                  },
                  {
                    label: "Token C",
                    value: tokenC,
                    icon: {
                      1: "dotlogo",
                    },
                  },
                ]}
                onChange={(option) => {
                  console.log(option?.value);
                  setTokenOut(option?.value!);
                }}
              />
            </span>
            <span className="flex items-center gap-1">
              <p className="text-sm font-semibold text-grey-1">Wallet Bal</p>
              <p>{tokenOutBalance?.toString()}</p>
            </span>
          </div>
          <hr />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <p>{Number(swapAmount) || 0}</p>
              <p className="text-sm font-semibold text-grey-1">($4602.43)</p>
            </span>
            <span className="flex items-center gap-1">
              <Image
                height={20}
                width={20}
                src="/weavelogo.svg"
                alt="weavelogo"
              />
              <p className="text-2xl">Weaves</p>
              <IoMdArrowDropdown />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p>Summary</p>
          <div>
            <span className="flex items-center justify-between">
              <p className="text-grey-1">Cross chain rate</p>
              <p>1 USDT on ETH= 1 USDT on WAS</p>
            </span>
            <span className="flex items-center justify-between">
              <p className="text-grey-1">Amount Recieved (Estimated)</p>
              <p>0.000WAS</p>
            </span>
            <span className="flex items-center justify-between">
              <p className="text-grey-1">Gas Fee</p>
              <p>0.000USDC</p>
            </span>
          </div>
        </div>
        <Button
          className="w-full font-bold"
          variant="primary"
          disabled={isLoading}
        >
          Swap
        </Button>
      </div>
    </main>
  );
};

export default Swap;
