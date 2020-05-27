import * as React from 'react';

function StoryXmlUpload() {
  return (
    <div className="Vertical">
      <h3>Story Xml Upload</h3>
      <input type="file" onChange={onChange} style={{ width: '250px' }} />
    </div>
  );
}

function onChange(e: { target: any }) {
  const reader = new FileReader();
  reader.readAsText(e.target.files[0]);
  reader.onloadend = (event: Event) => {
    if (!reader.result) {
      return;
    }
    localStorage.setItem('storyXml', reader.result.toString());
  };
}

export function strToXml(str: string) {
  const parser = new DOMParser();
  return parser.parseFromString(str.toString(), 'text/xml');
}

export default StoryXmlUpload;
