export const ConnectorLine = ({ className = "" }: { className?: string }) => (
  <div className={`flex justify-center ${className}`}>
    <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
  </div>
);

export const ConnectorNode = () => (
  <div className="flex justify-center -my-3 relative z-10">
    <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-[0_0_12px_hsl(220_80%_52%/0.4)]" />
  </div>
);

export const ConnectorBlock = () => (
  <>
    <ConnectorLine />
    <ConnectorNode />
    <ConnectorLine />
  </>
);
