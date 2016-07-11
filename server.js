var restify = require('restify'),
    soap = require('soap');

var server = restify.createServer();

server.use(restify.bodyParser())

function slimPeople(people) {
    var peeps = [];
    people.forEach(function (p) {
        peeps.push({ "id": p.id, "first": p.ItemPersonData.First, "last": p.ItemPersonData.Last, "city": p.ItemPersonAddressData1.City, "state": p.ItemPersonAddressData1.State, "zip": p.ItemPersonAddressData1.ZipCode })
    }, this);

    return peeps;
}

function getPeople(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var url = 'http://peopleservice.azurewebsites.net/people.svc?wsdl';

    var args = { value: 100 };

    soap.createClient(url, function (err, client) {
        client.GetCompletePeople(args, function (err, result) {
            //console.log(result);
            res.send(result.GetCompletePeopleResult.PersonMajor);
            //var peeps = slimPeople(result.GetCompletePeopleResult.PersonMajor);
            //res.send(peeps);
        });
    });

    next();
}

server.get('/people', getPeople);

var port = process.env.PORT || 3000;
server.listen(port, function (err) {
    if (err)
        console.error(err)
    else
        console.log('app is ready at : ' + port)
})

if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
