// server.js
'use strict';

const randomize = require('randomatic');
const accountSid = 'ACdf3ed067edb15c4c26e70c09a9f9b495';
const authToken = '6baad527321b0966204c4a3a4557bd43';
const client = require('twilio')(accountSid, authToken);

var express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let mysql  = require('mysql');
let connection = mysql.createConnection({
  host    : "localhost",
  user    : "root",
  password: "",
  database: "sssdb"
});

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/webhook', (request, response) => {
const intent = request.body.queryResult.intent.displayName;
console.log(intent);
let msg = "";
	let sessionID = request.body.session;
if(intent === 'verifySSNumber'){
	const SSNumberParam = request.body.queryResult.parameters.ssnumber;
	console.log("SSNumberParam: " +SSNumberParam);
	
	let mobile = "";
	let ssnum = "";
	let outputcontext = sessionID + "/contexts/awaiting_otp";
	let lifespancount = 15;
	let pattern = /^\d+$/;
	//connection.connect(function(err) {
	//if (err) throw err;
	console.log("Connected!");
	var sql = "select ssnumber, mobileno from ssmemberinfo where ssnumber = '"+SSNumberParam+"'";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
	console.log(result);
		ssnum = result[0].ssnumber;
		mobile = result[0].mobileno;	
		sendOTP(mobile);
		
		if(ssnum === SSNumberParam)
				msg = "I sent you your six digit One Time PIN on your registered number in SSS.\n Please enter below:";
		
	} else {
		
		if (SSNumberParam.match(pattern) !== null){	
				if(SSNumberParam.length !== 10){
					msg = "The length of the SS Number should be ten digits.";
				} else {			
				msg = "Ang inyong ipinadalang SS Number ay wala sa aming records.";
				}
		} else {
				msg = "Ang inyong SS Number ay dapat numero lamang";
		}
    
		outputcontext = sessionID + "/contexts/awaiting_ssnumber";
		lifespancount = 5;
	} // if result is 0
				
		response.json({
	fulfillmentText: msg,
	fulfillmentMessages: [{
	platform : "FACEBOOK"
	},
	{
		text : {
			text:[
			msg
			]
		}
	  
  }
	],
	outputContexts: [
			{
				name: outputcontext,
				lifespanCount: lifespancount,
				parameters: {
				ssnumber: SSNumberParam
		}
		}
	]
	});
console.log(msg);
	});
	//	connection.end();
	//});
}else if(intent === 'LinkSSNumber'){
	const SSNumberParam = request.body.queryResult.parameters.ssnumber;
	console.log("request "+ JSON.stringify(request.body));
	var ses  = request.body.session;//request.body.originalDetectIntentRequest.payload.data.sender.id;
	
		var psidArr = ses.split("/");
		
		var psid = psidArr[4];
		 
	console.log("SSNumberParam: " +SSNumberParam);
	console.log("psid: " +psid);
	
	let mobile = "";
	let ssnum = "";
	let outputcontext = sessionID + "/contexts/awaiting_mobile_no";
	let lifespancount = 15;
	let pattern = /^\d+$/;
	//connection.connect(function(err) {
	//if (err) throw err;
	console.log("Connected!");
	var sql = "select ssnumber, mobileno from ssmemberinfo where ssnumber = '"+SSNumberParam+"'";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
	console.log(result);
		ssnum = result[0].ssnumber;
		//mobile = result[0].mobileno;	
		//sendOTP(mobile);
		
		if(ssnum === SSNumberParam)
				msg = "Marami pong salamat sa inyong impormasyon. Ano naman po ang inyong mobile / cellphone number?";
		
	} else {
		
		if (SSNumberParam.match(pattern) !== null){	
				if(SSNumberParam.length !== 10){
					msg = "The length of the SS Number should be ten digits.";
				} else {			
				msg = "Ang inyong ipinadalang SS Number ay wala sa aming records.";
				}
		} else {
				msg = "Ang inyong SS Number ay dapat numero lamang";
		}
    
		outputcontext = sessionID + "/contexts/awaiting_ssnum";
		lifespancount = 5;
	} // if result is 0
			
	console.log("outputcontext " + outputcontext);
			
