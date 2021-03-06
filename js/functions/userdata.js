// function that gets users anime list from animelist
//parammeters are the username and a function
//return values
//the function will be preformmed if the call is done sucessfully and data is retrieved.
function getUserList(username, callback)
{
	url="http://myanimelist.net/malappinfo.php?u="+username +"&status=all&type=anime";
	query ='select * from xml where url="'+url+'"';
	 var yqlAPI = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + ' &format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=?';

	$.getJSON(yqlAPI, function(){
	      //console.log("sucess");
	  })
	.success(function(r){
	  console.log("sucess")
	  console.log(r.query.results);
	  if (typeof r.query.results.myanimelist == 'undefined') 
	  {
	  	//add throw an error
	  	alert("returned null: data wasn't found for specific user");
	  }
	  if (typeof r.query.results.myanimelist.anime == "undefined")
	  {
		console.log("User has no watched anime");
		callback([]);
	  }
	  else
	  	callback(r.query.results.myanimelist)
	  
	})  
	.fail(function(r){
	  console.log("fail");
	  console.log(r);
	});

}

//function will do multiple calls to api to retrieve data for various animes
//will take an array of strings that contain title=~name 
//callback
function animeDataCalls(array_animetitles,callback)
{
	var apiCallData=[]; 
	if(array_animetitles.length == 1)
	{
		getAnimeData(array_animetitles[0], function(r){
			apiCallData.push(r);
			callback(apiCallData);
		});
		
	}
	else if (array_animetitles.length == 0) 
	{
		alert("User has not watched/rated any anime");

	}
	else
	{
		var promises=[];
		for (var i = 0; i < array_animetitles.length; i++) {
			promises.push(getAnimeData_n(array_animetitles[i]));
		};
		$.when.apply($, promises).then(function() {
		         var temp=arguments; // The array of resolved objects as a pseudo-array
			callback(temp);		         
		})
	}

}

//function that will retrieve more detail information for each anime
//a string with the names of animes alrady formated for this specific api call
//a callback function
//and when its done doing all calls send the data to call back function
//returns the data
function getAnimeData_n(animelist)
{
	var debug=1;
	var deferred = $.Deferred();
	url="http://cdn.animenewsnetwork.com/encyclopedia/api.xml?"+animelist;
	var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'xml',
	success: function(r){
  	  if (r == null) 
	  {
	  	//add throw an error
	  	console.log("returned null: data wasn't found for specific anime/s")
	  }
	  else
	  {
	  	if(debug) console.log(r);
		if(debug) console.log(xmlToJson(r));
	  	deferred.resolve(xmlToJson(r).ann);
	  }
	  
	},  
	fail: function(r){
	  console.log("fail");
	  console.log(r);
	}
	})
	  return deferred.promise();
}

//function that will retrieve more detail information for each anime
//a string with the names of animes alrady formated for this specific api call
//a callback function
//and when its done doing all calls send the data to call back function
//returns the data
function getAnimeData(animelist, callback)
{
	var debug=1;
	if (debug) console.log(animelist);
	//http://goessner.net/download/prj/jsonxml/
	url="http://cdn.animenewsnetwork.com/encyclopedia/api.xml?"+animelist;
	 if(debug)console.log(animelist);
	var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'xml',
	});
	request.success(function(r){
	  if (debug) console.log("sucess of geting anime data for old animes")
  	  if (r == null) 
	  {
	  	//add throw an error
	  	console.log("returned null: data wasn't found for specific anime/s")
	  }
	  else
	  {
	  	if(debug) console.log(r);
		if(debug) console.log(xmlToJson(r));
	  	callback(xmlToJson(r).ann)
	  }
	  
	})  
	request.fail(function(r){
	  console.log("fail");
	  console.log(r);
	});
	
}
function Create_UserAnime_Objects(animelist)
{
	var objects={};
	$.each(animelist,function(){
		 var temp={};
		 temp.a_name =this["@attributes"].name;
		 temp.desc =RetrieveDesc(this["info"]) ;
		 if($.isArray(this["credit"]))
		 {
		 	temp.company =RetrieveCompanies(this["credit"]);
		 }
		 else if ( typeof this["credit"] !== "undefined")
		 {
			 if(typeof this["credit"].company !== "undefined") 
			 {
				temp.company =this["credit"].company["#text"]; 
			 }
			 else
			 {
				console.log("no company" +this["credit"]);
			 }
		 }
		 //have to account for mutiple companies
		  temp.ppl=RetrieveStaff_obj(this["staff"]);
		  temp.userRating =this.rating;
		  temp.a_genres =RetrieveGenre(this["info"]);
		  objects[temp.a_name]= temp;
	});
	console.log(objects);
		return objects;
}
function RetrieveStaff_obj(staff)
{
	var temp=[];
	$.each(staff, function(){
		temp.push( {"title": this.task["#text"] , "name": this.person["#text"] });
	});
	return temp;
}
function RetrieveCompanies(credits)
{
	var temp=[];
	$.each(credits, function(){
		if(typeof this.company != "undefined")
			temp.push(this.company["#text"]);
	});
	return temp;
}
