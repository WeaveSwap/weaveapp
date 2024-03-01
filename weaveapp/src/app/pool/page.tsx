"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, IconType } from "@/components";
import Image from "next/image";
import { Button } from "@/primitives";

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

export const pools: Pool[] = [
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

export const columns: ColumnDef<Pool>[] = [
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
      return <Button variant="primary">Add Supply</Button>;
    },
  },
];

const Page = () => {
  return (
    <main className="flex flex-col gap-3">
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