response.json({
  fulfillmentText: msg,
  fulfillmentMessages: 
  [
  {
	 platform : "FACEBOOK"
  },
  {
		text : {
			text:[
			msg
			]
		}
	  
  }
  ],
  outputContexts: [
    {
      name: outputcontext,
      lifespanCount: 5,
      parameters: {
		  ssnumber: ssnum,
			psid: psid
		  }
    }
  ]
});

console.log(msg);
	});
	//	connection.end();
	//});

} else if (intent === 'LinktoMobile'){
	var psid  = "";
	const mobile_no = request.body.queryResult.parameters.mobileno;		
	var switcher = true;
	var ssnum = "", ssnumber = "";
	var i = 0;
	do{		
		var outputcontextx = request.body.queryResult.outputContexts[i].name;
		var res = outputcontextx.split("/");
		if (res[res.length-1] ==='awaiting_mobile_no'){
			ssnumber = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			psid = request.body.queryResult.outputContexts[i].parameters.psid;	
			switcher = false;
		}
		i++;
	}while (switcher);
	
	let mobile = "";
	let outputcontext = sessionID + "/contexts/awaiting_otp_";
	let lifespancount = 7;
	let pattern = /^\d+$/;
	//connection.connect(function(err) {
	//if (err) throw err;
	console.log("Connected!");
	
	var sql = "select ssnumber from memberfblink where ssnumber = '"+ssnum+"' ";
	var sql2 = "";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
		ssnum = result[0].ssnumber;	
			
			if(ssnum === ssnumber)
			msg = "Facebook Account is already linked.";				
		
	}
	});

if(msg !== "Facebook Account is already linked."){
	var sql = "select ssnumber, mobileno from ssmemberinfo where mobileno = '"+mobile_no+"' and ssnumber = '" + ssnumber + "'";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
	console.log(result);
		ssnum = result[0].ssnumber;
		mobile = result[0].mobileno;	
		sendOTP(mobile);
		
		if(ssnum === ssnumber)
				msg = "Marami pong salamat sa inyong impormasyon. Ano naman po ang inyong One-Time Password?\nManggagaling po ito sainyong inilagay na mobile / cellphone number.";
		
	} else {
		
		if (ssnumber.match(pattern) !== null){	
				if(ssnumber.length !== 11){
					msg = "The length of the Mobile Number should be eleven digits.";
				} else {			
					msg = "Ang inyong inerehistrong Mobile Number ay di tugma sa aming records.";
				}
		} else {
				msg = "Ang inyong Mobile Number ay dapat numero lamang";
		}
    
		outputcontext = sessionID + "/contexts/awaiting_mobile_no";
		lifespancount = 5;
	} // if result is 0
				
		response.json({
	fulfillmentText: msg,
	fulfillmentMessages: [{
	platform : "FACEBOOK"
	},
	{
		text : {
			text:[
			msg
			]
		}
	  
  }
	],
	outputContexts: [
			{
				name: outputcontext,
				lifespanCount: lifespancount,
				parameters: {
				ssnumber: ssnumber,
				psid : psid,
				mobileno: mobile_no
		}
		}
	]
	});
