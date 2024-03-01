"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, IconType } from "@/components";
import Image from "next/image";
import { Button, Icon } from "@/primitives";
import * as Tabs from "@radix-ui/react-tabs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { createUrl } from "@/utils";
const asset_name = ["MATIC", "ENG", "CBC", "WAS", "CLY"] as const;

type AssetName = (typeof asset_name)[number];

type Asset = {
  id: string;
  Name: AssetName;
  "Total Supplied": string;
  APY: string;
  "Wallet Balance": string;
  Action: string;
};

export const assets: Asset[] = [
  {
    id: "1",
    Name: "MATIC",
    "Total Supplied": "20M",
    APY: "3.23%",
    "Wallet Balance": "$2,000",
    Action: "Supply",
  },
  {
    id: "2",
    Name: "ENG",
    "Total Supplied": "20M",
    APY: "3.23%",
    "Wallet Balance": "$2,000",
    Action: "Supply",
  },
  {
    id: "3",
    Name: "CBC",
    "Total Supplied": "20M",
    APY: "3.23%",
    "Wallet Balance": "$2,000",
    Action: "Supply",
  },
  {
    id: "4",
    Name: "WAS",
    "Total Supplied": "20M",
    APY: "3.23%",
    "Wallet Balance": "$2,000",
    Action: "Supply",
  },
  {
    id: "5",
    Name: "CLY",
    "Total Supplied": "20M",
    APY: "3.23%",
    "Wallet Balance": "$2,000",
    Action: "Supply",
  },
];

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "Name",
    // header: "Pool",
    header: () => <div className="text-center">Asset</div>,
    cell: ({ row }) => {
      const asset: AssetName = row.getValue("Name");

      const TokenIcon = () => {
        switch (asset) {
          case "MATIC":
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
          case "WAS":
            return (
              <Image
                width="20"
                height="20"
                src="/weavelogo.svg"
                alt="blylogo"
              />
            );

          case "ENG":
            return (
              <Image width="20" height="20" src="/englogo.svg" alt="englogo" />
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
    cell: ({ row }) => {
      return <Button variant="primary">Add Supply</Button>;
    },
  },
];

type TabType = "supply" | "borrow";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
                  "border-primary-4 bg-primary-4 border-b-1"
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
                  "border-primary-4 bg-primary-4 border-b-1"
                }`,
              )}
            />
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="supply">
          <DataTable columns={columns} data={assets} />
        </Tabs.Content>
        <Tabs.Content value="borrow">
          <DataTable columns={columns} data={assets} />
        </Tabs.Content>
      </Tabs.Root>
    </main>
  );
};

export default Page;
