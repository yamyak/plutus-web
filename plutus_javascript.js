function loadData()
{
  if(typeof(Storage) !== "undefined")
  {
    // check if username and api key stored in local storage
    if(localStorage.getItem("plutus_username") === null && localStorage.getItem("plutus_key") === null)
    {
      // if not, display setup page
      displaySetup();
    }
    else
    {
      // retrieve username and key and display main page
      var username = localStorage.getItem("plutus_username");
      var key = localStorage.getItem("plutus_key");
      
      displayMain(username, key);
    }
  }
}

function displaySetup()
{
  // load setup page
  $("body").empty();
  $("body").load("setup.html", function()
  {
    // if form submitted, save account data
    $("#login_form").submit(function(e)
    {
      e.preventDefault();
      
      saveAccountData();
    });
  });
}

function saveAccountData()
{
  // get username and password
  var username = document.forms["plutus_init"]["username"].value;
  var key = document.forms["plutus_init"]["key"].value;
  var script = "create_account.php?user=" + username + "&key=" + key;
  
  // if both fields filled out
  if( username != "" && key != "" )
  { 
    // call the php script to create a new account in the database
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
      {
        result = xmlhttp.responseText;
        
        // interpret string returned from database
        if(result === "SUCCESS")
        {
          // save username and password to local storage
          localStorage.setItem("plutus_username", username);
          localStorage.setItem("plutus_key", key);
          
          // display the main page
          displayMain(username, key);
        }
        else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
        {
          // unable to access the database
          alert("Error accessing database");
        }
        else if(result === "ACCOUNT_EXISTS")
        {
          // account already exists so:
          
          // alert the user to pick another username and/or key
          //alert("Username and API key taken");
          
          // retrieve username and key from local storage
          localStorage.setItem("plutus_username", username);
          localStorage.setItem("plutus_key", key);
          
          // display the main page
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
  // load main page
  $("body").empty();
  $("body").load("portfolios.html", function()
  {
    // if add portfolio form submitted
    $("#add_port").submit(function(e)
    {
      e.preventDefault();
      
      var user = username;
      var name = document.forms["plutus_add_port"]["portname"].value;
      var script = "create_portfolio.php?user=" + user + "&name=" + name;
      
      // if portfolio name filled in
      if( name != "" )
      {
        // call the php script to add the portfolio entry to the database
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
          {
            result = xmlhttp.responseText;
            
            // interpret string returned from database
            if(result === "SUCCESS")
            {
              // display portfolio dropdown and portfolio data
              loadDropdown(user, false);
              // since newly created, will be empty
              displayPortfolio(name);
            }
            else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
            {
              // unable to access database
              alert("Error accessing database");
            }
            else if(result === "PORTFOLIO_EXISTS")
            {
              // already a portfolio with the name given
              alert("Portfolio name taken");
            }
            
            // hide the modal
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
    
    // if clear account form submitted
    $("#clear_acc").submit(function(e)
    {
      e.preventDefault();
      
      clearAccountData();
    });
    
    // if add holding form submitted
    $("#add_hold").submit(function(e)
    {
        e.preventDefault();
        
        saveHoldingData();
    });
    
    loadDropdown(username, true);
  });
}

function loadDropdown(username, displayFlag)
{
  var script = "get_portfolio_list.php?user=" + username;
  
  // call php script to retrieve names of all portfolios in this account 
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    {
      // parse the json output of php script
      var a = $.parseJSON(xmlhttp.responseText);
      
      // if there were holdings to return
      if(a != null && a.length > 0)
      {
        // clear out portfolio dropdown
        // add in portfolio names html with onclick functions
        $("#portfolio_dropdown").empty();
        for(var p in a)
        { 
          $("#portfolio_dropdown").append(a[p][1]);
        }
        
        // if display flag set, simply display the first portfolio in list
        // meant for case where portfolio not selected, initial load
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
  // save portfolio name in session storage
  sessionStorage.setItem("name", name);
  var script = "get_portfolio_data.php?name=" + name;
  $("#table_title").html(name);
  $(".dropdown-toggle").html(name + ' <span class="caret"></span>');
  
  // call php script to retrieve portfolio data
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    { 
      // parse json data returned from php script
      var holdings = $.parseJSON(xmlhttp.responseText);
      
      // if any data returned
      if(holdings != null && holdings.length > 0 )
      {
        // generate alpha vantage link to get stock for all stocks in portfolio
        var api_link = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=";
        for(var h in holdings)
        {
          api_link = api_link + holdings[h]["symbol"] + ",";
        }
        api_link = api_link.slice(0,-1) + "&apikey=" + localStorage.getItem("plutus_key");
      
        // retrieve stock data using alpha vantage api
        $.getJSON(api_link, function( data ) {
          var quotes = data["Stock Quotes"];
          
          // add table header to table
          $("table").empty();
          $("table").append('<tr><th scope="col">Symbol</th><th scope="col">Buy Price</th><th scope="col">Buy Quantity</th><th scope="col">Current Price</th><th scope="col">Gain/Loss</th></tr>');
          
          // for each stock in api call return data
          var totalGain = 0;
          for(var q in quotes)
          {
            var buyPrice = parseFloat(holdings[q]["price"]);
            var buyQuant = parseFloat(holdings[q]["quantity"]);
            var currPrice = parseFloat(quotes[q]["2. price"]);
            
            // calculate the gain based on how much the stock cost initially
            // and how much it costs now
            var gain = ((currPrice - buyPrice) * buyQuant);
            totalGain += gain;
            
            // color the table text according to whether it's a positive or negative gain
            var end = '';
            if(gain >= 0)
            {
              end = '<td class="positive">' + gain.toFixed(2) + '</td></tr>';
            }
            else
            {
              end = '<td class="negative">' + gain.toFixed(2) + '</td></tr>';
            }
            // add the table data to table
            var row = '<tr><td>' + holdings[q]["symbol"] + '</td><td>'+ buyPrice.toFixed(2) + '</td><td>'+ buyQuant.toFixed(2) + '</td><td>' + currPrice.toFixed(2) + '</td>' + end;
            $("table").append(row);
          }
          
          // add a total gain row to table, text colored appropriately
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
        // if no holdings in portfolio, clear table and add header
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
  // retrieve stock symbol and quantity from form
  var symbol = document.forms["plutus_add_hold"]["symbol"].value;
  var quantity = document.forms["plutus_add_hold"]["quantity"].value;
  
  var api_link = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=" + symbol + "&apikey=" + localStorage.getItem("plutus_key");
  
  // request stock data from alpha vantage api
  $.getJSON(api_link, function( data ) {
    var quotes = data["Stock Quotes"];
    
    // if stock symbol is valid
    if(quotes.length > 0)
    {
      // retrieve stock price and save stock data to database
      quote = quotes[0];
      var price = quote["2. price"];
      var name = sessionStorage.getItem("name");
      
      var script = "create_holding.php?name=" + name + "&symbol=" + symbol + "&number=" + quantity + "&price=" + price;
      
      // call php script to save stock holding data to database
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
        // parse the php script response
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
        {
          result = xmlhttp.responseText;
          
          if(result === "SUCCESS")
          {
            // redisplay the portfolio with new stock data
            displayPortfolio(name);
          }
          else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
          {
            // unable to access database
            alert("Error accessing database");
          }
          
          // close the dialog
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
  
  // call the php script to remove the current account from the database
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) 
    {
      result = xmlhttp.responseText;

      // interpret php script response
      if(result === "SUCCESS")
      {
        // remove username and key from local storage
        localStorage.removeItem("plutus_username");
        localStorage.removeItem("plutus_key");
        
        // display setup page
        displaySetup();
      }
      else if(result === "QUERY_FAILED" || result === "NO_CONNECTION")
      {
        // error accessing database
        alert("Error accessing database");
      }
    }
  };
  xmlhttp.open("GET", script, true);
  xmlhttp.send(null);
}