console.log(msg);
	});
	//	connection.end();
	//});	
	} else {
				response.json({
	fulfillmentText: msg,
	fulfillmentMessages: [  {
		text : {
			text:[
			msg
			]
		}
	  
  }		
	],
	outputContexts: [
			{
				name: sessionID + "/contexts/awaiting_mobile_no",
				lifespanCount: 5,
				parameters: {
				ssnumber: ssnumber,
				psid : psid,
				mobileno: mobile_no
		}
		}
	]
	});
	}
		
}else if (intent === 'MemberLink'){ //member enter OTP
	const otp = request.body.queryResult.parameters.otp_;	
	var switcher = true;
	var ssnum = "", ssnumber = "";
	let psid = "";
	let mobileno = "";
	var lifespanCount = 5;
	
	const today = new Date();
	
	var i = 0;
	do{		
		var outputcontext = request.body.queryResult.outputContexts[i].name;
		var res = outputcontext.split("/");
		if (res[res.length-1] ==='awaiting_otp_'){
			ssnumber = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			psid = request.body.queryResult.outputContexts[i].parameters.psid;	
			mobileno = request.body.queryResult.outputContexts[i].parameters.mobileno;
			switcher = false;
		}
		i++;
	}while (switcher);
	
	
	const sql = "select otp, dateReceived, ssnumber from confirmmember where otp = '"+otp+"'";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
		if(result.length > 0){		
			otpval = result[0].otp;
			otpdate = result[0].dateReceived;
			console.log(today.getTime());
			console.log(otpdate.getTime());
			diff = (today.getTime() - otpdate.getTime()) / 1000;
			diff /= 60;
			diff = Math.abs(Math.round(diff));
		}else{
			otpval = "";
		}
		console.log("otpval : " + otpval);
		  	let pattern = /^\d+$/;
  
  	if(otp.length !== 6){
		msg = "The length of the One Time PIN should be six digits.";
	}else if (otp.match(pattern) !== null) { 
		if(otp !== otpval){
			msg = "Sorry po, di tumugma One Time PIN na pinadala nyo sa records nmamin.";
		}else{
	        if(diff <= 5){
				msg = "OTP is Correct";
			}else{
				msg = "Ang inyong One Time PIN ay lumipas na ng 5 minuto."
				lifespanCount = 1;
			}
		}
    }else{
			msg = "Ang inyong One Time PIN ay dapat numero lamang";
	}
console.log(msg);
if(msg === "OTP is Correct"){
	var sql2 = "";	
	sql2 = "insert into memberfblink(ssnumber, psid, mobileno) values('"+ssnumber+"',  '"+psid+"', '"+mobileno+"')";	
connection.query(sql2, function (err, result2) {
	if (err) throw err;
});

msg= "Ang inyong Facebook Account ay nakalink na po sa inyong record dito sa SSS.\nMarami pong salamat at\nMabuting Araw!";

	response.json({
		fulfillmentText: msg,
		fulfillmentMessages: [{
		platform : "FACEBOOK"
		},
		{
			text : {
				text:[
				msg
				]
			}
	  
	}
	],
	outputContexts: [
			{
				name: outputcontext,
				lifespanCount: 2
		}
	]
	});
} else {
response.json({
  fulfillmentText: msg,
  fulfillmentMessages: [],
  outputContexts: [
    {
      name: sessionID + "/contexts/awaiting_otp_",
      lifespanCount: lifespanCount,
      parameters: {
        ssnumber: request.body.queryResult.outputContexts[1].parameters.ssnumber
      }
    }
  ]
});	
}

  });
		//	connection.end();
  //});

}else if (intent === 'verifyOtp'){ // or MemberLink
	const otp = request.body.queryResult.parameters.otp;


	const today = new Date();
	
	var otpval = "";
	var otpdate;
	var diff;
	var lifespanCount = 5;
	//connection.connect(function(err) {
	//if (err) throw err 
	console.log("Connected!");
	const sql = "select otp, dateReceived, ssnumber from confirmmember where otp = '"+otp+"'";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
		if(result.length > 0){		
			otpval = result[0].otp;
			otpdate = result[0].dateReceived;
			console.log(today.getTime());
			console.log(otpdate.getTime());
			diff = (today.getTime() - otpdate.getTime()) / 1000;
			diff /= 60;
			diff = Math.abs(Math.round(diff));
		}else{
			otpval = "";
		}
		console.log("otpval : " + otpval);
		  	let pattern = /^\d+$/;
  
  	if(otp.length !== 6){
		msg = "The length of the One Time PIN should be six digits.";
	}else if (otp.match(pattern) !== null) { 
		if(otp !== otpval){
			msg = "Sorry po, di tumugma One Time PIN na pinadala nyo sa records nmamin.";
		}else{
	        if(diff <= 5){
				msg = "Maari nyo na pong piliin sa baba ang inyong kailangang malaman:";
			}else{
				msg = "Ang inyong One Time PIN ay lumipas na ng 5 minuto."
				lifespanCount = 1;
			}
		}
    }else{
			msg = "Ang inyong One Time PIN ay dapat numero lamang";
	}

if(msg === "Maari nyo na pong piliin sa baba ang inyong kailangang malaman:"){
	
response.json({

  fulfillmentText: "",
  fulfillmentMessages: [
        {
        "text": {
          "text": [
            "Ano pong gusto nyong malaman sa inyong napiling benepisyo?"
          ]
        },
        "platform": "FACEBOOK"
      },
/*      {
        "card": {
          "buttons": [
            {
              text: "Inquire Contributions"
            },
            {
              text: "Inquire Loan Application Requirements, Application Status & Statement of Account with Repayments"
            },
            {
              text: "Inquire UMID Application"
            },
            {
              text: "Inquire SSS Benefits"
            },
            {
              text: "Transfer to SSS Representative"
            }
          ]
        },
        "platform": "FACEBOOK"
      }*/
  
  {
	 quickReplies: {
		 title : msg,
		 quickReplies : [
		 "Inquire Contributions",
    	 "Inquire Loan Application Requirements, Application Status & Statement of Account with Repayments",
    	 "Inquire UMID Application",
    	 "Inquire SSS Benefits",
		 "Transfer to SSS Representative"
		 ]
		 
	 },
	 platform : "FACEBOOK"
  }
  ],
  outputContexts: [
    {
      name: sessionID + "/contexts/awaiting_sss_menu",
      lifespanCount: 1,
      parameters: {
        ssnumber: result[0].ssnumber
      }
    }
  ] 
});
}else {
response.json({
  fulfillmentText: msg,
  fulfillmentMessages: [],
  outputContexts: [
    {
      name: sessionID + "/contexts/awaiting_otp",
      lifespanCount: lifespanCount,
      parameters: {
        ssnumber: request.body.queryResult.outputContexts[1].parameters.ssnumber
      }
    }
  ]
});	
}

  });
		//	connection.end();
  //});
}else if (intent === 'ContriInq'){
	var ssnum = "", ssnumber = "";
	console.log(request.body.queryResult.outputContexts);
	var i = 0;
	var switcher = true;
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	do{		
		var outputcontext = request.body.queryResult.outputContexts[i].name;
		var res = outputcontext.split("/");
		if (res[res.length-1] ==='awaiting_otp'){
			ssnum = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			switcher = false;
		}
		i++;
	}while (switcher);
	
	var yearmonth;
	var contriamount;
	
	console.log("Connected!");
	var sql = "select yearmonth, contriamount, ssnumber from contritable where ssnumber = '"+ssnum+"' order by yearmonth DESC LIMIT 1";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
	console.log(result);
		ssnumber = result[0].ssnumber;
		yearmonth = result[0].yearmonth;
		contriamount = result[0].contriamount;		
		var date = months[yearmonth.getMonth()] + " " + yearmonth.getFullYear();
		if(ssnum === ssnumber)
			msg = "Your last contribution was in " +date+ ".\nThe contribution amount is :" +contriamount;
	} else {
		msg = "You have no contribution posted";
	}
	
	response.json({
  fulfillmentText: msg,
  fulfillmentMessages: [],
  outputContexts: [
    {
      name: sessionID + "/contexts/awaiting_rating",
      lifespanCount: 5,
      parameters: {
		  ssnum : ssnumber      
		  }
    }
  ]
});
console.log(msg);
	});
}else if (intent === 'SLBalance' || intent === 'ELBalance' || intent === 'CLBalance'){	
	var ssnum = "", ssnumber = "";
	console.log(request.body.queryResult.outputContexts);
	var i = 0;
	var switcher = true;
	do{		
		var outputcontext = request.body.queryResult.outputContexts[i].name;
		var res = outputcontext.split("/");
		if (res[res.length-1] ==='awaiting_otp'){
			ssnum = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			switcher = false;
		}
		i++;
	}while (switcher); 
	
	var yearmonth;
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var date;
	var repaymentamount;
	var balance;
	var outputcontext = sessionID + "/contexts/awaiting_rating";
	
	var loantype = "", loanname = "";
	if (intent === 'SLBalance'){
		loantype = "S";
		loanname = "Salary";
		//outputcontext = sessionID + "/contexts/awaiting_salaryloan_menu";
	} else if (intent === 'ELBalance'){
		loantype = "E";
		loanname = "Educational";
		//outputcontext = sessionID + "/contexts/awaiting_educloan_menu";
	} else {
		loantype = "C";
		loanname = "Calamity";
		//outputcontext = sessionID + "/contexts/awaiting_calloan_menu";
	}
	
	console.log("Connected!");
	var sql = "SELECT s.balance, r.yearmonth, IFNULL(r.repaymentamount,0) repaymentamount, s.ssnumber " +
			   "FROM statementofaccount AS s " +
			   "LEFT JOIN repayments AS r ON r.ssnumber = ( " +
			   "SELECT ssnumber FROM repayments AS r2 WHERE r2.ssnumber = s.ssnumber and r2.loantype = s.loantype " +
			   "ORDER BY yearmonth DESC LIMIT 1 )" +
			   "WHERE s.ssnumber = '"+ssnum+"' and s.loantype = '"+loantype+"' LIMIT 1";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
	console.log(result);
		yearmonth = result[0].yearmonth;
		repaymentamount = result[0].repaymentamount;
		balance = result[0].balance;
		ssnumber = result [0].ssnumber;
		var date;
		if(yearmonth===null)
			date = "There are no payments found.";
		else{
			date = months[yearmonth.getMonth()] + " " + yearmonth.getFullYear();
			date = "Your last repayment month was in " +date;			
		}
		if(ssnum===ssnumber){		
			msg = "Your loan balance is : "+balance+" on "+date+". The last repayment amount is : " +repaymentamount;	
		}
	} else {
		msg = "You have no applied "+loanname+" loan";	
	}
			response.json({
			fulfillmentText: msg,
			fulfillmentMessages: [
			  {
					 platform : "FACEBOOK"
			  },
			  {
					text : {
						text:[
						msg
						]
					}
				  
			  }
			],
			outputContexts: [
					{
						name: outputcontext,
						lifespanCount: 1,
						parameters: {
						ssnumber: ssnum
				}
				}
			]
			});
	console.log(msg);
});

} else if (intent === 'MemberRating'){
	let outputcontextx = sessionID + "/contexts/awaiting_rating";
	var ssnum = "", ssnumber = "";
	console.log(request.body.queryResult.outputContexts);
	var i = 0;
	var switcher = true;
	do{		
		var outputcontext = request.body.queryResult.outputContexts[i].name;
		var res = outputcontext.split("/");
		if (res[res.length-1] ==='awaiting_otp'){
			ssnum = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			switcher = false;
		}
		i++;
	}while (switcher); 
	var counter = 0;
	const rating = request.body.queryResult.parameters.rate;
	var sql = "select ssnumber from memberrating where ssnumber = '"+ssnum+"' ";
	var sql2 = "";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
			console.log(result);
			sql2 = "update memberrating set rating = '"+rating+"' where ssnumber = '"+ssnum+"'";
	} else {		
			sql2 = "insert into memberrating(ssnumber, rating) values('"+ssnum+"', '"+rating+"')";	
	}
	});
	
	connection.query(sql2, function (err, result2) {
	if (err) throw err
	
msg = "Marami pong salamat at magandang araw!";
	
	response.json({
	  fulfillmentText: msg,
	  fulfillmentMessages: [],
	  outputContexts: [
		{
		  name: outputcontextx,
		  lifespanCount: 1,
		  parameters: {
			  awaiting_end : ""      
			  }
		}
	  ]
	});
	
	
	});

