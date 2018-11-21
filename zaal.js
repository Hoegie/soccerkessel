var express    = require('express');
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var join = require('path').join;
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var formidable = require('formidable');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'Hoegaarden',
  database : 'soccerKessel'
});

var app = express();

  app.set('port', process.env.PORT || 4000);
  app.set('porthttps', 4001);
  app.use(bodyParser.urlencoded({ extended: false}));
  app.use(bodyParser.json());

/*USERROLES*/

app.get("/userroles/:password",function(req,res){
  var data = {
        password: req.params.password
    };
connection.query('SELECT role from userroles WHERE password = ?', data.password, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


/*TEAMS*/


app.get("/teams/series/:series",function(req,res){
  if (req.params.series == "All") {
    var searchstring = "%";
  } else {
     var searchstring = req.params.series;
   }
  var data = {
        series: searchstring
    };
    console.log('series :', searchstring);
connection.query('SELECT * from teams WHERE series LIKE ?', data.series, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/teams/id/:id",function(req,res){
  var data = {
        id: req.params.id
    };
connection.query('SELECT teamname from teams WHERE team_ID = ?', data.id, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.get("/",function(req,res){
connection.query('SELECT * from teams', function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});



app.post("/teams/new",function(req,res){
  var post = {
        teamname: req.body.teamname,
        series: req.body.series
    };
    console.log(post);
connection.query('INSERT INTO teams SET ?', post, function(err, result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.put("/teams/id/:id",function(req,res){
  var put = {
        teamname: req.body.teamname,
        series: req.body.series
    };
    console.log(put);
connection.query('UPDATE teams SET ? WHERE team_ID = ?',[put, req.params.id], function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.put("/teams/extradata/id/:id",function(req,res){
  var put = {
        playedgames: req.body.playedgames,
        wongames: req.body.wongames,
        lostgames: req.body.lostgames,
        drawgames: req.body.drawgames,
        progoals: req.body.progoals,
        contragoals: req.body.contragoals,
        points: req.body.points
    };
    console.log(put);
connection.query('UPDATE teams SET ? WHERE team_ID = ?',[put, req.params.id], function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


/*GAMES*/

app.get("/games/series/teamid/year/:series/:teamid/:year/:matchtype",function(req,res){
  if (req.params.series == "All") {
    var seriessearchstring = "%";
  } else {
     var seriessearchstring = req.params.series;
  }
  if (req.params.teamid == "1000") {
    var teamsearchstring = "%";
  } else {
     var teamsearchstring = req.params.teamid;
  }
  if (req.params.year == "Beide") {
    var yearsearchstring = "%";
  } else {
     var yearsearchstring = req.params.year;
  }
  var data = {
        series: seriessearchstring,
        teamid: teamsearchstring,
        year: yearsearchstring,
        matchtype: req.params.matchtype
    };
    console.log(data);
connection.query('SELECT games.game_id, games.hometeamid, CONVERT(DATE_FORMAT(games.date,"%d-%m-%Y"), CHAR(50)) as gamedate, CONVERT(DATE_FORMAT(games.date,"%H:%i"), CHAR(50)) as gametime ,games.series, games.matchtype, hometeam.teamname as hometeamname, awayteam.teamname as awayteamname, COALESCE(results.homegoals, 1000) as homegoals, COALESCE(results.awaygoals, 1000) as awaygoals, CONVERT(COALESCE(results.result_ID, "none"), CHAR(50)) as result_ID FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE (games.series LIKE ?) AND (games.hometeamid LIKE ? OR games.awayteamid LIKE ?) AND (YEAR(games.date) LIKE ?) AND (matchtype = ?) ORDER BY games.date ASC', [data.series, data.teamid, data.teamid, data.year, data.matchtype], function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.post("/games/referees/series/teamid/year",function(req,res){
  console.log("games query gehit")
  var seriessearchstring;
  var teamsearchstring;
  var yearsearchstring;
  var refereesearchstring;

  console.log(req.body);


  if (req.body.series == "All") {
    seriessearchstring = "%";
  } else {
    seriessearchstring = req.body.series;
  }
  if (req.body.teamid == "1000") {
    teamsearchstring = "%";
  } else {
    teamsearchstring = req.body.teamid;
  }
  if (req.body.year == "Beide") {
    yearsearchstring = "%";
  } else {
    yearsearchstring = req.body.year;
  }
  if (req.body.refereeid == "All"){
    refereesearchstring = "%";
  } else {
    refereesearchstring = req.body.refereeid;
  }

  var data = {
        series: seriessearchstring,
        teamid: teamsearchstring,
        year: yearsearchstring,
        matchtype: req.body.matchtype,
        refereeid: refereesearchstring
    };
    console.log(data);
connection.query('SELECT games.game_id, games.hometeamid, CONVERT(DATE_FORMAT(games.date,"%d-%m-%Y"), CHAR(50)) as gamedate, CONVERT(DATE_FORMAT(games.date,"%H:%i"), CHAR(50)) as gametime ,games.series, games.matchtype, games.refereeid, hometeam.teamname as hometeamname, awayteam.teamname as awayteamname, COALESCE(results.homegoals, 1000) as homegoals, COALESCE(results.awaygoals, 1000) as awaygoals, CONVERT(COALESCE(results.result_ID, "none"), CHAR(50)) as result_ID, COALESCE(CONCAT(referees.name, " ", referees.lastname), "none") as refereename FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID LEFT JOIN referees ON games.refereeid = referees.referee_ID WHERE (games.series LIKE ?) AND (games.hometeamid LIKE ? OR games.awayteamid LIKE ?) AND (YEAR(games.date) LIKE ?) AND (matchtype = ?) AND (games.refereeid LIKE ?) ORDER BY games.date ASC', [data.series, data.teamid, data.teamid, data.year, data.matchtype, data.refereeid], function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.post("/games/referees/series/teamid/year/android",function(req,res){
  console.log("games query gehit")
  var seriessearchstring;
  var teamsearchstring;
  var yearsearchstring;
  var refereesearchstring;

  console.log(req.body);
  console.log(req.body[0]);


  if (req.body[0].series == "All") {
    seriessearchstring = "%";
  } else {
    seriessearchstring = req.body[0].series;
  }
  if (req.body[0].teamid == "1000") {
    teamsearchstring = "%";
  } else {
    teamsearchstring = req.body[0].teamid;
  }
  if (req.body[0].year == "Beide") {
    yearsearchstring = "%";
  } else {
    yearsearchstring = req.body[0].year;
  }
  if (req.body[0].refereeid == "All"){
    refereesearchstring = "%";
  } else {
    refereesearchstring = req.body[0].refereeid;
  }

  var data = {
        series: seriessearchstring,
        teamid: teamsearchstring,
        year: yearsearchstring,
        matchtype: req.body[0].matchtype,
        refereeid: refereesearchstring
    };
    console.log(data);
connection.query('SELECT games.game_id, games.hometeamid, CONVERT(DATE_FORMAT(games.date,"%d-%m-%Y"), CHAR(50)) as gamedate, CONVERT(DATE_FORMAT(games.date,"%H:%i"), CHAR(50)) as gametime ,games.series, games.matchtype, games.refereeid, hometeam.teamname as hometeamname, awayteam.teamname as awayteamname, COALESCE(results.homegoals, 1000) as homegoals, COALESCE(results.awaygoals, 1000) as awaygoals, CONVERT(COALESCE(results.result_ID, "none"), CHAR(50)) as result_ID, COALESCE(CONCAT(referees.name, " ", referees.lastname), "none") as refereename FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID LEFT JOIN referees ON games.refereeid = referees.referee_ID WHERE (games.series LIKE ?) AND (games.hometeamid LIKE ? OR games.awayteamid LIKE ?) AND (YEAR(games.date) LIKE ?) AND (matchtype = ?) AND (games.refereeid LIKE ?) ORDER BY games.date ASC', [data.series, data.teamid, data.teamid, data.year, data.matchtype, data.refereeid], function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/games/all",function(req,res){
connection.query('SELECT games.game_id, CONVERT(DATE_FORMAT(games.date,"%d-%m-%Y"), CHAR(50)) as gamedate, CONVERT(DATE_FORMAT(games.date,"%H:%i"), CHAR(50)) as gametime ,games.series, games.matchtype, hometeam.teamname as hometeamname, awayteam.teamname as awayteamname, COALESCE(results.homegoals, 1000) as homegoals, COALESCE(results.awaygoals, 1000) as awaygoals FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID ORDER BY games.date ASC', function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.get("/games/series/:series",function(req,res){
  var data = {
        series: req.params.series
    };
connection.query('SELECT games.game_id, CONVERT(DATE_FORMAT(games.date,"%d-%m-%Y"), CHAR(50)) as gamedate, CONVERT(DATE_FORMAT(games.date,"%H:%i"), CHAR(50)) as gametime ,games.series, games.matchtype, hometeam.teamname as hometeamname, awayteam.teamname as awayteamname, results.homegoals, results.awaygoals FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.series = ? ORDER BY games.date ASC', data.series, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/games/teamid/:teamid",function(req,res){
  var data = {
        teamid: req.params.teamid
    };
connection.query('SELECT games.game_id, CONVERT(DATE_FORMAT(games.date,"%d-%m-%Y"), CHAR(50)) as gamedate, CONVERT(DATE_FORMAT(games.date,"%H:%i"), CHAR(50)) as gametime ,games.series, games.matchtype, hometeam.teamname as hometeamname, awayteam.teamname as awayteamname, results.homegoals, results.awaygoals FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = ? OR games.awayteamid = ? ORDER BY games.date ASC', [data.teamid, data.teamid], function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/games/years",function(req,res){
connection.query('SELECT DISTINCT(CONVERT(year(date), CHAR(50))) as year from games ORDER by year DESC', function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.post("/games/new",function(req,res){
  var post = {
        date: req.body.date,
        hometeamid: req.body.hometeamid,
        awayteamid: req.body.awayteamid,
        series: req.body.series,
        matchtype: req.body.matchtype
    };
    console.log(post);
    var connquery = "INSERT INTO games SET date = STR_TO_DATE('" + post.date + "','%d-%m-%Y  %H:%i'), hometeamid = '" +  post.hometeamid + "', awayteamid = '" +  post.awayteamid + "', series = '" +  post.series + "', matchtype = '" +  post.matchtype + "'";
connection.query(connquery, post, function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.put("/games/date/:gameid",function(req,res){
  var put = {
        date: req.body.date,
    };
    console.log(put);
    console.log(req.params.id);
  var connquery = "UPDATE games SET date = STR_TO_DATE('" + put.date + "','%d-%m-%Y  %H:%i') WHERE game_ID = " + req.params.gameid;
  console.log(connquery)
connection.query(connquery,[put, req.params.id], function(err,result) {
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.put("/games/referee/:gameid",function(req,res){
  var put = {
        refereeid: req.body.refereeid,
    };
    console.log(put);
    console.log(req.params.gameid);
  
connection.query('UPDATE games SET ? WHERE game_ID = ?',[put, req.params.gameid], function(err,result) {
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.put("/games/all/:gameid",function(req,res){
  var post = {
        date: req.body.date,
        hometeamid: req.body.hometeamid,
        awayteamid: req.body.awayteamid,
        series: req.body.series,
        matchtype: req.body.matchtype
    };
    console.log(put);
    console.log(req.params.id);
  var connquery = "UPDATE games SET date = STR_TO_DATE('" + post.date + "','%d-%m-%Y  %H:%i'), hometeamid = '" +  post.hometeamid + "', awayteamid = '" +  post.awayteamid + "', series = '" +  post.series + "', matchtype = '" +  post.matchtype + "' WHERE game_ID = " + req.params.gameid;
  console.log(connquery)
connection.query(connquery,[put, req.params.id], function(err,result) {
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.delete("/games/:gameid",function(req,res){
  var data = {
        gameid: req.params.gameid
    };
    console.log(data.id);
connection.query('DELETE FROM games WHERE game_ID = ?', data.gameid, function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


/*RESULTS*/

app.get("/results/gameid/:gameid",function(req,res){
  var data = {
        gameid: req.params.gameid
    };
connection.query('SELECT * from results WHERE gameid = ?', data.gameid, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.post("/results/new",function(req,res){
  var post = {
        gameid: req.body.gameid,
        homegoals: req.body.homegoals,
        awaygoals: req.body.awaygoals
    };
    console.log(post);
connection.query('INSERT INTO results SET ?', post, function(err, result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.put("/results/resultid/:resultid",function(req,res){
  var put = {
        gameid: req.body.gameid,
        homegoals: req.body.homegoals,
        awaygoals: req.body.awaygoals
    };
    console.log(put);
connection.query('UPDATE results SET ? WHERE result_ID = ?',[put, req.params.resultid], function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

/*PLAYERS*/

app.get("/players/teamid/:teamid",function(req,res){
  var data = {
        teamid: req.params.teamid
    };
connection.query('SELECT * from players WHERE teamid = ?', data.teamid, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.post("/players/new",function(req,res){
  var imageurl = req.body.imageurl
  if ( typeof imageurl == 'undefined' ){
      imageurl = "none"
  }
  var post = {
        name: req.body.name,
        lastname: req.body.lastname,
        emailaddress: req.body.emailaddress,
        phone: req.body.phone,
        teamid: req.body.teamid,
        imageurl: imageurl
    };
    console.log(post);
connection.query('INSERT INTO players SET ?', post, function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.put("/players/playersid/:playerid",function(req,res){
  var imageurl = req.body.imageurl
  if ( typeof imageurl == 'undefined' ){
      imageurl = "none"
  }
  var put = {
        name: req.body.name,
        lastname: req.body.lastname,
        emailaddress: req.body.emailaddress,
        phone: req.body.phone,
        teamid: req.body.teamid,
        imageurl: imageurl
    };
    console.log(put);
connection.query('UPDATE players SET ? WHERE player_ID = ?',[put, req.params.playerid], function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.delete("/players/:playerid",function(req,res){
  var data = {
        playerid: req.params.playerid
    };
    console.log(data.id);
connection.query('DELETE FROM players WHERE player_ID = ?', data.playerid, function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


/*REFEREES*/

app.get("/referees/all",function(req,res){
connection.query('SELECT * from referees', function(err, rows, fields) {
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.get("/referees/refereeid/:refereeid",function(req,res){
connection.query("SELECT CONCAT(name, ' ', lastname) as refereename from referees WHERE referee_ID = ?",req.params.refereeid, function(err, rows, fields) {
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.post("/referees/new",function(req,res){
  var post = {
        name: req.body.name,
        lastname: req.body.lastname,
        emailaddress: req.body.emailaddress,
        phone: req.body.phone
    };
    console.log(post);
connection.query('INSERT INTO referees SET ?', post, function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

app.put("/referees/refereeid/:refereeid",function(req,res){
  var put = {
        name: req.body.name,
        lastname: req.body.lastname,
        emailaddress: req.body.emailaddress,
        phone: req.body.phone,
        imageurl: req.body.imageurl
    };
    console.log(put);
connection.query('UPDATE referees SET ? WHERE referee_ID = ?',[put, req.params.refereeid], function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


/*GOALS*/

app.get("/goals/gameid/teamid/playerid/:gameid/:teamid:/playerid",function(req,res){
  var data = {
      gameid: req.params.gameid,
        teamid: req.params.teamid,
        playerid: req.params.playerid
    };
connection.query('SELECT goals from goals WHERE gameid = ? ANS teamid = ? AND playerid = ?', [data.gameid, data.teamid, data.playerid], function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/goalsnames/gameid/:gameid",function(req,res){
  var data = {
      gameid: req.params.gameid
    };
connection.query('SELECT players.name, players.lastname, goals.goals FROM goals JOIN players ON goals.playerid = players.player_ID WHERE goals.gameid = ?', data.gameid, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/goals/allplayers/teamid/gamedid/:teamid/:gameid",function(req,res){
  var data = {
      gameid: req.params.gameid,
      teamid: req.params.teamid
    };
connection.query('SELECT players.name, players.lastname, players.player_ID, players.imageurl, COALESCE((SELECT goals.goals from goals WHERE goals.playerid = players.player_ID AND goals.gameid = ?), 0) as goals, CONVERT(COALESCE((SELECT goals.gameid from goals WHERE goals.playerid = players.player_ID AND goals.gameid = ?), "none"), CHAR(50)) as gameid FROM `players` WHERE players.teamid = ?', [data.gameid, data.gameid, data.teamid], function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.post("/goals/new",function(req,res){
  var post = {
        gameid: req.body.gameid,
        teamid: req.body.teamid,
        playerid: req.body.playerid,
        goals: req.body.goals
    };
    console.log(post);
connection.query('INSERT INTO goals SET ?', post, function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.put("/goals/gameid/playerid/:gameid/:playerid",function(req,res){
  var put = {
        goals: req.body.goals
    };
    console.log(put);
connection.query('UPDATE goals SET ? WHERE gameid = ? AND playerid = ?',[put, req.params.gameid, req.params.playerid], function(err,result) {
/*connection.end();*/
  if (!err){
    console.log(result);
    res.end(JSON.stringify(result));
  }else{
    console.log('Error while performing Query.');
  }
  });
});

/*RANKING*/

app.get("/ranking/series/:series",function(req,res){
  var data = {
      series: req.params.series
    };
connection.query('SELECT teams.teamname, teams.team_ID, CONVERT((SELECT COUNT(results.result_ID) as playedgames FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE (games.hometeamid = teams.team_ID OR games.awayteamid = teams.team_ID) AND games.matchtype = "C"), CHAR(50)) as playedgames, CONVERT(COALESCE((SELECT SUM(CASE WHEN games.hometeamid = teams.team_ID THEN results.homegoals ELSE results.awaygoals END) as goalspro FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE (games.hometeamid = teams.team_ID OR games.awayteamid = teams.team_ID) AND games.matchtype = "C"), "0"), CHAR(50)) as progoals, CONVERT(COALESCE((SELECT SUM(CASE WHEN games.hometeamid = teams.team_ID THEN results.awaygoals ELSE results.homegoals END) as goalspro FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE (games.hometeamid = teams.team_ID OR games.awayteamid = teams.team_ID) AND games.matchtype = "C"), "0"), CHAR(50)) as contragoals, CONVERT(((SELECT COUNT(results.gameid) as winshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals > results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as winshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals < results.awaygoals AND games.matchtype = "C")), CHAR(50)) as wongames, CONVERT(((SELECT COUNT(results.gameid) as losseshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals < results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as losseshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals > results.awaygoals AND games.matchtype = "C")), CHAR(50)) as lostgames, CONVERT(((SELECT COUNT(results.gameid) as drawhome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals = results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as drawhome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals = results.awaygoals AND games.matchtype = "C")), CHAR(50)) as drawgames, CONVERT((((SELECT COUNT(results.gameid) as winshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals > results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as winshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals < results.awaygoals AND games.matchtype = "C"))*3 + ((SELECT COUNT(results.gameid) as drawhome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals = results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as drawhome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals = results.awaygoals AND games.matchtype = "C"))), CHAR(50)) as points, (((SELECT COUNT(results.gameid) as winshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals > results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as winshome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals < results.awaygoals AND games.matchtype = "C"))*3 + ((SELECT COUNT(results.gameid) as drawhome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID AND results.homegoals = results.awaygoals AND games.matchtype = "C") + (SELECT COUNT(results.gameid) as drawhome FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.awayteamid = teams.team_ID AND results.homegoals = results.awaygoals AND games.matchtype = "C"))) as points2 FROM teams WHERE teams.series = ? ORDER BY points2 DESC, wongames DESC, progoals DESC', data.series, function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});


app.get("/ranking/test",function(req,res){
connection.query('SELECT teams.teamname, teams.team_ID, CONVERT((SELECT COUNT(results.result_ID) as playedgames FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID OR games.awayteamid = teams.team_ID), CHAR(50)) as playedgames, CONVERT(COALESCE((SELECT SUM(CASE WHEN games.hometeamid = teams.team_ID THEN results.homegoals ELSE results.awaygoals END) as goalspro FROM `games` LEFT JOIN results ON games.game_ID = results.gameid JOIN teams AS hometeam ON games.hometeamid = hometeam.team_ID JOIN teams AS awayteam ON games.awayteamid = awayteam.team_ID WHERE games.hometeamid = teams.team_ID OR games.awayteamid = teams.team_ID), "0"), CHAR(50)) as progoals FROM teams WHERE teams.series = "B"', function(err, rows, fields) {
/*connection.end();*/
  if (!err){
    console.log('The solution is: ', rows);
    res.end(JSON.stringify(rows));
  }else{
    console.log('Error while performing Query.');
  }
  });
});



/*FILE UPLOAD*/

app.post("/image/upload",function(req,res){

var form = new formidable.IncomingForm();
var fileNameImage = "";
form.uploadDir = '/var/www/html/zaalkessel/images/';
console.log("file uploading ...");

form.parse(req,function(err, fields, files){
  console.log(fields);
  console.log("filename : ");
  console.log(fields.picURL);
  fileNameImage = fields.picURL;
  //fileNameImage = fileNameImage + '.png';
  fs.rename(files.file.path, path.join(form.uploadDir, fileNameImage), function(err){

  });

});

form.on('error', function(err){
  console.log('An error has occured : \n' + err);
});

form.on('end', function(){
  res.end(JSON.stringify("success"));
});

});


app.post("/image/android/upload",function(req,res){

console.log(req.body.picurl);
console.log(req.body.photo);
//res.end(JSON.stringify("success"));

var imageBuffer = new Buffer(req.body.photo, 'base64');
fs.writeFile("/var/www/html/zaalkessel/images/" + req.body.picurl, imageBuffer, function(err) { 
  res.end(JSON.stringify("success"));
});

});


app.post("/image/delete",function(req,res){

var imageName = req.body.imagename;
//var fullImageName = '/var/www/html/' + apachedir + '/images/' + imageName;
var fullImageName = '/var/www/html/zaalkessel/images/' + imageName
console.log(fullImageName);

fs.unlink(fullImageName, function(error){

  if (!error){
    console.log('Image deleted');
    var outputArray = [];
    var outputDic = {
    response: 'Success'
    };
    outputArray.push(outputDic);
    res.end(JSON.stringify(outputDic));
  } else {
    console.log('Image deleted failed !');
    console.log(error);
    var outputArray = [];
    var outputDic = {
    response: 'Failure'
    };
    outputArray.push(outputDic);
    res.end(JSON.stringify(outputDic));
  }

});

});




  http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


https.createServer({
            key: fs.readFileSync("/etc/letsencrypt/live/appskberlaar.be/privkey.pem"),
            cert: fs.readFileSync("/etc/letsencrypt/live/appskberlaar.be/fullchain.pem"),
            ca: fs.readFileSync("/etc/letsencrypt/live/appskberlaar.be/chain.pem")
     }, app).listen(app.get('porthttps'), function(){
  console.log("Express SSL server listening on port " + app.get('porthttps'));
});