"use client";
import { DataTable } from "@/components";
import { Button, Icon, Input, Modal, Select } from "@/primitives";
import { createUrl } from "@/utils";
import * as Tabs from "@radix-ui/react-tabs";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  lend,
  lendAbi,
  tokenA,
  tokenB,
  tokenC,
  lendingPoolAbi,
  borrow,
  borrowAbi,
} from "@/constants";
import {
  useAccount,
  useEstimateFeesPerGas,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  erc20Abi,
  parseUnits,
  parseEther,
  formatEther,
  formatUnits,
} from "viem";
import { toast } from "sonner";
import { IconType } from "@/components";

const assetName = ["Token A", "Token B", "Token C"] as const;
type AssetName = (typeof assetName)[number];
type TabType = "supply" | "borrow";
interface ItokenOptions {
  label: string;
  value: string;
  icon: {
    1: IconType;
  };
}

const tokenOptions: ItokenOptions[] = [
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
];

type Asset = {
  Name: AssetName | null;
  Address: `0x${string}` | null;
  Image: string;
  "Total Supplied": string;
  APY: string;
  "Wallet Balance": string;
  Action: string;
};

const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "Name",
    // header: "Pool",
    header: () => <div className="text-center">Asset</div>,
    cell: ({ row }) => {
      const asset: AssetName = row.getValue("Name");

      const TokenIcon = () => {
        switch (asset) {
          case "Token A":
            return (
              <Image width="20" height="20" src="/blylogo.svg" alt="blylogo" />
            );
          case "Token B":
            return (
              <Image width="20" height="20" src="/clylogo.svg" alt="clylogo" />
            );
          case "Token C":
            return (
              <Image width="20" height="20" src="/dotlogo.svg" alt="clylogo" />
            );
          default:
            return null;
        }
      };

      return (
        <div className="flex items-center justify-center gap-1 font-medium">
          <TokenIcon />
          <p>{asset}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "Total Supplied",
    header: "Total Supplied",
  },
  {
    accessorKey: "APY",
    header: "APY",
  },
  {
    accessorKey: "Wallet Balance",
    header: "Wallet Balance",
  },
  {
    accessorKey: "Action",
    header: "Action",
    cell: ({ row, table }) => {
      const [inputAmount, setInputAmount] = useState<number | string>(0);
      const [tokenCollateral, setTokenCollateral] = useState({
        name: "",
        address: "",
        value: 0,
      });
      const searchParams = useSearchParams();
      const { address } = useAccount();
      const action = (): TabType => {
        const optionSearchParams = new URLSearchParams(searchParams.toString());
        const action = optionSearchParams.get("action");
        return action as TabType;
      };

      const title = action()[0]?.toUpperCase() + action().slice(1);

      const balance: string = row.getValue("Wallet Balance");
      const name: string = row.getValue("Name");
      const token: `0x${string}` = row.original.Address!;

      console.log("token address", token);

      const setMaxAmount = () => {
        setInputAmount(balance.toString());
      };

      const { data: hash, isPending, writeContractAsync } = useWriteContract();
      const {
        data: approveHash,
        isPending: isApprovePending,
        isSuccess: isApproveSuccess,
        writeContractAsync: writeApproveAsync,
      } = useWriteContract();
      const {
        data: collateralApproveHash,
        isPending: isCollateralApprovePending,
        isSuccess: isCollateralApproveSuccess,
        writeContractAsync: writeCollateralApproveAsync,
      } = useWriteContract();
      const {
        data: stakeCollateralHash,
        isPending: isStakeCollateralPending,
        isSuccess: isStakeCollateralSuccess,
        writeContractAsync: writeStakeCollateralAsync,
      } = useWriteContract();
      const {
        data: borrowHash,
        isPending: isBorrowPending,
        isSuccess: isBorrowSuccess,
        writeContractAsync: writeBorrowAsync,
      } = useWriteContract();

      const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
          hash,
        });

      const { isLoading: isApproving, isSuccess: isApproved } =
        useWaitForTransactionReceipt({
          hash: approveHash,
        });

      const {
        isLoading: isCollateralApproving,
        isSuccess: isCollateralApproved,
      } = useWaitForTransactionReceipt({
        hash: collateralApproveHash,
      });

      const {
        isLoading: isCollateralStaking,
        isSuccess: isCollateralSuccesss,
      } = useWaitForTransactionReceipt({
        hash: stakeCollateralHash,
      });

      const { isLoading: isBorrowLoading, isSuccess: isBorrowSuccesss } =
        useWaitForTransactionReceipt({
          hash: borrowHash,
        });

      const handleLendApprove = async () => {
        try {
          await writeApproveAsync({
            address: token as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [lend as `0x${string}`, parseUnits("100", 10)],
          });
          toast.success("Token approved succesfully");
        } catch (error) {
          console.error(error);
          toast.error("An error occured");
        }
      };

      const handleCollateralApprove = async () => {
        try {
          await writeCollateralApproveAsync({
            address: tokenCollateral.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [borrow as `0x${string}`, parseUnits("100", 10)],
          });
          toast.success("Token approved succesfully");
        } catch (error) {
          console.error(error);
          toast.error("An error occured");
        }
      };

      const handleSupply = async () => {
        try {
          await writeContractAsync({
            abi: lendAbi,
            address: lend,
            functionName: "lendToken",
            account: address,
            args: [token, inputAmount],
          });
          toast.success("Token supplied succesfully");
          table.reset();
        } catch (error) {
          console.error(error);
          toast.error("An error occured");
        }
      };

      const handleStakeCollateral = async () => {
        try {
          await writeStakeCollateralAsync({
            abi: borrowAbi,
            address: borrow,
            functionName: "stakeCollateral",
            account: address,
            args: [
              tokenCollateral.address,
              parseEther(tokenCollateral.value.toString()),
            ],
          });
          toast.success("Collateral Staked succesfully");
          // table.reset();
        } catch (error) {
          console.error(error);
          toast.error("An error occured");
        }
      };

      const handleBorrow = async () => {
        try {
          await writeContractAsync({
            abi: borrowAbi,
            address: borrow,
            functionName: "borrowToken",
            account: address,
            args: [token, parseEther(inputAmount.toString())],
          });
          toast.success("Token Borrowed succesfully");
          // table.reset();
        } catch (error) {
          console.error(error);
          toast.error("An error occured");
        }
      };

      useEffect(() => {
        if (isApproved) {
          handleSupply();
        }
      }, [isApproved]);

      useEffect(() => {
        if (isCollateralApproved) {
          handleStakeCollateral();
        }
      }, [isCollateralApproved]);

      useEffect(() => {
        if (isCollateralSuccesss) {
          handleBorrow();
        }
      }, [isCollateralSuccesss]);

      return (
        <Suspense fallback={<>Loading...</>}>
          <Modal>
            <Modal.Button asChild>
              <Button variant="primary">
                {action() == "supply" ? `Add Supply` : `Borrow`}
              </Button>
            </Modal.Button>
            <Modal.Portal className="backdrop-blur-sm">
              <Modal.Content className="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 z-30 flex max-h-[814px] w-full max-w-[30.06rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-10 rounded-[10px] border border-[0.5] border-grey-1 bg-black p-10 px-8 py-10 font-khand text-white shadow focus:outline-none">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{title}</h2>
                </div>
                <div className="rounded-md bg-grey-1/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-grey-1">
                        {`${name} Asset`}
                      </p>
                    </span>
                    <span className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-grey-1">
                        Wallet Bal
                      </p>
                      <p>{balance}</p>
                      <Button
                        variant="primary"
                        className="h-3.5 w-5"
                        onClick={setMaxAmount}
                      >
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
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                      />
                      <p className="text-sm font-semibold text-grey-1">
                        ($4602.43)
                      </p>
                    </span>
                    <span className="flex items-center gap-1">
                      <Image
                        height={20}
                        width={20}
                        src="/ethlogo.svg"
                        alt="ethlogo"
                      />
                      <p className="text-2xl">Ethereum</p>
                      {/* <IoMdArrowDropdown /> */}
                    </span>
                  </div>
                </div>
                {action() == "borrow" && inputAmount && (
                  <div className="rounded-md bg-grey-1/30 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-grey-1">
                          Collateral
                        </p>
                        <Select
                          inputId="token1"
                          option={tokenOptions.filter(
                            (tokenOption) => tokenOption.value !== token,
                          )}
                          onChange={(option) => {
                            console.log(option?.value);
                            setTokenCollateral({
                              name: option?.label!,
                              address: option?.value!,
                              value: 0,
                            });
                          }}
                        />
                      </span>
                    </div>
                    <hr />
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Input
                          id="valueIn"
                          type="number"
                          value={tokenCollateral.value}
                          onChange={(e) =>
                            setTokenCollateral((prev) => {
                              return {
                                ...prev,
                                value: Number(e.target.value),
                              };
                            })
                          }
                        />
                        <p className="text-sm font-semibold text-grey-1">
                          ($4602.43)
                        </p>
                      </span>
                      <span className="flex items-center gap-1">
                        <Image
                          height={20}
                          width={20}
                          src="/ethlogo.svg"
                          alt="ethlogo"
                        />
                        <p className="text-2xl">Ethereum</p>
                        {/* <IoMdArrowDropdown /> */}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <p>Summary</p>
                  <div>
                    <span className="flex items-center justify-between">
                      <p className="text-grey-1">Supply APY</p>
                      <p>3.23%</p>
                    </span>
                    <span className="flex items-center justify-between">
                      <p className="text-grey-1">Collateral Factor</p>
                      <p>72.1%</p>
                    </span>
                    <span className="flex items-center justify-between">
                      <p className="text-grey-1">Gas Fee</p>
                      <p>$20</p>
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full font-bold"
                  variant="primary"
                  disabled={
                    isApprovePending ||
                    isPending ||
                    isConfirming ||
                    isApproving ||
                    isBorrowLoading ||
                    isCollateralStaking ||
                    isCollateralApproving ||
                    isBorrowPending ||
                    isStakeCollateralPending ||
                    isCollateralApprovePending ||
                    !tokenCollateral.address ||
                    !tokenCollateral.value
                  }
                  onClick={
                    action() == "borrow"
                      ? handleCollateralApprove
                      : handleLendApprove
                  }
                >
                  {isCollateralApprovePending
                    ? "Approving collateral"
                    : isStakeCollateralPending
                      ? "Approve stake collateral..."
                      : isBorrowPending
                        ? "Confirm borrow..."
                        : isCollateralApproving
                          ? "Confirming collateral"
                          : isCollateralStaking
                            ? "Staking collateral.."
                            : isBorrowLoading
                              ? "Borrowing..."
                              : isConfirming
                                ? "Confirming token supplied"
                                : isApproving
                                  ? "Confirming Approval..."
                                  : isPending
                                    ? "Supply token pending..."
                                    : isApprovePending
                                      ? "Aproving token.."
                                      : title}
                </Button>
              </Modal.Content>
            </Modal.Portal>
          </Modal>
        </Suspense>
      );
    },
  },
];

