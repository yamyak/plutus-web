<?php
$user = $_GET['user'];
$key = $_GET['key'];

# parse ini file for database information
$ini_array = parse_ini_file("db.ini");

# connect to database
$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

# check if account with same username or key already exists
$sql = "SELECT * FROM `accounts` WHERE `username`='".$user."' OR `key`='".$key."'";
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

# add new account entry to database
$sql = "INSERT INTO `accounts` (`accountID`, `username`, `apiKey`) VALUES ('0', '".$user."', '".$key."')";
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