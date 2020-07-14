import { SpeakerDetail } from '../character/GameCharacterTypes';
import StringUtils from '../utils/StringUtils';
import CharacterParser from './CharacterParser';
import Parser from './Parser';
import ParserConverter from './ParserConverter';

export default class SpeakerParser {
  public static parse(rawStr: string): SpeakerDetail {
    const [speakerId, expression, speakerPositionStr] = StringUtils.splitByChar(
      rawStr.slice(1), // remove the @
      ','
    );
    const speakerPosition = ParserConverter.stringToPosition(speakerPositionStr);

    this.addCharacterExprToMap(speakerId, expression);

    return {
      speakerId,
      expression,
      speakerPosition
    };
  }

  public static addCharacterExprToMap(charId: string, expression: string) {
    if (charId === 'you' || charId === 'narrator') {
      return;
    }
    const character = Parser.checkpoint.map.getCharacters().get(charId);

    if (!character) {
      throw new Error(`Character "${charId}" not in map`);
    }

    const charExpression = expression || character.defaultExpression;

    character.expressions.set(
      expression,
      CharacterParser.characterAssetKey(charId, expression || charExpression)
    );

    Parser.checkpoint.map.addMapAsset(
      CharacterParser.characterAssetKey(charId, charExpression),
      CharacterParser.characterAssetValue(charId, charExpression)
    );
  }
}
