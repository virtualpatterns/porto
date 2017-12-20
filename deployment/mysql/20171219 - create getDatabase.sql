USE `porto`;
DROP procedure IF EXISTS `getDatabase`;

DELIMITER $$
USE `porto`$$
CREATE PROCEDURE `getDatabase` ()
BEGIN

	select  information_schema.tables.table_schema  	as name,
			@@GLOBAL.version_comment                	as description,
			@@GLOBAL.version                        	as version,
			sum(data_length + index_length)         	as numberOfBytes,
			min(information_schema.tables.create_time)	as created
	from    information_schema.tables 
	where   information_schema.tables.table_schema = database()
	group
	by      information_schema.tables.table_schema,
			@@GLOBAL.version_comment,
			@@GLOBAL.version;

END$$

DELIMITER ;

