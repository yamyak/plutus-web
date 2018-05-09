<?php
$user = $_GET['user'];
$name = $_GET['name'];

# parse ini file for database information
$ini_array = parse_ini_file("db.ini");

# connect to database
$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

# check if portfolio with same name already exists
$sql = "SELECT * FROM `portfolios` WHERE `name`='".$name."'";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

# if so return
if(mysqli_num_rows($res) > 0)
{
  echo 'ACCOUNT_EXISTS';
  return;
}

# add new portfolio entry to database
$sql_select = "SELECT `accountID` FROM `accounts` WHERE `username`='".$user."'";
$sql = "INSERT INTO `portfolios` (`portfolioID`, `name`, `accountKey`) VALUES ('0', '".$name."', (".$sql_select."))";
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