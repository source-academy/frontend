import { Card, H1 } from "@blueprintjs/core";

export type WelcomeProps = DispatchProps;

export type DispatchProps = {};

const Welcome: React.FC<WelcomeProps> = props => {
  return (
    <div className="fullpage">
      <Card className="fullpage-content" >
        <div style={{marginTop: '20px'}}>
          <H1>Welcome to Source Academy @ NUS</H1>
          <div>and you have no course...</div>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;
