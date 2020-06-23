import { splitToLines } from './ParserHelper';
import GameObjective from '../objective/GameObjective';
import Parser from './Parser';

export default function CharacterParser(fileName: string, fileContent: string): void {
  const objectives = new GameObjective();
  objectives.addObjectives(splitToLines(fileContent));
  Parser.checkpoint.objectives = objectives;
}
