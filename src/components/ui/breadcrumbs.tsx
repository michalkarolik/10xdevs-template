import React from "react";

export const Breadcrumbs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <nav className="flex space-x-2">{children}</nav>;
};

export const BreadcrumbItem: React.FC<{ href?: string; children: React.ReactNode }> = ({ href, children }) => {
  return (
    <span>
      {href ? (
        <a href={href} className="text-blue-600 hover:underline">
          {children}
        </a>
      ) : (
        <span className="text-gray-500">{children}</span>
      )}
    </span>
  );
};
