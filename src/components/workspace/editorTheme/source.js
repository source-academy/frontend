/**
 * Source Theme for Ace Editor
 * (Modified from cobalt theme in default brace package)
 * 
 * Changes includes:
 * 1)
 * Use background highlighting for bracket matching to make it more prominent.
 * Reference: https://github.com/source-academy/cadet-frontend/pull/767
 */
ace.define("ace/theme/source",["require","exports","module","ace/lib/dom"], function(acequire, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-source";
exports.cssText = ".ace-source .ace_gutter {\
background: #011e3a;\
color: rgb(128,145,160)\
}\
.ace-source .ace_print-margin {\
width: 1px;\
background: #555555\
}\
.ace-source {\
background-color: #002240;\
color: #FFFFFF\
}\
.ace-source .ace_cursor {\
color: #FFFFFF\
}\
.ace-source .ace_marker-layer .ace_selection {\
background: rgba(179, 101, 57, 0.75)\
}\
.ace-source.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #002240;\
}\
.ace-source .ace_marker-layer .ace_step {\
background: rgb(127, 111, 19)\
}\
.ace-source .ace_marker-layer .ace_bracket {\
background: #090;\
}\
.ace-terminal-theme .ace_marker-layer .ace_bracket-start {\
background: #090;\
}\
.ace-terminal-theme .ace_marker-layer .ace_bracket-unmatched {\
margin: -1px 0 0 -1px;\
border: 1px solid #900\
}\
.ace-source .ace_marker-layer .ace_active-line {\
background: rgba(0, 0, 0, 0.35)\
}\
.ace-source .ace_gutter-active-line {\
background-color: rgba(0, 0, 0, 0.35)\
}\
.ace-source .ace_marker-layer .ace_selected-word {\
border: 1px solid rgba(179, 101, 57, 0.75)\
}\
.ace-source .ace_invisible {\
color: rgba(255, 255, 255, 0.15)\
}\
.ace-source .ace_keyword,\
.ace-source .ace_meta {\
color: #FF9D00\
}\
.ace-source .ace_constant,\
.ace-source .ace_constant.ace_character,\
.ace-source .ace_constant.ace_character.ace_escape,\
.ace-source .ace_constant.ace_other {\
color: #FF628C\
}\
.ace-source .ace_invalid {\
color: #F8F8F8;\
background-color: #800F00\
}\
.ace-source .ace_support {\
color: #80FFBB\
}\
.ace-source .ace_support.ace_constant {\
color: #EB939A\
}\
.ace-source .ace_fold {\
background-color: #FF9D00;\
border-color: #FFFFFF\
}\
.ace-source .ace_support.ace_function {\
color: #FFB054\
}\
.ace-source .ace_storage {\
color: #FFEE80\
}\
.ace-source .ace_entity {\
color: #FFDD00\
}\
.ace-source .ace_string {\
color: #3AD900\
}\
.ace-source .ace_string.ace_regexp {\
color: #80FFC2\
}\
.ace-source .ace_comment {\
font-style: italic;\
color: #0088FF\
}\
.ace-source .ace_heading,\
.ace-source .ace_markup.ace_heading {\
color: #C8E4FD;\
background-color: #001221\
}\
.ace-source .ace_list,\
.ace-source .ace_markup.ace_list {\
background-color: #130D26\
}\
.ace-source .ace_variable {\
color: #CCCCCC\
}\
.ace-source .ace_variable.ace_language {\
color: #FF80E1\
}\
.ace-source .ace_meta.ace_tag {\
color: #9EFFFF\
}\
.ace-source .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYHCLSvkPAAP3AgSDTRd4AAAAAElFTkSuQmCC) right repeat-y\
}\
";

var dom = acequire("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
