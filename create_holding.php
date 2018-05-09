<?php
$name = $_GET['name'];
$symbol = $_GET['symbol'];
$number = $_GET['number'];
$price = $_GET['price'];

# parse ini file for database information
$ini_array = parse_ini_file("db.ini");

# connect to database
$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

# add new holding entry to database
$sql_select = "SELECT `portfolioID` FROM `portfolios` WHERE `name`='".$name."'";
$sql = "INSERT INTO `holdings` (`holdingID`, `symbol`, `quantity`, `buyTime`, `price`, `portfolioKey`) VALUES ('0', '".$symbol."', '".$number."', NOW(), '".$price."', (".$sql_select."))";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

# close database connection
mysqli_close($conn);

echo 'SUCCESS';
?>