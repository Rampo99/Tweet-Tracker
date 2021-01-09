const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const Twitter = require('twitter');
const axios = require('axios');
const fs = require('fs');
const download = require('image-downloader')

var client = new Twitter({
  consumer_key: '///',
  consumer_secret: '///',
  access_token_key: '///',
  access_token_secret: '///'
});
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(express.static(__dirname));
app.post("/login",function(req,res){
  let key = req.body.login;
  let secret = req.body.password;
  let key2 = req.body.login2;
  let secret2 = req.body.password2;
  var client = new Twitter({
   consumer_key: key2,
   consumer_secret: secret2,
   access_token_key: key,
   access_token_secret: secret
 });
 client.get("account/verify_credentials", function(error, tweets, response) {
   if(error){
     res.send(error[0].message);
   } else {
     fs.writeFile("data.txt", JSON.stringify(tweets.screen_name),function(err, result) {
       if(err) console.log('errore nel salvataggio del file data.txt', err);
     });
     res.send("ok");
   }

});

});
app.get("/login2",function(req,res){
  try {
    try {
      if (fs.existsSync("data.txt")) {
        fs.unlinkSync("data.txt");
      }
    } catch(err) {
      console.log('errore nel salvataggio del file data.txt', err);
    }

  } catch(err) {
    console.log('errore nel salvataggio del file data.txt', err);
  }
  res.send("ok");
});

url1 = 'search/tweets'; //standard search param: q
url2 = 'trends/place'; //trend param: id =1
url3 = 'geo/search'; //city query param: query
url4 =  'search/tweets'; //standard search param: q + geocode: lat,lon,diamkm

app.post('/', function(req, res){
    myText = req.body.testoRicerca
    type = req.body.selector1
    ricerca = ""
    raggio = ""
    if(type != "0"){
      ricerca = req.body.selector2
    }
    if(type == "coords"){
      raggio = req.body.raggio;
    }
    switch(type){
      case "0":
        client.get(url2, {id: "23424853"}, function(error, tweets, response) {
          if(error) throw error;
          res.send(tweets);
        });
      break;
      case "luogo":
        client.get(url3, {query: myText, result_type: ricerca, count:100}, function(error, tweets, response) {
          if(error) throw error;
          var data = tweets.result.places[0];
          if (typeof data === "undefined") {
            var tweets = '{"statuses":[],' +
            '"search_metadata": {' +
              '"query":"' + myText + '"}}';

            console.log(JSON.parse(tweets));
            return res.send(JSON.parse(tweets));
        } else {
          data = "place:"+data.id;
          client.get(url1, {q: data, result_type: ricerca, count:100}, function(error, tweets, response) {
            if(error) throw error;
            console.log(tweets);
            res.send(tweets);
          });
        }
        });
      break;
      case "testo":
        client.get(url1, {q: myText, result_type: ricerca, count:100}, function(error, tweets, response) {
          if(error) throw error;
          console.log(tweets);
          res.send(tweets);
          });
      break;
      case "hashtag":
        client.get(url1, {q: "#" + myText, result_type: ricerca, count:100}, function(error, tweets, response) {
          if(error) throw error;
          res.send(tweets);
        });
      break;
      case "coords":
        axios.get('http://ip-api.com/json?fields=lat,lon').then(function(response){
          data = response.data;
          client.get(url4, {q: "", geocode: data.lat + "," + data.lon + ","+ raggio + "km", result_type: ricerca, count:100}, function(error, tweets, response) {
            if(error) throw error;
            console.log(tweets);
            res.send(tweets);
          });
        })

      break;
      case "utente":
      client.get(url1, {q: "from:" + myText, result_type: ricerca, count:100}, function(error, tweets, response) {
        if(error) throw error;
        console.log(tweets);
        res.send(tweets);
        });
      break;
    }

});

app.post("/salva", function(req,res){
  let jsstring = req.body.o;
  let d = new Date();
  let date = d.getDate() + "/" + d.getMonth()+ "/"+d.getFullYear();
  try {
    if (fs.existsSync("tweets.json")) {
      var obj = fs.readFileSync('tweets.json', 'utf8');
      let jsoned= JSON.parse(obj+"]}]");
      if(jsoned[jsoned.length -1].hasOwnProperty(date)){
        fs.writeFile("tweets.json", ","+jsstring,{'flag':'a'}, function(err, result) {
          if(err) console.log('errore nel salvataggio del json', err);
        });
      } else {
        fs.writeFile("tweets.json", ']},{"'+date+'"'+":["+jsstring,{'flag':'a'}, function(err, result) {
          if(err) console.log('errore nel salvataggio del json', err);
        });
      }
    } else {
      fs.writeFile("tweets.json",'[{"'+date+ '"'+":["+jsstring , function(err, result) {
        if(err) console.log('errore nel salvataggio del json', err);
      });
    }
  } catch(error) {
    console.error(error);
  } finally {
    res.send("ok");
    console.log("x");
  }

});

app.get("/carica", function(req,res){
  var obj = fs.readFileSync('tweets.json', 'utf8');
  res.send(obj+"]}]");
});

function wcsave(par1,par2){
  fs.writeFile("search.txt", par1, function(err, result) {
    if(err) console.log('errore nel salvataggio della ricerca', err);
  });
  const options = {
    url: 'https://quickchart.io/wordcloud?text=' + par2+"&format=png",
    dest: 'image.png'
  }
  download.image(options)
  .then(({ filename }) => {
    console.log('Saved to', filename)
});
}

app.post("/wcsave",function(req,res){
  let cloudtext = req.body.a;
  let searched = req.body.b;
  wcsave(searched,cloudtext);
res.send("ok");
});

