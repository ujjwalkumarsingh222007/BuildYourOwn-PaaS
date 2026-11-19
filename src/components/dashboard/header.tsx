"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Plus, 
  LogOut,
  ChevronDown,
  BookOpen,
  Cloud
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchAwsConnection } from "@/services/api"
import { toast } from "sonner"

interface HeaderProps {
  onOpenMobileSidebar: () => void
}

export function DashboardHeader({ onOpenMobileSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { data: awsConn } = useQuery({
    queryKey: ["aws-status"],
    queryFn: fetchAwsConnection,
  })

  const awsConnected = awsConn?.status === "connected"

  return (
    <header className="h-16 border-b border-border bg-card/60 px-4 sm:px-6 flex items-center justify-between backdrop-blur-sm z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative w-64 md:w-80 hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects or deployments..."
            className="pl-9 h-9 text-xs bg-background/50 border-border focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/aws-connections"
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${
            awsConnected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          <Cloud className="h-3 w-3" />
          <span>{awsConnected ? `aws:${awsConn?.region}` : "aws:not-connected"}</span>
        </Link>

        <Link href="/guide" className="hidden md:inline-flex">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <BookOpen className="h-3.5 w-3.5" /> AWS Guide
          </Button>
        </Link>

        <Link href="/projects/new" className="hidden sm:inline-flex">
          <Button
            size="sm"
            className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Deploy
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-accent rounded-lg">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  WS
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-foreground leading-none">Workspace</div>
                <div className="text-[10px] text-muted-foreground leading-none mt-1">
                  {awsConnected ? awsConn?.accountId : "AWS Ready"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Workspace</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {awsConnected ? `AWS ${awsConn?.accountId}` : "No active AWS session"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/projects">Projects</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/aws-connections">AWS Connections</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/infrastructure">Infrastructure</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/guide">AWS Guide</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => {
                toast.info("Returned to home page")
                window.location.href = "/"
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Exit Console</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
