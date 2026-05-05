import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Reduce unnecessary physical tours by up to 70%",
  "Increase conversion rates with pre-qualified leads",
  "Attract diaspora investors from anywhere in the world",
  "Modernize your brand with cutting-edge VR technology",
  "Listings go live faster with our rapid scan process",
  "Dedicated agency dashboard and analytics",
];

const AgenciesSection = () => {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="agencies" className="py-24 bg-white">
      <div className="container max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6"
              style={{ background: 'hsl(214,80%,40%,0.08)', color: 'hsl(var(--primary))' }}>
              For Real Estate Agencies
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-navy mb-6 leading-tight">
              Why Real Estate Agencies Partner With BetView
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Forward-thinking agencies in Addis Ababa are already transforming how they do business. Join the movement.
            </p>

            <ul className="space-y-4 mb-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToForm}
              className="px-8 py-4 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] inline-block"
            >
              Schedule My Free Demo
            </button>
          </div>

          {/* Right: visual card */}
          <div className="relative">
            <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'hsl(215,66%,10%)' }}>
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
                style={{ background: 'hsl(var(--blue-glow))' }} />

              <div className="relative z-10">
                <div className="font-display font-bold text-5xl text-white mb-2">70%</div>
                <div style={{ color: 'hsl(var(--blue-glow))' }} className="font-medium mb-6">Fewer Unnecessary Tours</div>
                <div className="h-px mb-6" style={{ background: 'hsl(215,40%,22%)' }} />

                <div className="font-display font-bold text-5xl text-white mb-2">3×</div>
                <div style={{ color: 'hsl(var(--blue-glow))' }} className="font-medium mb-6">Higher Lead Quality</div>
                <div className="h-px mb-6" style={{ background: 'hsl(215,40%,22%)' }} />

                <div className="font-display font-bold text-5xl text-white mb-2">∞</div>
                <div style={{ color: 'hsl(var(--blue-glow))' }} className="font-medium mb-6">Global Reach for Diaspora</div>

                <div className="mt-8 p-4 rounded-xl" style={{ background: 'hsl(215,55%,14%)', border: '1px solid hsl(215,40%,22%)' }}>
                  <p className="text-sm italic" style={{ color: 'hsl(215,30%,65%)' }}>
                    "BetView helped us close a deal with a buyer in the US who never set foot in Ethiopia. This is the future."
                  </p>
                  <p className="text-sm font-medium text-white mt-3">— Agency Partner, Addis Ababa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgenciesSection;
