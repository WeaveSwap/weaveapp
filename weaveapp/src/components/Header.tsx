import Link from "next/link";
import React from "react";
import { WalletConnectButton } from ".";
import { Icon } from "@/primitives/Icon";

const Header = () => {
  return (
    <main
      className={`flex items-center justify-between text-white`}
    >
      <div className="flex items-center gap-1">
        <Icon name="weavelogo" />
        <h1 className="font-kavoon text-2xl">Weaveswap</h1>
      </div>
      <ul className="font-khand flex gap-2 text-lg font-semibold">
        <Link href={"/swap"}>Swap</Link>
        <Link href={"/lend?action=supply"}>Lend</Link>
        <Link href={"/pool"}>Pool</Link>
      </ul>
      <WalletConnectButton />
    </main>
  );
};

export default Header;
