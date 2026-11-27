type Props = {
  href: string;
  children?: React.ReactNode;
};

function ItalicLink({ href, children }: Props) {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      <i>{children}</i>
    </a>
  );
}

export default ItalicLink;
