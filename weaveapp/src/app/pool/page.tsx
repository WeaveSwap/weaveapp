"use client";
import { DataTable, Header } from "@/components";
import { Button, Input, Modal } from "@/primitives";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useState } from "react";

type Pool = {
  id: string;
  Pool: string;
  Composition: string;
  "7d Volume": string;
  "24h Volume": string;
  Fee: string;
  "Total Market Cap": string;
  ROI: string;
  Action: string;
};

const pools: Pool[] = [
  {
    id: "1",
    Pool: "PLY/WAS",
    Composition: "",
    "7d Volume": "$1M",
    "24h Volume": "$456k",
    Fee: "$35.23",
    "Total Market Cap": "$15m",
    ROI: "13.7%",
    Action: "Add Supply",
  },
  {
    id: "2",
    Pool: "CBC/ETH",
    Composition: "",
    "7d Volume": "$1M",
    "24h Volume": "$456k",
    Fee: "$35.23",
    "Total Market Cap": "$15m",
    ROI: "13.7%",
    Action: "Add Supply",
  },
  {
    id: "3",
    Pool: "CLY/WAS",
    Composition: "",
    "7d Volume": "$1M",
    "24h Volume": "$456k",
    Fee: "$35.23",
    "Total Market Cap": "$15m",
    ROI: "13.7%",
    Action: "Add Supply",
  },
  {
    id: "4",
    Pool: "BLY/WAS",
    Composition: "",
    "7d Volume": "$1M",
    "24h Volume": "$456k",
    Fee: "$35.23",
    "Total Market Cap": "$15m",
    ROI: "13.7%",
    Action: "Add Supply",
  },
  {
    id: "5",
    Pool: "DOT/WAS",
    Composition: "",
    "7d Volume": "$1M",
    "24h Volume": "$456k",
    Fee: "$35.23",
    "Total Market Cap": "$15m",
    ROI: "13.7%",
    Action: "Add Supply",
  },
  {
    id: "6",
    Pool: "ENG/WAS",
    Composition: "",
    "7d Volume": "$1M",
    "24h Volume": "$456k",
    Fee: "$35.23",
    "Total Market Cap": "$15m",
    ROI: "13.7%",
    Action: "Add Supply",
  },
];

const columns: ColumnDef<Pool>[] = [
  {
    accessorKey: "Pool",
    // header: "Pool",
    header: () => <div className="">Pool</div>,
  },
  {
    accessorKey: "Composition",
    header: "Composition",
    cell: ({ row }) => {
      const pool: string = row.getValue("Pool");

      const [token1, token2] = pool.split("/");
      const Token1Icon = ({ token1 }: { token1: string | undefined }) => {
        switch (token1) {
          case "PLY":
            return (
              <Image
                width="20"
                height="20"
                src="/polygonlogo.svg"
                alt="polygonlogo"
              />
            );
          case "CBC":
            return (
              <Image
                width="20"
                height="20"
                src="/cnbclogo.svg"
                alt="cnbclogo"
              />
            );
          case "CLY":
            return (
              <Image width="20" height="20" src="/clylogo.svg" alt="clylogo" />
            );
          case "BLY":
            return (
              <Image width="20" height="20" src="/blylogo.svg" alt="blylogo" />
            );
          case "DOT":
            return (
              <Image width="20" height="20" src="/dotlogo.svg" alt="dotlogo" />
            );
          case "ENG":
            return (
              <Image width="20" height="20" src="/englogo.svg" alt="englogo" />
            );
          default:
            return null;
        }
      };

      const Token2Icon = ({ token2 }: { token2: string | undefined }) => {
        switch (token2) {
          case "WAS":
            return (
              <Image
                width="20"
                height="20"
                src="/weavelogo.svg"
                alt="weavelogo"
              />
            );
          case "ETH":
            return (
              <Image width="20" height="20" src="/ethlogo.svg" alt="ethlogo" />
            );
          default:
            return null;
        }
      };
      return (
        <div className="flex items-center gap-1 font-medium">
          <Token1Icon token1={token1} />
          <Token2Icon token2={token2} />
        </div>
      );
    },
  },
  {
    accessorKey: "7d Volume",
    header: "7d Volume",
  },
  {
    accessorKey: "24h Volume",
    header: "24h Volume",
  },
  {
    accessorKey: "Fee",
    header: "Fee",
  },
  {
    accessorKey: "Total Market Cap",
    header: "Total Market Cap",
  },
  {
    accessorKey: "ROI",
    header: "ROI",
  },
  {
    accessorKey: "Action",
    header: "Action",
    cell: ({ row }) => {
      const [inputAmount, setInputAmount] = useState<number | string>(0);

      return (
        <Modal>
          <Modal.Button asChild>
            <Button variant="primary">Add Supply</Button>
          </Modal.Button>
          <Modal.Portal className="backdrop-blur-sm">
            <Modal.Content className="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 z-30 flex max-h-[814px] w-full max-w-[30.06rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-10 rounded-[10px] border border-[0.5] border-grey-1 bg-black p-10 px-8 py-10 font-khand text-white shadow focus:outline-none">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold"> Add Supply</h2>
              </div>
              <div className="rounded-md bg-grey-1/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-grey-1">
                      First asset
                    </p>
                  </span>
                  <span className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-grey-1">
                      Wallet Bal
                    </p>
                    {/* <p>{tokenInBalance?.toString()}</p> */}
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
              <div className="rounded-md bg-grey-1/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-grey-1">
                      Second asset
                    </p>
                  </span>
                  <span className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-grey-1">
                      Wallet Bal
                    </p>
                    {/* <p>{tokenInBalance?.toString()}</p> */}
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
                // disabled={isLoading || isPending || isConfirming}
                // onClick={handleSwap}
              >
                Add Supply
              </Button>
            </Modal.Content>
          </Modal.Portal>
        </Modal>
      );
    },
  },
];

const Page = () => {
  return (
    <main className="flex min-h-screen flex-col gap-3 bg-black p-10">
      <Header />
      <div className="w-2/3">
        <h1 className="font-khand text-2xl font-bold text-white">
          Put your funds to work by providing for launchpad liquidity
        </h1>
        <p className="font-khand text-lg text-grey-1">
          When you add funds to launchpad liquidity pool, you can receive a
          share of its trading volume and potentially snag extra rewards when
          there are incentives involved!
        </p>
      </div>
      <DataTable columns={columns} data={pools} />
    </main>
  );
};

export default Page;
