const sd = require('./service-discovery');

function getServices(type, filters)
{
  let services = sd.services.filter(x => {
    let match = !type || (type === x.service);
    for (let item in filters) {
      match &= (x[item] === filters[item]);
    }
    return match;
  });
  return services;
}


function registerRoutes(app)
{
  app.route('/sd')
    .get((request, response) => {
      response.status(200).json(getServices(null, request.query));
    });

  app.route('/sd/:type')
    .get((request, response) => {
      response.status(200).json(getServices(request.params.type, request.query));
    });
}

exports.registerRoutes = registerRoutes;