const Lend = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { address } = useAccount();

  const action = (): TabType => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());
    const action = optionSearchParams.get("action");
    return action as TabType;
  };

  const setAction = (action: TabType) => {
    const optionSearchParams = new URLSearchParams(searchParams.toString());
    optionSearchParams.set("action", action);
    const optionUrl = createUrl(pathname, optionSearchParams);
    router.replace(optionUrl, { scroll: false });
  };

  const { data: availableTokens, isLoading } = useReadContract({
    abi: lendAbi,
    address: lend,
    functionName: "allAvailableTokens",
    account: address,
  });

  const { data: Pooldetail, isLoading: isPoolDetailLoading } = useReadContract({
    abi: lendAbi,
    address: lend,
    functionName: "tokenToPool",
    account: address,
    args: [tokenA],
  });

  const pooldetail = useMemo(() => Pooldetail as string[], [Pooldetail]);

  const { data: borrowingAPY, isLoading: isAPYLoading } = useReadContract({
    abi: lendingPoolAbi,
    address: pooldetail?.[0] as `0x${string}`,
    functionName: "borrowingAPY",
    account: address,
  });

  const {
    data: tokenABalance,
    refetch: refetchTokenA,
    isLoading: isTokenALoading,
  } = useReadContract({
    address: tokenA as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const {
    data: tokenBBalance,
    refetch: refetchTokenB,
    isLoading: isTokenBLoading,
  } = useReadContract({
    address: tokenB as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const {
    data: tokenCBalance,
    refetch: refetchTokenC,
    isLoading: isTokenCLoading,
  } = useReadContract({
    address: tokenC as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  console.log("Pooldetail", Pooldetail);
  // console.log("borrowingAPY", borrowingAPY.toString());

  const assets: Asset[] = useMemo(() => {
    return (availableTokens as string[])?.map((availableToken) => {
      let tokenInfo: Asset = {
        Name: null,
        Address: null,
        Image: "",
        "Wallet Balance": "",
        APY: "",
        "Total Supplied": "",
        Action: "",
      };

      if (availableToken === tokenA) {
        tokenInfo = {
          Name: "Token A",
          Address: availableToken,
          Image: "/blylogo",
          "Wallet Balance": formatEther(BigInt(tokenABalance ?? 0)),
          APY: "3.23%",
          "Total Supplied": "20M",
          Action: "Supply",
        };
      } else if (availableToken === tokenB) {
        tokenInfo = {
          Name: "Token B",
          Address: availableToken,
          Image: "/clylogo",
          "Wallet Balance": formatEther(BigInt(tokenBBalance ?? 0)),
          APY: "3.23%",
          "Total Supplied": "20M",
          Action: "Supply",
        };
      } else if (availableToken === tokenC) {
        tokenInfo = {
          Name: "Token C",
          Address: availableToken,
          Image: "/dotlogo",
          "Wallet Balance": formatEther(BigInt(tokenCBalance ?? 0)),
          APY: "3.23%",
          "Total Supplied": "20M",
          Action: "Supply",
        };
      }
      return tokenInfo;
    });
  }, [availableTokens, address]);

  console.log("availableTokens", assets);

  return (
    <main className="flex flex-col gap-3">
      <div className="w-2/3">
        <h1 className="font-khand text-2xl font-bold text-white">
          Lock in your crypto assets to earn interest
        </h1>
        <p className="font-khand text-lg text-grey-1">
          Enable peer-to-peer lending and borrowing through blockchain
          technology, providing users with direct control, reduced fees, and
          increased financial accessibility!
        </p>
      </div>
      <div className="border-0.5 flex items-center justify-between rounded-md border border-grey-2 px-10 py-3 font-khand text-white">
        <div className="flex flex-col items-center justify-center">
          <span className="flex gap-2 text-sm font-semibold">
            <Icon name="supply" />
            Total Supply
          </span>
          <p className="text-2xl">$0.000</p>
        </div>
        <hr className="h-full w-[1px] bg-grey-2" />
        <div className="flex flex-col items-center justify-center">
          <span className="flex gap-2 text-sm font-semibold">
            <Icon name="apy" />
            Net APY
          </span>
          <p className="text-2xl">0.00%</p>
        </div>
        <hr className="h-full w-[1px] bg-grey-2" />
        <div className="flex flex-col items-center justify-center">
          <span className="flex gap-2 text-sm font-semibold">
            <Icon name="borrow" />
            Total Borrow
          </span>
          <p className="text-2xl">$0.000</p>
        </div>
      </div>
      <Tabs.Root
        value={action()!}
        onValueChange={(value) => setAction(value as TabType)}
        className="flex flex-col gap-4"
      >
        <Tabs.List className="flex items-center font-khand font-semibold">
          <Tabs.Trigger key="supply" value={"supply"}>
            <p
              className={twMerge(
                `text-grey-1  ${action() == "supply" && "text-white"}`,
              )}
            >
              Supply
            </p>
            <hr
              className={twMerge(
                `h-[4px] w-[102px] bg-grey-1  ${
                  action() == "supply" &&
                  "border-b-1 border-primary-4 bg-primary-4"
                }`,
              )}
            />
          </Tabs.Trigger>

          <Tabs.Trigger key="borrow" value={"borrow"}>
            <p
              className={twMerge(
                `text-grey-1  ${action() == "borrow" && "text-white"}`,
              )}
            >
              Borrow
            </p>
            <hr
              className={twMerge(
                `h-[4px] w-[102px] bg-grey-1  ${
                  action() == "borrow" &&
                  "border-b-1 border-primary-4 bg-primary-4"
                }`,
              )}
            />
          </Tabs.Trigger>
        </Tabs.List>
        {isLoading || isTokenALoading || isTokenBLoading || isTokenCLoading ? (
          <>Loading...</>
        ) : (
          <>
            <Tabs.Content value="supply">
              <DataTable columns={columns} data={assets} />
            </Tabs.Content>
            <Tabs.Content value="borrow">
              <DataTable columns={columns} data={assets} />
            </Tabs.Content>
          </>
        )}
      </Tabs.Root>
    </main>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<>Loading...</>}>
      <Lend />
    </Suspense>
  );
};

export default Page;
