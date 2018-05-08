function loadData()
{
  if(typeof(Storage) !== "undefined")
  {
    if(localStorage.getItem("plutus_username") === null && localStorage.getItem("plutus_key") === null)
    {
      console.log("No account data found");
      
      displaySetup();
    }
    else
    {
      var username = localStorage.getItem("plutus_username");
      var key = localStorage.getItem("plutus_key");
      
      console.log("Username: " + username + ", key: " + key + " retrieved from storage");
      
      displayMain(username, key);
    }
  }
}

function displaySetup()
{
  $("body").empty();
  $("body").load("setup.html", function()
  {
    $("#login_form").submit(function(e)
    {
      e.preventDefault();
      
      console.log("Login page loaded");
      
      saveAccountData();
    });
  });
}

function saveAccountData()
{
  var username = document.forms["plutus_init"]["username"].value;
  var key = document.forms["plutus_init"]["key"].value;
  var script = "create_account.php?user=" + username + "&key=" + key;
  
  if( username != "" && key != "" )
  { 
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
      {
        result = xmlhttp.responseText;
        
        if(result === "SUCCESS")
        {
          localStorage.setItem("plutus_username", username);
          localStorage.setItem("plutus_key", key);
          
          console.log("Account created, username: " + username + ", key: " + key);
          
          displayMain(username, key);
        }
        else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
        {
          console.log("Error accessing database");
          
          alert("Error accessing database");
        }
        else if(result === "ACCOUNT_EXISTS")
        {
          console.log("Username and API key taken");
          
          //alert("Username and API key taken");
          
          localStorage.setItem("plutus_username", username);
          localStorage.setItem("plutus_key", key);
          
          displayMain(username, key);
        }
      }
    };
    xmlhttp.open("GET", script, true);
    xmlhttp.send(null);
  }
  else
  {
    alert("Please provide a username and an API key");
  }
}

function displayMain(username, key)
{
  $("body").empty();
  
  $("body").load("portfolios.html", function()
  {
    console.log("Main page loaded");
    
    $("#add_port").submit(function(e)
    {
      e.preventDefault();
      
      console.log("Add Portfolio button clicked");
      
      var user = username;
      var name = document.forms["plutus_add_port"]["portname"].value;
      var script = "create_portfolio.php?user=" + user + "&name=" + name;
      
      if( name != "" )
      {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
          {
            result = xmlhttp.responseText;
            
            if(result === "SUCCESS")
            {
              console.log("Portfolio created, name: " + name);
              
              loadDropdown(user, false);
              displayPortfolio(name);
            }
            else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
            {
              console.log("Error accessing database");
              
              alert("Error accessing database");
            }
            else if(result === "PORTFOLIO_EXISTS")
            {
              console.log("Portfolio name taken");
              
              alert("Portfolio name taken");
            }
            
            $("#addPortModal").modal('hide');
          }
        };
        xmlhttp.open("GET", script, true);
        xmlhttp.send(null);
      }
      else
      {
        alert("Please provide a portfolio name");
      }
    });
    
    $("#clear_acc").submit(function(e)
    {
      e.preventDefault();
      
      console.log("Clear button pressed");
      
      clearAccountData();
    });
    
    $("#add_hold").submit(function(e)
    {
        e.preventDefault();
        
        console.log("Add holding button pressed");
        
        saveHoldingData();
    });
    
    loadDropdown(username, true);
  });
}

function loadDropdown(username, displayFlag)
{
  var script = "get_portfolio_list.php?user=" + username;
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    {
      var a = $.parseJSON(xmlhttp.responseText);
      
      if(a != null && a.length > 0)
      {
        $("#portfolio_dropdown").empty();
        for(var p in a)
        { 
          $("#portfolio_dropdown").append(a[p][1]);
        }
        
        console.log("Dropdown loaded");
        
        if(displayFlag)
        {
          displayPortfolio( a[0][0] );
        }
      }
    }
  };
  xmlhttp.open("GET", script, true);
  xmlhttp.send(null);
}

