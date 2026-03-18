import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FlaskConical, LayoutDashboard, TestTube2, Boxes, ActivitySquare, Database, FileText, History, Users, Beaker } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FlaskConical, label: "Samples", href: "/samples" },
  { icon: TestTube2, label: "Tests", href: "/tests" },
  { icon: Boxes, label: "Inventory", href: "/inventory" },
  { icon: ActivitySquare, label: "Workflows", href: "/workflows" },
  { icon: Database, label: "Storage", href: "/storage" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: History, label: "Audit Logs", href: "/audit-logs" },
  { icon: Users, label: "Users", href: "/users" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Background ambient image */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/sci-bg.png)` }}
      />
      
      {/* Sidebar */}
      <div className="relative z-10 w-64 border-r border-white/5 bg-sidebar/50 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-primary">
            <Beaker className="w-6 h-6" />
            <span className="font-display font-bold tracking-wider text-lg text-glow">LIMS.OS</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-4 h-4 relative z-10", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                  <span className="relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-muted-foreground">Lab Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8">
          <h2 className="font-display font-medium text-lg text-white/90 capitalize">
            {location === "/" ? "Dashboard" : location.split('/')[1].replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
