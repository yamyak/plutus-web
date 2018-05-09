<?php
$name = $_GET['name'];

# parse ini file for database information
$ini_array = parse_ini_file("db.ini");

# connect to database
$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  return;
}

# get all holding entries under the given portfolio
$sql = "SELECT * FROM `holdings` WHERE `portfolioKey`=(SELECT `portfolioID` FROM `portfolios` WHERE `name`='".$name."')";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  return;
}

# process database response to create holding array
if(mysqli_num_rows($res) > 0)
{
  $a = array();
  while($row = mysqli_fetch_assoc($res))
  {
    $o['symbol'] = $row["symbol"];
    $o['quantity'] = $row["quantity"];
    $o['buyTime'] = $row["buyTime"];
    $o['price'] = $row["price"];
    
    array_push($a, $o);
  }
}

# return holding array as a json array
echo json_encode($a);

# close database connection
mysqli_close($conn);
?>