function displayPortfolio(name)
{
  sessionStorage.setItem("name", name);
  var script = "get_portfolio_data.php?name=" + name;
  $("#table_title").html(name);
  $(".dropdown-toggle").html(name + ' <span class="caret"></span>');
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    { 
      console.log("Test: " + xmlhttp.responseText);
      var holdings = $.parseJSON(xmlhttp.responseText);
      if(holdings != null && holdings.length > 0 )
      {
        console.log(holdings);
        
        var api_link = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=";
        for(var h in holdings)
        {
          api_link = api_link + holdings[h]["symbol"] + ",";
        }
        api_link = api_link.slice(0,-1) + "&apikey=" + localStorage.getItem("plutus_key");
        
        console.log(api_link);
      
        $.getJSON(api_link, function( data ) {
          console.log(data);
          var quotes = data["Stock Quotes"];
          console.log(quotes);
          
          $("table").empty();
          $("table").append('<tr><th scope="col">Symbol</th><th scope="col">Buy Price</th><th scope="col">Buy Quantity</th><th scope="col">Current Price</th><th scope="col">Gain/Loss</th></tr>');
          var totalGain = 0;
          for(var q in quotes)
          {
            var buyPrice = parseFloat(holdings[q]["price"]);
            var buyQuant = parseFloat(holdings[q]["quantity"]);
            var currPrice = parseFloat(quotes[q]["2. price"]);
            var gain = ((currPrice - buyPrice) * buyQuant);
            totalGain += gain;
            
            var end = '';
            if(gain >= 0)
            {
              end = '<td class="positive">' + gain.toFixed(2) + '</td></tr>';
            }
            else
            {
              end = '<td class="negative">' + gain.toFixed(2) + '</td></tr>';
            }
            var row = '<tr><td>' + holdings[q]["symbol"] + '</td><td>'+ buyPrice.toFixed(2) + '</td><td>'+ buyQuant.toFixed(2) + '</td><td>' + currPrice.toFixed(2) + '</td>' + end;
            console.log(row);
            $("table").append(row);
          }
          var row = '';
          if(totalGain >= 0)
          {
            row = '<tr><td></td><td></td><td></td><td></td><td class="positive">' + totalGain.toFixed(2) + '</td></tr>';
          }
          else
          {
            row = '<tr><td></td><td></td><td></td><td></td><td class="negative">' + totalGain.toFixed(2) + '</td></tr>';
          }
          $("table").append(row);
        });
      }
      else
      {
        $("table").empty();
        $("table").append('<tr><th scope="col">Symbol</th><th scope="col">Buy Price</th><th scope="col">Buy Quantity</th><th scope="col">Current Price</th><th scope="col">Gain/Loss</th></tr>');
      }
      
      $("#port_data").removeClass("hidden");
    }
  };
  xmlhttp.open("GET", script, true);
  xmlhttp.send(null);
}

function saveHoldingData()
{
  var symbol = document.forms["plutus_add_hold"]["symbol"].value;
  var quantity = document.forms["plutus_add_hold"]["quantity"].value;
  
  console.log(symbol);
  console.log(quantity);
  
  var api_link = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=" + symbol + "&apikey=" + localStorage.getItem("plutus_key");
  
  $.getJSON(api_link, function( data ) {
    var quotes = data["Stock Quotes"];
    
    if(quotes.length > 0)
    {
      quote = quotes[0];
      var price = quote["2. price"];
      var name = sessionStorage.getItem("name");
      
      var script = "create_holding.php?name=" + name + "&symbol=" + symbol + "&number=" + quantity + "&price=" + price;
      console.log(script);
      
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        console.log(xmlhttp.readyState + ", " + xmlhttp.status + ", " + xmlhttp.statusText);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
        {
          result = xmlhttp.responseText;
          
          if(result === "SUCCESS")
          {
            console.log("Stock purchased, stock: " + symbol);
            
            displayPortfolio(name);
          }
          else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
          {
            console.log("Error accessing database");
            
            alert("Error accessing database");
          }
          
          $("#addHoldModal").modal('hide');
        } 
      };
      xmlhttp.open("GET", script, true);
      xmlhttp.send(null);
    }
    else
    {
      alert("Invalid stock symbol");
    }
  });
}

function clearAccountData()
{
  var script = "delete_account.php?user=" + localStorage.plutus_username;
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    {
      result = xmlhttp.responseText;
            
      if(result === "SUCCESS")
      {
        console.log("Account deleted");
        
        localStorage.removeItem("plutus_username");
        localStorage.removeItem("plutus_key");
        
        displaySetup();
      }
      else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
      {
        console.log("Error accessing database");
        
        alert("Error accessing database");
      }
    }
  };
  xmlhttp.open("GET", script, true);
  xmlhttp.send(null);
}