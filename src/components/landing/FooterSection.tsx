import { Mail, MapPin } from "lucide-react";

const FooterSection = () => {
  return (
    <footer style={{ background: 'hsl(215,70%,7%)', borderTop: '1px solid hsl(215,40%,15%)' }} className="border-t">
      <div className="container max-w-6xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
                <span className="text-white font-display font-bold text-sm">B</span>
              </div>
              <span className="font-display font-semibold text-xl text-white tracking-tight">
                BetView <span style={{ color: 'hsl(var(--blue-glow))' }} className="font-light">ቤት View</span>
              </span>
            </div>
            <p style={{ color: 'hsl(215,30%,55%)' }} className="text-sm leading-relaxed">
              Bringing Ethiopia's real estate to life in 3D. The future of property exploration starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["VR Demo", "How It Works", "For Agencies", "Book a Demo"].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                    style={{ color: 'hsl(215,30%,55%)' }}
                    className="text-sm hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:info@betview.et" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(214,80%,40%,0.15)', border: '1px solid hsl(214,80%,40%,0.3)' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: 'hsl(var(--blue-glow))' }} />
                </div>
                <span style={{ color: 'hsl(215,30%,60%)' }} className="text-sm group-hover:text-white transition-colors">
                  info@betview.et
                </span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(214,80%,40%,0.15)', border: '1px solid hsl(214,80%,40%,0.3)' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'hsl(var(--blue-glow))' }} />
                </div>
                <span style={{ color: 'hsl(215,30%,60%)' }} className="text-sm">
                  Addis Ababa, Ethiopia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid hsl(215,40%,15%)' }}>
          <p style={{ color: 'hsl(215,30%,40%)' }} className="text-sm">
            © {new Date().getFullYear()} BetView · ቤት View. All rights reserved.
          </p>
          <p style={{ color: 'hsl(215,30%,40%)' }} className="text-sm">
            Addis Ababa, Ethiopia 🇪🇹
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
