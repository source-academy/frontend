type Props = {
  children: React.ReactNode;
  heading: string;
};

function FormContainer({ children, heading }: Props) {
  return (
    <div className="flex flex-col items-center p-5 bg-white mt-5">
      <form>
        <h2>{heading}</h2>
        {children}
      </form>
    </div>
  );
}

export default FormContainer;
