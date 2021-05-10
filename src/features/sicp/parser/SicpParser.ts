export const getData = () => {
  fetch('sicp/test.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (myJson) {
      console.log(myJson);
    });
};
