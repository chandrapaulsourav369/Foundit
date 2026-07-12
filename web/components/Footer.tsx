import React from "react";
import Link from "next/link";
import { MapPinned } from "lucide-react";

const Footer = () => {
	return (
		<footer className="mb-14 border-t border-white/5 bg-background py-12 px-6 md:mb-0 lg:px-20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <MapPinned className="size-6 text-primary" />
            <h2 className="font-serif text-xl font-bold text-foreground italic">FoundIt</h2>
          </div>
          <div className="flex gap-8 text-muted-foreground text-sm">
            <Link className="hover:text-primary transition-colors" href="/">Feed</Link>
            <Link className="hover:text-primary transition-colors" href="/posts/create">create post</Link>
            <Link className="hover:text-primary transition-colors" href="/reports">My reports</Link>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 FoundIt. All rights reserved.</p>
        </div>
      </footer>
	);
};

export default Footer;
