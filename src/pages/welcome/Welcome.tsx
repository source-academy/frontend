
export type WelcomeProps = DispatchProps;

export type DispatchProps = {

}

const Welcome: React.FC<WelcomeProps> = props => {
  return (
    <>
      <h3>Welcome to Source Academy</h3>
      <div>and you have no course...</div>
    </>
  )
}

export default Welcome;