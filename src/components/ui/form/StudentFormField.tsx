type Props = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
};

function StudentFormField({ label, htmlFor, children }: Props) {
  return (
    <div className="mb-6 w-200">
      <label htmlFor={htmlFor} className="block text-base mb-3.75">
        {label}
      </label>
      {children}
    </div>
  );
}

export default StudentFormField;
