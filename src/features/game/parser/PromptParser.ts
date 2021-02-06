import { DialogueLine } from "../dialogue/GameDialogueTypes";

export default class PromptParser {

    public static parse(lines: string[], currIndex: number) {
        const firstStr = lines[currIndex];
        const prompt: DialogueLine = {
            line: firstStr.slice(firstStr.indexOf("prompt:") + 7).trim(),
            choices: new Map<string, string>()
        }
        while (lines[currIndex + 1] && isPromptChoice(lines[currIndex + 1])) {
            currIndex++;
            const choiceStr = lines[currIndex];
            const choiceArr = choiceStr.split('->');
            const option = choiceArr[0].trim();
            const goto = choiceArr[1].trim().split(' ')[1];
            if (prompt.choices) prompt.choices.set(option, goto);
        }
        return prompt;
    }
}

const isPromptChoice = (line: string) => line.includes('-> goto');