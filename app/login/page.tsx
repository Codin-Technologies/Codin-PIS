import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-[#1e1a16] overflow-hidden">
            {/* Left Side: Form Area (Expansive) */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-24 z-10 bg-[#1e1a16]">
                <div className="w-full max-w-lg mx-auto">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-yellow-600 shadow-lg shadow-amber-700/20">
                            <span className="text-xl font-black text-white">KSC</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-white">
                            Kongoni Serengeti Camp
                        </h2>
                    </div>

                    {/* Form Panel */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-700/20 to-yellow-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[#2a241e] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                            <LoginForm />
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-12 flex items-center justify-between text-[#9ca6af] text-xs font-semibold uppercase tracking-widest">
                        <button className="hover:text-white transition-colors">Support Center.</button>
                        <button className="hover:text-white transition-colors">Security Policy.</button>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual Branding (Desktop only) */}
            <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[#1e1a16] via-transparent to-transparent"></div>
                <div className="absolute inset-0 z-10 bg-[#1e1a16]/60 backdrop-blur-[2px]"></div>

                <img
                    src="/restaurant_interior_login_bg_1769723163606.png"
                    alt="Premium Restaurant Interior"
                    className="absolute inset-0 h-full w-full object-cover grayscale brightness-[0.6] transition-transform duration-[10000ms] hover:scale-110"
                />

                <div className="relative z-20 flex flex-col justify-center p-24 text-white">
                    <div className="max-w-md">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase mb-6 border border-white/10">
                            Enterprise Edition
                        </span>
                        <h1 className="text-6xl font-black leading-[1.1] tracking-tighter mb-8">
                            Procurement Management System <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
                                Kongoni Serengeti Camp
                            </span>
                        </h1>
                        <p className="text-xl text-[#9ca6af] font-medium leading-relaxed">
                            Managed operations, real-time analytics, and procurement
                            orchestration for luxury safari camps.
                        </p>
                    </div>
                </div>

                {/* Decorative Accents */}
                <div className="absolute bottom-12 right-12 z-20">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1e1a16] bg-[#332b24] flex items-center justify-center text-xs font-bold">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-[#9ca6af]">
                            Trusted by 100+ Brands
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
