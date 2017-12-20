USE `porto`;
DROP procedure IF EXISTS `getTables`;

DELIMITER $$
USE `porto`$$
CREATE PROCEDURE `getTables` ()
BEGIN

	select  information_schema.tables.table_name    										as name,
			information_schema.tables.table_rows    										as numberOfRows,
			information_schema.tables.data_length + information_schema.tables.index_length	as numberOfBytes,
			information_schema.tables.create_time											as created
	from    information_schema.tables 
	where   information_schema.tables.table_schema = database()
	order 
	by      information_schema.tables.data_length + information_schema.tables.index_length desc;

END$$

DELIMITER ;

