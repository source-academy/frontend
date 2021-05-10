// @ts-ignore
import XMLParser from "react-xml-parser";
import * as xml2js from 'xml2js';

// @ts-ignore
import data from '../assets/xml/chapter1/section1/subsection1.xml';

export function parseSicpXml(chapter: integer, section:integer, subsection: integer) {
    const parser = new xml2js.Parser();

    // const __rootDirectory = "../assets/xml/";
    // const __filepath = "chapter1/section1/subsection1.xml";
    // const data = "<root>Hello xml2js!</root>"
    const jsonDataFromXml = new XMLParser().parseFromString(data);

    //TODO: Replace any type in parameter
    parser.parseString(jsonDataFromXml, function (err: any, result: any) {
        console.log(result);
        console.log('Done');
    });

    return "a";
}