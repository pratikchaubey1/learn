import React from 'react';
import Logo from './Logo';

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-blue transition-colors">
        {children}
    </a>
);

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-slate-300 py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <Logo />
                        <p className="mt-2 text-sm text-slate-400 max-w-xs">
                            AI-Powered Test Prep for the next generation of students.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                         <SocialIcon href="#">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                        </SocialIcon>
                        <SocialIcon href="#">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.06-1.064.049-1.644.212-2.126.41a3.099 3.099 0 00-1.082.682 3.099 3.099 0 00-.682 1.082c-.198.482-.361 1.062-.41 2.126-.049 1.023-.06 1.351-.06 3.807 0 2.456.011 2.784.06 3.807.049 1.064.212 1.644.41 2.126a3.099 3.099 0 00.682 1.082 3.099 3.099 0 001.082.682c.482.198 1.062.361 2.126.41 1.023.049 1.351.06 3.807.06h.468c2.456 0 2.784-.011 3.807-.06 1.064-.049 1.644-.212 2.126-.41a3.099 3.099 0 001.082-.682 3.099 3.099 0 00.682-1.082c.198-.482.361-1.062.41-2.126.049-1.023.06-1.351.06-3.807s-.011-2.784-.06-3.807c-.049-1.064-.212-1.644-.41-2.126a3.099 3.099 0 00-.682-1.082 3.099 3.099 0 00-1.082-.682c-.482-.198-1.062-.361-2.126-.41-1.023-.049-1.351-.06-3.807-.06z M12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 1.802a3.333 3.333 0 110 6.666 3.333 3.333 0 010-6.666zm5.338-3.205a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" clipRule="evenodd" /></svg>
                        </SocialIcon>
                         <SocialIcon href="#">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </SocialIcon>
                    </div>
                </div>
                <div className="mt-8 border-t border-slate-700 pt-6 text-sm text-center text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Refresh Kid Learning. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;