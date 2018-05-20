--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
  `accountID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8_bin NOT NULL,
  `apiKey` varchar(100) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`accountID`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `apiKey` (`apiKey`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=38 ;

-- --------------------------------------------------------

--
-- Table structure for table `holdings`
--

DROP TABLE IF EXISTS `holdings`;
CREATE TABLE IF NOT EXISTS `holdings` (
  `holdingID` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(10) COLLATE utf8_bin NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '0',
  `buyTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `price` float NOT NULL DEFAULT '0',
  `portfolioKey` int(11) NOT NULL,
  PRIMARY KEY (`holdingID`),
  KEY `portfolioKey` (`portfolioKey`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=40 ;

-- --------------------------------------------------------

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
CREATE TABLE IF NOT EXISTS `portfolios` (
  `portfolioID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_bin NOT NULL,
  `accountKey` int(11) NOT NULL,
  PRIMARY KEY (`portfolioID`),
  UNIQUE KEY `name` (`name`),
  KEY `accountKey` (`accountKey`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=19 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `holdings`
--
ALTER TABLE `holdings`
  ADD CONSTRAINT `holding_portfolio` FOREIGN KEY (`portfolioKey`) REFERENCES `portfolios` (`portfolioID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `portfolios`
--
ALTER TABLE `portfolios`
  ADD CONSTRAINT `account_portfolio` FOREIGN KEY (`accountKey`) REFERENCES `accounts` (`accountID`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
