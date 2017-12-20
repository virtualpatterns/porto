USE `porto`;
DROP procedure IF EXISTS `clean`;

DELIMITER $$
USE `porto`$$
CREATE DEFINER=`fficnar`@`%` PROCEDURE `clean`()
BEGIN

	delete	insertedAttendance
	from    insertedAttendance
				inner join attendance on
					insertedAttendance.attendanceId = attendance.attendanceId and
                    not attendance.deleted is null;

	delete 
	from    attendance
	where	not attendance.deleted is null;

	delete
	from    meeting
	where	not meeting.deleted is null;

	delete
	from    user
	where	not user.deleted is null;

	delete
	from    batch
	where	not batch.deleted is null;

END$$

DELIMITER ;

