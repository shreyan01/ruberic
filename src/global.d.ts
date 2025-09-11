declare namespace JSX {
  interface IntrinsicElements {
    'shader-doodle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { children?: string };
  }
} 