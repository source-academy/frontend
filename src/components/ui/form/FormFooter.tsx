type Props = {
  children: React.ReactNode;
};

function FormFooter({ children }: Props) {
  return <div className="mt-5 mb-2.5 flex justify-between items-center">{children}</div>;
}

export default FormFooter;
