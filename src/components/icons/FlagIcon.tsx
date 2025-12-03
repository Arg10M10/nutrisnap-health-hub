interface FlagIconProps extends React.SVGProps<SVGSVGElement> {
  code: 'es' | 'en' | 'it' | 'fr';
}

const SpainFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 3 2" {...props}><path fill="#c60b1e" d="M0 0h3v2H0z"/><path fill="#ffc400" d="M0 .5h3v1H0z"/></svg>
);

const USFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1235 650" {...props}>
    <path fill="#FFF" d="M0 0h1235v650H0z"/>
    <path fill="#B22234" d="M0 0h1235v50H0zm0 100h1235v50H0zm0 200h1235v50H0zm0 300h1235v50H0zm0 400h1235v50H0zm0 500h1235v50H0zm0 600h1235v50H0z"/>
    <path fill="#3C3B6E" d="M0 0h494v350H0z"/>
    <g fill="#FFF">
      <path d="M50 35l12 36-30-22h36l-30 22z M150 35l12 36-30-22h36l-30 22z M250 35l12 36-30-22h36l-30 22z M350 35l12 36-30-22h36l-30 22z M450 35l12 36-30-22h36l-30 22z M100 70l12 36-30-22h36l-30 22z M200 70l12 36-30-22h36l-30 22z M300 70l12 36-30-22h36l-30 22z M400 70l12 36-30-22h36l-30 22z M50 105l12 36-30-22h36l-30 22z M150 105l12 36-30-22h36l-30 22z M250 105l12 36-30-22h36l-30 22z M350 105l12 36-30-22h36l-30 22z M450 105l12 36-30-22h36l-30 22z M100 140l12 36-30-22h36l-30 22z M200 140l12 36-30-22h36l-30 22z M300 140l12 36-30-22h36l-30 22z M400 140l12 36-30-22h36l-30 22z M50 175l12 36-30-22h36l-30 22z M150 175l12 36-30-22h36l-30 22z M250 175l12 36-30-22h36l-30 22z M350 175l12 36-30-22h36l-30 22z M450 175l12 36-30-22h36l-30 22z M100 210l12 36-30-22h36l-30 22z M200 210l12 36-30-22h36l-30 22z M300 210l12 36-30-22h36l-30 22z M400 210l12 36-30-22h36l-30 22z M50 245l12 36-30-22h36l-30 22z M150 245l12 36-30-22h36l-30 22z M250 245l12 36-30-22h36l-30 22z M350 245l12 36-30-22h36l-30 22z M450 245l12 36-30-22h36l-30 22z M100 280l12 36-30-22h36l-30 22z M200 280l12 36-30-22h36l-30 22z M300 280l12 36-30-22h36l-30 22z M400 280l12 36-30-22h36l-30 22z M50 315l12 36-30-22h36l-30 22z M150 315l12 36-30-22h36l-30 22z M250 315l12 36-30-22h36l-30 22z M350 315l12 36-30-22h36l-30 22z M450 315l12 36-30-22h36l-30 22z"/>
    </g>
  </svg>
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
    case 'en': return <USFlag {...props} />;
    case 'it': return <ItalyFlag {...props} />;
    case 'fr': return <FranceFlag {...props} />;
    default: return null;
  }
};