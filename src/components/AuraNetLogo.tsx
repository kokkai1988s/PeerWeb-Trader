import * as React from 'react';

export function AuraNetLogo() {
  return (
    <svg width="100" height="100" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="mb-4">
      <defs>
        <style>
          {`
            .a {
              fill: hsl(var(--foreground));
              stroke: hsl(var(--foreground));
              stroke-width: 4;
              shape-rendering: crispEdges;
            }
          `}
        </style>
      </defs>
      <path className="a" d="M16 4h32v4H16z M12 8h4v4h-4z M48 8h4v4h-4z M8 12h4v24H8z M52 12h4v24h-4z M16 36h32v4H16z M12 40h4v4h-4z M48 40h4v4h-4z M8 44h4v12H8z M52 44h4v12h-4z M16 56h32v4H16z"/>
      <path fill="hsl(var(--foreground))" d="M24 20h4v16h-4z M36 20h4v16h-4z M28 24h4v4h-4z M32 28h4v4h-4z" shapeRendering="crispEdges"/>
    </svg>
  );
}
