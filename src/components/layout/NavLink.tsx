
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export const NavLink = ({ href, children }: NavLinkProps) => (
  <a 
    href={href}
    className="text-chess-dark font-medium hover:text-chess-gold transition duration-300"
  >
    {children}
  </a>
);
