export const createHeadersWithCors = (): Headers => {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  return headers;
};

export const loadFileLocally = (storageName: string, txtFile: File) => {
  const reader = new FileReader();
  reader.readAsText(txtFile);
  reader.onloadend = _ => {
    if (!reader.result) {
      return;
    }
    sessionStorage.setItem(storageName, reader.result.toString());
  };
};

export const dateOneYearFromNow = (date: Date) => {
  date.setFullYear(date.getFullYear() + 1);
  return date;
};
