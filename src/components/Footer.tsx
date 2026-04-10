import Link from "next/link";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Search Properties", href: "/search" },
      { label: "List a Property", href: "/register" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "For Agents",
    links: [
      { label: "Agent Portal", href: "/dashboard" },
      { label: "Marketing Tools", href: "/marketing-materials" },
      { label: "CMA Reports", href: "/cma" },
      { label: "Showing Service", href: "/showing-service" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About OneMLS", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Fair Housing", href: "/fair-housing" },
      { label: "DMCA", href: "/dmca" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-[#c9a962] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#2a2a3a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#c9a962]">OneMLS</span>
          </div>
          <p className="text-sm text-slate-500 text-center">
            &copy; 2026 OneMLS. The National MLS &mdash; Independent of NAR.
          </p>
        </div>
      </div>
    </footer>
  );
}
