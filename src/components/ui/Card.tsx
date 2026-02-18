import { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({ title, description, children, className = "", onClick }: CardProps) {
  const clickable = onClick ? "cursor-pointer hover:shadow-md transition-shadow" : "";
  return (
    <div className={`bg-surface rounded-3xl p-5 ${clickable} ${className}`} onClick={onClick}>
      {children ?? (
        <>
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </>
      )}
    </div>
  );
}

function Header({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

Card.Header = Header;
Card.Body = Body;

export default Card;
