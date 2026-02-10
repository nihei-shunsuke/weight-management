"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "全体" },
  { href: "/mypage", label: "マイページ" },
  { href: "/record", label: "データ入力" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/settings", label: "設定" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg">
            体重管理
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  pathname.startsWith(item.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.displayName}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            ログアウト
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" aria-describedby={undefined}>
            <SheetTitle>メニュー</SheetTitle>
            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-muted font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Separator className="my-2" />
              <p className="px-3 text-sm text-muted-foreground">
                {user?.displayName}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mx-3"
                onClick={handleSignOut}
              >
                ログアウト
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
