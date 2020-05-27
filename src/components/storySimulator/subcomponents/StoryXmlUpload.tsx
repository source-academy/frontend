import * as React from 'react';

function StoryXmlUpload() {
  return (
    <div className="Vertical">
      <h3>Story Xml Loader</h3>
      <input multiple={true} type="file" onChange={onChange} style={{ width: '250px' }} />
    </div>
  );
}

function onChange(e: { target: any }) {
  const files = e.target.files;
  localStorage.setItem(`storyXmlLength`, files.length);

  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.readAsText(files[i]);
    reader.onloadend = _ => {
      if (!reader.result) {
        return;
      }
      localStorage.setItem(`storyXml${i}`, reader.result.toString());
    };
  }
}

export function strToXml(str: string) {
  const parser = new DOMParser();
  return parser.parseFromString(str.toString(), 'text/xml');
}

export default StoryXmlUpload;