app.get("/navcheck",function(req,res){
  var obj = ""
  try {
    if (fs.existsSync("data.txt")) {
      obj = fs.readFileSync("data.txt", 'utf8');

    }
  } catch(err) {
    console.error(err)
  }
  res.send(obj);

});

app.post("/utente",function(req,res){
  let text = req.body.text;
  let imageset = req.body.wc;
    function pubblica(){
          var data = require('fs').readFileSync('image.png');
          client.post('media/upload', {media: data}, function(error, media, response) {
            if (!error) {
              var status = {
                status: text,
                media_ids: media.media_id_string
              }
              client.post('statuses/update', status, function(error, tweets, response) {
                if (!error) {
                  console.log(tweets);
                }
                let obj = fs.readFileSync("search.txt", 'utf8');
                let type = obj.slice(obj.indexOf("selector1")+10,obj.indexOf("&selector2"));
                var myText = obj.slice(obj.indexOf("testoRicerca")+13);
                let ricerca = "";
                let raggio = "";
                let result = "";
                if(type != "0"){
                  ricerca = obj.slice(obj.indexOf("selector2")+10,obj.indexOf("&testo"));
                }
                if(type == "coords"){
                  raggio = "";
                }
                let words = "";
                switch(type){
                  case "0":
                    client.get(url2, {id: "23424853"}, function(error, tweets, response) {
                      if(error) throw error;
                      result = tweets;
                      dataObject = result.statuses;
                      for (let i = 0; i < dataObject.length; i++) {
                        for (let j = 0; j < dataObject[i].entities.hashtags.length; j++) {
                            words = words + " " + dataObject[i].entities.hashtags[j].text;
                        }
                      }
                      wcsave(obj,words);
                    });
                  break;
                  case "luogo":
                  client.get(url3, {query: myText, result_type: ricerca, count:100}, function(error, tweets, response) {
                    if(error) throw error;
                    var data = tweets.result.places[0];
                    if (typeof data === "undefined") {
                      var tweets = 'error';
                      console.log(tweets);
                    } else {
                      data = "place:"+data.id;
                      client.get(url1, {q: data, result_type: ricerca, count:25}, function(error, tweets, response) {
                        if(error) throw error;
                        console.log(tweets);
                        result = tweets;
                        dataObject = result.statuses;
                        for (let i = 0; i < dataObject.length; i++) {
                          for (let j = 0; j < dataObject[i].entities.hashtags.length; j++) {
                              words = words + " " + dataObject[i].entities.hashtags[j].text;
                          }
                        }
                        wcsave(obj,words);
                      });
                    }
                    });
                  break;
                  case "testo":
                    client.get(url1, {q: myText, result_type: ricerca, count:50}, function(error, tweets, response) {
                      if(error) throw error;
                      console.log(tweets);
                      result = tweets;
                      dataObject = result.statuses;
                      for (let i = 0; i < dataObject.length; i++) {
                        for (let j = 0; j < dataObject[i].entities.hashtags.length; j++) {
                            words = words + " " + dataObject[i].entities.hashtags[j].text;
                        }
                      }
                      wcsave(obj,words);
                    });
                  break;
                  case "hashtag":
                    client.get(url1, {q: "#" + myText, result_type: ricerca, count:50}, function(error, tweets, response) {
                      if(error) throw error;
                      result = tweets;
                      dataObject = result.statuses;
                      for (let i = 0; i < dataObject.length; i++) {
                        for (let j = 0; j < dataObject[i].entities.hashtags.length; j++) {
                            words = words + " " + dataObject[i].entities.hashtags[j].text;
                        }
                      }
                    wcsave(obj,words);
                    });
                  break;
                  case "coords":
                    axios.get('http://ip-api.com/json?fields=lat,lon').then(function(response){
                      data = response.data;
                      client.get(url4, {q: "", geocode: data.lat + "," + data.lon + ","+ raggio + "km", result_type: ricerca}, function(error, tweets, response) {
                        if(error) throw error;
                        console.log(tweets);
                        result = tweets;
                        dataObject = result.statuses;
                        for (let i = 0; i < dataObject.length; i++) {
                          for (let j = 0; j < dataObject[i].entities.hashtags.length; j++) {
                              words = words + " " + dataObject[i].entities.hashtags[j].text;
                          }
                        }
                        wcsave(obj,words);
                      });
                    })

                  break;
                  case "utente":
                  client.get(url1, {q: "from:" + myText, result_type: ricerca}, function(error, tweets, response) {
                    if(error) throw error;
                    console.log(tweets);
                    result = tweets;
                    dataObject = result.statuses;
                    for (let i = 0; i < dataObject.length; i++) {
                      for (let j = 0; j < dataObject[i].entities.hashtags.length; j++) {
                          words = words + " " + dataObject[i].entities.hashtags[j].text;
                      }
                    }
                    wcsave(obj,words);
                    });
                  break;
                }
              });
            }
          });
      }
    if(imageset == "wc"){
      let times = req.body.volte;
      let timeout = req.body.ore;
      let i = 0;
      while(i<times){
        setTimeout(pubblica,timeout);
        i++;
      }
      res.send("ok");
    } else {
      var status = {
        status: text
      }
      client.post('statuses/update', status, function(error, tweets, response) {
        if (error) {
          console.log('errore nella pubblicazione del tweet ', error);
          res.send("Error");
        }
        else {
          console.log(tweets);
          res.send("Tweet pubblicato!");
        }
      });
    }


});

app.get("/ricerca", function(req, res) {
  res.sendFile(__dirname + "/ricerca.html");
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/account", function(req, res) {

  res.sendFile(__dirname + "/account.html");
});
app.listen(3000)
