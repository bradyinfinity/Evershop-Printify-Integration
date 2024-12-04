const { setContextValue } = require("@evershop/evershop/src/modules/graphql/services/contextHelper");

module.exports = (request) => {
  setContextValue(request, 'pageInfo', {
    title: 'Import Printify Products',
    description: 'Printify Import Products'
  });
};
