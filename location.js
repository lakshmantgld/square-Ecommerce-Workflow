var axios = require('axios');

// axios.defaults.headers.common['Authorization'] = 'Bearer ' + <Personal Access Token>;

axios({
  method:'get',
  url:'https://connect.squareup.com/v2/locations',
  headers: {'Authorization': 'Bearer ' + <Personal Access Token>}
})
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error.response.data);
  });
