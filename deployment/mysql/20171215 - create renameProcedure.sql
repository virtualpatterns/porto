USE `porto`;
DROP procedure IF EXISTS `renameProcedure`;

DELIMITER $$
USE `porto`$$
CREATE PROCEDURE `renameProcedure` (	in fromName varchar(100),
										in toName varchar(100))
BEGIN

	update 	`mysql`.`proc`
	set 	name = toName,
			specific_name = toName
	WHERE	db = 'porto' AND
			name = fromName;
  
END$$

DELIMITER ;
