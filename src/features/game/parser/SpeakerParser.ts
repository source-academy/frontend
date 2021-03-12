import { AssetType } from '../assets/AssetsTypes';
import { SpeakerDetail } from '../character/GameCharacterTypes';
import StringUtils from '../utils/StringUtils';
import CharacterParser from './CharacterParser';
import Parser from './Parser';
import ParserConverter from './ParserConverter';

/**
 * This classes parses the speaker portion of the dialogue
 * and returns SpeakerDetail object encapsulating information
 * about speakers in a dialogue.
 *
 * This class also loads the character expressions into the
 * Character entity in the game map
 */
export default class SpeakerParser {
  /**
   * The character parses one line containing the speaker details
   * and returns a speaker detail object which is a property of some DialogueLine's.
   *
   * @param rawStr the string containing the character ids and expressions
   * @returns {SpeakerDetail} associated with that string
   */
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

  /**
   * This line adds the  expression into the expression map of an
   * existing Character in the game map. This ensures that
   * images of the characters' various expressions are loaded properly
   * into the game map.
   *
   * @param charId the character Id of that character, also the asset folder of the character inside /avatars folder
   * @param expression the expression of character to be loaded into the expression map of the character
   */
  private static addCharacterExprToMap(charId: string, expression: string) {
    if (charId === 'you' || charId === 'narrator') {
      return;
    }
    const character = Parser.checkpoint.map.getCharacterMap().get(charId);

    if (!character) {
      throw new Error(`Character "${charId}" not in map`);
    }

    const charExpression = expression || character.defaultExpression;

    character.expressions.set(
      expression,
      CharacterParser.characterAssetKey(charId, expression || charExpression)
    );

    Parser.checkpoint.map.addMapAsset(CharacterParser.characterAssetKey(charId, charExpression), {
      path: CharacterParser.characterAssetPath(charId, charExpression),
      type: AssetType.Image,
      key: charId
    });
  }
}
