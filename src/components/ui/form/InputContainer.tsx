type Props = {
  children: React.ReactNode;
};

function InputContainer({ children }: Props) {
  return <div className="flex items-center">{children}</div>;
}

export default InputContainer;
