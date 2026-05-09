import { Link } from "react-router-dom"; 
import { Facebook, Twitter, Linkedin, Instagram, Globe, Mail, MapPin, ArrowRight } from "lucide-react";

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: 'hsl(215,70%,7%)', borderTop: '1px solid hsl(215,40%,15%)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        {/* Top Section: 1 col mobile, 2 cols tablet, 6 cols desktop (2 for brand + 4 for links) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & Mission (spans 2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:pr-8">
            <Link 
              to="/" 
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-fit"
              aria-label="BetView Home"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
                  <span className="text-white font-display font-bold text-sm">B</span>
                </div>
                <span className="font-display font-semibold text-xl text-white tracking-tight">
                  BetView <span style={{ color: 'hsl(var(--blue-glow))' }} className="font-light">ቤት View</span>
                </span>
              </div>
            </Link>
            
            <p style={{ color: 'hsl(215,30%,55%)' }} className="leading-relaxed max-w-sm text-sm">
              Ethiopia's trusted real estate marketplace connecting verified agencies with property seekers.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" style={{ color: 'hsl(215,30%,55%)' }} className="p-2 -ml-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X/Twitter" style={{ color: 'hsl(215,30%,55%)' }} className="p-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn" style={{ color: 'hsl(215,30%,55%)' }} className="p-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" style={{ color: 'hsl(215,30%,55%)' }} className="p-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-display font-semibold tracking-wide text-sm">Platform</h3>
            <ul className="flex flex-col gap-3">
              <li><Link to="/browse" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Browse Properties</Link></li>
              <li><Link to="/agency" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Agency Dashboard</Link></li>
              <li><Link to="/pricing" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Pricing & Plans</Link></li>
              <li><Link to="/featured" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Featured Listings</Link></li>
              <li><Link to="/scan-request" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Request 360° Scan</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-display font-semibold tracking-wide text-sm">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link to="/about" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">About Us</Link></li>
              <li><Link to="/how-it-works" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">How It Works</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-display font-semibold tracking-wide text-sm">Support</h3>
            <ul className="flex flex-col gap-3">
              <li><Link to="/help" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Help Center</Link></li>
              <li><Link to="/contact" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Contact Us</Link></li>
              <li><Link to="/report" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Report a Listing</Link></li>
              <li><Link to="/trust" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Trust & Safety</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="flex flex-col gap-5">
            <h3 className="text-white font-display font-semibold tracking-wide text-sm">Legal & Contact</h3>
            <ul className="flex flex-col gap-3">
              <li><Link to="/privacy" style={{ color: 'hsl(215,30%,55%)' }} className="text-sm hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-1 inline-block">Privacy Policy</Link></li>
            </ul>
            <div className="mt-2 flex flex-col gap-3 text-sm" style={{ color: 'hsl(215,30%,55%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(214,80%,40%,0.15)', border: '1px solid hsl(214,80%,40%,0.3)' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'hsl(var(--blue-glow))' }} aria-hidden="true" />
                </div>
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <a href="mailto:info@betview.et" className="flex items-center gap-3 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm py-0.5 w-fit">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(214,80%,40%,0.15)', border: '1px solid hsl(214,80%,40%,0.3)' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: 'hsl(var(--blue-glow))' }} aria-hidden="true" />
                </div>
                <span>info@betview.et</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Stacked on mobile, flex on tablet/desktop */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4" style={{ borderTop: '1px solid hsl(215,40%,15%)' }}>
          
          {/* Left: Copyright */}
          <div style={{ color: 'hsl(215,30%,40%)' }} className="text-sm text-center lg:text-left order-3 lg:order-1 w-full lg:w-auto">
            © {currentYear} BetView · ቤት View. All rights reserved.
          </div>

          {/* Center: Language/Region */}
          <div className="order-2 lg:order-2 flex justify-center w-full lg:w-auto">
            <button 
              type="button"
              style={{ color: 'hsl(215,30%,55%)', background: 'hsl(215,40%,12%)', borderColor: 'hsl(215,40%,20%)' }}
              className="flex items-center gap-2 hover:text-white transition-colors text-sm px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary border min-h-[44px]"
            >
              <Globe className="w-4 h-4" style={{ color: 'hsl(var(--blue-glow))' }} aria-hidden="true" />
              <span>English (ET)</span>
            </button>
          </div>

          {/* Right: Newsletter */}
          <form className="order-1 lg:order-3 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <div className="relative w-full sm:w-64">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(215,30%,55%)' }} aria-hidden="true" />
              <input 
                type="email" 
                id="newsletter-email"
                required
                placeholder="Subscribe to newsletter" 
                style={{ background: 'hsl(215,50%,9%)', borderColor: 'hsl(215,40%,18%)', color: 'white' }}
                className="w-full border text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[44px]"
              />
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-5 py-2.5 gradient-blue text-white shadow-blue text-sm font-medium rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 flex items-center justify-center gap-2 min-h-[44px]"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