/*} else if (intent === 'MemberComment'){
	var ssnum = "", ssnumber = "";
	msg = "Marami pong salamat at magandang araw!";
	console.log(request.body.queryResult.outputContexts);
	var i = 0;
	var switcher = true;
	do{		
		var outputcontext = request.body.queryResult.outputContexts[i].name;
		var res = outputcontext.split("/");
		if (res[res.length-1] ==='awaiting_otp'){
			ssnum = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			switcher = false;
		}
		i++;
	}while (switcher); 
	
	const comment = request.body.queryResult.parameters.comment;
	var sql = "update memberrating set comment = '"+rating+"' where ssnumber = '"+ssnum+"'";
connection.query(sql, function (err, result2) {
	if (err) throw err;
	if(result2.length > 0){
		console.log("table updated");		
	}
});*/
} else {
	var ssnum = "";
	console.log(request.body.queryResult.outputContexts);
	//let outputcontextx = request.body.queryResult.outputContexts[0].name;
	let outputcontextx = sessionID + "/contexts/awaiting_rating";
	var i = 0;
	var switcher = true;
	do{		
		var outputcontext = request.body.queryResult.outputContexts[i].name;
		var res = outputcontext.split("/");
		if (res[res.length-1] ==='awaiting_otp'){
			ssnum = request.body.queryResult.outputContexts[i].parameters.ssnumber;	
			switcher = false;
		}
		i++;
	}while (switcher);
	
	var table = "";
	var fields = "";
	var where = "";
	var transtatus = "";
	var trandate = "";
	var trantype = "";
	if(intent === "SLStatus" || intent === "ELStatus" || intent === "CLStatus"){
		table = "loantable";
		fields = "loandate, loanstatus";
		if(intent === "SLStatus"){
			where  = "and loantype = 'S'";
			trantype = "Salary Loan";
		}
		else if(intent === "ELStatus"){
			where  = "and loantype = 'E'";
			trantype = "Educational Loan";
		}
		else if(intent === "CLStatus"){
			where  = "and loantype = 'C'";			
			trantype = "Calamity Loan";
		}
	} else if (intent === "SicStatus" || intent === "MatStatus" || intent === "DisStatus" || intent === "DeaStatus" || intent === "RetStatus"){
		table = "benefittable";
		fields = "appdate, benefitstatus";	
		if(intent === "SicStatus"){
			where  = "and benefittype = 'S'";
			trantype = "Sickness Benefit";
		}
		else if(intent === "MatStatus"){
			where  = "and benefittype = 'M'";
			trantype = "Maternity Benefit";
		}
		else if(intent === "DisStatus"){
			where  = "and benefittype = 'D'";
			trantype = "Disability Benefit";
		}
		else if(intent === "DeaStatus"){
			where  = "and benefittype = 'E'"; // death benef type
			trantype = "Death Benefit";
		}
		else if(intent === "RetStatus"){
			where  = "and benefittype = 'R'";
			trantype = "Retirement Benefit";
		}
	} else if (intent === "UMIDStatus") {
			table = "umidtable";
			fields = "appdate, umidstatus";
			trantype = "UMID Application";
	}
		console.log("Connected!");
	var sql = "select "+fields+" from "+table+" where ssnumber = '"+ssnum+"' "+where+"";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
	if(result.length > 0){	
	console.log(result);
		if(table === "loantable"){
			transtatus = result[0].loanstatus;
			trandate = result[0].loandate;
		} else if(table === "benefittable"){
			transtatus = result[0].benefitstatus;
			trandate = result[0].appdate;
		} else{
			transtatus = result[0].umidstatus;
			trandate = result[0].appdate;			
		}
		msg = "Ang inyong status ay : "+transtatus;
	} else {
		msg = "Wala po kayong nakafile na " + trantype;
	}

response.json({
  fulfillmentText: msg,
  fulfillmentMessages: 
  [
  {
	 quickReplies: {
		 title : "Maraming Salamat po sa inyong pag-inquire dito sa SSS. Para po mapaigting namin ang aming serbisyo, maaring mamili lamang po sa ibaba kung ano ang karanasan ninyo sa chat na ito:",
		 quickReplies : [
		 "5 - Kuntento",
    	 "4 - Ayos naman",
    	 "3 - Bahagya",
    	 "2 - Hindi Masyado",
		 "1 - Hindi Kuntento"
		 ]
	 },
	 platform : "FACEBOOK"
  },
  {
		text : {
			text:[
			msg
			]
		}
	  
  }
  ],
  outputContexts: [
    {
      name: outputcontextx,
      lifespanCount: 1,
      parameters: {
		  awaiting_end : ""      
		  }
    }
  ]
});

	});

	
}

});

function sendOTP(mobile){
	const today = new Date();
	const otp = randomize('0', 6);
	var date = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	//connection.connect(function(err) {
	//if (err) throw err;
	console.log("Connected!");
	let sql = "Update confirmmember set otp = '"+otp+"', dateReceived  = STR_TO_DATE('"+ date +" "+ time +"','%Y-%m-%d %H:%i:%s') where mobile = '"+mobile+"'";
	console.log(sql);
	connection.query(sql, function (err, result) {
		if (err) throw err;
		console.log("table updated");
		console.log("otp "+ otp);
	});
	//	connection.end();
	//});

client.messages.create({
		  from: '+12057724511',
		  to: '+63' + mobile,
		  body: "Your SSSChat One Time PIN is: " + otp + ". Please enter within 5 minutes."
		  }).then(message => console.log(message.sid));
}

app.listen(port);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

console.log('todo list RESTful API server started on: ' + port);
