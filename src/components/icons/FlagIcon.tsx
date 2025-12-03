interface FlagIconProps extends React.SVGProps<SVGSVGElement> {
  code: 'es' | 'en' | 'it' | 'fr';
}

const SpainFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 3 2" {...props}><path fill="#c60b1e" d="M0 0h3v2H0z"/><path fill="#ffc400" d="M0 .5h3v1H0z"/></svg>
);

const UKFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 60 30" {...props}><clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/><path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#a)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" clipPath="url(#a)"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" clipPath="url(#a)"/></svg>
);

const ItalyFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 3 2" {...props}><path fill="#009246" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ce2b37" d="M2 0h1v2H2z"/></svg>
);

const FranceFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 3 2" {...props}><path fill="#002395" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ed2939" d="M2 0h1v2H2z"/></svg>
);

export const FlagIcon = ({ code, ...props }: FlagIconProps) => {
  switch (code) {
    case 'es': return <SpainFlag {...props} />;
    case 'en': return <UKFlag {...props} />;
    case 'it': return <ItalyFlag {...props} />;
    case 'fr': return <FranceFlag {...props} />;
    default: return null;
  }
};