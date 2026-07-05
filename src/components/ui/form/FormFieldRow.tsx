type Props = {
  children: React.ReactNode;
};

function FormFieldRow({ children }: Props) {
  return <div className="flex items-center gap-4">{children}</div>;
}

export default FormFieldRow;
