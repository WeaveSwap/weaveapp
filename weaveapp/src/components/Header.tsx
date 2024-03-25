"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { WalletConnectButton } from ".";
import { Icon } from "@/primitives/Icon";
import { usePathname } from "next/navigation";

const Header = () => {
  const path = usePathname();
  useEffect(() => {
    window.addEventListener("load", () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
    });
  }, []);

  return (
    <main className={`flex items-center justify-between text-white`}>
      <div className="flex items-center gap-1">
        <Icon name="weavelogo" />
        <link rel="manifest" href="./manifest.json" />
        <Link href={"/"} className="font-kavoon text-2xl">
          Weaveswap
        </Link>
      </div>
      <ul className="flex gap-4 font-khand text-lg font-semibold">
        <Link href={"/swap"}>Swap</Link>
        <Link href={"/lend?action=supply"}>Lend</Link>
        <Link href={"/pool"}>Pool</Link>
      </ul>
      <WalletConnectButton isHome={path == "/"} />
    </main>
  );
};

export default Header;
